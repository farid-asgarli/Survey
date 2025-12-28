// ResponsesPage - Survey response management page

import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Download, RefreshCw, ClipboardList } from 'lucide-react';
import { Button, Card, EmptyState } from '@/components/ui';
import { Layout, PageHeader } from '@/components/layout';
import { renderPageIcon } from '@/config';
import { ResponseDetailDrawer, ExportDialog } from '@/components/features/responses';
import { useResponsesInfinite, useDeleteResponses, type ResponseFilters } from '@/hooks/queries/useResponses';
import { useSurveysList } from '@/hooks/queries/useSurveys';
import { useInfiniteScroll } from '@/hooks';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { cn } from '@/lib/utils';
import type { Survey } from '@/types';
import type { CompletionFilter } from './types';
import { ResponseRow, ResponsesEmptyState, LoadingSkeleton, FiltersBar, BulkActionsBar, ResponsesTableHeader } from './components';

export function ResponsesPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get surveyId from URL if present
  const surveyIdFromUrl = searchParams.get('surveyId');

  const [selectedSurveyId, setSelectedSurveyId] = useState<string | undefined>(surveyIdFromUrl || undefined);
  const [completionFilter, setCompletionFilter] = useState<CompletionFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState<string | undefined>();
  const [toDate, setToDate] = useState<string | undefined>();
  const [selectedResponses, setSelectedResponses] = useState<Set<string>>(new Set());
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Fetch surveys for the dropdown
  const { data: surveysData, isLoading: surveysLoading } = useSurveysList();

  // Build filters for responses query
  const filters: ResponseFilters = useMemo(
    () => ({
      ...(completionFilter !== 'all' ? { isCompleted: completionFilter === 'complete' } : {}),
      ...(fromDate ? { fromDate } : {}),
      ...(toDate ? { toDate } : {}),
      ...(searchQuery ? { search: searchQuery } : {}),
    }),
    [completionFilter, fromDate, toDate, searchQuery]
  );

  // Fetch responses
  const {
    data: responsesData,
    isLoading: responsesLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useResponsesInfinite(selectedSurveyId, filters);

  // Delete mutation
  const deleteResponses = useDeleteResponses(selectedSurveyId || '');

  // Flatten paginated responses
  const responses = useMemo(() => {
    if (!responsesData?.pages) return [];
    return responsesData.pages.flatMap((page) => page.items);
  }, [responsesData]);

  // Create survey lookup map
  const surveysMap = useMemo(() => {
    const items = surveysData?.items;
    if (!items) return new Map<string, Survey>();
    return new Map(items.map((s) => [s.id, s]));
  }, [surveysData]);

  // Filter responses by search query (client-side)
  const filteredResponses = useMemo(() => {
    if (!searchQuery) return responses;
    const query = searchQuery.toLowerCase();
    return responses.filter((r) => {
      if (r.respondentEmail?.toLowerCase().includes(query)) return true;
      const survey = surveysMap.get(r.surveyId);
      if (survey?.title.toLowerCase().includes(query)) return true;
      return false;
    });
  }, [responses, searchQuery, surveysMap]);

  // Infinite scroll
  const { sentinelRef } = useInfiniteScroll({
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    onLoadMore: fetchNextPage,
  });

  // Survey options for dropdown
  const surveyOptions = useMemo(() => {
    const options = [{ value: '', label: t('responses.allSurveys') }];
    const items = surveysData?.items;
    if (items) {
      items.forEach((s) => {
        options.push({ value: s.id, label: s.title });
      });
    }
    return options;
  }, [surveysData, t]);

  // Handle survey change
  const handleSurveyChange = useCallback(
    (value: string) => {
      const newSurveyId = value || undefined;
      setSelectedSurveyId(newSurveyId);
      setSelectedResponses(new Set());

      // Update URL
      if (newSurveyId) {
        searchParams.set('surveyId', newSurveyId);
      } else {
        searchParams.delete('surveyId');
      }
      setSearchParams(searchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  // Selection handlers
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedResponses(new Set(filteredResponses.map((r) => r.id)));
      } else {
        setSelectedResponses(new Set());
      }
    },
    [filteredResponses]
  );

  const handleSelectResponse = useCallback((responseId: string, checked: boolean) => {
    setSelectedResponses((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(responseId);
      } else {
        next.delete(responseId);
      }
      return next;
    });
  }, []);

  // Delete handlers
  const handleDeleteSelected = async () => {
    if (selectedResponses.size === 0 || !selectedSurveyId) return;

    const confirmed = await confirm({
      title: t('responses.deleteResponses'),
      description: t('responses.deleteConfirm', { count: selectedResponses.size }),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
      variant: 'destructive',
    });

    if (confirmed) {
      await deleteResponses.mutateAsync(Array.from(selectedResponses));
      setSelectedResponses(new Set());
    }
  };

  // View response detail
  const handleViewResponse = useCallback((responseId: string) => {
    setSelectedResponseId(responseId);
    setIsDetailOpen(true);
  }, []);

  // Check if all visible responses are selected
  const isAllSelected = filteredResponses.length > 0 && selectedResponses.size === filteredResponses.length;

  // Has any active filters
  const hasFilters = completionFilter !== 'all' || !!fromDate || !!toDate || !!searchQuery;

  // Get selected survey for context
  const selectedSurvey = selectedSurveyId ? surveysMap.get(selectedSurveyId) : undefined;

  return (
    <Layout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <PageHeader
          title={t('responses.title')}
          description={t('responses.description')}
          icon={renderPageIcon('responses')}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => refetch()} disabled={responsesLoading}>
                <RefreshCw className={cn('h-4 w-4 mr-2', responsesLoading && 'animate-spin')} />
                {t('common.refresh')}
              </Button>
              <Button variant="tonal" onClick={() => setIsExportOpen(true)} disabled={!selectedSurveyId}>
                <Download className="h-4 w-4 mr-2" />
                {t('responses.export')}
              </Button>
            </div>
          }
        />

        {/* Filters Bar */}
        <FiltersBar
          surveyOptions={surveyOptions}
          selectedSurveyId={selectedSurveyId}
          onSurveyChange={handleSurveyChange}
          surveysLoading={surveysLoading}
          completionFilter={completionFilter}
          onCompletionFilterChange={setCompletionFilter}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          fromDate={fromDate}
          toDate={toDate}
          onDateRangeChange={(from, to) => {
            setFromDate(from);
            setToDate(to);
          }}
          selectedSurvey={selectedSurvey}
        />

        {/* Bulk Actions Bar */}
        <BulkActionsBar
          selectedCount={selectedResponses.size}
          isAllSelected={isAllSelected}
          onSelectAll={handleSelectAll}
          onDelete={handleDeleteSelected}
          isDeleting={deleteResponses.isPending}
        />

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 md:px-6 md:pb-6">
          {!selectedSurveyId ? (
            <EmptyState
              icon={<ClipboardList className="h-7 w-7" />}
              title={t('responses.selectSurveyTitle')}
              description={t('responses.selectSurveyDesc')}
              iconVariant="default"
              size="full"
            />
          ) : responsesLoading ? (
            <Card variant="outlined" shape="rounded" className="border-2 border-outline-variant/30 overflow-hidden">
              <LoadingSkeleton />
            </Card>
          ) : filteredResponses.length === 0 ? (
            <ResponsesEmptyState hasFilters={hasFilters} />
          ) : (
            <Card variant="outlined" shape="rounded" className="border-2 border-outline-variant/30 overflow-hidden">
              {/* Table Header */}
              <ResponsesTableHeader isAllSelected={isAllSelected} onSelectAll={handleSelectAll} />

              {/* Response List */}
              <div className="divide-y divide-outline-variant/30">
                {filteredResponses.map((response) => (
                  <ResponseRow
                    key={response.id}
                    response={response}
                    survey={surveysMap.get(response.surveyId)}
                    isSelected={selectedResponses.has(response.id)}
                    onSelect={(checked) => handleSelectResponse(response.id, checked)}
                    onClick={() => handleViewResponse(response.id)}
                  />
                ))}
              </div>

              {/* Infinite scroll trigger */}
              <div ref={sentinelRef} className="h-px" />

              {/* Loading more indicator */}
              {isFetchingNextPage && (
                <div className="flex items-center justify-center py-4">
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    {t('common.loading')}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Response Detail Drawer */}
      {selectedSurveyId && (
        <ResponseDetailDrawer
          surveyId={selectedSurveyId}
          responseId={selectedResponseId}
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          onDeleted={() => {
            setSelectedResponses((prev) => {
              const next = new Set(prev);
              if (selectedResponseId) next.delete(selectedResponseId);
              return next;
            });
          }}
        />
      )}

      {/* Export Dialog */}
      {selectedSurveyId && (
        <ExportDialog surveyId={selectedSurveyId} surveyTitle={selectedSurvey?.title} open={isExportOpen} onOpenChange={setIsExportOpen} />
      )}

      <ConfirmDialog />
    </Layout>
  );
}
