import { useCallback } from 'react';
import { usePublicSurveyStore, formatAnswerForSubmission } from '@/stores';
import type { SubmitResponseRequest, PublicSurvey, SubmitResponseResult } from '@/types/public-survey';

interface UseSubmitSurveyParams {
  survey: PublicSurvey | null;
  shareToken: string | undefined;
  submitResponseAsync: (request: SubmitResponseRequest) => Promise<SubmitResponseResult>;
}

export function useSubmitSurvey({ survey, shareToken, submitResponseAsync }: UseSubmitSurveyParams) {
  const { answers, validateAll, setSubmitting, completeSurvey } = usePublicSurveyStore();

  const handleSubmit = useCallback(async () => {
    if (!survey || !shareToken) return;

    // Validate all questions
    const isValid = validateAll();
    if (!isValid) {
      return;
    }

    setSubmitting(true);

    try {
      // Format answers for submission
      const formattedAnswers = survey.questions
        .map((question: { id: string }) => {
          const value = answers[question.id];
          const formattedValue = formatAnswerForSubmission(value);

          return {
            questionId: question.id,
            answerValue: formattedValue,
          };
        })
        .filter((a: { questionId: string; answerValue: string | undefined }) => a.answerValue !== undefined);

      const request: SubmitResponseRequest = {
        surveyId: survey.id,
        answers: formattedAnswers as SubmitResponseRequest['answers'],
      };

      await submitResponseAsync(request);
      completeSurvey();
    } catch (error) {
      console.error('Failed to submit response:', error);
      // Error handled by interceptor
    } finally {
      setSubmitting(false);
    }
  }, [survey, shareToken, answers, validateAll, setSubmitting, submitResponseAsync, completeSurvey]);

  return { handleSubmit };
}
