import { useState, useCallback } from 'react';

/**
 * Options for the useDialogState hook.
 */
export interface UseDialogStateOptions<TItem> {
  /** Initial open state */
  initialOpen?: boolean;
  /** Initial selected item */
  initialItem?: TItem | null;
  /** Callback when dialog opens */
  onOpen?: (item?: TItem) => void;
  /** Callback when dialog closes */
  onClose?: () => void;
}

/**
 * Return type for the useDialogState hook.
 */
export interface UseDialogStateReturn<TItem> {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** The currently selected item (if any) */
  selectedItem: TItem | null;
  /** Open the dialog, optionally with a selected item */
  open: (item?: TItem) => void;
  /** Close the dialog and clear the selected item */
  close: () => void;
  /** Toggle the dialog open state */
  toggle: () => void;
  /** Set the open state directly (for controlled components) */
  setOpen: (open: boolean) => void;
  /** Set the selected item without changing open state */
  setItem: (item: TItem | null) => void;
}

/**
 * A hook that manages dialog state including open/close and selected item.
 * Reduces boilerplate for common dialog patterns.
 *
 * @example
 * ```tsx
 * // Simple create dialog
 * const createDialog = useDialogState();
 *
 * // Edit dialog with selected item
 * const editDialog = useDialogState<Survey>();
 *
 * // Usage
 * <Button onClick={() => createDialog.open()}>Create</Button>
 * <Button onClick={() => editDialog.open(survey)}>Edit</Button>
 *
 * <CreateDialog
 *   open={createDialog.isOpen}
 *   onOpenChange={createDialog.setOpen}
 * />
 *
 * <EditDialog
 *   open={editDialog.isOpen}
 *   onOpenChange={editDialog.setOpen}
 *   item={editDialog.selectedItem}
 * />
 * ```
 */
export function useDialogState<TItem = unknown>(options: UseDialogStateOptions<TItem> = {}): UseDialogStateReturn<TItem> {
  const { initialOpen = false, initialItem = null, onOpen, onClose } = options;

  const [isOpen, setIsOpen] = useState(initialOpen);
  const [selectedItem, setSelectedItem] = useState<TItem | null>(initialItem);

  const open = useCallback(
    (item?: TItem) => {
      if (item !== undefined) {
        setSelectedItem(item);
      }
      setIsOpen(true);
      onOpen?.(item);
    },
    [onOpen]
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setSelectedItem(null);
    onClose?.();
  }, [onClose]);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      if (prev) {
        setSelectedItem(null);
        onClose?.();
      } else {
        onOpen?.();
      }
      return !prev;
    });
  }, [onOpen, onClose]);

  const setOpen = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      if (!open) {
        setSelectedItem(null);
        onClose?.();
      } else {
        onOpen?.();
      }
    },
    [onOpen, onClose]
  );

  const setItem = useCallback((item: TItem | null) => {
    setSelectedItem(item);
  }, []);

  return {
    isOpen,
    selectedItem,
    open,
    close,
    toggle,
    setOpen,
    setItem,
  };
}

/**
 * A convenience hook for managing multiple dialogs at once.
 * Useful when a page has create, edit, preview, etc. dialogs.
 *
 * @example
 * ```tsx
 * const dialogs = useMultiDialogState<Survey>({
 *   create: {},
 *   edit: {},
 *   preview: {},
 * });
 *
 * // Usage
 * <Button onClick={() => dialogs.create.open()}>Create</Button>
 * <Button onClick={() => dialogs.edit.open(survey)}>Edit</Button>
 * <Button onClick={() => dialogs.preview.open(survey)}>Preview</Button>
 * ```
 */
export function useMultiDialogState<TItem = unknown, TKeys extends string = string>(
  configs: Record<TKeys, UseDialogStateOptions<TItem>>
): Record<TKeys, UseDialogStateReturn<TItem>> {
  const entries = Object.entries(configs) as [TKeys, UseDialogStateOptions<TItem>][];

  // We need to create hooks dynamically, but hooks must be called unconditionally
  // This is a simplified version that works for static keys
  const results = {} as Record<TKeys, UseDialogStateReturn<TItem>>;

  // Note: This pattern is acceptable because the number of keys is fixed at mount
  entries.forEach(([key, options]) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    results[key] = useDialogState<TItem>(options);
  });

  return results;
}
