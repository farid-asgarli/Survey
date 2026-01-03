import { useTranslation } from 'react-i18next';
import { X, Check } from 'lucide-react';
import { IconButton } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { PublicQuestion, AnswerValue } from '@/types/public-survey';

interface ResponseDrawerProps {
  questions: PublicQuestion[];
  answers: Record<string, AnswerValue>;
  currentQuestionIndex: number;
  displayMode: 'one-by-one' | 'all-at-once';
  onClose: () => void;
}

export function ResponseDrawer({ questions, answers, currentQuestionIndex, displayMode, onClose }: ResponseDrawerProps) {
  const { t } = useTranslation();

  const answeredCount = Object.keys(answers).filter((k) => {
    const val = answers[k];
    if (val === null || val === undefined) return false;
    if (typeof val === 'string' && val.trim() === '') return false;
    if (Array.isArray(val) && val.length === 0) return false;
    return true;
  }).length;

  const totalQuestions = questions.length;

  return (
    <aside className="w-80 shrink-0 border-l border-outline-variant/30 bg-surface flex flex-col overflow-hidden">
      <div className="p-4 border-b border-outline-variant/30 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-on-surface">{t('surveyPreview.responseSummary')}</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {answeredCount} / {totalQuestions} {t('surveyPreview.answered')}
          </p>
        </div>
        <IconButton variant="standard" size="sm" aria-label={t('common.close')} onClick={onClose}>
          <X className="w-4 h-4" />
        </IconButton>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-2">
        {questions.map((question, index) => {
          const answer = answers[question.id];
          const hasAnswer =
            answer !== null &&
            answer !== undefined &&
            (typeof answer !== 'string' || answer.trim() !== '') &&
            (!Array.isArray(answer) || answer.length > 0);

          return (
            <div
              key={question.id}
              className={cn(
                'p-3 rounded-xl border transition-colors',
                hasAnswer ? 'bg-success-container/20 border-success/30' : 'bg-surface-container border-outline-variant/30',
                currentQuestionIndex === index && displayMode === 'one-by-one' && 'ring-2 ring-primary/30'
              )}
            >
              <div className="flex items-start gap-2">
                <span className="text-xs font-medium text-on-surface-variant shrink-0">Q{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">{question.text}</p>
                  {hasAnswer ? (
                    <p className="text-xs text-success mt-1 truncate">
                      {typeof answer === 'string' ? answer : Array.isArray(answer) ? answer.join(', ') : JSON.stringify(answer)}
                    </p>
                  ) : (
                    <p className="text-xs text-on-surface-variant/60 mt-1">{t('surveyPreview.notAnswered')}</p>
                  )}
                </div>
                {hasAnswer && <Check className="w-4 h-4 text-success shrink-0" />}
              </div>
            </div>
          );
        })}

        {questions.length === 0 && <div className="text-center py-8 text-on-surface-variant text-sm">{t('surveyPreview.noQuestions')}</div>}
      </div>

      {/* Summary footer */}
      <div className="p-4 border-t border-outline-variant/30 bg-surface-container-low">
        <div className="flex items-center justify-between text-sm">
          <span className="text-on-surface-variant">{t('surveyPreview.progress')}</span>
          <span className="font-medium text-on-surface">{Math.round((answeredCount / Math.max(totalQuestions, 1)) * 100)}%</span>
        </div>
        <div className="mt-2 h-2 bg-surface-container-high rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${(answeredCount / Math.max(totalQuestions, 1)) * 100}%` }}
          />
        </div>
      </div>
    </aside>
  );
}
