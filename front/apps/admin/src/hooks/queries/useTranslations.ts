// React Query hooks for Survey Translations operations

import { useQuery, useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { translationsApi } from '@/services';
import { surveyKeys } from './useSurveys';
import type { SurveyTranslationDto, BulkUpdateSurveyTranslationsRequest, BulkTranslationResultDto } from '@/types';
import { createExtendedQueryKeys, STALE_TIMES } from './queryUtils';

// Query keys - translations use a simple survey-scoped pattern
export const translationKeys = createExtendedQueryKeys('translations', (base) => ({
  survey: (surveyId: string) => [...base.all, surveyId] as const,
}));

/**
 * Hook to fetch all translations for a survey
 */
export function useSurveyTranslations(surveyId: string | undefined) {
  return useQuery({
    queryKey: translationKeys.survey(surveyId || ''),
    queryFn: () => translationsApi.getAll(surveyId!),
    enabled: !!surveyId,
    staleTime: STALE_TIMES.LONG,
  });
}

/**
 * Hook to bulk update translations for a survey
 * @param options - Optional mutation options (retry, retryDelay, etc.)
 * @returns Mutation with BulkTranslationResultDto containing success/failure counts and errors
 */
export function useBulkUpdateTranslations(
  options?: Omit<
    UseMutationOptions<BulkTranslationResultDto, Error, { surveyId: string; data: BulkUpdateSurveyTranslationsRequest }>,
    'mutationFn' | 'onSuccess'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ surveyId, data }: { surveyId: string; data: BulkUpdateSurveyTranslationsRequest }) => translationsApi.bulkUpdate(surveyId, data),
    onSuccess: (_, { surveyId }) => {
      // Invalidate translations and survey detail queries
      queryClient.invalidateQueries({ queryKey: translationKeys.survey(surveyId) });
      queryClient.invalidateQueries({ queryKey: surveyKeys.detail(surveyId) });
    },
    ...options,
  });
}

/**
 * Hook to add a new language translation to a survey
 * @returns Mutation with the created SurveyTranslationDto
 */
export function useAddSurveyTranslation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ surveyId, translation }: { surveyId: string; translation: SurveyTranslationDto }) => translationsApi.add(surveyId, translation),
    onSuccess: (_, { surveyId }) => {
      // Invalidate translations and survey detail queries
      queryClient.invalidateQueries({ queryKey: translationKeys.survey(surveyId) });
      queryClient.invalidateQueries({ queryKey: surveyKeys.detail(surveyId) });
    },
  });
}

/**
 * Hook to update a single language translation
 * @returns Mutation with BulkTranslationResultDto (backend uses bulk update internally)
 */
export function useUpdateSurveyTranslation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ surveyId, languageCode, data }: { surveyId: string; languageCode: string; data: SurveyTranslationDto }) =>
      translationsApi.bulkUpdate(surveyId, { translations: [{ ...data, languageCode }] }),
    onSuccess: (_, { surveyId }) => {
      queryClient.invalidateQueries({ queryKey: translationKeys.survey(surveyId) });
      queryClient.invalidateQueries({ queryKey: surveyKeys.detail(surveyId) });
    },
  });
}

/**
 * Hook to delete a language translation from a survey
 */
export function useDeleteSurveyTranslation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ surveyId, languageCode }: { surveyId: string; languageCode: string }) => translationsApi.delete(surveyId, languageCode),
    onSuccess: (_, { surveyId }) => {
      queryClient.invalidateQueries({ queryKey: translationKeys.survey(surveyId) });
      queryClient.invalidateQueries({ queryKey: surveyKeys.detail(surveyId) });
    },
  });
}
