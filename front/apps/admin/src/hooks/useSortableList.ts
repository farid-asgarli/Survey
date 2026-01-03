// useSortableList - Centralized drag-and-drop hook using @dnd-kit
// This hook provides a reusable abstraction for sortable lists throughout the app
// Can be used for: SurveyBuilder questions, Email Editor blocks, etc.

import { useState, useCallback } from 'react';
import { KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent, DragOverEvent, UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

export interface UseSortableListOptions<T> {
  /** The list of items to make sortable */
  items: T[];
  /** Function to get unique identifier from item */
  getId: (item: T) => UniqueIdentifier;
  /** Callback when items are reordered */
  onReorder: (fromIndex: number, toIndex: number) => void;
  /** Whether the list is disabled/read-only */
  disabled?: boolean;
  /** Activation distance in pixels before drag starts (default: 8) */
  activationDistance?: number;
}

export interface UseSortableListReturn<T> {
  /** Configured sensors for DndContext */
  sensors: ReturnType<typeof useSensors>;
  /** Currently dragging item ID */
  activeId: UniqueIdentifier | null;
  /** Currently dragging item */
  activeItem: T | null;
  /** Array of item IDs for SortableContext */
  itemIds: UniqueIdentifier[];
  /** Handler for drag start event */
  handleDragStart: (event: DragStartEvent) => void;
  /** Handler for drag over event (for cross-container support) */
  handleDragOver: (event: DragOverEvent) => void;
  /** Handler for drag end event */
  handleDragEnd: (event: DragEndEvent) => void;
  /** Handler for drag cancel event */
  handleDragCancel: () => void;
  /** Check if an item is being dragged */
  isDragging: (id: UniqueIdentifier) => boolean;
}

/**
 * A centralized hook for sortable list functionality using @dnd-kit.
 *
 * @example
 * ```tsx
 * const { sensors, activeId, itemIds, handleDragStart, handleDragEnd } = useSortableList({
 *   items: questions,
 *   getId: (q) => q.id,
 *   onReorder: reorderQuestions,
 * });
 *
 * return (
 *   <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
 *     <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
 *       {items.map((item) => <SortableItem key={item.id} id={item.id} />)}
 *     </SortableContext>
 *   </DndContext>
 * );
 * ```
 */
export function useSortableList<T>({
  items,
  getId,
  onReorder,
  disabled = false,
  activationDistance = 8,
}: UseSortableListOptions<T>): UseSortableListReturn<T> {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  // Configure sensors with activation constraints
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: activationDistance,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Compute item IDs for SortableContext
  const itemIds = items.map(getId);

  // Find active item
  const activeItem = activeId !== null ? items.find((item) => getId(item) === activeId) ?? null : null;

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      if (disabled) return;
      setActiveId(event.active.id);
    },
    [disabled]
  );

  const handleDragOver = useCallback(() => {
    // For future cross-container support (e.g., dragging between sections)
    // Currently a no-op for single list sorting
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (disabled || !over || active.id === over.id) {
        return;
      }

      const oldIndex = itemIds.indexOf(active.id);
      const newIndex = itemIds.indexOf(over.id);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        onReorder(oldIndex, newIndex);
      }
    },
    [disabled, itemIds, onReorder]
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const isDragging = useCallback((id: UniqueIdentifier) => activeId === id, [activeId]);

  return {
    sensors,
    activeId,
    activeItem,
    itemIds,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    isDragging,
  };
}

/**
 * Helper to reorder an array (can be used if you're not using a store)
 */
export function reorderArray<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  return arrayMove(array, fromIndex, toIndex);
}
