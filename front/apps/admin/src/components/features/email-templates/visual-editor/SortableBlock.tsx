// SortableBlock - Sortable wrapper for email blocks using @dnd-kit
// Provides drag handle and proper sortable behavior within the canvas

import { forwardRef, type CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import type { EmailBlock, EmailBlockType } from './types';
import { Card, IconContainer } from '@/components/ui';
import { Type, Image, MousePointer2, Minus, Space, Columns, Share2, FileText, LayoutTemplate, Plus } from 'lucide-react';

// ============================================================================
// Drop Indicator Component - Shows where items will be inserted
// ============================================================================

interface DropIndicatorProps {
  /** Whether the indicator is visible */
  isVisible: boolean;
  /** Position: 'before' shows at top, 'after' shows at bottom */
  position?: 'before' | 'after';
  /** Optional label to show in the indicator */
  label?: string;
}

export function DropIndicator({ isVisible, position = 'before', label }: DropIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'absolute left-0 right-0 z-50 flex items-center gap-2 pointer-events-none transition-opacity duration-150',
        position === 'before' ? '-top-1' : '-bottom-1',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
    >
      {/* Left circle indicator */}
      <div className="w-3 h-3 rounded-full bg-primary border-2 border-primary shadow-md flex items-center justify-center">
        <Plus className="w-2 h-2 text-on-primary" />
      </div>

      {/* Horizontal line */}
      <div className="flex-1 h-0.5 bg-primary rounded-full shadow-sm" />

      {/* Right circle indicator */}
      <div className="w-3 h-3 rounded-full bg-primary border-2 border-primary shadow-md flex items-center justify-center">
        <Plus className="w-2 h-2 text-on-primary" />
      </div>

      {/* Optional label */}
      {label && (
        <div className="absolute left-1/2 -translate-x-1/2 -top-6 px-2 py-0.5 bg-primary text-on-primary text-xs font-medium rounded-md shadow-md whitespace-nowrap">
          {label}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Canvas Drop Indicator - For showing drop at the end of the list
// ============================================================================

interface CanvasDropIndicatorProps {
  isVisible: boolean;
  isEmpty?: boolean;
}

export function CanvasDropIndicator({ isVisible, isEmpty = false }: CanvasDropIndicatorProps) {
  if (!isVisible) return null;

  if (isEmpty) {
    return (
      <div className="p-8 border-2 border-dashed border-primary rounded-xl bg-primary/5 flex flex-col items-center justify-center gap-2 transition-all duration-200">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Plus className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm font-medium text-primary">Drop here to add</p>
      </div>
    );
  }

  return (
    <div className="relative py-3">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-primary border-2 border-primary shadow-md flex items-center justify-center">
          <Plus className="w-2 h-2 text-on-primary" />
        </div>
        <div className="flex-1 h-0.5 bg-primary rounded-full shadow-sm" />
        <div className="w-3 h-3 rounded-full bg-primary border-2 border-primary shadow-md flex items-center justify-center">
          <Plus className="w-2 h-2 text-on-primary" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Context for Sortable Handle (allows BlockEditor to use SortableHandle)
// ============================================================================

import { createContext, useContext } from 'react';

interface SortableBlockContextValue {
  attributes: ReturnType<typeof useSortable>['attributes'];
  listeners: ReturnType<typeof useSortable>['listeners'];
  setActivatorNodeRef: (node: HTMLElement | null) => void;
  isDragging: boolean;
}

const SortableBlockContext = createContext<SortableBlockContextValue | null>(null);

export function useSortableBlockContext() {
  const context = useContext(SortableBlockContext);
  if (!context) {
    throw new Error('SortableHandle must be used within a SortableBlock');
  }
  return context;
}

// ============================================================================
// SortableBlock Component
// ============================================================================

interface SortableBlockProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const SortableBlock = forwardRef<HTMLDivElement, SortableBlockProps>(function SortableBlock(
  { id, children, className, disabled = false },
  ref
) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging, isOver } = useSortable({
    id,
    disabled,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    position: 'relative',
  };

  const contextValue: SortableBlockContextValue = {
    attributes,
    listeners,
    setActivatorNodeRef,
    isDragging,
  };

  return (
    <SortableBlockContext.Provider value={contextValue}>
      <div
        ref={(node) => {
          setNodeRef(node);
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        style={style}
        className={cn('relative', isDragging && 'opacity-50', isOver && !isDragging && 'ring-2 ring-primary/40 ring-inset', className)}
      >
        {children}
      </div>
    </SortableBlockContext.Provider>
  );
});

// ============================================================================
// BlockOverlay - Rendered in DragOverlay when dragging blocks
// ============================================================================

interface BlockOverlayProps {
  block: EmailBlock;
}

const blockIcons: Record<EmailBlockType, React.ReactNode> = {
  header: <LayoutTemplate className="h-5 w-5" />,
  text: <Type className="h-5 w-5" />,
  image: <Image className="h-5 w-5" />,
  button: <MousePointer2 className="h-5 w-5" />,
  divider: <Minus className="h-5 w-5" />,
  spacer: <Space className="h-5 w-5" />,
  columns: <Columns className="h-5 w-5" />,
  social: <Share2 className="h-5 w-5" />,
  footer: <FileText className="h-5 w-5" />,
};

const blockColors: Record<EmailBlockType, 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'info'> = {
  header: 'primary',
  text: 'secondary',
  image: 'tertiary',
  button: 'success',
  divider: 'info',
  spacer: 'secondary',
  columns: 'warning',
  social: 'tertiary',
  footer: 'primary',
};

const blockLabels: Record<EmailBlockType, string> = {
  header: 'Header',
  text: 'Text',
  image: 'Image',
  button: 'Button',
  divider: 'Divider',
  spacer: 'Spacer',
  columns: 'Columns',
  social: 'Social',
  footer: 'Footer',
};

export function BlockOverlay({ block }: BlockOverlayProps) {
  return (
    <Card variant="elevated" padding="none" className="shadow-xl ring-2 ring-primary/40 min-w-48 max-w-64">
      <div className="flex items-center gap-3 p-3">
        <IconContainer variant={blockColors[block.type]} emphasis="standard" className="shrink-0">
          {blockIcons[block.type]}
        </IconContainer>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-on-surface truncate">{blockLabels[block.type]} Block</p>
          <p className="text-xs text-on-surface-variant truncate">Drag to reorder</p>
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// DroppableCanvas - Canvas area that accepts drops from palette
// ============================================================================

import { useDroppable } from '@dnd-kit/core';
import { CANVAS_DROPPABLE_ID, TOP_EDGE_DROPPABLE_ID, BOTTOM_EDGE_DROPPABLE_ID } from './usePaletteToCanvasDnd';

interface DroppableCanvasProps {
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
  style?: CSSProperties;
}

export function DroppableCanvas({ children, className, isActive, style }: DroppableCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: CANVAS_DROPPABLE_ID,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn('transition-all duration-200', (isOver || isActive) && 'ring-2 ring-primary/30 ring-inset bg-primary/5', className)}
      style={style}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Edge Drop Zones - Droppable zones at top/bottom of canvas for edge drops
// ============================================================================

interface EdgeDropZoneProps {
  position: 'top' | 'bottom';
  isActive?: boolean;
  showIndicator?: boolean;
}

export function EdgeDropZone({ position, isActive = false, showIndicator = false }: EdgeDropZoneProps) {
  const droppableId = position === 'top' ? TOP_EDGE_DROPPABLE_ID : BOTTOM_EDGE_DROPPABLE_ID;
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
  });

  const shouldShowIndicator = isOver || (isActive && showIndicator);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative transition-all duration-200',
        // Larger hit area when dragging is active
        isActive ? 'min-h-8 py-2' : 'min-h-4 py-1',
        // Visual feedback when hovering
        isOver && 'bg-primary/5'
      )}
    >
      {/* Drop indicator line */}
      {shouldShowIndicator && (
        <div
          className="absolute inset-x-0 flex items-center gap-2 px-0"
          style={{ top: position === 'top' ? '50%' : '50%', transform: 'translateY(-50%)' }}
        >
          <div className="w-3 h-3 rounded-full bg-primary border-2 border-primary shadow-md flex items-center justify-center">
            <Plus className="w-2 h-2 text-on-primary" />
          </div>
          <div className="flex-1 h-0.5 bg-primary rounded-full shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-primary border-2 border-primary shadow-md flex items-center justify-center">
            <Plus className="w-2 h-2 text-on-primary" />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SortableBlockHandle - Drag handle for email blocks
// ============================================================================

interface SortableBlockHandleProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const SortableBlockHandle = forwardRef<HTMLDivElement, SortableBlockHandleProps>(function SortableBlockHandle(
  { children, className, ...props },
  ref
) {
  const { attributes, listeners, setActivatorNodeRef, isDragging } = useSortableBlockContext();

  return (
    <div
      ref={(node) => {
        setActivatorNodeRef(node);
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      className={cn('touch-none', isDragging ? 'cursor-grabbing' : 'cursor-grab', className)}
      {...attributes}
      {...listeners}
      {...props}
    >
      {children}
    </div>
  );
});
