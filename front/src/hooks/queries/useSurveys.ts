// React Query hooks for Survey operations

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { surveysApi } from '@/services';
import { useNamespaceStore } from '@/stores';
import type { CreateSurveyRequest, UpdateSurveyRequest, SurveyListParams, SurveyStatus } from '@/types';
import { createExtendedQueryKeys, useInvalidatingMutation, useUpdatingMutation, STALE_TIMES } from './queryUtils';

// Query keys - using utility with custom infiniteList key
export const surveyKeys = createExtendedQueryKeys('surveys', (base) => ({
  infiniteList: (namespaceId: string, filters?: Omit<SurveyListParams, 'pageNumber'>) => [...base.lists(), 'infinite', namespaceId, filters] as const,
}));

/**
 * Filter options for survey list queries.
 * Maps to backend SurveyListParams with frontend-friendly naming.
 */
export interface SurveyFilters {
  /** Filter by survey status, or 'all' for no filtering */
  status?: SurveyStatus | 'all';
  /** Search term for title/description */
  search?: string;
  /** Filter surveys created on or after this date (ISO string) */
  fromDate?: string;
  /** Filter surveys created on or before this date (ISO string) */
  toDate?: string;
  /** Sort field: 'title', 'createdAt', 'updatedAt', 'status', 'responseCount', 'questionCount' */
  sortBy?: SurveyListParams['sortBy'];
  /** Sort direction: true for descending (default), false for ascending */
  sortDescending?: boolean;
}

/**
 * Converts frontend SurveyFilters to backend SurveyListParams.
 * Handles field mapping and removes undefined/empty values.
 */
function buildSurveyListParams(filters?: SurveyFilters, pageNumber?: number): SurveyListParams {
  return {
    ...(pageNumber !== undefined ? { pageNumber } : {}),
    pageSize: 20,
    ...(filters?.status && filters.status !== 'all' ? { status: String(filters.status) } : {}),
    ...(filters?.search ? { searchTerm: filters.search } : {}),
    ...(filters?.fromDate ? { fromDate: filters.fromDate } : {}),
    ...(filters?.toDate ? { toDate: filters.toDate } : {}),
    ...(filters?.sortBy ? { sortBy: filters.sortBy } : {}),
    ...(filters?.sortDescending !== undefined ? { sortDescending: filters.sortDescending } : {}),
  };
}

/**
 * Hook to fetch paginated surveys list with filtering and sorting.
 *
 * @param filters - Optional filters for status, search, dates, and sorting
 * @returns React Query result with paginated survey data
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useSurveysList({
 *   status: SurveyStatus.Published,
 *   search: 'customer feedback',
 *   sortBy: 'createdAt',
 *   sortDescending: true,
 * });
 * ```
 */
export function useSurveysList(filters?: SurveyFilters) {
  const { activeNamespace } = useNamespaceStore();
  const namespaceId = activeNamespace?.id;

  const params = buildSurveyListParams(filters, 1);

  return useQuery({
    queryKey: surveyKeys.list(namespaceId || '', params),
    queryFn: () => surveysApi.list(namespaceId!, params),
    enabled: !!namespaceId,
    staleTime: STALE_TIMES.MEDIUM,
  });
}

/**
 * Hook to fetch infinite scrolling surveys list with filtering and sorting.
 *
 * @param filters - Optional filters for status, search, dates, and sorting
 * @returns React Query infinite query result with paginated survey data
 *
 * @example
 * ```tsx
 * const { data, fetchNextPage, hasNextPage } = useSurveysInfinite({
 *   status: 'all',
 *   sortBy: 'responseCount',
 *   sortDescending: true,
 * });
 *
 * // Flatten pages for rendering
 * const surveys = data?.pages.flatMap(page => page.items) ?? [];
 * ```
 */
export function useSurveysInfinite(filters?: SurveyFilters) {
  const { activeNamespace } = useNamespaceStore();
  const namespaceId = activeNamespace?.id;

  const baseParams = buildSurveyListParams(filters);

  return useInfiniteQuery({
    queryKey: surveyKeys.infiniteList(namespaceId || '', baseParams),
    queryFn: ({ pageParam }) => surveysApi.list(namespaceId!, { ...baseParams, pageNumber: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.pageNumber + 1 : undefined),
    enabled: !!namespaceId,
    staleTime: STALE_TIMES.MEDIUM,
  });
}

/**
 * Hook to fetch a single survey by ID
 */
export function useSurveyDetail(id: string | undefined) {
  const { activeNamespace } = useNamespaceStore();
  const namespaceId = activeNamespace?.id;

  return useQuery({
    queryKey: surveyKeys.detail(id!),
    queryFn: () => surveysApi.getById(id!),
    enabled: !!id && !!namespaceId,
    staleTime: STALE_TIMES.LONG,
  });
}

/**
 * Hook to create a new survey
 */
export function useCreateSurvey() {
  const { activeNamespace } = useNamespaceStore();

  return useInvalidatingMutation(surveyKeys, (data: CreateSurveyRequest) => {
    if (!activeNamespace) {
      return Promise.reject(new Error('No active namespace selected'));
    }
    return surveysApi.create(activeNamespace.id, data);
  });
}

/**
 * Hook to update a survey
 */
export function useUpdateSurvey() {
  return useUpdatingMutation(
    surveyKeys,
    ({ id, data }: { id: string; data: UpdateSurveyRequest }) => surveysApi.update(id, data),
    ({ id }) => id
  );
}

/**
 * Hook to delete a survey
 */
export function useDeleteSurvey() {
  return useInvalidatingMutation(surveyKeys, (id: string) => surveysApi.delete(id), { removeDetail: (id) => id });
}

/**
 * Hook to publish a survey
 */
export function usePublishSurvey() {
  return useUpdatingMutation(
    surveyKeys,
    (id: string) => surveysApi.publish(id),
    (id) => id
  );
}

/**
 * Hook to close a survey
 */
export function useCloseSurvey() {
  return useUpdatingMutation(
    surveyKeys,
    (id: string) => surveysApi.close(id),
    (id) => id
  );
}

/**
 * Hook to duplicate a survey, creating a new draft copy with all questions and settings.
 * Uses the backend duplicate endpoint for atomic operation.
 *
 * @returns Mutation hook for duplicating surveys
 *
 * @example
 * ```tsx
 * const duplicateSurvey = useDuplicateSurvey();
 *
 * // Duplicate with auto-generated title ("Original (Copy)")
 * duplicateSurvey.mutate({ surveyId: 'abc-123' });
 *
 * // Duplicate with custom title
 * duplicateSurvey.mutate({ surveyId: 'abc-123', newTitle: 'My New Survey' });
 * ```
 */
export function useDuplicateSurvey() {
  return useInvalidatingMutation(surveyKeys, ({ surveyId, newTitle }: { surveyId: string; newTitle?: string }) =>
    surveysApi.duplicate(surveyId, newTitle)
  );
}
