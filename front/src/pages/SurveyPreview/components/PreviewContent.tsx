import { useTranslation } from 'react-i18next';
import { Check, RefreshCw, TestTube2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { WelcomeScreen, ProgressBar, QuestionCard, NavigationControls, AllQuestionsView } from '@/components/features/public-survey';
import type { PreviewContentProps } from '../types';

export function PreviewContent({
  survey,
  visibleQuestions,
  viewMode,
  displayMode,
  currentQuestionIndex,
  answers,
  errors,
  onStart,
  onSetAnswer,
  onNext,
  onPrevious,
  onSubmit,
  onReset,
  showKeyboardHints,
}: PreviewContentProps) {
  const { t } = useTranslation();
  // Use visibleQuestions (filtered by conditional logic) instead of survey.questions
  const questions = visibleQuestions;
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  // Welcome screen
  if (viewMode === 'welcome') {
    return (
      <WelcomeScreen
        title={survey.title}
        description={survey.description}
        welcomeMessage={survey.welcomeMessage}
        questionCount={totalQuestions}
        onStart={onStart}
        logoUrl={survey.theme?.logoUrl}
        logoSize={survey.theme?.logoSize}
        showLogoBackground={survey.theme?.showLogoBackground}
        logoBackgroundColor={survey.theme?.logoBackgroundColor}
        brandingTitle={survey.theme?.brandingTitle}
        brandingSubtitle={survey.theme?.brandingSubtitle}
      />
    );
  }

  // Thank you screen
  if (viewMode === 'thank-you') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        {/* Success icon */}
        <div className="w-20 h-20 rounded-full bg-success-container flex items-center justify-center mb-8">
          <Check className="w-10 h-10 text-on-success-container" />
        </div>

        {/* Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-on-surface mb-4">{t('publicSurvey.thankYouTitle')}</h1>
        <p className="text-lg text-on-surface-variant mb-8 max-w-xl">{survey.thankYouMessage || t('surveyPreview.responseRecorded')}</p>

        {/* Test mode indicator */}
        <div className="p-4 rounded-2xl bg-warning-container/30 border border-warning/20 mb-8 max-w-md">
          <div className="flex items-center gap-2 text-warning mb-2">
            <TestTube2 className="w-5 h-5" />
            <span className="font-medium">{t('surveyPreview.testMode')}</span>
          </div>
          <p className="text-sm text-on-surface-variant">{t('surveyPreview.testSubmissionMessage')}</p>
        </div>

        {/* Preview again button */}
        <Button variant="outline" onClick={onReset}>
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('surveyPreview.previewAgain')}
        </Button>
      </div>
    );
  }

  // Questions - All at once mode
  if (displayMode === 'all-at-once') {
    return (
      <AllQuestionsView
        questions={questions}
        answers={answers}
        errors={errors}
        onAnswerChange={onSetAnswer}
        onSubmit={onSubmit}
        isSubmitting={false}
        submitError={null}
      />
    );
  }

  // Questions - One by one mode
  if (!currentQuestion) return null;

  return (
    <div className={showKeyboardHints ? 'py-8 px-4 relative' : 'py-8 px-4'}>
      {/* Keyboard hints overlay */}
      {showKeyboardHints && (
        <div className="absolute top-2 right-2 bg-surface-container/95 backdrop-blur-sm rounded-xl p-3 text-xs border border-outline-variant/30 z-10">
          <p className="font-medium text-on-surface mb-2">{t('surveyPreview.keyboardShortcuts')}</p>
          <div className="space-y-1 text-on-surface-variant">
            <p>
              <kbd className="px-1.5 py-0.5 bg-surface-container-high rounded text-[10px]">Tab</kbd> {t('surveyPreview.nextField')}
            </p>
            <p>
              <kbd className="px-1.5 py-0.5 bg-surface-container-high rounded text-[10px]">Enter</kbd> {t('surveyPreview.submit')}
            </p>
            <p>
              <kbd className="px-1.5 py-0.5 bg-surface-container-high rounded text-[10px]">←</kbd>{' '}
              <kbd className="px-1.5 py-0.5 bg-surface-container-high rounded text-[10px]">→</kbd> {t('surveyPreview.navigate')}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <ProgressBar current={currentQuestionIndex + 1} total={totalQuestions} className="mb-10" />

        {/* Question */}
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={totalQuestions}
          value={answers[currentQuestion.id]}
          error={errors[currentQuestion.id]}
          onChange={(value) => onSetAnswer(currentQuestion.id, value)}
          disabled={false}
        />

        {/* Navigation */}
        <NavigationControls
          currentIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          canGoPrevious={currentQuestionIndex > 0}
          isSubmitting={false}
          onPrevious={onPrevious}
          onNext={onNext}
          onSubmit={onSubmit}
          className="mt-12"
        />
      </div>
    </div>
  );
}
