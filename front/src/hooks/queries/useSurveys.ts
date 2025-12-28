// React Query hooks for Survey operations

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { surveysApi } from '@/services';
import { useNamespaceStore } from '@/stores';
import type { CreateSurveyRequest, UpdateSurveyRequest, SurveyListParams, SurveyStatus } from '@/types';

// Query keys
export const surveyKeys = {
  all: ['surveys'] as const,
  lists: () => [...surveyKeys.all, 'list'] as const,
  list: (namespaceId: string, filters?: SurveyListParams) => [...surveyKeys.lists(), namespaceId, filters] as const,
  infiniteList: (namespaceId: string, filters?: Omit<SurveyListParams, 'pageNumber'>) =>
    [...surveyKeys.lists(), 'infinite', namespaceId, filters] as const,
  details: () => [...surveyKeys.all, 'detail'] as const,
  detail: (id: string) => [...surveyKeys.details(), id] as const,
};

export interface SurveyFilters {
  status?: SurveyStatus | 'all';
  search?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Hook to fetch paginated surveys list
 */
export function useSurveysList(filters?: SurveyFilters) {
  const { activeNamespace } = useNamespaceStore();
  const namespaceId = activeNamespace?.id;

  const params: SurveyListParams = {
    pageNumber: 1,
    pageSize: 20,
    ...(filters?.status && filters.status !== 'all' ? { status: String(filters.status) } : {}),
    ...(filters?.search ? { search: filters.search } : {}),
    ...(filters?.fromDate ? { fromDate: filters.fromDate } : {}),
    ...(filters?.toDate ? { toDate: filters.toDate } : {}),
  };

  return useQuery({
    queryKey: surveyKeys.list(namespaceId || '', params),
    queryFn: () => surveysApi.list(namespaceId!, params),
    enabled: !!namespaceId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch infinite scrolling surveys list
 */
export function useSurveysInfinite(filters?: SurveyFilters) {
  const { activeNamespace } = useNamespaceStore();
  const namespaceId = activeNamespace?.id;

  const baseParams: Omit<SurveyListParams, 'pageNumber'> = {
    pageSize: 20,
    ...(filters?.status && filters.status !== 'all' ? { status: String(filters.status) } : {}),
    ...(filters?.search ? { search: filters.search } : {}),
    ...(filters?.fromDate ? { fromDate: filters.fromDate } : {}),
    ...(filters?.toDate ? { toDate: filters.toDate } : {}),
    ...(filters?.sortBy ? { sortBy: filters.sortBy } : {}),
    ...(filters?.sortOrder ? { sortOrder: filters.sortOrder } : {}),
  };

  return useInfiniteQuery({
    queryKey: surveyKeys.infiniteList(namespaceId || '', baseParams),
    queryFn: ({ pageParam }) => surveysApi.list(namespaceId!, { ...baseParams, pageNumber: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.pageNumber + 1 : undefined),
    enabled: !!namespaceId,
    staleTime: 2 * 60 * 1000,
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
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to create a new survey
 */
export function useCreateSurvey() {
  const queryClient = useQueryClient();
  const { activeNamespace } = useNamespaceStore();

  return useMutation({
    mutationFn: (data: CreateSurveyRequest) => surveysApi.create(activeNamespace!.id, data),
    onSuccess: () => {
      // Invalidate all survey lists for this namespace
      queryClient.invalidateQueries({
        queryKey: surveyKeys.lists(),
      });
    },
  });
}

/**
 * Hook to update a survey
 */
export function useUpdateSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSurveyRequest }) => surveysApi.update(id, data),
    onSuccess: (updatedSurvey, { id }) => {
      // Update detail cache
      queryClient.setQueryData(surveyKeys.detail(id), updatedSurvey);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: surveyKeys.lists() });
    },
  });
}

/**
 * Hook to delete a survey
 */
export function useDeleteSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => surveysApi.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: surveyKeys.detail(deletedId) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: surveyKeys.lists() });
    },
  });
}

/**
 * Hook to publish a survey
 */
export function usePublishSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => surveysApi.publish(id),
    onSuccess: (updatedSurvey, id) => {
      // Update detail cache
      queryClient.setQueryData(surveyKeys.detail(id), updatedSurvey);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: surveyKeys.lists() });
    },
  });
}

/**
 * Hook to close a survey
 */
export function useCloseSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => surveysApi.close(id),
    onSuccess: (updatedSurvey, id) => {
      // Update detail cache
      queryClient.setQueryData(surveyKeys.detail(id), updatedSurvey);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: surveyKeys.lists() });
    },
  });
}

/**
 * Hook to duplicate a survey (create a copy)
 */
export function useDuplicateSurvey() {
  const queryClient = useQueryClient();
  const { activeNamespace } = useNamespaceStore();

  return useMutation({
    mutationFn: async (surveyId: string) => {
      // First get the survey details
      const original = await surveysApi.getById(surveyId);
      // Create a copy with modified title
      return surveysApi.create(activeNamespace!.id, {
        title: `${original.title} (Copy)`,
        description: original.description,
        themeId: original.themeId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.lists() });
    },
  });
}
