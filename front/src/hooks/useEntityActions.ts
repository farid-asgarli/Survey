import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/components/ui';
import { useConfirmDialog } from './useConfirmDialog';
import { getErrorMessage } from '@/utils';

/**
 * Configuration for an entity action.
 */
export interface EntityActionConfig<TEntity, TResult = void> {
  /** The action function to execute */
  action: (entity: TEntity) => Promise<TResult>;
  /** Success message or function to generate message */
  successMessage: string | ((entity: TEntity, result: TResult) => string);
  /** Error message or function to generate message */
  errorMessage?: string | ((entity: TEntity, error: unknown) => string);
  /** Optional callback after successful action */
  onSuccess?: (entity: TEntity, result: TResult) => void;
  /** Optional callback on error */
  onError?: (entity: TEntity, error: unknown) => void;
}

/**
 * Configuration for a confirmable entity action (like delete).
 */
export interface ConfirmableActionConfig<TEntity, TResult = void> extends EntityActionConfig<TEntity, TResult> {
  /** Title for the confirmation dialog */
  confirmTitle: string | ((entity: TEntity) => string);
  /** Description for the confirmation dialog */
  confirmDescription: string | ((entity: TEntity) => string);
  /** Text for the confirm button (default: "Confirm") */
  confirmText?: string;
  /** Variant for the confirm dialog */
  confirmVariant?: 'default' | 'destructive' | 'warning';
}

/**
 * A hook that creates a reusable action handler with toast notifications.
 * Reduces boilerplate for common CRUD operations.
 *
 * @example
 * ```tsx
 * const handleDuplicate = useEntityAction({
 *   action: (survey) => duplicateMutation.mutateAsync(survey.id),
 *   successMessage: 'Survey duplicated successfully',
 *   errorMessage: 'Failed to duplicate survey',
 * });
 *
 * // Usage
 * <Button onClick={() => handleDuplicate(survey)}>Duplicate</Button>
 * ```
 */
export function useEntityAction<TEntity, TResult = void>(config: EntityActionConfig<TEntity, TResult>) {
  const { t } = useTranslation();
  const { action, successMessage, errorMessage, onSuccess, onError } = config;
  const defaultErrorMessage = errorMessage ?? t('common.operationFailed', 'Operation failed');

  return useCallback(
    async (entity: TEntity): Promise<TResult | undefined> => {
      try {
        const result = await action(entity);

        const message = typeof successMessage === 'function' ? successMessage(entity, result) : successMessage;
        toast.success(message);

        onSuccess?.(entity, result);
        return result;
      } catch (error) {
        const fallbackMessage = typeof defaultErrorMessage === 'function' ? defaultErrorMessage(entity, error) : defaultErrorMessage;
        toast.error(getErrorMessage(error, fallbackMessage));

        onError?.(entity, error);
        return undefined;
      }
    },
    [action, successMessage, defaultErrorMessage, onSuccess, onError]
  );
}

/**
 * A hook that creates a confirmable action handler with dialog and toast notifications.
 * Perfect for destructive actions like delete.
 *
 * @example
 * ```tsx
 * const { handleAction: handleDelete, ConfirmDialog } = useConfirmableAction({
 *   action: (survey) => deleteMutation.mutateAsync(survey.id),
 *   confirmTitle: 'Delete Survey',
 *   confirmDescription: (survey) => `Are you sure you want to delete "${survey.title}"?`,
 *   confirmVariant: 'destructive',
 *   successMessage: 'Survey deleted successfully',
 *   errorMessage: 'Failed to delete survey',
 * });
 *
 * return (
 *   <>
 *     <Button onClick={() => handleDelete(survey)}>Delete</Button>
 *     <ConfirmDialog />
 *   </>
 * );
 * ```
 */
export function useConfirmableAction<TEntity, TResult = void>(config: ConfirmableActionConfig<TEntity, TResult>) {
  const { t } = useTranslation();
  const {
    action,
    confirmTitle,
    confirmDescription,
    confirmText,
    confirmVariant = 'default',
    successMessage,
    errorMessage,
    onSuccess,
    onError,
  } = config;
  const resolvedConfirmText = confirmText ?? t('common.confirm', 'Confirm');
  const defaultErrorMessage = errorMessage ?? t('common.operationFailed', 'Operation failed');

  const { confirm, ConfirmDialog } = useConfirmDialog();

  const handleAction = useCallback(
    async (entity: TEntity): Promise<TResult | undefined> => {
      const title = typeof confirmTitle === 'function' ? confirmTitle(entity) : confirmTitle;
      const description = typeof confirmDescription === 'function' ? confirmDescription(entity) : confirmDescription;

      const confirmed = await confirm({
        title,
        description,
        confirmText: resolvedConfirmText,
        variant: confirmVariant,
      });

      if (!confirmed) return undefined;

      try {
        const result = await action(entity);

        const message = typeof successMessage === 'function' ? successMessage(entity, result) : successMessage;
        toast.success(message);

        onSuccess?.(entity, result);
        return result;
      } catch (error) {
        const fallbackMessage = typeof defaultErrorMessage === 'function' ? defaultErrorMessage(entity, error) : defaultErrorMessage;
        toast.error(getErrorMessage(error, fallbackMessage));

        onError?.(entity, error);
        return undefined;
      }
    },
    [action, confirm, confirmTitle, confirmDescription, resolvedConfirmText, confirmVariant, successMessage, defaultErrorMessage, onSuccess, onError]
  );

  return { handleAction, ConfirmDialog };
}

