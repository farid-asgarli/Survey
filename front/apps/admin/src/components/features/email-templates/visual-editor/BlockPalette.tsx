// Block Palette - Drag source for adding new blocks using @dnd-kit
// M3 Expressive Design: Card-based blocks with shape morphing
// Uses useDraggable from @dnd-kit for proper drag-and-drop integration

import { useTranslation } from 'react-i18next';
import { useDraggable } from '@dnd-kit/core';
import { Type, Image, MousePointer2, Minus, Space, Columns, Share2, FileText, LayoutTemplate, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, IconContainer } from '@/components/ui';
import type { EmailBlockType } from './types';
import { createPaletteId, type PaletteItemData } from './usePaletteToCanvasDnd';

// ============================================================================
// Types
// ============================================================================

interface BlockPaletteProps {
  /** Callback when a block is clicked (for click-to-add functionality) */
  onAddBlock: (type: EmailBlockType) => void;
  /** Additional class names */
  className?: string;
}

interface BlockOption {
  type: EmailBlockType;
  icon: React.ReactNode;
  label: string;
  description: string;
  color: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'info';
}

// ============================================================================
// Hook for block options
// ============================================================================

function useBlockOptions(): BlockOption[] {
  const { t } = useTranslation();

  return [
    {
      type: 'header',
      icon: <LayoutTemplate className="h-5 w-5" />,
      label: t('emailEditor.blocks.header', 'Header'),
      description: t('emailEditor.blocks.headerDesc', 'Logo and title section'),
      color: 'primary',
    },
    {
      type: 'text',
      icon: <Type className="h-5 w-5" />,
      label: t('emailEditor.blocks.text', 'Text'),
      description: t('emailEditor.blocks.textDesc', 'Rich text content'),
      color: 'secondary',
    },
    {
      type: 'image',
      icon: <Image className="h-5 w-5" />,
      label: t('emailEditor.blocks.image', 'Image'),
      description: t('emailEditor.blocks.imageDesc', 'Single image with optional link'),
      color: 'tertiary',
    },
    {
      type: 'button',
      icon: <MousePointer2 className="h-5 w-5" />,
      label: t('emailEditor.blocks.button', 'Button'),
      description: t('emailEditor.blocks.buttonDesc', 'Call-to-action button'),
      color: 'success',
    },
    {
      type: 'divider',
      icon: <Minus className="h-5 w-5" />,
      label: t('emailEditor.blocks.divider', 'Divider'),
      description: t('emailEditor.blocks.dividerDesc', 'Horizontal line separator'),
      color: 'info',
    },
    {
      type: 'spacer',
      icon: <Space className="h-5 w-5" />,
      label: t('emailEditor.blocks.spacer', 'Spacer'),
      description: t('emailEditor.blocks.spacerDesc', 'Empty vertical space'),
      color: 'secondary',
    },
    {
      type: 'columns',
      icon: <Columns className="h-5 w-5" />,
      label: t('emailEditor.blocks.columns', 'Columns'),
      description: t('emailEditor.blocks.columnsDesc', 'Multi-column layout'),
      color: 'warning',
    },
    {
      type: 'social',
      icon: <Share2 className="h-5 w-5" />,
      label: t('emailEditor.blocks.social', 'Social Links'),
      description: t('emailEditor.blocks.socialDesc', 'Social media icons'),
      color: 'tertiary',
    },
    {
      type: 'footer',
      icon: <FileText className="h-5 w-5" />,
      label: t('emailEditor.blocks.footer', 'Footer'),
      description: t('emailEditor.blocks.footerDesc', 'Company info & unsubscribe'),
      color: 'primary',
    },
  ];
}

// ============================================================================
// Main Component
// ============================================================================

