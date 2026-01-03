import { useTranslation } from 'react-i18next';
import { ProgressBar, StepIndicator, QuestionCard, NavigationControls } from '@/components/features/public-survey';
import type { PublicQuestion, AnswerValue, PublicSurveyTheme } from '@/types/public-survey';

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
  /** Theme settings for progress bar visibility and style */
  theme?: PublicSurveyTheme;
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
  theme,
}: OneByOneSectionProps) {
  const { t } = useTranslation();

  // Translate error key if it looks like a translation key (contains a dot)
  const translatedError = error && error.includes('.') ? t(error) : error;

  // Default to showing progress bar if not specified
  const showProgressBar = theme?.showProgressBar !== false;
  // Default to Bar style (1) - Backend enum: None=0, Bar=1, Percentage=2, Steps=3, Dots=4
  const progressBarStyle = theme?.progressBarStyle ?? 1;

  // Render the appropriate progress indicator based on style
  const renderProgressIndicator = () => {
    if (!showProgressBar) return null;

    // Steps (3) and Dots (4) use the StepIndicator component
    if (progressBarStyle === 3 || progressBarStyle === 4) {
      return <StepIndicator current={currentQuestionIndex + 1} total={totalQuestions} className='mb-10' />;
    }

    // Default: Bar (1) or Percentage (2) use the ProgressBar component
    return <ProgressBar current={currentQuestionIndex + 1} total={totalQuestions} className='mb-10' />;
  };

  return (
    <div className='py-8 px-4'>
      <div className='max-w-2xl mx-auto'>
        {/* Progress - only show if enabled in theme */}
        {renderProgressIndicator()}

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
        {submitError && <div className='mt-6 p-4 rounded-xl bg-error-container text-on-error-container'>{t('publicSurveyPage.submitError')}</div>}

        {/* Navigation */}
        <NavigationControls
          currentIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          canGoPrevious={canGoPrevious}
          isSubmitting={isSubmitting}
          onPrevious={onPrevious}
          onNext={onNext}
          onSubmit={onSubmit}
          className='mt-12'
        />
      </div>
    </div>
  );
}
