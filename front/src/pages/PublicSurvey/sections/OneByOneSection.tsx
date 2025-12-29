import { useTranslation } from 'react-i18next';
import { ProgressBar, QuestionCard, NavigationControls } from '@/components/features/public-survey';
import type { PublicQuestion, AnswerValue } from '@/types/public-survey';

interface OneByOneSectionProps {
  currentQuestion: PublicQuestion;
  currentQuestionIndex: number;
  totalQuestions: number;
  answer: AnswerValue;
  error?: string;
  canGoPrevious: boolean;
  isSubmitting: boolean;
  submitError?: Error | null;
  onAnswerChange: (questionId: string, value: AnswerValue) => void;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function OneByOneSection({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  answer,
  error,
  canGoPrevious,
  isSubmitting,
  submitError,
  onAnswerChange,
  onPrevious,
  onNext,
  onSubmit,
}: OneByOneSectionProps) {
  const { t } = useTranslation();

  // Translate error key if it looks like a translation key (contains a dot)
  const translatedError = error && error.includes('.') ? t(error) : error;

  return (
    <div className="py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <ProgressBar current={currentQuestionIndex + 1} total={totalQuestions} className="mb-10" />

        {/* Question */}
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={totalQuestions}
          value={answer}
          error={translatedError}
          onChange={(value) => onAnswerChange(currentQuestion.id, value)}
          disabled={isSubmitting}
        />

        {/* Submit error */}
        {submitError && <div className="mt-6 p-4 rounded-xl bg-error-container text-on-error-container">{t('publicSurveyPage.submitError')}</div>}

        {/* Navigation */}
        <NavigationControls
          currentIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          canGoPrevious={canGoPrevious}
          isSubmitting={isSubmitting}
          onPrevious={onPrevious}
          onNext={onNext}
          onSubmit={onSubmit}
          className="mt-12"
        />
      </div>
    </div>
  );
}
