// RecurringSurveysPage - Manage recurring surveys and schedules

import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, AlertCircle } from 'lucide-react';
import { Button, EmptyState, Tabs, TabsList, TabsTrigger, ListContainer, GridSkeleton } from '@/components/ui';
import { ListPageLayout } from '@/components/layout/ListPageLayout';
import { renderPageIcon } from '@/config';
import { RecurringSurveyCard, RecurringScheduleEditor, RunHistoryDrawer } from '@/components/features/recurring-surveys';
import { cn } from '@/lib/utils';
import { useConfirmDialog, useListPage, useDialogState } from '@/hooks';
import { usePreferencesStore } from '@/stores';
import { useSurveysList } from '@/hooks/queries/useSurveys';
import {
  useRecurringSurveys,
  useRecurringSurveyDetail,
  useCreateRecurringSurvey,
  useUpdateRecurringSurvey,
  useDeleteRecurringSurvey,
  usePauseRecurringSurvey,
  useResumeRecurringSurvey,
  useTriggerRecurringSurvey,
} from '@/hooks/queries/useRecurringSurveys';
import { SurveyStatus } from '@/types';
import type { CreateRecurringSurveyRequest, UpdateRecurringSurveyRequest, ViewMode } from '@/types';
import { StatsCards, UpcomingRunsPreview } from './sections';
import { FILTER_CONFIGS, RecurringSurveysEmptyState } from './constants';
import type { StatusFilter } from './types';

