// React Query hooks for Analytics operations

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/services';
import { useNamespaceStore } from '@/stores';
import type { NpsTrendParams } from '@/types';

// Query keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  survey: (surveyId: string) => [...analyticsKeys.all, 'survey', surveyId] as const,
  nps: (surveyId: string) => [...analyticsKeys.all, 'nps', surveyId] as const,
  npsTrend: (surveyId: string, params?: NpsTrendParams) => [...analyticsKeys.all, 'nps-trend', surveyId, params] as const,
  questionNps: (surveyId: string, questionId: string) => [...analyticsKeys.all, 'question-nps', surveyId, questionId] as const,
};

/**
 * Hook to fetch survey analytics summary
 */
export function useSurveyAnalytics(surveyId: string | undefined) {
  const { activeNamespace } = useNamespaceStore();
  const namespaceId = activeNamespace?.id;

  return useQuery({
    queryKey: analyticsKeys.survey(surveyId!),
    queryFn: () => analyticsApi.getSurveyAnalytics(surveyId!),
    enabled: !!surveyId && !!namespaceId,
    staleTime: 30 * 1000, // 30 seconds - analytics data can change frequently
  });
}

/**
 * Hook to fetch NPS summary for a survey
 */
export function useSurveyNps(surveyId: string | undefined) {
  const { activeNamespace } = useNamespaceStore();
  const namespaceId = activeNamespace?.id;

  return useQuery({
    queryKey: analyticsKeys.nps(surveyId!),
    queryFn: () => analyticsApi.getSurveyNps(surveyId!),
    enabled: !!surveyId && !!namespaceId,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch NPS trend over time
 */
export function useNpsTrend(surveyId: string | undefined, params?: NpsTrendParams) {
  const { activeNamespace } = useNamespaceStore();
  const namespaceId = activeNamespace?.id;

  return useQuery({
    queryKey: analyticsKeys.npsTrend(surveyId!, params),
    queryFn: () => analyticsApi.getNpsTrend(surveyId!, params),
    enabled: !!surveyId && !!namespaceId,
    staleTime: 60 * 1000, // 1 minute for trend data
  });
}

/**
 * Hook to fetch NPS for a specific question
 */
export function useQuestionNps(surveyId: string | undefined, questionId: string | undefined) {
  const { activeNamespace } = useNamespaceStore();
  const namespaceId = activeNamespace?.id;

  return useQuery({
    queryKey: analyticsKeys.questionNps(surveyId!, questionId!),
    queryFn: () => analyticsApi.getQuestionNps(surveyId!, questionId!),
    enabled: !!surveyId && !!questionId && !!namespaceId,
    staleTime: 30 * 1000,
  });
}
