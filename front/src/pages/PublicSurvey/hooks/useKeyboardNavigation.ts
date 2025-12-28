import { useEffect } from 'react';
import { usePublicSurveyStore } from '@/stores';
import type { PublicSurvey } from '@/types/public-survey';

interface UseKeyboardNavigationParams {
  survey: PublicSurvey | null;
  onSubmit: () => void;
}

export function useKeyboardNavigation({ survey, onSubmit }: UseKeyboardNavigationParams) {
  const { viewMode, currentQuestionIndex, goToNextQuestion } = usePublicSurveyStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'questions') return;

      if (e.key === 'Enter' && !e.shiftKey) {
        // Don't navigate on Enter in text inputs
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return;
        }

        if (currentQuestionIndex === (survey?.questions.length || 0) - 1) {
          onSubmit();
        } else {
          goToNextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, currentQuestionIndex, survey, goToNextQuestion, onSubmit]);
}
