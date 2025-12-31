/**
 * SurveysPage - Manage surveys
 *
 * Features:
 * - useListPageState hook for combined state management
 * - useEntityActions hook for CRUD operations
 * - ListPageLayout compound component for consistent structure
 * - Section-based component organization for maintainability
 * - User preferences integration for view mode, sorting, etc.
 */

import { useMemo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, FileText } from 'lucide-react';
import { useViewTransitionNavigate, useCopyToClipboard } from '@/hooks';
import { EmptyState, toast } from '@/components/ui';
import { ListPageLayout } from '@/components/layout';
import { CreateSurveyDialog, type CreateSurveyFormData } from '@/components/features/surveys';
import {
  useSurveysInfinite,
  useCreateSurvey,
  useDeleteSurvey,
  usePublishSurvey,
  useCloseSurvey,
  useDuplicateSurvey,
  useInfiniteScroll,
  useListPageState,
  useEntityActions,
  useDialogState,
  useConfirmDialog,
  FilterMatchers,
  type SurveyFilters,
  type ExtendedFilterConfig,
} from '@/hooks';
import { useNamespaceStore, usePreferencesStore } from '@/stores';
import type { Survey, SurveyStatus, ViewMode } from '@/types';
import { SurveysHeader, SurveysToolbar, SurveysContent, SurveysEmptyState } from './sections';

type StatusFilter = SurveyStatus | 'all';

type SurveyListFilters = {
  status: StatusFilter;
};

/** Filter configuration for the surveys list page */
const FILTER_CONFIGS: ExtendedFilterConfig<Survey, unknown>[] = [
  {
    key: 'status',
    defaultValue: 'all' as const,
    label: 'Status',
    formatValue: (v) => String(v),
    getValue: (survey: Survey) => survey.status,
    matches: (itemValue: unknown, filterValue: unknown): boolean => FilterMatchers.equalOrAll(itemValue, filterValue as StatusFilter),
  },
];

