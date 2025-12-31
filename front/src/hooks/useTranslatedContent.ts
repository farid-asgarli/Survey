// Hook for getting translated survey content based on editing language
// Provides translated question text/description with fallback to default language

import { useMemo } from 'react';
import { useSurveyTranslations } from './queries/useTranslations';
import { useSurveyBuilderStore } from '@/stores';
import type { DraftQuestion } from '@/stores/surveyBuilderStore';
import type { SurveyTranslationsResponse, QuestionTranslationItemDto, SurveyTranslationDto } from '@/types';

export interface TranslatedQuestion extends DraftQuestion {
  /** The displayed text (translated or fallback) */
  displayText: string;
  /** The displayed description (translated or fallback) */
  displayDescription: string;
  /** Whether the current display is using fallback (default language) */
  isUsingFallback: boolean;
  /** Whether translation data is still loading */
  isTranslationLoading: boolean;
}

export interface TranslatedSurveyMetadata {
  title: string;
  description: string;
  welcomeMessage: string;
  thankYouMessage: string;
  isUsingFallback: boolean;
  isTranslationLoading: boolean;
}

export interface TranslationHookState {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

// ============ Utility Functions ============

/**
 * Find a translation by language code from an array of translations.
 */
function findTranslation<T extends { languageCode: string; isDefault?: boolean }>(
  translations: T[] | undefined,
  languageCode: string,
  defaultLanguage: string
): { translation: T | undefined; defaultTranslation: T | undefined } {
  const translation = translations?.find((t) => t.languageCode === languageCode);
  const defaultTranslation = translations?.find((t) => t.languageCode === defaultLanguage || t.isDefault);
  return { translation, defaultTranslation };
}

/**
 * Check if a question translation has valid content.
 */
function hasValidQuestionTranslation(translation: QuestionTranslationItemDto | undefined): boolean {
  return !!(translation?.text && translation.text.trim() !== '');
}

/**
 * Check if a survey translation has valid content.
 */
function hasValidSurveyTranslation(translation: SurveyTranslationDto | undefined): boolean {
  return !!(translation?.title && translation.title.trim() !== '');
}

/**
 * Apply translation to a question, with fallback to default language.
 */
function applyQuestionTranslation(
  question: DraftQuestion,
  translationsData: SurveyTranslationsResponse | undefined,
  editingLanguage: string,
  defaultLanguage: string,
  isLoading: boolean
): TranslatedQuestion {
  // If editing default language, no translation needed
  if (editingLanguage === defaultLanguage) {
    return {
      ...question,
      displayText: question.text,
      displayDescription: question.description || '',
      isUsingFallback: false,
      isTranslationLoading: false,
    };
  }

  // Find translation for this question in the target language
  const questionTranslations = translationsData?.questions?.find((q) => q.questionId === question.id);
  const { translation, defaultTranslation } = findTranslation(questionTranslations?.translations, editingLanguage, defaultLanguage);

  const hasTranslation = hasValidQuestionTranslation(translation);

  return {
    ...question,
    displayText: hasTranslation ? translation!.text : defaultTranslation?.text || question.text,
    displayDescription: hasTranslation ? translation!.description || '' : defaultTranslation?.description || question.description || '',
    isUsingFallback: !hasTranslation,
    isTranslationLoading: isLoading,
  };
}

/**
 * Hook to get a question with translated content based on current editing language.
 * Falls back to default language content when translation is missing.
 */
export function useTranslatedQuestion(question: DraftQuestion | null): TranslatedQuestion | null {
  const survey = useSurveyBuilderStore((s) => s.survey);
  const editingLanguage = useSurveyBuilderStore((s) => s.editingLanguage);
  const defaultLanguage = survey?.defaultLanguage || 'en';

  // Fetch translations when editing non-default language
  const shouldFetchTranslations = editingLanguage !== defaultLanguage && !!survey?.id;
  const { data: translationsData, isLoading } = useSurveyTranslations(shouldFetchTranslations ? survey?.id : undefined);

  return useMemo(() => {
    if (!question) return null;
    return applyQuestionTranslation(question, translationsData, editingLanguage, defaultLanguage, isLoading);
  }, [question, editingLanguage, defaultLanguage, translationsData, isLoading]);
}

/**
 * Hook to get survey metadata with translated content based on current editing language.
 * Falls back to default language content when translation is missing.
 */
export function useTranslatedSurveyMetadata(): TranslatedSurveyMetadata & TranslationHookState {
  const survey = useSurveyBuilderStore((s) => s.survey);
  const editingLanguage = useSurveyBuilderStore((s) => s.editingLanguage);
  const defaultLanguage = survey?.defaultLanguage || 'en';

  // Fetch translations when editing non-default language
  const shouldFetchTranslations = editingLanguage !== defaultLanguage && !!survey?.id;
  const { data: translationsData, isLoading, isError, error, refetch } = useSurveyTranslations(shouldFetchTranslations ? survey?.id : undefined);

  const metadata = useMemo((): TranslatedSurveyMetadata => {
    const defaultResult: TranslatedSurveyMetadata = {
      title: survey?.title || '',
      description: survey?.description || '',
      welcomeMessage: survey?.welcomeMessage || '',
      thankYouMessage: survey?.thankYouMessage || '',
      isUsingFallback: false,
      isTranslationLoading: false,
    };

    if (!survey) return defaultResult;

    // If editing default language, no translation needed
    if (editingLanguage === defaultLanguage) {
      return defaultResult;
    }

    // Find translation for target language
    const { translation, defaultTranslation } = findTranslation(translationsData?.translations, editingLanguage, defaultLanguage);

    const hasTranslation = hasValidSurveyTranslation(translation);

    return {
      title: hasTranslation ? translation!.title : defaultTranslation?.title || survey.title || '',
      description: hasTranslation ? translation!.description || '' : defaultTranslation?.description || survey.description || '',
      welcomeMessage: hasTranslation ? translation!.welcomeMessage || '' : defaultTranslation?.welcomeMessage || survey.welcomeMessage || '',
      thankYouMessage: hasTranslation ? translation!.thankYouMessage || '' : defaultTranslation?.thankYouMessage || survey.thankYouMessage || '',
      isUsingFallback: !hasTranslation,
      isTranslationLoading: isLoading,
    };
  }, [survey, editingLanguage, defaultLanguage, translationsData, isLoading]);

  return {
    ...metadata,
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  };
}

/**
 * Hook to get all questions with translated content.
 * Useful for question list displays.
 */
export function useTranslatedQuestions(): {
  questions: TranslatedQuestion[];
} & TranslationHookState {
  const questions = useSurveyBuilderStore((s) => s.questions);
  const survey = useSurveyBuilderStore((s) => s.survey);
  const editingLanguage = useSurveyBuilderStore((s) => s.editingLanguage);
  const defaultLanguage = survey?.defaultLanguage || 'en';

  // Fetch translations when editing non-default language
  const shouldFetchTranslations = editingLanguage !== defaultLanguage && !!survey?.id;
  const { data: translationsData, isLoading, isError, error, refetch } = useSurveyTranslations(shouldFetchTranslations ? survey?.id : undefined);

  const translatedQuestions = useMemo(() => {
    return questions.map((question): TranslatedQuestion => {
      return applyQuestionTranslation(question, translationsData, editingLanguage, defaultLanguage, isLoading);
    });
  }, [questions, editingLanguage, defaultLanguage, translationsData, isLoading]);

  return {
    questions: translatedQuestions,
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  };
}
