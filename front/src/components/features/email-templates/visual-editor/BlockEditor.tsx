// Block Editor - Renders editable block with toolbar (settings now in right sidebar)
import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { GripVertical, Trash2, Copy, ChevronUp, ChevronDown, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui';
import type { EmailBlock, EmailGlobalStyles } from './types';

interface BlockEditorProps {
  block: EmailBlock;
  globalStyles: EmailGlobalStyles;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (block: EmailBlock) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onReorder?: (fromId: string, toId: string) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onOpenSettings?: () => void;
}

// Main block editor wrapper
export function BlockEditor({
  block,
  globalStyles,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onReorder,
  canMoveUp,
  canMoveDown,
  onOpenSettings,
}: BlockEditorProps) {
  const { t } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);

  // Drag-drop handlers for reordering
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('blockId', block.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.types.includes('blockid');
    if (draggedId) {
      setIsDragOver(true);
    }
  };

  function handleDragLeave() {
    setIsDragOver(false);
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const fromId = e.dataTransfer.getData('blockId');
    if (fromId && fromId !== block.id && onReorder) {
      onReorder(fromId, block.id);
    }
  };

  return (
    <div
      ref={blockRef}
      className={cn(
        'group relative transition-all duration-200 pt-12', // pt-12 for toolbar space
        isSelected && 'z-10',
        isDragOver && 'ring-2 ring-primary ring-offset-2'
      )}
      onClick={onSelect}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Block wrapper with selection outline */}
      <div
        className={cn(
          'relative border-2 rounded-lg transition-all duration-200',
          isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-outline-variant/50'
        )}
      >
        {/* Block toolbar */}
        <div
          className={cn(
            'absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-surface rounded-lg border-2 border-outline-variant transition-all duration-200',
            isSelected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          )}
          role="toolbar"
          aria-label={t('emailEditor.blockToolbar', 'Block actions')}
        >
          <Tooltip content={t('common.dragToReorder', 'Drag to reorder')}>
            <button
              draggable
              onDragStart={handleDragStart}
              className="p-1.5 text-on-surface-variant hover:text-on-surface cursor-grab active:cursor-grabbing"
              aria-label={t('common.dragToReorder', 'Drag to reorder')}
            >
              <GripVertical className="h-4 w-4" />
            </button>
          </Tooltip>
          <div className="w-px h-4 bg-outline-variant/30" aria-hidden="true" />
          <Tooltip content={t('common.moveUp', 'Move Up')}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp();
              }}
              disabled={!canMoveUp}
              className="p-1.5 text-on-surface-variant hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label={t('common.moveUp', 'Move Up')}
              aria-disabled={!canMoveUp}
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          </Tooltip>
          <Tooltip content={t('common.moveDown', 'Move Down')}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown();
              }}
              disabled={!canMoveDown}
              className="p-1.5 text-on-surface-variant hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label={t('common.moveDown', 'Move Down')}
              aria-disabled={!canMoveDown}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </Tooltip>
          <div className="w-px h-4 bg-outline-variant/30" aria-hidden="true" />
          <Tooltip content={t('emailEditor.settings.title', 'Settings')}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenSettings?.();
              }}
              className={cn('p-1.5 transition-colors', isSelected ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface')}
              aria-label={t('emailEditor.settings.title', 'Settings')}
            >
              <Settings className="h-4 w-4" />
            </button>
          </Tooltip>
          <Tooltip content={t('common.duplicate', 'Duplicate')}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="p-1.5 text-on-surface-variant hover:text-on-surface"
              aria-label={t('common.duplicate', 'Duplicate')}
            >
              <Copy className="h-4 w-4" />
            </button>
          </Tooltip>
          <Tooltip content={t('common.delete', 'Delete')}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 text-on-surface-variant hover:text-error"
              aria-label={t('common.delete', 'Delete')}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </Tooltip>
        </div>

        {/* Block content - rendered based on type */}
        <div className="min-h-10">
          <BlockPreview block={block} globalStyles={globalStyles} />
        </div>
      </div>
    </div>
  );
}