export function BlockPalette({ onAddBlock, className }: BlockPaletteProps) {
  const { t } = useTranslation();
  const blockOptions = useBlockOptions();

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-sm font-semibold text-on-surface px-1">{t('emailEditor.addBlock', 'Add Block')}</h3>
      <p className="text-xs text-on-surface-variant px-1 mb-2">{t('emailEditor.addBlockHint', 'Click or drag blocks to add them')}</p>

      <div className="grid grid-cols-1 gap-2">
        {blockOptions.map((option) => (
          <DraggablePaletteItem key={option.type} option={option} onAddBlock={onAddBlock} />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Draggable Palette Item
// ============================================================================

interface DraggablePaletteItemProps {
  option: BlockOption;
  onAddBlock: (type: EmailBlockType) => void;
}

function DraggablePaletteItem({ option, onAddBlock }: DraggablePaletteItemProps) {
  const paletteId = createPaletteId(option.type);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: paletteId,
    data: {
      type: 'palette-item',
      blockType: option.type,
    } satisfies PaletteItemData,
  });

  // Note: We intentionally don't apply transform here because palette items are "copy" sources.
  // The visual feedback is provided by DragOverlay in the parent component.
  // This keeps the source item in place while dragging (proper pattern for palette-to-canvas).

  return (
    <Card variant="interactive" padding="none" className={cn('group', isDragging && 'opacity-50 ring-2 ring-primary/40')}>
      <button
        ref={setNodeRef}
        onClick={() => onAddBlock(option.type)}
        className={cn(
          'flex items-center gap-3 p-3 w-full text-left',
          'cursor-grab active:cursor-grabbing',
          'transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset',
          'touch-none', // Important for @dnd-kit on touch devices
          isDragging && 'cursor-grabbing'
        )}
        aria-label={`Add ${option.label} block`}
        {...attributes}
        {...listeners}
      >
        {/* Icon container with color variant */}
        <IconContainer variant={option.color} emphasis="standard" className="shrink-0 transition-transform duration-200 group-hover:scale-110">
          {option.icon}
        </IconContainer>

        {/* Labels */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-on-surface truncate">{option.label}</p>
          <p className="text-xs text-on-surface-variant truncate">{option.description}</p>
        </div>

        {/* Drag handle indicator */}
        <GripVertical
          className={cn(
            'h-4 w-4 text-on-surface-variant/40 shrink-0',
            'opacity-0 group-hover:opacity-100',
            'transition-opacity duration-200',
            isDragging && 'opacity-100'
          )}
        />
      </button>
    </Card>
  );
}

// ============================================================================
// Drag Overlay Content (for use in DragOverlay)
// ============================================================================

interface PaletteItemOverlayProps {
  blockType: EmailBlockType;
}

export function PaletteItemOverlay({ blockType }: PaletteItemOverlayProps) {
  const blockOptions = useBlockOptions();
  const option = blockOptions.find((o) => o.type === blockType);

  if (!option) return null;

  return (
    <Card variant="elevated" padding="none" className="shadow-xl ring-2 ring-primary/40 min-w-48">
      <div className="flex items-center gap-3 p-3">
        <IconContainer variant={option.color} emphasis="standard" className="shrink-0">
          {option.icon}
        </IconContainer>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-on-surface truncate">{option.label}</p>
          <p className="text-xs text-on-surface-variant truncate">{option.description}</p>
        </div>
        <GripVertical className="h-4 w-4 text-on-surface-variant/60 shrink-0" />
      </div>
    </Card>
  );
}

// ============================================================================
// Compact Palette (for smaller spaces)
// ============================================================================

interface CompactBlockPaletteProps {
  onAddBlock: (type: EmailBlockType) => void;
  className?: string;
}

export function CompactBlockPalette({ onAddBlock, className }: CompactBlockPaletteProps) {
  const { t } = useTranslation();

  const blockOptions: { type: EmailBlockType; icon: React.ReactNode; label: string }[] = [
    { type: 'header', icon: <LayoutTemplate className="h-4 w-4" />, label: t('emailEditor.blocks.header', 'Header') },
    { type: 'text', icon: <Type className="h-4 w-4" />, label: t('emailEditor.blocks.text', 'Text') },
    { type: 'image', icon: <Image className="h-4 w-4" />, label: t('emailEditor.blocks.image', 'Image') },
    { type: 'button', icon: <MousePointer2 className="h-4 w-4" />, label: t('emailEditor.blocks.button', 'Button') },
    { type: 'divider', icon: <Minus className="h-4 w-4" />, label: t('emailEditor.blocks.divider', 'Divider') },
    { type: 'spacer', icon: <Space className="h-4 w-4" />, label: t('emailEditor.blocks.spacer', 'Spacer') },
    { type: 'columns', icon: <Columns className="h-4 w-4" />, label: t('emailEditor.blocks.columns', 'Columns') },
    { type: 'social', icon: <Share2 className="h-4 w-4" />, label: t('emailEditor.blocks.social', 'Social') },
    { type: 'footer', icon: <FileText className="h-4 w-4" />, label: t('emailEditor.blocks.footer', 'Footer') },
  ];

  return (
    <div className={cn('grid grid-cols-3 gap-2', className)}>
      {blockOptions.map((option) => (
        <CompactDraggableItem key={option.type} option={option} onAddBlock={onAddBlock} />
      ))}
    </div>
  );
}

function CompactDraggableItem({
  option,
  onAddBlock,
}: {
  option: { type: EmailBlockType; icon: React.ReactNode; label: string };
  onAddBlock: (type: EmailBlockType) => void;
}) {
  const paletteId = createPaletteId(option.type);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: paletteId,
    data: {
      type: 'palette-item',
      blockType: option.type,
    } satisfies PaletteItemData,
  });

  // Note: No transform applied - palette items stay in place, DragOverlay shows the drag preview

  return (
    <button
      ref={setNodeRef}
      onClick={() => onAddBlock(option.type)}
      className={cn(
        'flex flex-col items-center gap-1.5 p-3 rounded-2xl',
        'bg-surface-container border-2 border-transparent',
        'hover:bg-surface-container-high hover:border-primary/20 hover:rounded-3xl',
        'active:scale-95',
        'transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        'cursor-grab active:cursor-grabbing touch-none',
        isDragging && 'opacity-50 cursor-grabbing'
      )}
      aria-label={`Add ${option.label} block`}
      {...attributes}
      {...listeners}
    >
      <div className="text-on-surface-variant group-hover:text-primary transition-colors">{option.icon}</div>
      <span className="text-xs font-medium text-on-surface-variant truncate max-w-full">{option.label}</span>
    </button>
  );
}
