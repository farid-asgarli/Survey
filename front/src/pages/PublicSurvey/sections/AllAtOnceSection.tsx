import { AllQuestionsView } from '@/components/features/public-survey';
import type { PublicQuestion, AnswerValue } from '@/types/public-survey';

interface AllAtOnceSectionProps {
  questions: PublicQuestion[];
  answers: Record<string, AnswerValue>;
  errors: Record<string, string>;
  isSubmitting: boolean;
  submitError?: Error | null | undefined;
  onAnswerChange: (questionId: string, value: AnswerValue) => void;
  onSubmit: () => void;
}

export function AllAtOnceSection({ questions, answers, errors, isSubmitting, submitError, onAnswerChange, onSubmit }: AllAtOnceSectionProps) {
  return (
    <AllQuestionsView
      questions={questions}
      answers={answers}
      errors={errors}
      onAnswerChange={onAnswerChange}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      submitError={submitError ?? null}
    />
  );
}