export function RecurringSurveysPage() {
  const { t } = useTranslation();

  // User preferences
  const dashboardPrefs = usePreferencesStore((s) => s.preferences.dashboard);

  // Use the reusable list page hook for common list page state
  const { viewMode, setViewMode, searchQuery, setSearchQuery, filters, setFilter, activeFilters, clearAllFilters } = useListPage<{
    status: StatusFilter;
  }>({
    initialViewMode: dashboardPrefs.defaultViewMode as ViewMode,
    initialFilters: { status: 'all' },
    filterConfigs: FILTER_CONFIGS,
  });

  // Dialog state using reusable hooks
  const createDialog = useDialogState();
  const editDialog = useDialogState<string>();
  const historyDrawer = useDialogState<string>();

  // Shorthand for current filter value
  const statusFilter = filters.status;

  // Queries
  const {
    data: recurringSurveysResponse,
    isLoading,
    isError,
    refetch,
  } = useRecurringSurveys({
    searchTerm: searchQuery || undefined,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
  });
  const { data: surveysData } = useSurveysList({ status: SurveyStatus.Published });

  // Fetch full data for editing/viewing history
  const { data: editingRecurringSurvey } = useRecurringSurveyDetail(editDialog.selectedItem ?? undefined);
  const { data: historyRecurringSurvey } = useRecurringSurveyDetail(historyDrawer.selectedItem ?? undefined);

  // Extract items from response
  const recurringSurveys = useMemo(() => recurringSurveysResponse?.items ?? [], [recurringSurveysResponse?.items]);

  // Mutations
  const createMutation = useCreateRecurringSurvey();
  const updateMutation = useUpdateRecurringSurvey();
  const deleteMutation = useDeleteRecurringSurvey();
  const pauseMutation = usePauseRecurringSurvey();
  const resumeMutation = useResumeRecurringSurvey();
  const triggerMutation = useTriggerRecurringSurvey();

  // Confirm dialog
  const { ConfirmDialog, confirm } = useConfirmDialog();

  // Handlers
  const handleCreate = useCallback(
    async (data: CreateRecurringSurveyRequest | UpdateRecurringSurveyRequest) => {
      await createMutation.mutateAsync(data as CreateRecurringSurveyRequest);
      createDialog.close();
    },
    [createMutation, createDialog]
  );

  const handleUpdate = useCallback(
    async (data: CreateRecurringSurveyRequest | UpdateRecurringSurveyRequest) => {
      if (!editDialog.selectedItem) return;
      await updateMutation.mutateAsync({ id: editDialog.selectedItem, data: data as UpdateRecurringSurveyRequest });
      editDialog.close();
    },
    [updateMutation, editDialog]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const confirmed = await confirm({
        title: t('recurringSurveys.deleteConfirm.title'),
        description: t('recurringSurveys.deleteConfirm.description'),
        confirmText: t('common.delete'),
        variant: 'destructive',
      });

      if (!confirmed) return;

      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation, confirm, t]
  );

  const handlePause = useCallback(
    async (id: string) => {
      await pauseMutation.mutateAsync(id);
    },
    [pauseMutation]
  );

  const handleResume = useCallback(
    async (id: string) => {
      await resumeMutation.mutateAsync(id);
    },
    [resumeMutation]
  );

  const handleTrigger = useCallback(
    async (id: string) => {
      const confirmed = await confirm({
        title: t('recurringSurveys.triggerConfirm.title'),
        description: t('recurringSurveys.triggerConfirm.description'),
        confirmText: t('recurringSurveys.runNow'),
      });

      if (!confirmed) return;

      await triggerMutation.mutateAsync(id);
    },
    [triggerMutation, confirm, t]
  );

  const handleEdit = useCallback(
    (id: string) => {
      editDialog.open(id);
    },
    [editDialog]
  );

  const handleViewHistory = useCallback(
    (id: string) => {
      historyDrawer.open(id);
    },
    [historyDrawer]
  );

  // Check for active filters
  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all';

  return (
    <ListPageLayout
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      activeFilters={activeFilters}
      onClearAllFilters={clearAllFilters}
    >
      {/* Header */}
      <ListPageLayout.Header
        title={t('recurringSurveys.title')}
        description={t('recurringSurveys.description')}
        icon={renderPageIcon('recurring-surveys')}
        actions={
          <Button className="hidden md:flex" onClick={() => createDialog.open()}>
            <Plus className="h-4 w-4 mr-2" />
            {t('recurringSurveys.createSchedule')}
          </Button>
        }
      />

      {/* Toolbar with filters */}
      <ListPageLayout.Toolbar searchPlaceholder={t('recurringSurveys.searchPlaceholder')}>
        <Tabs value={statusFilter} onValueChange={(v) => setFilter('status', v as StatusFilter)} variant="segmented">
          <TabsList>
            <TabsTrigger value="all">{t('recurringSurveys.tabs.all')}</TabsTrigger>
            <TabsTrigger value="active">{t('recurringSurveys.tabs.active')}</TabsTrigger>
            <TabsTrigger value="inactive">{t('recurringSurveys.tabs.paused')}</TabsTrigger>
          </TabsList>
        </Tabs>
      </ListPageLayout.Toolbar>

      {/* Active filters bar */}
      <ListPageLayout.FiltersBar />

      {/* Content */}
      <ListPageLayout.Content>
        {/* Stats */}
        <StatsCards recurringSurveys={recurringSurveys || []} isLoading={isLoading} />

        {/* Upcoming runs preview */}
        <UpcomingRunsPreview />

        {/* Content - Using ListContainer compound component */}
        <ListContainer items={recurringSurveys} isLoading={isLoading} hasError={isError} viewMode={viewMode}>
          <ListContainer.Loading>
            <GridSkeleton viewMode={viewMode} count={6} gridHeight="h-52" listHeight="h-32" />
          </ListContainer.Loading>

          <ListContainer.Error>
            <EmptyState
              icon={<AlertCircle className="h-7 w-7" />}
              title={t('recurringSurveys.loadError')}
              description={t('recurringSurveys.loadErrorDesc')}
              iconVariant="muted"
              action={{
                label: t('errors.tryAgain'),
                onClick: () => refetch(),
                variant: 'tonal',
              }}
            />
          </ListContainer.Error>

          <ListContainer.Empty>
            <RecurringSurveysEmptyState
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearAllFilters}
              onCreateItem={() => createDialog.open()}
            />
          </ListContainer.Empty>

          <ListContainer.Content>
            <div className={cn(viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-4')}>
              {recurringSurveys.map((rs) => (
                <RecurringSurveyCard
                  key={rs.id}
                  recurringSurvey={rs}
                  onPause={handlePause}
                  onResume={handleResume}
                  onTrigger={handleTrigger}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onViewHistory={handleViewHistory}
                  isLoading={pauseMutation.isPending || resumeMutation.isPending || deleteMutation.isPending || triggerMutation.isPending}
                />
              ))}
            </div>
          </ListContainer.Content>
        </ListContainer>
      </ListPageLayout.Content>

      {/* FAB for mobile */}
      <ListPageLayout.FAB icon={<Plus className="h-6 w-6" />} onClick={() => createDialog.open()} />

      {/* Dialogs */}
      <ListPageLayout.Dialogs>
        <RecurringScheduleEditor
          open={createDialog.isOpen}
          onOpenChange={createDialog.setOpen}
          surveys={surveysData?.items}
          onSubmit={handleCreate}
          isLoading={createMutation.isPending}
        />

        <RecurringScheduleEditor
          open={editDialog.isOpen}
          onOpenChange={editDialog.setOpen}
          recurringSurvey={editingRecurringSurvey || undefined}
          onSubmit={handleUpdate}
          isLoading={updateMutation.isPending}
        />

        <RunHistoryDrawer open={historyDrawer.isOpen} onOpenChange={historyDrawer.setOpen} recurringSurvey={historyRecurringSurvey || undefined} />

        <ConfirmDialog />
      </ListPageLayout.Dialogs>
    </ListPageLayout>
  );
}
