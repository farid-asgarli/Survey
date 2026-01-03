// Block Editor - Renders editable block with M3 Expressive toolbar
// Uses @dnd-kit for smooth drag-and-drop reordering
// M3 Design: IconButton components, Card-based toolbar, shape morphing
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { GripVertical, Trash2, Copy, ChevronUp, ChevronDown, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconButton, Tooltip, Card } from '@/components/ui';
import { SortableBlockHandle } from './SortableBlock';
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
  canMoveUp,
  canMoveDown,
  onOpenSettings,
}: BlockEditorProps) {
  const { t } = useTranslation();
  const blockRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={blockRef}
      className={cn(
        'group relative transition-all duration-300 pt-14', // pt-14 for toolbar space
        isSelected && 'z-10'
      )}
      onClick={onSelect}
    >
      {/* Block wrapper with M3 selection outline and shape morphing */}
      <div
        className={cn(
          'relative border-2 transition-all duration-300',
          // Shape morphing: rounded-xl → rounded-2xl → rounded-3xl
          isSelected
            ? 'border-primary ring-2 ring-primary/20 rounded-2xl'
            : 'border-transparent hover:border-outline-variant/40 rounded-xl hover:rounded-2xl'
        )}
      >
        {/* Block toolbar - M3 Card with IconButtons */}
        <Card
          variant="elevated"
          padding="none"
          className={cn(
            'absolute -top-12 left-1/2 -translate-x-1/2',
            'flex items-center gap-0.5 p-1',
            'transition-all duration-300',
            isSelected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0'
          )}
          role="toolbar"
          aria-label={t('emailEditor.blockToolbar', 'Block actions')}
        >
          {/* Drag handle - using @dnd-kit SortableBlockHandle */}
          <Tooltip content={t('common.dragToReorder', 'Drag to reorder')}>
            <SortableBlockHandle
              className={cn(
                'p-2 rounded-xl text-on-surface-variant',
                'hover:bg-surface-container-high hover:text-on-surface',
                'transition-colors duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
              )}
              aria-label={t('common.dragToReorder', 'Drag to reorder')}
            >
              <GripVertical className="h-4 w-4" />
            </SortableBlockHandle>
          </Tooltip>

          {/* Divider */}
          <div className="w-px h-5 bg-outline-variant/30 mx-0.5" aria-hidden="true" />

          {/* Move up */}
          <Tooltip content={t('common.moveUp', 'Move Up')}>
            <IconButton
              variant="standard"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp();
              }}
              disabled={!canMoveUp}
              aria-label={t('common.moveUp', 'Move Up')}
              aria-disabled={!canMoveUp}
            >
              <ChevronUp className="h-4 w-4" />
            </IconButton>
          </Tooltip>

          {/* Move down */}
          <Tooltip content={t('common.moveDown', 'Move Down')}>
            <IconButton
              variant="standard"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown();
              }}
              disabled={!canMoveDown}
              aria-label={t('common.moveDown', 'Move Down')}
              aria-disabled={!canMoveDown}
            >
              <ChevronDown className="h-4 w-4" />
            </IconButton>
          </Tooltip>

          {/* Divider */}
          <div className="w-px h-5 bg-outline-variant/30 mx-0.5" aria-hidden="true" />

          {/* Settings */}
          <Tooltip content={t('emailEditor.settings.title', 'Settings')}>
            <IconButton
              variant={isSelected ? 'filled-tonal' : 'standard'}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onOpenSettings?.();
              }}
              aria-label={t('emailEditor.settings.title', 'Settings')}
            >
              <Settings className="h-4 w-4" />
            </IconButton>
          </Tooltip>

          {/* Duplicate */}
          <Tooltip content={t('common.duplicate', 'Duplicate')}>
            <IconButton
              variant="standard"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              aria-label={t('common.duplicate', 'Duplicate')}
            >
              <Copy className="h-4 w-4" />
            </IconButton>
          </Tooltip>

          {/* Delete */}
          <Tooltip content={t('common.delete', 'Delete')}>
            <IconButton
              variant="standard"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              aria-label={t('common.delete', 'Delete')}
              className="hover:text-error hover:bg-error-container/50"
            >
              <Trash2 className="h-4 w-4" />
            </IconButton>
          </Tooltip>
        </Card>

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
        <div
          className="p-4 text-center rounded-xl"
          style={{
            backgroundColor: block.content.backgroundColor,
            textAlign: block.content.alignment,
          }}
        >
          {block.content.logoUrl && (
            <img
              src={block.content.logoUrl}
              alt={block.content.logoAlt || t('a11y.logoAlt', 'Company logo')}
              style={{ maxWidth: block.content.logoWidth || 150, margin: '0 auto 10px' }}
              className="rounded-lg"
            />
          )}
          {block.content.title && (
            <h2 style={{ color: block.content.textColor, margin: 0 }} className="font-semibold">
              {block.content.title}
            </h2>
          )}
          {block.content.subtitle && <p style={{ color: block.content.textColor, opacity: 0.8, margin: '4px 0 0' }}>{block.content.subtitle}</p>}
          {!block.content.title && !block.content.logoUrl && (
            <span className="text-on-surface-variant text-sm">{t('emailEditor.preview.headerPlaceholder', 'Header Block')}</span>
          )}
        </div>
      );

    case 'text':
      return (
        <div
          className="p-4 [&_a]:underline rounded-xl"
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
        <div className="p-2 rounded-xl" style={{ textAlign: block.content.alignment }}>
          {block.content.src ? (
            <img
              src={block.content.src}
              alt={block.content.alt}
              style={{
                maxWidth: block.content.width || '100%',
                borderRadius: block.content.borderRadius,
              }}
              className="inline-block"
            />
          ) : (
            <div className="bg-surface-container-high rounded-2xl p-8 text-center inline-block min-w-50">
              <span className="text-on-surface-variant">{t('emailEditor.preview.imagePlaceholder', 'Add image URL')}</span>
            </div>
          )}
        </div>
      );

    case 'button':
      return (
        <div className="p-4 rounded-xl" style={{ textAlign: block.content.alignment }}>
          <span
            className="inline-block font-semibold"
            style={{
              backgroundColor: block.content.backgroundColor,
              color: block.content.textColor,
              padding: `${block.content.padding?.vertical || 12}px ${block.content.padding?.horizontal || 24}px`,
              borderRadius: block.content.borderRadius,
              fontSize: block.content.fontSize,
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
        <div style={{ padding: `${block.content.padding}px 0` }} className="rounded-xl">
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
        <div className="relative rounded-xl" style={{ height: block.content.height }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">{block.content.height}px</span>
          </div>
        </div>
      );

    case 'columns':
      return (
        <div
          className="p-4 text-center border-2 border-dashed border-outline-variant/50 rounded-2xl"
          style={{ backgroundColor: block.content.backgroundColor }}
        >
          <div className="flex items-center justify-center gap-2 text-on-surface-variant text-sm">
            <span>{t('emailEditor.preview.columnsPlaceholder', 'Columns Layout')}</span>
            <span className="text-xs bg-surface-container px-2 py-0.5 rounded-full">
              {block.content.columns.length} {t('emailEditor.columns', 'columns')}
            </span>
          </div>
        </div>
      );

    case 'social':
      return (
        <div className="p-4 rounded-xl" style={{ textAlign: block.content.alignment }}>
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
          className="p-4 text-center rounded-xl"
          style={{
            backgroundColor: block.content.backgroundColor,
            color: block.content.textColor,
            fontSize: block.content.fontSize,
          }}
        >
          {block.content.companyName && <p className="font-semibold m-0">{block.content.companyName}</p>}
          {block.content.address && <p className="m-0 mt-1 whitespace-pre-line">{block.content.address}</p>}
          {block.content.unsubscribeText && (
            <p className="m-0 mt-2">
              <span className="underline cursor-pointer">{block.content.unsubscribeText}</span>
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
