import { useMemo, useCallback } from 'react';
import { usePublicSurveyStore } from '@/stores';
import { useKeyboardShortcuts, createEnterShortcut } from '@/hooks';
import type { PublicSurvey } from '@/types/public-survey';

interface UseKeyboardNavigationParams {
  survey: PublicSurvey | null;
  onSubmit: () => void;
}

export function useKeyboardNavigation({ survey, onSubmit }: UseKeyboardNavigationParams) {
  const { viewMode, currentQuestionIndex, goToNextQuestion } = usePublicSurveyStore();

  const handleEnter = useCallback(() => {
    if (currentQuestionIndex === (survey?.questions.length || 0) - 1) {
      onSubmit();
    } else {
      goToNextQuestion();
    }
  }, [currentQuestionIndex, survey?.questions.length, goToNextQuestion, onSubmit]);

  const shortcuts = useMemo(() => [createEnterShortcut(handleEnter, viewMode === 'questions')], [handleEnter, viewMode]);

  useKeyboardShortcuts(shortcuts);
}
