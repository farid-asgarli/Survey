import { useState, useCallback } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, Button } from '@/components/ui';

interface ConfirmDialogOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'warning';
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ConfirmDialogState extends ConfirmDialogOptions {
  open: boolean;
  isLoading: boolean;
}

export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmDialogState>({
    open: false,
    isLoading: false,
    title: '',
    description: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'default',
  });

  const confirm = useCallback((options: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        isLoading: false,
        title: options.title,
        description: options.description ?? '',
        confirmText: options.confirmText ?? 'Confirm',
        cancelText: options.cancelText ?? 'Cancel',
        variant: options.variant ?? 'default',
        onConfirm: async () => {
          setState((prev) => ({ ...prev, isLoading: true }));
          try {
            await options.onConfirm?.();
            resolve(true);
          } finally {
            setState((prev) => ({ ...prev, open: false, isLoading: false }));
          }
        },
        onCancel: () => {
          options.onCancel?.();
          resolve(false);
          setState((prev) => ({ ...prev, open: false }));
        },
      });
    });
  }, []);

  const ConfirmDialog = useCallback(() => {
    const getVariantConfig = () => {
      switch (state.variant) {
        case 'destructive':
          return { icon: <AlertTriangle className="h-7 w-7" />, headerVariant: 'error' as const };
        case 'warning':
          return { icon: <AlertTriangle className="h-7 w-7" />, headerVariant: 'warning' as const };
        default:
          return { icon: <Info className="h-7 w-7" />, headerVariant: 'primary' as const };
      }
    };

    const { icon, headerVariant } = getVariantConfig();

    return (
      <Dialog
        open={state.open}
        onOpenChange={(open) => {
          if (!open && !state.isLoading) {
            state.onCancel?.();
          }
        }}
      >
        <DialogContent size="default" showClose={false}>
          <DialogHeader
            hero
            icon={icon}
            title={state.title}
            description={<span className="line-clamp-none">{state.description}</span>}
            variant={headerVariant}
            showClose={!state.isLoading}
          />
          <div className="p-4">
            <div className="flex justify-end gap-3">
              <Button variant="text" onClick={state.onCancel} disabled={state.isLoading}>
                {state.cancelText}
              </Button>
              <Button
                variant={state.variant === 'destructive' ? 'destructive' : 'filled'}
                onClick={state.onConfirm}
                loading={state.isLoading}
              >
                {state.confirmText}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }, [state]);

  return { confirm, ConfirmDialog };
}

// Hook for simple delete confirmation
export function useDeleteConfirm() {
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const confirmDelete = useCallback(
    (itemName: string, onConfirm: () => void | Promise<void>) => {
      return confirm({
        title: `Delete ${itemName}?`,
        description: `This action cannot be undone. Are you sure you want to delete this ${itemName.toLowerCase()}?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'destructive',
        onConfirm,
      });
    },
    [confirm]
  );

  return { confirmDelete, ConfirmDialog };
}
