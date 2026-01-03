/**
 * NamespacesPage - Manage workspaces
 *
 * Features:
 * - useListPageState hook for combined state management
 * - useEntityActions hook for CRUD operations
 * - ListPageLayout compound component for consistent structure
 * - createListEmptyState factory for empty states
 */

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useViewTransitionNavigate } from '@/hooks';
import { Button, ListContainer, GridSkeleton, toast, EmptyState } from '@/components/ui';
import { ListPageLayout } from '@/components/layout';
import { renderPageIcon } from '@/config';
import { Plus, FolderOpen } from 'lucide-react';
import { CreateNamespaceDialog } from '@/components/features/namespaces';
import { useNamespacesList, useDeleteNamespace, useListPageState, useEntityActions, useDialogState, type ExtendedFilterConfig } from '@/hooks';
import { useActiveNamespace, useNamespaceStore, usePreferencesStore } from '@/stores';
import { useAuthStore } from '@/stores';
import type { Namespace, ViewMode } from '@/types';
import { NamespaceCard, NamespacesEmptyState } from './components';

/** Filter configs - no filters for namespaces, just search */
const FILTER_CONFIGS: ExtendedFilterConfig<Namespace, unknown>[] = [];

export function NamespacesPage() {
  const { t } = useTranslation();
  const navigate = useViewTransitionNavigate();
  const createDialog = useDialogState();

  // Data hooks
  const { data: namespaces = [], isLoading, error } = useNamespacesList();
  const activeNamespace = useActiveNamespace();
  const switchNamespace = useNamespaceStore((s) => s.switchNamespace);
  const currentUser = useAuthStore((s) => s.user);
  const deleteNamespace = useDeleteNamespace();

  // User preferences
  const dashboardPrefs = usePreferencesStore((s) => s.preferences.dashboard);

  // Use the combined list page state hook
  const {
    searchQuery,
    setSearchQuery,
    filteredItems: filteredNamespaces,
    hasActiveFilters,
    clearAllFilters,
  } = useListPageState<Namespace, Record<string, never>>({
    initialFilters: {},
    filterConfigs: FILTER_CONFIGS,
    items: namespaces,
    searchConfig: {
      fields: ['name', 'slug', 'description'],
    },
    initialViewMode: dashboardPrefs.defaultViewMode as ViewMode,
  });

  // Use entity actions for delete
  const { handleDelete, ConfirmDialog } = useEntityActions<Namespace>({
    entityName: 'workspace',
    getDisplayName: (ns) => ns.name,
    delete: {
      action: (namespace) => deleteNamespace.mutateAsync(namespace.id),
    },
  });

  // Handlers
  const handleSelectNamespace = useCallback(
    (namespace: Namespace) => {
      switchNamespace(namespace.id);
      toast.success(t('workspaces.switchedTo', { name: namespace.name }));
    },
    [switchNamespace, t]
  );

  const handleSettings = useCallback(
    (namespace: Namespace) => {
      navigate(`/workspaces/${namespace.id}/settings`);
    },
    [navigate]
  );

  return (
    <ListPageLayout searchQuery={searchQuery} onSearchChange={setSearchQuery}>
      {/* Header */}
      <ListPageLayout.Header
        icon={renderPageIcon('workspaces')}
        title={t('workspaces.title')}
        description={t('workspaces.description')}
        actions={
          <Button onClick={() => createDialog.open()} className='gap-2'>
            <Plus className='h-5 w-5' />
            {t('workspaces.newWorkspace')}
          </Button>
        }
      />

      {/* Toolbar - just search, no filters or view mode for namespaces */}
      <ListPageLayout.Toolbar showViewModeToggle={false} searchPlaceholder={t('workspaces.searchPlaceholder')}>
        {/* No filter tabs for namespaces */}
        <div />
      </ListPageLayout.Toolbar>

      {/* Content */}
      <ListPageLayout.Content>
        <ListContainer items={filteredNamespaces} isLoading={isLoading} hasError={!!error}>
          <ListContainer.Loading>
            <GridSkeleton count={3} gridHeight='h-48' />
          </ListContainer.Loading>

          <ListContainer.Error>
            <EmptyState
              icon={<FolderOpen className='h-7 w-7' />}
              title={t('workspaces.loadError')}
              description={t('workspaces.loadErrorDesc')}
              iconVariant='muted'
              action={{
                label: t('errors.tryAgain'),
                onClick: () => window.location.reload(),
                variant: 'outline',
              }}
            />
          </ListContainer.Error>

          <ListContainer.Empty>
            <NamespacesEmptyState hasActiveFilters={hasActiveFilters} onClearFilters={clearAllFilters} onCreateItem={() => createDialog.open()} />
          </ListContainer.Empty>

          <ListContainer.Content>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {filteredNamespaces.map((namespace) => (
                <NamespaceCard
                  key={namespace.id}
                  namespace={namespace}
                  isActive={namespace.id === activeNamespace?.id}
                  isOwner={namespace.ownerId === currentUser?.id}
                  onSelect={() => handleSelectNamespace(namespace)}
                  onSettings={() => handleSettings(namespace)}
                  onDelete={() => handleDelete?.(namespace)}
                />
              ))}
            </div>
          </ListContainer.Content>
        </ListContainer>
      </ListPageLayout.Content>

      {/* FAB for mobile */}
      <ListPageLayout.FAB icon={<Plus className='h-6 w-6' />} onClick={() => createDialog.open()} />

      {/* Dialogs */}
      <CreateNamespaceDialog open={createDialog.isOpen} onOpenChange={createDialog.setOpen} />
      <ConfirmDialog />
    </ListPageLayout>
  );
}
