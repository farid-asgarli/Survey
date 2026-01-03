// usePaletteToCanvasDnd - Hook for drag-and-drop from palette to canvas
// Implements @dnd-kit pattern for dragging new items from a palette to a sortable list
// Best practice: Combines useDraggable (palette) with useDroppable (canvas) and useSortable (list)

import { useState, useCallback, useMemo, useRef } from 'react';
import { pointerWithin, rectIntersection, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, DragOverEvent, DragMoveEvent, UniqueIdentifier, CollisionDetection } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { EmailBlockType } from './types';

// Valid block types for runtime validation
const VALID_BLOCK_TYPES: ReadonlySet<EmailBlockType> = new Set([
  'header',
  'text',
  'image',
  'button',
  'divider',
  'spacer',
  'columns',
  'social',
  'footer',
]);

// ============================================================================
// Types
// ============================================================================

/** Prefix for palette item IDs to distinguish from block IDs */
export const PALETTE_ID_PREFIX = 'palette-' as const;

/** Identifier for the canvas drop zone */
export const CANVAS_DROPPABLE_ID = 'email-canvas' as const;

/** Identifier for the top edge drop zone */
export const TOP_EDGE_DROPPABLE_ID = 'email-canvas-top-edge' as const;

/** Identifier for the bottom edge drop zone */
export const BOTTOM_EDGE_DROPPABLE_ID = 'email-canvas-bottom-edge' as const;

/** Data attached to a draggable palette item */
export interface PaletteItemData {
  type: 'palette-item';
  blockType: EmailBlockType;
}

/** Data attached to a sortable block */
export interface SortableBlockData {
  type: 'sortable-block';
  blockId: UniqueIdentifier;
  index: number;
}

export type DraggableData = PaletteItemData | SortableBlockData;

/** Active drag state for rendering overlays */
export interface ActiveDragState {
  id: UniqueIdentifier;
  type: 'palette' | 'block';
  blockType?: EmailBlockType;
  blockId?: UniqueIdentifier;
}

export interface UsePaletteToCanvasDndOptions {
  /** Block IDs for sortable context */
  blockIds: UniqueIdentifier[];
  /** Callback when a new block should be added from palette */
  onAddBlock: (type: EmailBlockType, index?: number) => void;
  /** Callback when blocks should be reordered */
  onReorder: (fromIndex: number, toIndex: number) => void;
  /** Whether dragging is disabled */
  disabled?: boolean;
  /** Activation distance in pixels before drag starts */
  activationDistance?: number;
}

