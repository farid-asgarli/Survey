// Question Preview - Clean preview showing how question appears to respondents
// Designed to be the complementary half of the question editor card

import { useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { RotateCcw, Sparkles } from 'lucide-react';
import { QuestionRenderer, draftToPublicQuestion, usePreviewState } from '@/components/features/public-survey';
import type { DraftQuestion } from '@/stores/surveyBuilderStore';
import type { AnswerValue } from '@/types/public-survey';
import { cn } from '@/lib/utils';

// ============ Types ============

interface QuestionPreviewProps {
  question: DraftQuestion;
  className?: string;
  /** Enable/disable user interaction with the preview */
  isInteractive?: boolean;
}

// ============ Main Component ============

/**
 * QuestionPreview - Clean, complementary preview for the survey builder
 *
 * Designed to be the "other half" of the question card - showing
 * exactly how the question will appear to respondents.
 */
export function QuestionPreview({ question, className, isInteractive = true }: QuestionPreviewProps) {
  const { t } = useTranslation();

  // Convert DraftQuestion to PublicQuestion for the renderer
  const publicQuestion = useMemo(() => draftToPublicQuestion(question), [question]);

  // Preview state management
  const { value, setValue, reset, hasAnswer } = usePreviewState();

  const handleChange = useCallback(
    (newValue: AnswerValue) => {
      if (!isInteractive) return;
      setValue(newValue);
    },
    [isInteractive, setValue]
  );

  return (
    <div className={cn('space-y-5', className)}>
      {/* Question Text */}
      <div className="space-y-1.5">
        <h3 className="text-lg font-medium text-on-surface leading-snug flex items-start gap-1">
          <span className="flex-1">
            {question.text || <span className="text-on-surface-variant/50 italic">{t('questionPreview.questionText', 'Question text')}</span>}
          </span>
          {question.isRequired && <span className="text-error font-medium">*</span>}
        </h3>
        {question.description && <p className="text-sm text-on-surface-variant leading-relaxed">{question.description}</p>}
      </div>

      {/* Interactive hint */}
      {isInteractive && (
        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant/60">
          <Sparkles className="w-3 h-3 text-primary/70" />
          <span>{t('questionPreview.interactiveMode', 'Interactive preview - try it out!')}</span>
        </div>
      )}

      {/* Question Renderer */}
      <QuestionRenderer question={publicQuestion} value={value} onChange={handleChange} disabled={!isInteractive} />

      {/* Reset row - appears when answer is recorded */}
      <AnimatePresence>
        {hasAnswer && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-between pt-1"
          >
            <span className="text-xs text-success font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              {t('questionPreview.answered', 'Answer recorded')}
            </span>
            <button onClick={reset} className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors">
              <RotateCcw className="w-3 h-3" />
              {t('common.reset', 'Reset')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default QuestionPreview;
