/**
 * Questions View - Main survey question display and navigation
 * Matches admin preview styling with M3 Expressive design
 */

'use client';

import { useEffect, useCallback } from 'react';
import type { PublicSurvey, AnswerValue } from '@survey/types';
import { ProgressBarStyle } from '@survey/types';
import { QuestionRenderer, defaultQuestionLabels, type QuestionLabels } from '@survey/ui';
import { Button, cn } from '@survey/ui-primitives';
import { useSurveyStore } from '@/store/survey-store';
import { ProgressBar } from './ProgressBar';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import type { TranslationKey } from '@/lib/i18n';

interface QuestionsViewProps {
  survey: PublicSurvey;
  labels?: QuestionLabels;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export function QuestionsView({ survey, labels = defaultQuestionLabels, t }: QuestionsViewProps) {
  const {
    visibleQuestions,
    currentQuestionIndex,
    answers,
    errors,
    progress,
    isSubmitting,
    displayMode,
    setAnswer,
    goToNextQuestion,
    goToPreviousQuestion,
    submitResponse,
  } = useSurveyStore();

  const currentQuestion = visibleQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === visibleQuestions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      submitResponse();
    } else {
      goToNextQuestion();
    }
  }, [isLastQuestion, submitResponse, goToNextQuestion]);

  const handlePrevious = useCallback(() => {
    goToPreviousQuestion();
  }, [goToPreviousQuestion]);

  const handleAnswerChange = useCallback(
    (value: AnswerValue) => {
      if (currentQuestion) {
        setAnswer(currentQuestion.id, value);
      }
    },
    [currentQuestion, setAnswer]
  );

  // Keyboard navigation for one-by-one mode
  useEffect(() => {
    if (displayMode !== 'one-by-one' || isSubmitting) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Allow Enter on single-line inputs to navigate
        if (e.key === 'Enter' && target.tagName === 'INPUT' && (target as HTMLInputElement).type !== 'checkbox') {
          e.preventDefault();
          handleNext();
        }
        return;
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Backspace' && !isFirstQuestion) {
        e.preventDefault();
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayMode, isSubmitting, isFirstQuestion, handleNext, handlePrevious]);

  if (!currentQuestion) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-on-surface-variant">No questions available</p>
      </div>
    );
  }

  // One-by-one display mode
  if (displayMode === 'one-by-one') {
    const currentAnswer = answers[currentQuestion.id];
    const currentError = errors[currentQuestion.id];

    return (
      <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {/* Progress */}
        {survey.theme?.showProgressBar !== false && (
          <div className="mb-6 sm:mb-8">
            <ProgressBar
              progress={progress}
              currentQuestion={currentQuestionIndex}
              totalQuestions={visibleQuestions.length}
              style={survey.theme?.progressBarStyle as ProgressBarStyle | undefined}
              progressLabel={t('survey.progress')}
            />
          </div>
        )}

        {/* Question counter chip */}
        <div className="mb-4 sm:mb-6">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary-container/30 text-on-primary-container text-sm font-medium border border-primary/15">
            {t('survey.question')} {currentQuestionIndex + 1} {t('survey.of')} {visibleQuestions.length}
          </span>
        </div>

        {/* Question card */}
        <article className="bg-surface-container-low rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border-2 border-outline-variant/30 transition-[border-color] duration-300 hover:border-primary/20">
          {/* Question header */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-on-surface font-heading leading-tight">
              {currentQuestion.text}
              {currentQuestion.isRequired && (
                <span className="text-error ml-1" aria-label="required">
                  *
                </span>
              )}
            </h2>
            {currentQuestion.description && <p className="mt-2 text-sm sm:text-base text-on-surface-variant">{currentQuestion.description}</p>}
          </div>

          {/* Question renderer */}
          <div className="mb-4 sm:mb-6">
            <QuestionRenderer
              question={currentQuestion}
              value={currentAnswer}
              onChange={handleAnswerChange}
              error={currentError}
              disabled={isSubmitting}
              labels={labels}
            />
          </div>
        </article>

        {/* Navigation */}
        <nav className="flex items-center justify-between mt-6 sm:mt-8 gap-4" aria-label="Question navigation">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstQuestion || isSubmitting}
            aria-label={t('survey.previous')}
            className="gap-2"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            <span className="hidden sm:inline">{t('survey.previous')}</span>
          </Button>

          <Button
            variant="filled"
            onClick={handleNext}
            disabled={isSubmitting}
            loading={isSubmitting}
            aria-label={isLastQuestion ? t('survey.submit') : t('survey.next')}
            className="gap-2"
          >
            {isSubmitting ? (
              t('survey.submitting')
            ) : isLastQuestion ? (
              <>
                {t('survey.submit')}
                <Send className="w-5 h-5" aria-hidden="true" />
              </>
            ) : (
              <>
                <span className="hidden sm:inline">{t('survey.next')}</span>
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </>
            )}
          </Button>
        </nav>
      </div>
    );
  }

  // All-at-once display mode
  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
      {/* Progress header */}
      {survey.theme?.showProgressBar !== false && (
        <div className="mb-6 sm:mb-8">
          <ProgressBar
            progress={progress}
            currentQuestion={currentQuestionIndex}
            totalQuestions={visibleQuestions.length}
            style={survey.theme?.progressBarStyle as ProgressBarStyle | undefined}
            progressLabel={t('survey.progress')}
          />
        </div>
      )}

      {/* All questions */}
      <div className="space-y-4 sm:space-y-6 md:space-y-8" role="list" aria-label="Survey questions">
        {visibleQuestions.map((question, index) => {
          const answer = answers[question.id];
          const error = errors[question.id];

          return (
            <article
              key={question.id}
              id={`question-${question.id}`}
              role="listitem"
              aria-labelledby={`question-title-${question.id}`}
              className={cn(
                'p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-surface-container-low border-2 transition-all duration-300',
                error ? 'border-error/50 bg-error-container/5' : 'border-outline-variant/30 hover:border-primary/20'
              )}
            >
              {/* Question number badge */}
              <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm sm:text-base">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h2
                    id={`question-title-${question.id}`}
                    className="text-base sm:text-lg md:text-xl font-semibold text-on-surface font-heading leading-tight"
                  >
                    {question.text}
                    {question.isRequired && (
                      <span className="text-error ml-1" aria-label="required">
                        *
                      </span>
                    )}
                  </h2>
                  {question.description && <p className="mt-1 text-sm sm:text-base text-on-surface-variant">{question.description}</p>}
                </div>
              </div>

              {/* Question renderer */}
              <QuestionRenderer
                question={question}
                value={answer}
                onChange={(value) => setAnswer(question.id, value)}
                error={error}
                disabled={isSubmitting}
                labels={labels}
              />
            </article>
          );
        })}
      </div>

      {/* Submit button */}
      <div className="mt-6 sm:mt-8 md:mt-10 flex justify-center sm:justify-end">
        <Button
          variant="filled"
          size="lg"
          onClick={() => submitResponse()}
          disabled={isSubmitting}
          loading={isSubmitting}
          aria-label={t('survey.submit')}
          className="gap-2 w-full sm:w-auto min-w-36 sm:min-w-48"
        >
          {isSubmitting ? (
            t('survey.submitting')
          ) : (
            <>
              {t('survey.submit')}
              <Send className="w-5 h-5" aria-hidden="true" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
