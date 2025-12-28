import { useState, useCallback } from 'react';

/**
 * Mode for the drawer (create new vs edit existing).
 */
export type DrawerMode = 'create' | 'edit';

/**
 * Options for the useDrawerState hook.
 */
export interface UseDrawerStateOptions<TItem> {
  /** Initial open state */
  initialOpen?: boolean;
  /** Initial editing item */
  initialItem?: TItem | null;
  /** Callback when drawer opens for creating */
  onOpenCreate?: () => void;
  /** Callback when drawer opens for editing */
  onOpenEdit?: (item: TItem) => void;
  /** Callback when drawer closes */
  onClose?: () => void;
}

/**
 * Return type for the useDrawerState hook.
 */
export interface UseDrawerStateReturn<TItem> {
  /** Whether the drawer is open */
  isOpen: boolean;
  /** The current mode (create or edit) */
  mode: DrawerMode;
  /** The item being edited (null for create mode) */
  editingItem: TItem | null;
  /** Whether we're in edit mode */
  isEditing: boolean;
  /** Whether we're in create mode */
  isCreating: boolean;
  /** Open the drawer in create mode */
  openCreate: () => void;
  /** Open the drawer in edit mode with an item */
  openEdit: (item: TItem) => void;
  /** Close the drawer and reset state */
  close: () => void;
  /** Set the open state directly (for controlled components) */
  setOpen: (open: boolean) => void;
  /** Get title based on mode */
  getTitle: (createTitle: string, editTitle: string) => string;
}

/**
 * A hook that manages drawer/editor state for create/edit patterns.
 * Common in pages that have a drawer or panel for editing entities.
 *
 * @example
 * ```tsx
 * const drawer = useDrawerState<Theme>();
 *
 * // Handlers
 * const handleCreate = () => drawer.openCreate();
 * const handleEdit = (theme: Theme) => drawer.openEdit(theme);
 *
 * // In JSX
 * <Button onClick={handleCreate}>Create Theme</Button>
 * <Button onClick={() => handleEdit(theme)}>Edit</Button>
 *
 * <ThemeEditorDrawer
 *   open={drawer.isOpen}
 *   onOpenChange={drawer.setOpen}
 *   theme={drawer.editingItem}
 *   title={drawer.getTitle('Create Theme', 'Edit Theme')}
 * />
 * ```
 */
export function useDrawerState<TItem = unknown>(options: UseDrawerStateOptions<TItem> = {}): UseDrawerStateReturn<TItem> {
  const { initialOpen = false, initialItem = null, onOpenCreate, onOpenEdit, onClose } = options;

  const [isOpen, setIsOpen] = useState(initialOpen);
  const [editingItem, setEditingItem] = useState<TItem | null>(initialItem);
  const [mode, setMode] = useState<DrawerMode>(initialItem ? 'edit' : 'create');

  const openCreate = useCallback(() => {
    setEditingItem(null);
    setMode('create');
    setIsOpen(true);
    onOpenCreate?.();
  }, [onOpenCreate]);

  const openEdit = useCallback(
    (item: TItem) => {
      setEditingItem(item);
      setMode('edit');
      setIsOpen(true);
      onOpenEdit?.(item);
    },
    [onOpenEdit]
  );

  const close = useCallback(() => {
    setIsOpen(false);
    // Delay clearing the item to allow for closing animation
    setTimeout(() => {
      setEditingItem(null);
      setMode('create');
    }, 200);
    onClose?.();
  }, [onClose]);

  const setOpen = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      if (!open) {
        // Delay clearing the item to allow for closing animation
        setTimeout(() => {
          setEditingItem(null);
          setMode('create');
        }, 200);
        onClose?.();
      }
    },
    [onClose]
  );

  const getTitle = useCallback(
    (createTitle: string, editTitle: string) => {
      return mode === 'create' ? createTitle : editTitle;
    },
    [mode]
  );

  return {
    isOpen,
    mode,
    editingItem,
    isEditing: mode === 'edit',
    isCreating: mode === 'create',
    openCreate,
    openEdit,
    close,
    setOpen,
    getTitle,
  };
}

/**
 * Extended drawer state that also tracks a preview mode.
 * Useful for drawers that can show read-only previews before editing.
 */
export type ExtendedDrawerMode = 'create' | 'edit' | 'preview';

export interface UseExtendedDrawerStateReturn<TItem> extends Omit<UseDrawerStateReturn<TItem>, 'mode' | 'getTitle'> {
  mode: ExtendedDrawerMode;
  isPreviewing: boolean;
  openPreview: (item: TItem) => void;
  switchToEdit: () => void;
  getTitle: (createTitle: string, editTitle: string, previewTitle?: string) => string;
}

/**
 * An extended version of useDrawerState that includes preview mode.
 *
 * @example
 * ```tsx
 * const drawer = useExtendedDrawerState<Template>();
 *
 * // Open in preview, then optionally edit
 * <Button onClick={() => drawer.openPreview(template)}>Preview</Button>
 *
 * // In the drawer
 * {drawer.isPreviewing && (
 *   <Button onClick={drawer.switchToEdit}>Edit</Button>
 * )}
 * ```
 */
export function useExtendedDrawerState<TItem = unknown>(
  options: UseDrawerStateOptions<TItem> & { onOpenPreview?: (item: TItem) => void } = {}
): UseExtendedDrawerStateReturn<TItem> {
  const { onOpenPreview, ...baseOptions } = options;

  const [isOpen, setIsOpen] = useState(baseOptions.initialOpen ?? false);
  const [editingItem, setEditingItem] = useState<TItem | null>(baseOptions.initialItem ?? null);
  const [mode, setMode] = useState<ExtendedDrawerMode>(baseOptions.initialItem ? 'edit' : 'create');

  const openCreate = useCallback(() => {
    setEditingItem(null);
    setMode('create');
    setIsOpen(true);
    baseOptions.onOpenCreate?.();
  }, [baseOptions]);

  const openEdit = useCallback(
    (item: TItem) => {
      setEditingItem(item);
      setMode('edit');
      setIsOpen(true);
      baseOptions.onOpenEdit?.(item);
    },
    [baseOptions]
  );

  const openPreview = useCallback(
    (item: TItem) => {
      setEditingItem(item);
      setMode('preview');
      setIsOpen(true);
      onOpenPreview?.(item);
    },
    [onOpenPreview]
  );

  const switchToEdit = useCallback(() => {
    if (editingItem) {
      setMode('edit');
    }
  }, [editingItem]);

  const close = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      setEditingItem(null);
      setMode('create');
    }, 200);
    baseOptions.onClose?.();
  }, [baseOptions]);

  const setOpen = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      if (!open) {
        setTimeout(() => {
          setEditingItem(null);
          setMode('create');
        }, 200);
        baseOptions.onClose?.();
      }
    },
    [baseOptions]
  );

  const getTitle = useCallback(
    (createTitle: string, editTitle: string, previewTitle?: string) => {
      if (mode === 'create') return createTitle;
      if (mode === 'preview') return previewTitle ?? editTitle;
      return editTitle;
    },
    [mode]
  );

  return {
    isOpen,
    mode,
    editingItem,
    isEditing: mode === 'edit',
    isCreating: mode === 'create',
    isPreviewing: mode === 'preview',
    openCreate,
    openEdit,
    openPreview,
    switchToEdit,
    close,
    setOpen,
    getTitle,
  };
}
