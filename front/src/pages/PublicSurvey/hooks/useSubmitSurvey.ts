import { useCallback } from 'react';
import { usePublicSurveyStore, formatAnswerForSubmission } from '@/stores';
import type { SubmitResponseRequest, PublicSurvey, SubmitResponseResult, SubmitAnswerRequest, PublicQuestion } from '@/types/public-survey';

interface UseSubmitSurveyParams {
  survey: PublicSurvey | null;
  shareToken: string | undefined;
  submitResponseAsync: (request: SubmitResponseRequest) => Promise<SubmitResponseResult>;
}

export function useSubmitSurvey({ survey, shareToken, submitResponseAsync }: UseSubmitSurveyParams) {
  const { answers, validateAll, setSubmitting, completeSurvey, getResponseId } = usePublicSurveyStore();

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
      const formattedAnswers: SubmitAnswerRequest[] = survey.questions
        .map((question: PublicQuestion) => {
          const answerValue = answers[question.id];
          const formatted = formatAnswerForSubmission(answerValue, question.type, question.settings?.options);

          if (!formatted) return null;

          return {
            questionId: question.id,
            ...formatted,
          };
        })
        .filter((a): a is SubmitAnswerRequest => a !== null);

      // Get responseId from store (set when survey was started)
      const responseId = getResponseId();

      const request: SubmitResponseRequest = responseId
        ? {
            // New flow: complete existing draft response
            responseId,
            answers: formattedAnswers,
          }
        : {
            // Legacy flow: create and complete in one step
            surveyId: survey.id,
            answers: formattedAnswers,
          };

      await submitResponseAsync(request);
      completeSurvey();
    } catch (error) {
      console.error('Failed to submit response:', error);
      // Error handled by interceptor
    } finally {
      setSubmitting(false);
    }
  }, [survey, shareToken, answers, validateAll, setSubmitting, submitResponseAsync, completeSurvey, getResponseId]);

  return { handleSubmit };
}
