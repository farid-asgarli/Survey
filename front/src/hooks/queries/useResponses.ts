// React Query hooks for Survey Response operations

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { responsesApi } from '@/services';
import type { ResponsesListParams, ExportResponsesRequest } from '@/types';

// Query keys
export const responseKeys = {
  all: ['responses'] as const,
  lists: () => [...responseKeys.all, 'list'] as const,
  list: (surveyId: string, filters?: ResponsesListParams) => [...responseKeys.lists(), surveyId, filters] as const,
  infiniteList: (surveyId: string, filters?: Omit<ResponsesListParams, 'pageNumber'>) => [...responseKeys.lists(), 'infinite', surveyId, filters] as const,
  details: () => [...responseKeys.all, 'detail'] as const,
  detail: (surveyId: string, responseId: string) => [...responseKeys.details(), surveyId, responseId] as const,
  exportPreview: (surveyId: string) => [...responseKeys.all, 'export-preview', surveyId] as const,
};

export interface ResponseFilters {
  isCompleted?: boolean;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

/**
 * Hook to fetch paginated responses for a survey
 */
export function useResponsesList(surveyId: string | undefined, filters?: ResponseFilters, pageNumber = 1) {
  const params: ResponsesListParams = {
    pageNumber,
    pageSize: 20,
    ...(filters?.isCompleted !== undefined ? { isCompleted: filters.isCompleted } : {}),
    ...(filters?.fromDate ? { fromDate: filters.fromDate } : {}),
    ...(filters?.toDate ? { toDate: filters.toDate } : {}),
  };

  return useQuery({
    queryKey: responseKeys.list(surveyId!, params),
    queryFn: () => responsesApi.list(surveyId!, params),
    enabled: !!surveyId,
    staleTime: 1 * 60 * 1000, // 1 minute - responses change frequently
  });
}

/**
 * Hook to fetch infinite scrolling responses
 */
export function useResponsesInfinite(surveyId: string | undefined, filters?: ResponseFilters) {
  const baseParams: Omit<ResponsesListParams, 'pageNumber'> = {
    pageSize: 20,
    ...(filters?.isCompleted !== undefined ? { isCompleted: filters.isCompleted } : {}),
    ...(filters?.fromDate ? { fromDate: filters.fromDate } : {}),
    ...(filters?.toDate ? { toDate: filters.toDate } : {}),
  };

  return useInfiniteQuery({
    queryKey: responseKeys.infiniteList(surveyId!, baseParams),
    queryFn: ({ pageParam }) => responsesApi.list(surveyId!, { ...baseParams, pageNumber: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.pageNumber + 1 : undefined),
    enabled: !!surveyId,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Hook to fetch a single response by ID
 */
export function useResponseDetail(surveyId: string | undefined, responseId: string | undefined) {
  return useQuery({
    queryKey: responseKeys.detail(surveyId!, responseId!),
    queryFn: () => responsesApi.getById(surveyId!, responseId!),
    enabled: !!surveyId && !!responseId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to delete a single response
 */
export function useDeleteResponse(surveyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (responseId: string) => responsesApi.delete(surveyId, responseId),
    onSuccess: (_, deletedId) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: responseKeys.detail(surveyId, deletedId) });
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: responseKeys.lists() });
    },
  });
}

/**
 * Hook to delete multiple responses in bulk
 */
export function useDeleteResponses(surveyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (responseIds: string[]) => responsesApi.deleteBulk(surveyId, responseIds),
    onSuccess: (_, deletedIds) => {
      // Remove from detail cache
      deletedIds.forEach((id) => {
        queryClient.removeQueries({ queryKey: responseKeys.detail(surveyId, id) });
      });
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: responseKeys.lists() });
    },
  });
}

/**
 * Hook to export responses
 */
export function useExportResponses(surveyId: string) {
  return useMutation({
    mutationFn: (options: ExportResponsesRequest) => responsesApi.export(surveyId, options),
  });
}

/**
 * Hook to get export preview (column options, etc.)
 */
export function useExportPreview(surveyId: string | undefined) {
  return useQuery({
    queryKey: responseKeys.exportPreview(surveyId!),
    queryFn: () => responsesApi.getExportPreview(surveyId!),
    enabled: !!surveyId,
    staleTime: 10 * 60 * 1000, // 10 minutes - doesn't change often
  });
}
