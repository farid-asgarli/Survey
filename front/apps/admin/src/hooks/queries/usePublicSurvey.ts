// React Query hooks for public survey operations

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicSurveyApi } from '@/services/api';
import type { StartResponseRequest, SubmitResponseRequest } from '@/types/public-survey';
import { createExtendedQueryKeys, STALE_TIMES } from './queryUtils';

// Query keys - public survey uses token-based lookup instead of standard list/detail
export const publicSurveyKeys = createExtendedQueryKeys('public-survey', (base) => ({
  byToken: (shareToken: string) => [...base.all, shareToken] as const,
}));

/**
 * Hook to fetch a public survey by share token
 */
export function usePublicSurvey(shareToken: string | undefined) {
  return useQuery({
    queryKey: publicSurveyKeys.byToken(shareToken || ''),
    queryFn: () => publicSurveyApi.getSurvey(shareToken!),
    enabled: !!shareToken,
    staleTime: STALE_TIMES.LONG,
    retry: (failureCount, error) => {
      // Don't retry on 404 (survey not found)
      if ((error as { response?: { status?: number } })?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook to start a survey response (creates a draft)
 */
export function useStartResponse() {
  return useMutation({
    mutationFn: (data: StartResponseRequest) => publicSurveyApi.startResponse(data),
  });
}

/**
 * Hook to submit a survey response
 */
export function useSubmitResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitResponseRequest) => publicSurveyApi.submitResponse(data),
    onSuccess: () => {
      // Optionally invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['responses'] });
    },
  });
}

/**
 * Hook for combined survey loading and submission state
 */
export function usePublicSurveyActions(shareToken: string | undefined) {
  const surveyQuery = usePublicSurvey(shareToken);
  const startMutation = useStartResponse();
  const submitMutation = useSubmitResponse();

  return {
    // Survey data
    survey: surveyQuery.data,
    isLoading: surveyQuery.isLoading,
    isError: surveyQuery.isError,
    error: surveyQuery.error,
    refetch: surveyQuery.refetch,

    // Start response
    startResponse: startMutation.mutate,
    startResponseAsync: startMutation.mutateAsync,
    isStarting: startMutation.isPending,
    startError: startMutation.error,
    startData: startMutation.data,
    resetStart: startMutation.reset,

    // Submission
    submitResponse: submitMutation.mutate,
    submitResponseAsync: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
    submitError: submitMutation.error,
    submitSuccess: submitMutation.isSuccess,
    submitData: submitMutation.data,
    resetSubmit: submitMutation.reset,
  };
}