export function SurveysPage() {
  const { t } = useTranslation();
  const navigate = useViewTransitionNavigate();
  const { activeNamespace } = useNamespaceStore();
  const { copy } = useCopyToClipboard();

  // Get user preferences for default view mode and sorting
  const dashboardPrefs = usePreferencesStore((s) => s.preferences.dashboard);

  // Dialog State using reusable hook
  const [fromDate, setFromDate] = useState<string | undefined>();
  const [toDate, setToDate] = useState<string | undefined>();
  const createDialog = useDialogState();

  // Use the combined list page state hook with preferences as initial values
  const { viewMode, setViewMode, searchQuery, setSearchQuery, filters, setFilter, activeFilters, clearAllFilters, hasActiveFilters } =
    useListPageState<Survey, SurveyListFilters>({
      initialFilters: { status: 'all' },
      filterConfigs: FILTER_CONFIGS,
      items: [], // We use server-side filtering for surveys, so no items here
      initialViewMode: dashboardPrefs.defaultViewMode as ViewMode,
    });

  // Build filters object for API - use preferences for sort
  const apiFilters: SurveyFilters = useMemo(
    () => ({
      status: filters.status !== 'all' ? filters.status : undefined,
      search: searchQuery || undefined,
      fromDate,
      toDate,
      sortBy: dashboardPrefs.defaultSortField,
      sortOrder: dashboardPrefs.defaultSortOrder,
    }),
    [filters.status, searchQuery, fromDate, toDate, dashboardPrefs.defaultSortField, dashboardPrefs.defaultSortOrder]
  );

  // Infinite scroll query
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch, isRefetching } = useSurveysInfinite(apiFilters);

  // Infinite scroll hook
  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
  });

  // Mutations
  const createSurvey = useCreateSurvey();
  const deleteSurvey = useDeleteSurvey();
  const publishSurvey = usePublishSurvey();
  const closeSurvey = useCloseSurvey();
  const duplicateSurvey = useDuplicateSurvey();

  // Derived data - flatten all pages
  const surveys = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) || [];
  }, [data?.pages]);
  const totalCount = data?.pages[0]?.totalCount || 0;

  // Use entity actions hook for CRUD operations with toast notifications
  const { handleDelete, handleDuplicate, ConfirmDialog } = useEntityActions<Survey>({
    entityName: 'survey',
    getDisplayName: (s) => s.title,
    delete: {
      action: (survey) => deleteSurvey.mutateAsync(survey.id),
    },
    duplicate: {
      action: (survey) => duplicateSurvey.mutateAsync({ surveyId: survey.id }),
    },
  });

  // Confirmation dialog for publish/close actions
  const { ConfirmDialog: PublishConfirmDialog, confirm } = useConfirmDialog();

  // Publish with confirmation - significant action that makes survey live
  const handlePublish = useCallback(
    async (survey: Survey) => {
      const confirmed = await confirm({
        title: t('surveys.publishSurvey'),
        description: t('surveys.publishConfirm', { title: survey.title }),
        confirmText: t('surveys.publishSurvey'),
        variant: 'default',
      });

      if (confirmed) {
        try {
          await publishSurvey.mutateAsync(survey.id);
          toast.success(t('surveys.publishSuccess'));
        } catch {
          toast.error(t('surveys.publishError'));
        }
      }
    },
    [confirm, publishSurvey, t]
  );

  // Close with confirmation - stops accepting responses
  const handleClose = useCallback(
    async (survey: Survey) => {
      const confirmed = await confirm({
        title: t('surveys.closeSurvey'),
        description: t('surveys.closeConfirm', { title: survey.title }),
        confirmText: t('surveys.closeSurvey'),
        variant: 'destructive',
      });

      if (confirmed) {
        try {
          await closeSurvey.mutateAsync(survey.id);
          toast.success(t('surveys.closeSuccess'));
        } catch {
          toast.error(t('surveys.closeError'));
        }
      }
    },
    [confirm, closeSurvey, t]
  );

  // Build date range filter for display
  const allActiveFilters = useMemo(() => {
    const result = [...activeFilters];
    if (fromDate || toDate) {
      result.push({
        key: 'dateRange',
        label: 'Date',
        value: fromDate && toDate ? `${fromDate} - ${toDate}` : fromDate || toDate || '',
        onRemove: () => {
          setFromDate(undefined);
          setToDate(undefined);
        },
      });
    }
    return result;
  }, [activeFilters, fromDate, toDate]);

  // Handlers
  const handleCreateSurvey = async (data: CreateSurveyFormData) => {
    const newSurvey = await createSurvey.mutateAsync({
      title: data.title,
      description: data.description,
      type: data.surveyType,
      cxMetricType: data.cxMetricType,
      languageCode: data.languageCode,
    });
    createDialog.close();
    navigate(`/surveys/${newSurvey.id}/edit`);
  };

  const handleEditSurvey = useCallback(
    (survey: Survey) => {
      navigate(`/surveys/${survey.id}/edit`);
    },
    [navigate]
  );

  const handlePreviewSurvey = useCallback(
    (survey: Survey) => {
      navigate(`/surveys/${survey.id}/preview`);
    },
    [navigate]
  );

  const handleShareSurvey = useCallback(
    (survey: Survey) => {
      const shareUrl = `${window.location.origin}/s/${survey.id}`;
      copy(shareUrl, { successMessage: t('distributions.linkCopied') });
    },
    [copy, t]
  );

  const clearFilters = useCallback(() => {
    clearAllFilters();
    setFromDate(undefined);
    setToDate(undefined);
  }, [clearAllFilters]);

  // No namespace selected
  if (!activeNamespace) {
    return (
      <ListPageLayout viewMode={viewMode} onViewModeChange={setViewMode}>
        <EmptyState
          icon={<FileText className="h-7 w-7" />}
          title={t('workspaces.selectWorkspace')}
          description={t('workspaces.selectWorkspaceDesc')}
          iconVariant="default"
          size="full"
        />
      </ListPageLayout>
    );
  }

  return (
    <ListPageLayout
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      activeFilters={allActiveFilters}
      onClearAllFilters={clearFilters}
    >
      {/* Header */}
      <SurveysHeader
        totalCount={totalCount}
        isLoading={isLoading}
        isRefetching={isRefetching}
        onRefresh={() => refetch()}
        onCreateSurvey={() => createDialog.open()}
      />

      {/* Toolbar with filters */}
      <SurveysToolbar
        searchPlaceholder={t('surveys.searchPlaceholder')}
        statusFilter={filters.status}
        onStatusFilterChange={(status) => setFilter('status', status)}
        fromDate={fromDate}
        toDate={toDate}
        onDateChange={(from, to) => {
          setFromDate(from);
          setToDate(to);
        }}
      />

      {/* Active filters bar */}
      <ListPageLayout.FiltersBar />

      {/* Content */}
      <ListPageLayout.Content>
        <SurveysContent
          surveys={surveys}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={!!hasNextPage}
          totalCount={totalCount}
          viewMode={viewMode}
          hasActiveFilters={hasActiveFilters || !!fromDate}
          sentinelRef={sentinelRef}
          onEdit={handleEditSurvey}
          onPreview={handlePreviewSurvey}
          onDuplicate={(survey) => handleDuplicate?.(survey)}
          onShare={handleShareSurvey}
          onPublish={handlePublish}
          onClose={handleClose}
          onDelete={(survey) => handleDelete?.(survey)}
          onClearFilters={clearFilters}
          onCreateSurvey={() => createDialog.open()}
          EmptyStateComponent={SurveysEmptyState}
        />
      </ListPageLayout.Content>

      {/* FAB for mobile */}
      <ListPageLayout.FAB icon={<Plus className="h-6 w-6" />} onClick={() => createDialog.open()} />

      {/* Dialogs */}
      <CreateSurveyDialog
        open={createDialog.isOpen}
        onOpenChange={createDialog.setOpen}
        onSubmit={handleCreateSurvey}
        isLoading={createSurvey.isPending}
      />

      <ConfirmDialog />
      <PublishConfirmDialog />
    </ListPageLayout>
  );
}
