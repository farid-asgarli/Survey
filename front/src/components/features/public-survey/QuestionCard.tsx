// Question Card - Container for individual questions
// Uses container queries (@sm:, @md:) for proper preview responsiveness

import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { PublicQuestion, AnswerValue } from '@/types/public-survey';
import { QuestionRenderer } from './QuestionRenderers';

interface QuestionCardProps {
  question: PublicQuestion;
  questionNumber: number;
  totalQuestions: number;
  value: AnswerValue;
  error?: string;
  onChange: (value: AnswerValue) => void;
  disabled?: boolean;
  className?: string;
}

export function QuestionCard({ question, questionNumber, totalQuestions, value, error, onChange, disabled, className }: QuestionCardProps) {
  const { t } = useTranslation();

  return (
    <div className={cn('animate-fade-in', className)}>
      {/* Question header */}
      <div className='mb-4 @md:mb-6'>
        {/* Question number badge */}
        <div className='flex flex-wrap items-center gap-2 @md:gap-3 mb-3 @md:mb-4'>
          <span className='px-2.5 @md:px-3 py-1 rounded-full bg-primary-container/50 text-on-primary-container text-xs @md:text-sm font-medium'>
            {t('publicSurvey.questionOfTotal', { current: questionNumber, total: totalQuestions })}
          </span>
          {question.isRequired && (
            <span className='px-2 py-0.5 rounded-lg bg-error-container/50 text-error text-xs font-medium'>{t('publicSurvey.required')}</span>
          )}
        </div>

        {/* Question text */}
        <h2 className='text-lg @sm:text-xl @md:text-2xl font-bold text-on-surface leading-tight'>
          {question.text}
          {question.isRequired && <span className='text-error ml-1'>*</span>}
        </h2>

        {/* Description */}
        {question.description && <p className='text-on-surface-variant mt-2 @md:mt-3 text-sm @md:text-base'>{question.description}</p>}
      </div>

      {/* Question renderer */}
      <div className='mt-4 @md:mt-6'>
        <QuestionRenderer question={question} value={value} onChange={onChange} error={error} disabled={disabled} />
      </div>
    </div>
  );
}
