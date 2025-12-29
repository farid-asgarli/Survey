// All Questions View - Shows all questions at once for "all-at-once" mode
// Uses container queries (@sm:, @md:) for proper preview responsiveness

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { QuestionRenderer } from './QuestionRenderers';
import { Send, Loader2 } from 'lucide-react';
import type { PublicQuestion, AnswerValue } from '@/types/public-survey';
import { useTranslation } from 'react-i18next';

interface AllQuestionsViewProps {
  questions: PublicQuestion[];
  answers: Record<string, AnswerValue>;
  errors: Record<string, string>;
  onAnswerChange: (questionId: string, value: AnswerValue) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitError: Error | null;
}

export function AllQuestionsView({ questions, answers, errors, onAnswerChange, onSubmit, isSubmitting, submitError }: AllQuestionsViewProps) {
  const { t } = useTranslation();
  const hasErrors = Object.keys(errors).length > 0;

  // Helper to translate error keys
  const translateError = (error: string | undefined): string | undefined => {
    if (!error) return undefined;
    return error.includes('.') ? t(error) : error;
  };

  const answeredCount = Object.keys(answers).filter((k) => {
    const v = answers[k];
    if (v === null || v === undefined) return false;
    if (typeof v === 'string' && v.trim() === '') return false;
    if (Array.isArray(v) && v.length === 0) return false;
    return true;
  }).length;

  return (
    <div className="py-4 @sm:py-6 @md:py-8 px-3 @md:px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress indicator */}
        <div className="mb-4 @sm:mb-6 @md:mb-8">
          <div className="flex justify-between items-center text-xs @md:text-sm text-on-surface-variant mb-2">
            <span>{t('publicSurvey.questionCount', { count: questions.length })}</span>
            <span>{t('publicSurvey.answeredCount', { count: answeredCount })}</span>
          </div>
          <div className="h-1.5 @md:h-2 rounded-full bg-surface-container-highest overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{
                width: `${Math.round((answeredCount / questions.length) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Questions list */}
        <div className="space-y-4 @sm:space-y-6 @md:space-y-8">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className={cn(
                'p-3 @sm:p-4 @md:p-6 rounded-xl @sm:rounded-2xl @md:rounded-3xl bg-surface-container-low border-2 transition-all duration-300',
                errors[question.id] ? 'border-error/50 bg-error-container/5' : 'border-outline-variant/30'
              )}
            >
              {/* Question header */}
              <div className="flex items-start gap-2 @sm:gap-3 @md:gap-4 mb-3 @sm:mb-4 @md:mb-6">
                <div className="shrink-0 w-7 h-7 @sm:w-8 @sm:h-8 @md:w-10 @md:h-10 rounded-lg @md:rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs @sm:text-sm @md:text-base">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base @sm:text-lg @md:text-xl font-semibold text-on-surface">
                    {question.text}
                    {question.isRequired && <span className="text-error ml-1">*</span>}
                  </h3>
                  {question.description && <p className="text-on-surface-variant mt-1 text-xs @sm:text-sm @md:text-base">{question.description}</p>}
                </div>
              </div>

              {/* Question renderer */}
              <QuestionRenderer
                question={question}
                value={answers[question.id]}
                onChange={(value) => onAnswerChange(question.id, value)}
                error={translateError(errors[question.id])}
                disabled={isSubmitting}
              />
            </div>
          ))}
        </div>

        {/* Submit error */}
        {submitError && (
          <div className="mt-4 @md:mt-6 p-3 @md:p-4 rounded-xl bg-error-container text-on-error-container text-xs @sm:text-sm @md:text-base">
            {t('publicSurvey.submitError')}
          </div>
        )}

        {/* Validation errors summary */}
        {hasErrors && (
          <div className="mt-4 @md:mt-6 p-3 @md:p-4 rounded-xl bg-warning-container/50 text-on-warning-container text-xs @sm:text-sm @md:text-base">
            <p className="font-medium">{t('publicSurvey.fixErrors')}</p>
          </div>
        )}

        {/* Submit button */}
        <div className="mt-6 @sm:mt-8 @md:mt-10 flex justify-center">
          <Button size="lg" onClick={onSubmit} disabled={isSubmitting} className="gap-2 min-w-36 @md:min-w-48 w-full @sm:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('publicSurvey.submitting')}
              </>
            ) : (
              <>
                {t('publicSurvey.submitSurvey')}
                <Send className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