export interface UsePaletteToCanvasDndReturn {
  /** Sensors for DndContext */
  sensors: ReturnType<typeof useSensors>;
  /** Collision detection algorithm */
  collisionDetection: CollisionDetection;
  /** Currently active drag state */
  activeDrag: ActiveDragState | null;
  /** Handler for drag start */
  handleDragStart: (event: DragStartEvent) => void;
  /** Handler for drag over (for visual feedback) */
  handleDragOver: (event: DragOverEvent) => void;
  /** Handler for drag move (for precise position tracking) */
  handleDragMove: (event: DragMoveEvent) => void;
  /** Handler for drag end */
  handleDragEnd: (event: DragEndEvent) => void;
  /** Handler for drag cancel */
  handleDragCancel: () => void;
  /** Whether a palette item is currently being dragged */
  isDraggingFromPalette: boolean;
  /** Whether any drag is active */
  isDragging: boolean;
  /** Whether the canvas is currently a drop target */
  isOverCanvas: boolean;
  /** Index where a new block would be inserted (for visual indicator) */
  insertionIndex: number | null;
  /** Position relative to the hovered item: 'before' | 'after' | null */
  insertionPosition: 'before' | 'after' | null;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for managing drag-and-drop from palette to canvas with reordering
 *
 * @example
 * ```tsx
 * const dnd = usePaletteToCanvasDnd({
 *   blockIds: blocks.map(b => b.id),
 *   onAddBlock: (type, index) => addBlock(type, index),
 *   onReorder: (from, to) => reorderBlocks(from, to),
 * });
 *
 * return (
 *   <DndContext
 *     sensors={dnd.sensors}
 *     collisionDetection={dnd.collisionDetection}
 *     onDragStart={dnd.handleDragStart}
 *     onDragEnd={dnd.handleDragEnd}
 *   >
 *     <Palette />
 *     <Canvas />
 *     <DragOverlay>{dnd.activeDrag && <OverlayContent />}</DragOverlay>
 *   </DndContext>
 * );
 * ```
 */
export function usePaletteToCanvasDnd({
  blockIds,
  onAddBlock,
  onReorder,
  disabled = false,
  activationDistance = 8,
}: UsePaletteToCanvasDndOptions): UsePaletteToCanvasDndReturn {
  const [activeDrag, setActiveDrag] = useState<ActiveDragState | null>(null);
  const [isOverCanvas, setIsOverCanvas] = useState(false);
  const [insertionIndex, setInsertionIndex] = useState<number | null>(null);
  const [insertionPosition, setInsertionPosition] = useState<'before' | 'after' | null>(null);

  // Track the last pointer Y position for precise insertion calculation
  const lastPointerY = useRef<number | null>(null);

  // Memoize blockIds as Set for O(1) lookup performance
  const blockIdSet = useMemo(() => new Set(blockIds), [blockIds]);

  // Memoize blockId to index mapping for efficient lookups
  const blockIdToIndex = useMemo(() => new Map(blockIds.map((id, index) => [id, index])), [blockIds]);

  // Configure sensors with memoized activation constraint
  // Includes TouchSensor for mobile device support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: activationDistance,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Custom collision detection that prioritizes edge zones and sortable items over canvas
  // Uses closestCenter for better accuracy when dragging between blocks
  const collisionDetection = useCallback<CollisionDetection>((args) => {
    // First, check for pointer collisions
    const pointerCollisions = pointerWithin(args);

    if (pointerCollisions.length > 0) {
      // Prioritize edge drop zones (top/bottom of canvas)
      const edgeCollision = pointerCollisions.find((c) => c.id === TOP_EDGE_DROPPABLE_ID || c.id === BOTTOM_EDGE_DROPPABLE_ID);
      if (edgeCollision) {
        return [edgeCollision];
      }

      // Then check for sortable items (filter out canvas zones)
      const sortableCollisions = pointerCollisions.filter(
        (collision) => collision.id !== CANVAS_DROPPABLE_ID && collision.id !== TOP_EDGE_DROPPABLE_ID && collision.id !== BOTTOM_EDGE_DROPPABLE_ID
      );

      if (sortableCollisions.length > 0) {
        return sortableCollisions;
      }
    }

    // Use closestCenter for better drop target detection when between items
    const centerCollisions = closestCenter(args);
    if (centerCollisions.length > 0) {
      const sortableCenterCollisions = centerCollisions.filter(
        (collision) => collision.id !== CANVAS_DROPPABLE_ID && collision.id !== TOP_EDGE_DROPPABLE_ID && collision.id !== BOTTOM_EDGE_DROPPABLE_ID
      );
      if (sortableCenterCollisions.length > 0) {
        return sortableCenterCollisions;
      }
    }

    // Fall back to rectangle intersection for canvas
    return rectIntersection(args);
  }, []);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      if (disabled) return;

      const { active } = event;
      const id = active.id;
      const data = active.data.current as DraggableData | undefined;

      if (typeof id === 'string' && id.startsWith(PALETTE_ID_PREFIX)) {
        // Dragging from palette
        const blockType = id.replace(PALETTE_ID_PREFIX, '') as EmailBlockType;
        setActiveDrag({
          id,
          type: 'palette',
          blockType,
        });
      } else if (data?.type === 'sortable-block') {
        // Dragging existing block
        setActiveDrag({
          id,
          type: 'block',
          blockId: data.blockId,
        });
      } else {
        // Fallback for existing blocks without explicit data
        setActiveDrag({
          id,
          type: 'block',
          blockId: id,
        });
      }
    },
    [disabled]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { over } = event;

