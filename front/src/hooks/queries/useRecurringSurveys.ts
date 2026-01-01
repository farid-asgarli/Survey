// React Query hooks for Recurring Survey operations

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { recurringSurveysApi, type RecurringSurveysListParams } from '@/services';
import type { CreateRecurringSurveyRequest, UpdateRecurringSurveyRequest, RecurringRunsParams } from '@/types';
import { createExtendedQueryKeys, STALE_TIMES } from './queryUtils';

// Query keys - recurring surveys have upcoming, runs, and runsInfinite custom keys
export const recurringSurveyKeys = createExtendedQueryKeys('recurringSurveys', (base) => ({
  upcoming: (count?: number) => [...base.all, 'upcoming', count] as const,
  runs: (id: string, params?: RecurringRunsParams) => [...base.all, 'runs', id, params] as const,
  runsInfinite: (id: string, params?: Omit<RecurringRunsParams, 'pageNumber'>) => [...base.all, 'runs', 'infinite', id, params] as const,
}));

import { useNamespaceStore } from '@/stores';

/**
 * Hook to fetch all recurring surveys
 */
export function useRecurringSurveys(params?: RecurringSurveysListParams) {
  const { activeNamespace } = useNamespaceStore();

  return useQuery({
    queryKey: recurringSurveyKeys.list(params),
    queryFn: () => recurringSurveysApi.list(params),
    enabled: !!activeNamespace?.id,
    staleTime: STALE_TIMES.MEDIUM,
  });
}

/**
 * Hook to fetch upcoming runs across all recurring surveys
 */
export function useUpcomingRuns(count?: number) {
  const { activeNamespace } = useNamespaceStore();

  return useQuery({
    queryKey: recurringSurveyKeys.upcoming(count),
    queryFn: () => recurringSurveysApi.getUpcoming(count),
    enabled: !!activeNamespace?.id,
    staleTime: STALE_TIMES.SHORT,
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  });
}

/**
 * Hook to fetch a single recurring survey by ID
 */
export function useRecurringSurveyDetail(id: string | undefined) {
  return useQuery({
    queryKey: recurringSurveyKeys.detail(id!),
    queryFn: () => recurringSurveysApi.getById(id!),
    enabled: !!id,
    staleTime: STALE_TIMES.LONG,
  });
}

/**
 * Hook to create a new recurring survey
 */
export function useCreateRecurringSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRecurringSurveyRequest) => recurringSurveysApi.create(data),
    onSuccess: () => {
      // Invalidate all list queries to refetch
      queryClient.invalidateQueries({ queryKey: recurringSurveyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recurringSurveyKeys.upcoming() });
    },
  });
}

/**
 * Hook to update a recurring survey
 */
export function useUpdateRecurringSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<UpdateRecurringSurveyRequest, 'id'> }) => recurringSurveysApi.update(id, data),
    onSuccess: (updatedRecurringSurvey, { id }) => {
      // Update detail cache
      queryClient.setQueryData(recurringSurveyKeys.detail(id), updatedRecurringSurvey);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: recurringSurveyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recurringSurveyKeys.upcoming() });
    },
  });
}

/**
 * Hook to delete a recurring survey
 */
export function useDeleteRecurringSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recurringSurveysApi.delete(id),
    onSuccess: (_, id) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: recurringSurveyKeys.detail(id) });
      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: recurringSurveyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recurringSurveyKeys.upcoming() });
    },
  });
}

/**
 * Hook to pause a recurring survey
 */
export function usePauseRecurringSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recurringSurveysApi.pause(id),
    onSuccess: (updatedRecurringSurvey, id) => {
      // Update detail cache
      queryClient.setQueryData(recurringSurveyKeys.detail(id), updatedRecurringSurvey);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: recurringSurveyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recurringSurveyKeys.upcoming() });
    },
  });
}

/**
 * Hook to resume a paused recurring survey
 */
export function useResumeRecurringSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recurringSurveysApi.resume(id),
    onSuccess: (updatedRecurringSurvey, id) => {
      // Update detail cache
      queryClient.setQueryData(recurringSurveyKeys.detail(id), updatedRecurringSurvey);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: recurringSurveyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recurringSurveyKeys.upcoming() });
    },
  });
}

/**
 * Hook to trigger an immediate run
 */
export function useTriggerRecurringSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recurringSurveysApi.trigger(id),
    onSuccess: (_newRun, id) => {
      // Invalidate runs list for this recurring survey
      queryClient.invalidateQueries({ queryKey: recurringSurveyKeys.runs(id) });
      queryClient.invalidateQueries({ queryKey: recurringSurveyKeys.runsInfinite(id) });
      // Invalidate detail to update lastRunAt
      queryClient.invalidateQueries({ queryKey: recurringSurveyKeys.detail(id) });
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: recurringSurveyKeys.lists() });
    },
  });
}

/**
 * Hook to fetch run history with pagination
 */
export function useRecurringRuns(id: string | undefined, params?: RecurringRunsParams) {
  return useQuery({
    queryKey: recurringSurveyKeys.runs(id!, params),
    queryFn: () => recurringSurveysApi.getRuns(id!, params),
    enabled: !!id,
    staleTime: STALE_TIMES.SHORT,
  });
}

/**
 * Hook to fetch run history with infinite scroll
 */
export function useRecurringRunsInfinite(id: string | undefined, params?: Omit<RecurringRunsParams, 'pageNumber'>) {
  const pageSize = params?.pageSize ?? 20;

  return useInfiniteQuery({
    queryKey: recurringSurveyKeys.runsInfinite(id!, params),
    queryFn: ({ pageParam = 1 }) =>
      recurringSurveysApi.getRuns(id!, {
        ...params,
        pageNumber: pageParam,
        pageSize,
      }),
    enabled: !!id,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.totalCount / pageSize);
      if (lastPage.pageNumber < totalPages) {
        return lastPage.pageNumber + 1;
      }
      return undefined;
    },
    staleTime: STALE_TIMES.SHORT,
  });
}