/**
 * Configuration for multiple entity actions.
 */
export interface EntityActionsConfig<TEntity> {
  /** Entity name for default messages (e.g., 'survey', 'template') */
  entityName: string;
  /** Function to get the entity's display name */
  getDisplayName?: (entity: TEntity) => string;
  /** Delete action configuration */
  delete?: {
    action: (entity: TEntity) => Promise<void>;
    onSuccess?: (entity: TEntity) => void;
  };
  /** Duplicate action configuration */
  duplicate?: {
    action: (entity: TEntity) => Promise<unknown>;
    onSuccess?: (entity: TEntity, result: unknown) => void;
  };
  /** Custom actions */
  custom?: Record<
    string,
    {
      action: (entity: TEntity) => Promise<unknown>;
      successMessage: string;
      errorMessage?: string;
      requiresConfirmation?: boolean;
      confirmTitle?: string;
      confirmDescription?: string | ((entity: TEntity) => string);
    }
  >;
}

/**
 * A hook that creates multiple common entity action handlers at once.
 * Provides a consistent API for CRUD operations with proper error handling and notifications.
 *
 * @example
 * ```tsx
 * const { handleDelete, handleDuplicate, ConfirmDialog } = useEntityActions<Survey>({
 *   entityName: 'survey',
 *   getDisplayName: (s) => s.title,
 *   delete: {
 *     action: (survey) => deleteMutation.mutateAsync(survey.id),
 *   },
 *   duplicate: {
 *     action: (survey) => duplicateMutation.mutateAsync(survey.id),
 *   },
 * });
 * ```
 */
export function useEntityActions<TEntity>(config: EntityActionsConfig<TEntity>) {
  const { t } = useTranslation();
  const { entityName, getDisplayName, delete: deleteConfig, duplicate: duplicateConfig, custom } = config;

  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Capitalize entity name helper
  const capitalizedEntityName = entityName.charAt(0).toUpperCase() + entityName.slice(1);

  // Delete handler with confirmation
  const handleDelete = useCallback(
    async (entity: TEntity): Promise<boolean> => {
      if (!deleteConfig) return false;

      const displayName = getDisplayName ? getDisplayName(entity) : entityName;
      const confirmed = await confirm({
        title: t('dialogs.deleteEntityTitle', { entity: capitalizedEntityName, defaultValue: `Delete ${capitalizedEntityName}` }),
        description: t('dialogs.deleteEntityDescription', {
          name: displayName,
          defaultValue: `Are you sure you want to delete "${displayName}"? This action cannot be undone.`,
        }),
        confirmText: t('common.delete', 'Delete'),
        variant: 'destructive',
      });

      if (!confirmed) return false;

      try {
        await deleteConfig.action(entity);
        toast.success(
          t('common.entityDeletedSuccess', { entity: capitalizedEntityName, defaultValue: `${capitalizedEntityName} deleted successfully` })
        );
        deleteConfig.onSuccess?.(entity);
        return true;
      } catch {
        toast.error(t('common.entityDeleteFailed', { entity: entityName, defaultValue: `Failed to delete ${entityName}` }));
        return false;
      }
    },
    [confirm, deleteConfig, entityName, getDisplayName, capitalizedEntityName, t]
  );

  // Duplicate handler (no confirmation needed)
  const handleDuplicate = useCallback(
    async (entity: TEntity): Promise<boolean> => {
      if (!duplicateConfig) return false;

      try {
        const result = await duplicateConfig.action(entity);
        toast.success(
          t('common.entityDuplicatedSuccess', { entity: capitalizedEntityName, defaultValue: `${capitalizedEntityName} duplicated successfully` })
        );
        duplicateConfig.onSuccess?.(entity, result);
        return true;
      } catch {
        toast.error(t('common.entityDuplicateFailed', { entity: entityName, defaultValue: `Failed to duplicate ${entityName}` }));
        return false;
      }
    },
    [duplicateConfig, entityName, capitalizedEntityName, t]
  );

  // Custom action handlers - use useMemo to avoid stale closure
  const customHandlers = useMemo(() => {
    if (!custom) return {};

    const handlers: Record<string, (entity: TEntity) => Promise<boolean>> = {};

    for (const [key, actionConfig] of Object.entries(custom)) {
      handlers[key] = async (entity: TEntity): Promise<boolean> => {
        if (actionConfig.requiresConfirmation) {
          const description =
            typeof actionConfig.confirmDescription === 'function'
              ? actionConfig.confirmDescription(entity)
              : actionConfig.confirmDescription || t('dialogs.confirmDescription', 'Are you sure?');

          const confirmed = await confirm({
            title: actionConfig.confirmTitle || t('dialogs.confirmAction', 'Confirm Action'),
            description,
          });

          if (!confirmed) return false;
        }

        try {
          await actionConfig.action(entity);
          toast.success(actionConfig.successMessage);
          return true;
        } catch {
          toast.error(actionConfig.errorMessage || t('common.operationFailed', 'Operation failed'));
          return false;
        }
      };
    }

    return handlers;
  }, [custom, confirm, t]);

  return {
    handleDelete: deleteConfig ? handleDelete : undefined,
    handleDuplicate: duplicateConfig ? handleDuplicate : undefined,
    ...customHandlers,
    ConfirmDialog,
  };
}
