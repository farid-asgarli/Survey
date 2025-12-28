// React Query hooks for public survey operations

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicSurveyApi } from '@/services/api';
import type { SubmitResponseRequest } from '@/types/public-survey';

// Query keys
export const publicSurveyKeys = {
  all: ['public-survey'] as const,
  byToken: (shareToken: string) => [...publicSurveyKeys.all, shareToken] as const,
};

/**
 * Hook to fetch a public survey by share token
 */
export function usePublicSurvey(shareToken: string | undefined) {
  return useQuery({
    queryKey: publicSurveyKeys.byToken(shareToken || ''),
    queryFn: () => publicSurveyApi.getSurvey(shareToken!),
    enabled: !!shareToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
  const submitMutation = useSubmitResponse();

  return {
    // Survey data
    survey: surveyQuery.data,
    isLoading: surveyQuery.isLoading,
    isError: surveyQuery.isError,
    error: surveyQuery.error,
    refetch: surveyQuery.refetch,

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
