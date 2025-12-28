// React Query hooks for Email Distribution operations

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { distributionsApi } from '@/services';
import type { CreateDistributionRequest, EmailDistribution, DistributionStatsResponse, DistributionRecipient, RecipientStatus } from '@/types';

// Query keys
export const distributionKeys = {
  all: ['distributions'] as const,
  lists: () => [...distributionKeys.all, 'list'] as const,
  list: (surveyId: string) => [...distributionKeys.lists(), surveyId] as const,
  details: () => [...distributionKeys.all, 'detail'] as const,
  detail: (surveyId: string, distId: string) => [...distributionKeys.details(), surveyId, distId] as const,
  stats: (surveyId: string, distId: string) => [...distributionKeys.all, 'stats', surveyId, distId] as const,
  recipients: (surveyId: string, distId: string, params?: { status?: RecipientStatus }) =>
    [...distributionKeys.all, 'recipients', surveyId, distId, params] as const,
};

/**
 * Hook to fetch all distributions for a survey
 */
export function useDistributions(surveyId: string | undefined) {
  return useQuery({
    queryKey: distributionKeys.list(surveyId!),
    queryFn: () => distributionsApi.list(surveyId!),
    enabled: !!surveyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch a single distribution by ID
 */
export function useDistributionDetail(surveyId: string | undefined, distId: string | undefined) {
  return useQuery({
    queryKey: distributionKeys.detail(surveyId!, distId!),
    queryFn: () => distributionsApi.getById(surveyId!, distId!),
    enabled: !!surveyId && !!distId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch distribution stats
 */
export function useDistributionStats(surveyId: string | undefined, distId: string | undefined) {
  return useQuery({
    queryKey: distributionKeys.stats(surveyId!, distId!),
    queryFn: () => distributionsApi.getStats(surveyId!, distId!),
    enabled: !!surveyId && !!distId,
    staleTime: 1 * 60 * 1000, // 1 minute - refresh more often for stats
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds when active
  });
}

/**
 * Hook to create a new distribution
 */
export function useCreateDistribution(surveyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDistributionRequest) => distributionsApi.create(surveyId, data),
    onSuccess: (newDistribution) => {
      // Update cache with new distribution
      queryClient.setQueryData<EmailDistribution[]>(distributionKeys.list(surveyId), (old) => {
        if (!old) return [newDistribution];
        return [...old, newDistribution];
      });
      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: distributionKeys.list(surveyId) });
    },
  });
}

/**
 * Hook to schedule a distribution
 */
export function useScheduleDistribution(surveyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ distId, scheduledAt }: { distId: string; scheduledAt: string }) => distributionsApi.schedule(surveyId, distId, scheduledAt),
    onSuccess: (updatedDistribution, { distId }) => {
      // Update detail cache
      queryClient.setQueryData(distributionKeys.detail(surveyId, distId), updatedDistribution);
      // Update list cache
      queryClient.setQueryData<EmailDistribution[]>(distributionKeys.list(surveyId), (old) => {
        if (!old) return [updatedDistribution];
        return old.map((dist) => (dist.id === distId ? updatedDistribution : dist));
      });
    },
  });
}

/**
 * Hook to send a distribution immediately
 */
export function useSendDistribution(surveyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (distId: string) => distributionsApi.sendNow(surveyId, distId),
    onSuccess: (updatedDistribution, distId) => {
      // Update detail cache
      queryClient.setQueryData(distributionKeys.detail(surveyId, distId), updatedDistribution);
      // Update list cache
      queryClient.setQueryData<EmailDistribution[]>(distributionKeys.list(surveyId), (old) => {
        if (!old) return [updatedDistribution];
        return old.map((dist) => (dist.id === distId ? updatedDistribution : dist));
      });
    },
  });
}

/**
 * Hook to cancel a distribution
 */
export function useCancelDistribution(surveyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (distId: string) => distributionsApi.cancel(surveyId, distId),
    onSuccess: (_, distId) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: distributionKeys.detail(surveyId, distId) });
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: distributionKeys.list(surveyId) });
    },
  });
}

/**
 * Hook to delete a distribution permanently
 */
export function useDeleteDistribution(surveyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (distId: string) => distributionsApi.delete(surveyId, distId),
    onSuccess: (_, distId) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: distributionKeys.detail(surveyId, distId) });
      // Remove from stats cache
      queryClient.removeQueries({ queryKey: distributionKeys.stats(surveyId, distId) });
      // Invalidate list to refetch
      queryClient.invalidateQueries({ queryKey: distributionKeys.list(surveyId) });
    },
  });
}

/**
 * Hook to fetch distribution recipients with pagination
 */
export function useDistributionRecipients(
  surveyId: string | undefined,
  distId: string | undefined,
  options?: { status?: RecipientStatus; pageSize?: number }
) {
  const pageSize = options?.pageSize ?? 20;

  return useInfiniteQuery({
    queryKey: distributionKeys.recipients(surveyId!, distId!, { status: options?.status }),
    queryFn: ({ pageParam = 1 }) =>
      distributionsApi.getRecipients(surveyId!, distId!, {
        pageNumber: pageParam,
        pageSize,
        status: options?.status,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const hasMore = lastPage.pageNumber * lastPage.pageSize < lastPage.totalCount;
      return hasMore ? lastPage.pageNumber + 1 : undefined;
    },
    enabled: !!surveyId && !!distId,
    staleTime: 1 * 60 * 1000,
  });
}

// Re-export types for convenience
export type { EmailDistribution, CreateDistributionRequest, DistributionStatsResponse, DistributionRecipient };