      if (!over) {
        setIsOverCanvas(false);
        setInsertionIndex(null);
        setInsertionPosition(null);
        return;
      }

      // Check if over the top edge zone - insert at beginning
      if (over.id === TOP_EDGE_DROPPABLE_ID) {
        setIsOverCanvas(true);
        setInsertionIndex(0);
        setInsertionPosition('before');
        return;
      }

      // Check if over the bottom edge zone - insert at end
      if (over.id === BOTTOM_EDGE_DROPPABLE_ID) {
        setIsOverCanvas(true);
        setInsertionIndex(blockIds.length > 0 ? blockIds.length - 1 : 0);
        setInsertionPosition('after');
        return;
      }

      // Check if over the canvas (empty area)
      if (over.id === CANVAS_DROPPABLE_ID) {
        setIsOverCanvas(true);
        // When dropping on empty canvas, append at the end
        setInsertionIndex(blockIds.length);
        setInsertionPosition('after');
        return;
      }

      // Check if over a sortable item using O(1) Set lookup
      if (blockIdSet.has(over.id)) {
        setIsOverCanvas(true);
        const overIndex = blockIdToIndex.get(over.id);

        if (overIndex !== undefined) {
          // Calculate if we should insert before or after based on pointer position
          const overRect = over.rect;
          const pointerY = lastPointerY.current;

          if (overRect && pointerY !== null) {
            const middleY = overRect.top + overRect.height / 2;
            const isInUpperHalf = pointerY < middleY;

            if (isInUpperHalf) {
              // Insert before this item
              setInsertionIndex(overIndex);
              setInsertionPosition('before');
            } else {
              // Insert after this item
              setInsertionIndex(overIndex);
              setInsertionPosition('after');
            }
          } else {
            // Fallback: insert before
            setInsertionIndex(overIndex);
            setInsertionPosition('before');
          }
        }
      } else {
        setIsOverCanvas(false);
        setInsertionIndex(null);
        setInsertionPosition(null);
      }
    },
    [blockIds.length, blockIdSet, blockIdToIndex]
  );

  // Track pointer position for precise insertion calculation
  const handleDragMove = useCallback((event: DragMoveEvent) => {
    // Store the current pointer Y position
    if (event.activatorEvent && 'clientY' in event.activatorEvent) {
      const clientY = (event.activatorEvent as PointerEvent).clientY;
      // Adjust for delta movement
      lastPointerY.current = clientY + (event.delta?.y ?? 0);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      // Capture current insertion state before clearing
      const finalInsertionIndex = insertionIndex;
      const finalInsertionPosition = insertionPosition;

      setActiveDrag(null);
      setIsOverCanvas(false);
      setInsertionIndex(null);
      setInsertionPosition(null);
      lastPointerY.current = null;

      if (disabled || !over) return;

      const activeId = active.id;
      const overId = over.id;

      // Check if dropped on edge zones
      const isEdgeDrop = overId === TOP_EDGE_DROPPABLE_ID || overId === BOTTOM_EDGE_DROPPABLE_ID;
      const isCanvasDrop = overId === CANVAS_DROPPABLE_ID;

      // Handle palette item drop
      if (typeof activeId === 'string' && activeId.startsWith(PALETTE_ID_PREFIX)) {
        const blockType = getBlockTypeFromPaletteId(activeId);

        // Validate block type before adding
        if (!blockType) {
          console.warn(`Invalid block type from palette ID: ${activeId}`);
          return;
        }

        if (overId === TOP_EDGE_DROPPABLE_ID) {
          // Dropped on top edge - insert at beginning
          onAddBlock(blockType, 0);
        } else if (overId === BOTTOM_EDGE_DROPPABLE_ID) {
          // Dropped on bottom edge - insert at end
          onAddBlock(blockType);
        } else if (isCanvasDrop) {
          // Dropped on canvas (empty area or end)
          onAddBlock(blockType);
        } else if (finalInsertionIndex !== null) {
          // Use the calculated insertion position
          const targetIndex = finalInsertionPosition === 'after' ? finalInsertionIndex + 1 : finalInsertionIndex;
          onAddBlock(blockType, targetIndex);
        } else {
          // Fallback: add at end
          onAddBlock(blockType);
        }
        return;
      }

      // Handle block reordering
      const isOverBlock = !isCanvasDrop && !isEdgeDrop;
      if (activeId !== overId) {
        const oldIndex = blockIdToIndex.get(activeId);

        // Handle edge drops for reordering
        if (overId === TOP_EDGE_DROPPABLE_ID && oldIndex !== undefined && oldIndex !== 0) {
          onReorder(oldIndex, 0);
          return;
        }
        if (overId === BOTTOM_EDGE_DROPPABLE_ID && oldIndex !== undefined && oldIndex !== blockIds.length - 1) {
          onReorder(oldIndex, blockIds.length - 1);
          return;
        }

        // Handle normal block reordering
        if (isOverBlock) {
          const newIndex = blockIdToIndex.get(overId);

          if (oldIndex !== undefined && newIndex !== undefined) {
            // Adjust target index based on insertion position and direction
            let targetIndex = newIndex;
            if (finalInsertionPosition === 'after') {
              targetIndex = newIndex + 1;
            }
            // If moving down, account for the removed element
            if (oldIndex < targetIndex) {
              targetIndex -= 1;
            }
            if (oldIndex !== targetIndex) {
              onReorder(oldIndex, targetIndex);
            }
          }
        }
      }
    },
    [disabled, blockIdToIndex, blockIds.length, onAddBlock, onReorder, insertionIndex, insertionPosition]
  );

  const handleDragCancel = useCallback(() => {
    setActiveDrag(null);
    setIsOverCanvas(false);
    setInsertionIndex(null);
    setInsertionPosition(null);
    lastPointerY.current = null;
  }, []);

  // Memoize derived state to prevent unnecessary recalculations
  const isDraggingFromPalette = useMemo(() => activeDrag?.type === 'palette', [activeDrag?.type]);
  const isDragging = useMemo(() => activeDrag !== null, [activeDrag]);

  // Memoize return value to provide stable references
  return useMemo(
    () => ({
      sensors,
      collisionDetection,
      activeDrag,
      handleDragStart,
      handleDragOver,
      handleDragMove,
      handleDragEnd,
      handleDragCancel,
      isDraggingFromPalette,
      isDragging,
      isOverCanvas,
      insertionIndex,
      insertionPosition,
    }),
    [
      sensors,
      collisionDetection,
      activeDrag,
      handleDragStart,
      handleDragOver,
      handleDragMove,
      handleDragEnd,
      handleDragCancel,
      isDraggingFromPalette,
      isDragging,
      isOverCanvas,
      insertionIndex,
      insertionPosition,
    ]
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

/** Creates a palette item ID from a block type */
export function createPaletteId(blockType: EmailBlockType): string {
  return `${PALETTE_ID_PREFIX}${blockType}`;
}

/** Checks if an ID is a palette item ID */
export function isPaletteId(id: UniqueIdentifier): boolean {
  return typeof id === 'string' && id.startsWith(PALETTE_ID_PREFIX);
}

/** Extracts block type from a palette item ID with runtime validation */
export function getBlockTypeFromPaletteId(id: UniqueIdentifier): EmailBlockType | null {
  if (!isPaletteId(id)) return null;
  const blockType = (id as string).replace(PALETTE_ID_PREFIX, '');
  // Runtime validation to ensure the extracted type is valid
  if (!VALID_BLOCK_TYPES.has(blockType as EmailBlockType)) {
    return null;
  }
  return blockType as EmailBlockType;
}
