// React Query hooks for Analytics operations

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/services';
import { useNamespaceStore } from '@/stores';
import type { NpsTrendParams } from '@/types';
import { createExtendedQueryKeys, STALE_TIMES } from './queryUtils';

// Query keys - analytics has all custom keys (no standard list/detail pattern)
export const analyticsKeys = createExtendedQueryKeys('analytics', (base) => ({
  survey: (surveyId: string) => [...base.all, 'survey', surveyId] as const,
  nps: (surveyId: string) => [...base.all, 'nps', surveyId] as const,
  npsTrend: (surveyId: string, params?: NpsTrendParams) => [...base.all, 'nps-trend', surveyId, params] as const,
  questionNps: (surveyId: string, questionId: string) => [...base.all, 'question-nps', surveyId, questionId] as const,
}));

// Very short stale time for analytics data that changes frequently
const ANALYTICS_STALE_TIME = 30 * 1000; // 30 seconds

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
    staleTime: ANALYTICS_STALE_TIME,
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
    staleTime: ANALYTICS_STALE_TIME,
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
    staleTime: STALE_TIMES.SHORT,
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
    staleTime: ANALYTICS_STALE_TIME,
  });
}