// Simple block preview for the editor canvas
function BlockPreview({ block, globalStyles }: { block: EmailBlock; globalStyles: EmailGlobalStyles }) {
  const { t } = useTranslation();
  // Use globalStyles for consistent styling
  const linkColor = globalStyles.linkColor;

  switch (block.type) {
    case 'header':
      return (
        <div className="p-4 text-center" style={{ backgroundColor: block.content.backgroundColor, textAlign: block.content.alignment }}>
          {block.content.logoUrl && (
            <img
              src={block.content.logoUrl}
              alt={block.content.logoAlt || 'Logo'}
              style={{ maxWidth: block.content.logoWidth || 150, margin: '0 auto 10px' }}
            />
          )}
          {block.content.title && <h2 style={{ color: block.content.textColor, margin: 0 }}>{block.content.title}</h2>}
          {block.content.subtitle && <p style={{ color: block.content.textColor, opacity: 0.8, margin: '4px 0 0' }}>{block.content.subtitle}</p>}
          {!block.content.title && !block.content.logoUrl && (
            <span className="text-on-surface-variant text-sm">{t('emailEditor.preview.headerPlaceholder', 'Header Block')}</span>
          )}
        </div>
      );

    case 'text':
      return (
        <div
          className="p-4 [&_a]:underline"
          style={{
            backgroundColor: block.content.backgroundColor,
            color: block.content.textColor,
            fontSize: block.content.fontSize,
            lineHeight: block.content.lineHeight,
            textAlign: block.content.alignment,
            // Apply link color through CSS variable
            ['--link-color' as string]: linkColor,
          }}
          dangerouslySetInnerHTML={{
            __html:
              block.content.html?.replace(/<a /g, `<a style="color:${linkColor};" `) ||
              `<p class="text-on-surface-variant">${t('emailEditor.preview.textPlaceholder', 'Text content...')}</p>`,
          }}
        />
      );

    case 'image':
      return (
        <div className="p-2" style={{ textAlign: block.content.alignment }}>
          {block.content.src ? (
            <img
              src={block.content.src}
              alt={block.content.alt}
              style={{
                maxWidth: block.content.width || '100%',
                borderRadius: block.content.borderRadius,
              }}
            />
          ) : (
            <div className="bg-surface-container-high rounded-lg p-8 text-center">
              <span className="text-on-surface-variant">{t('emailEditor.preview.imagePlaceholder', 'Add image URL')}</span>
            </div>
          )}
        </div>
      );

    case 'button':
      return (
        <div className="p-4" style={{ textAlign: block.content.alignment }}>
          <span
            style={{
              display: 'inline-block',
              backgroundColor: block.content.backgroundColor,
              color: block.content.textColor,
              padding: `${block.content.padding?.vertical || 12}px ${block.content.padding?.horizontal || 24}px`,
              borderRadius: block.content.borderRadius,
              fontSize: block.content.fontSize,
              fontWeight: 'bold',
              width: block.content.fullWidth ? '100%' : 'auto',
              textAlign: 'center',
            }}
          >
            {block.content.text}
          </span>
        </div>
      );

    case 'divider':
      return (
        <div style={{ padding: `${block.content.padding}px 0` }}>
          <hr
            style={{
              border: 'none',
              borderTop: `${block.content.thickness}px ${block.content.style} ${block.content.color}`,
              width: block.content.width,
              margin: '0 auto',
            }}
          />
        </div>
      );

    case 'spacer':
      return (
        <div className="relative" style={{ height: block.content.height }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-on-surface-variant bg-surface px-2">{block.content.height}px</span>
          </div>
        </div>
      );

    case 'columns':
      return (
        <div
          className="p-4 text-center border-2 border-dashed border-outline-variant/50 rounded-lg"
          style={{ backgroundColor: block.content.backgroundColor }}
        >
          <div className="flex items-center justify-center gap-2 text-on-surface-variant text-sm">
            <span>{t('emailEditor.preview.columnsPlaceholder', 'Columns Layout')}</span>
            <span className="text-xs bg-surface-container px-2 py-0.5 rounded">
              {block.content.columns.length} {t('emailEditor.columns', 'columns')}
            </span>
          </div>
        </div>
      );

    case 'social':
      return (
        <div className="p-4" style={{ textAlign: block.content.alignment }}>
          {(block.content.links || []).length > 0 ? (
            <div className="flex gap-2 justify-center">
              {block.content.links.map((link, i) => (
                <div
                  key={i}
                  className="rounded-full flex items-center justify-center text-white font-bold text-xs"
                  style={{
                    width: block.content.iconSize,
                    height: block.content.iconSize,
                    backgroundColor: '#666',
                  }}
                >
                  {link.platform.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          ) : (
            <span className="text-on-surface-variant text-sm">{t('emailEditor.preview.socialPlaceholder', 'Add social links')}</span>
          )}
        </div>
      );

    case 'footer':
      return (
        <div
          className="p-4 text-center"
          style={{
            backgroundColor: block.content.backgroundColor,
            color: block.content.textColor,
            fontSize: block.content.fontSize,
          }}
        >
          {block.content.companyName && <p className="font-bold m-0">{block.content.companyName}</p>}
          {block.content.address && <p className="m-0 mt-1">{block.content.address}</p>}
          {block.content.unsubscribeText && (
            <p className="m-0 mt-2">
              <span className="underline">{block.content.unsubscribeText}</span>
            </p>
          )}
          {!block.content.companyName && !block.content.address && (
            <span className="text-on-surface-variant">{t('emailEditor.preview.footerPlaceholder', 'Footer content')}</span>
          )}
        </div>
      );

    default:
      return null;
  }
}
