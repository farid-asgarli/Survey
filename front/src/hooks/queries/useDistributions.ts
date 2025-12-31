/**
 * React Query hooks for Email Distribution operations
 *
 * Provides type-safe data fetching and mutations for:
 * - Listing distributions for a survey
 * - Fetching distribution details and stats
 * - Creating, scheduling, sending, canceling, and deleting distributions
 * - Paginated recipient lists
 *
 * @example
 * ```tsx
 * const { data: distributions } = useDistributions(surveyId);
 * const sendMutation = useSendDistribution(surveyId);
 * await sendMutation.mutateAsync(distId);
 * ```
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { distributionsApi } from '@/services';
import { DistributionStatus } from '@/types';
import type { CreateDistributionRequest, EmailDistribution, DistributionStatsResponse, DistributionRecipient, RecipientStatus } from '@/types';
import { createExtendedQueryKeys, STALE_TIMES } from './queryUtils';

// Query keys - distributions have custom detail (surveyId + distId), stats, and recipients
export const distributionKeys = createExtendedQueryKeys('distributions', (base) => ({
  detail: (surveyId: string, distId: string) => [...base.details(), surveyId, distId] as const,
  stats: (surveyId: string, distId: string) => [...base.all, 'stats', surveyId, distId] as const,
  recipients: (surveyId: string, distId: string, params?: { status?: RecipientStatus }) =>
    [...base.all, 'recipients', surveyId, distId, params] as const,
}));

/**
 * Hook to fetch all distributions for a survey
 */
export function useDistributions(surveyId: string | undefined) {
  return useQuery({
    queryKey: distributionKeys.list(surveyId!),
    queryFn: () => distributionsApi.list(surveyId!),
    enabled: !!surveyId,
    staleTime: STALE_TIMES.MEDIUM,
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
    staleTime: STALE_TIMES.LONG,
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
    staleTime: STALE_TIMES.SHORT,
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
 * Hook to cancel a distribution.
 * Optimistically updates the distribution status to Cancelled.
 */
export function useCancelDistribution(surveyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (distId: string) => distributionsApi.cancel(surveyId, distId),
    onMutate: async (distId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: distributionKeys.list(surveyId) });
      await queryClient.cancelQueries({ queryKey: distributionKeys.detail(surveyId, distId) });

      // Snapshot current values for rollback
      const previousList = queryClient.getQueryData<EmailDistribution[]>(distributionKeys.list(surveyId));
      const previousDetail = queryClient.getQueryData<EmailDistribution>(distributionKeys.detail(surveyId, distId));

      // Optimistically update to cancelled status
      queryClient.setQueryData<EmailDistribution[]>(distributionKeys.list(surveyId), (old) => {
        if (!old) return old;
        return old.map((dist) => (dist.id === distId ? { ...dist, status: DistributionStatus.Cancelled } : dist));
      });

      queryClient.setQueryData<EmailDistribution>(distributionKeys.detail(surveyId, distId), (old) => {
        if (!old) return old;
        return { ...old, status: DistributionStatus.Cancelled };
      });

      return { previousList, previousDetail };
    },
    onError: (_error, distId, context) => {
      // Rollback on error
      if (context?.previousList) {
        queryClient.setQueryData(distributionKeys.list(surveyId), context.previousList);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(distributionKeys.detail(surveyId, distId), context.previousDetail);
      }
    },
    onSettled: (_, __, distId) => {
      // Always refetch after mutation settles
      queryClient.invalidateQueries({ queryKey: distributionKeys.list(surveyId) });
      queryClient.invalidateQueries({ queryKey: distributionKeys.detail(surveyId, distId) });
    },
  });
}

/**
 * Hook to delete a distribution permanently.
 * Optimistically removes the distribution from the list.
 */
export function useDeleteDistribution(surveyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (distId: string) => distributionsApi.delete(surveyId, distId),
    onMutate: async (distId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: distributionKeys.list(surveyId) });

      // Snapshot current value for rollback
      const previousList = queryClient.getQueryData<EmailDistribution[]>(distributionKeys.list(surveyId));

      // Optimistically remove from list
      queryClient.setQueryData<EmailDistribution[]>(distributionKeys.list(surveyId), (old) => {
        if (!old) return old;
        return old.filter((dist) => dist.id !== distId);
      });

      return { previousList };
    },
    onError: (_error, _distId, context) => {
      // Rollback on error
      if (context?.previousList) {
        queryClient.setQueryData(distributionKeys.list(surveyId), context.previousList);
      }
    },
    onSuccess: (_, distId) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: distributionKeys.detail(surveyId, distId) });
      // Remove from stats cache
      queryClient.removeQueries({ queryKey: distributionKeys.stats(surveyId, distId) });
      // Remove recipients cache
      queryClient.removeQueries({ queryKey: distributionKeys.recipients(surveyId, distId) });
    },
    onSettled: () => {
      // Always refetch after mutation settles
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
    staleTime: STALE_TIMES.SHORT,
  });
}

// Re-export types for convenience
export type { EmailDistribution, CreateDistributionRequest, DistributionStatsResponse, DistributionRecipient };
