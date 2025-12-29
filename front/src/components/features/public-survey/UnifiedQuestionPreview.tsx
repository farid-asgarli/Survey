// Unified Question Preview - Single source of truth for question rendering
// This component adapts DraftQuestion (from builder) to use the same renderers as public surveys

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { RotateCcw, Info } from 'lucide-react';
import { QuestionRenderer } from './QuestionRenderers';
import type { DraftQuestion } from '@/stores/surveyBuilderStore';
import type { PublicQuestion, AnswerValue } from '@/types/public-survey';

// ============ Adapter: DraftQuestion → PublicQuestion ============

/**
 * Converts a DraftQuestion (used in the survey builder) to a PublicQuestion format
 * that can be used with the unified QuestionRenderer.
 */
export function draftToPublicQuestion(draft: DraftQuestion): PublicQuestion {
  // Convert DraftOption[] to string[] for options-based questions
  const optionTexts = draft.options?.map((o) => o.text) || [];

  return {
    id: draft.id,
    text: draft.text || '',
    type: draft.type,
    order: draft.order,
    isRequired: draft.isRequired,
    description: draft.description,
    settings: {
      // Spread existing settings
      ...draft.settings,
      // Override options with converted format
      options: optionTexts.length > 0 ? optionTexts : draft.settings.options,
    },
  };
}

// ============ Preview State Hook ============

interface PreviewState {
  value: AnswerValue;
  setValue: (value: AnswerValue) => void;
  reset: () => void;
  hasAnswer: boolean;
}

/**
 * Hook to manage preview state for any question type
 */
export function usePreviewState(): PreviewState {
  const [value, setValueInternal] = useState<AnswerValue>(null);

  const setValue = useCallback((newValue: AnswerValue) => {
    setValueInternal(newValue);
  }, []);

  const reset = useCallback(() => {
    setValueInternal(null);
  }, []);

  const hasAnswer = useMemo(() => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return false;
    return true;
  }, [value]);

  return { value, setValue, reset, hasAnswer };
}

// ============ Main Preview Component ============

interface UnifiedQuestionPreviewProps {
  /** The question to preview - can be DraftQuestion or PublicQuestion */
  question: DraftQuestion | PublicQuestion;
  /** Additional CSS classes */
  className?: string;
  /** Whether the preview is interactive (allows user input) */
  isInteractive?: boolean;
  /** Show the interactive mode header with reset button */
  showHeader?: boolean;
  /** Optional controlled value */
  value?: AnswerValue;
  /** Optional onChange handler for controlled mode */
  onChange?: (value: AnswerValue) => void;
  /** Show question text and description */
  showQuestionText?: boolean;
  /** Custom wrapper className for the renderer */
  rendererClassName?: string;
}

/**
 * Unified Question Preview Component
 *
 * This is the single source of truth for rendering question previews across the application.
 * It uses the same renderers as the public survey, ensuring visual consistency.
 *
 * Usage:
 * - In QuestionPreview.tsx: Replace custom renderers with this component
 * - In Editors (ScaleEditor, RatingEditor, etc.): Use for inline previews
 * - In SurveyPreview: Already uses QuestionRenderer directly
 */
export function UnifiedQuestionPreview({
  question,
  className,
  isInteractive = true,
  showHeader = true,
  value: controlledValue,
  onChange: controlledOnChange,
  showQuestionText = true,
  rendererClassName,
}: UnifiedQuestionPreviewProps) {
  const { t } = useTranslation();

  // Convert to PublicQuestion if it's a DraftQuestion
  const publicQuestion = useMemo(() => {
    // Check if it's a DraftQuestion by looking for the `options` array with `id` property
    if ('options' in question && Array.isArray(question.options) && question.options.length > 0 && 'id' in question.options[0]) {
      return draftToPublicQuestion(question as DraftQuestion);
    }
    return question as PublicQuestion;
  }, [question]);

  // Internal state for uncontrolled mode
  const internalState = usePreviewState();

  // Determine if we're in controlled or uncontrolled mode
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalState.value;
  const setValue = isControlled ? controlledOnChange! : internalState.setValue;
  const hasAnswer = isControlled ? controlledValue !== null && controlledValue !== undefined && controlledValue !== '' : internalState.hasAnswer;

  const handleChange = useCallback(
    (newValue: AnswerValue) => {
      if (!isInteractive) return;
      setValue(newValue);
    },
    [isInteractive, setValue]
  );

  const handleReset = useCallback(() => {
    if (isControlled && controlledOnChange) {
      controlledOnChange(null);
    } else {
      internalState.reset();
    }
  }, [isControlled, controlledOnChange, internalState]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Interactive mode header */}
      {isInteractive && showHeader && (
        <div className="flex items-center justify-between text-xs text-on-surface-variant bg-surface-container/50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5" />
            <span>{t('questionPreview.interactiveMode', 'Interactive preview - try it out!')}</span>
          </div>
          {hasAnswer && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleReset}
              className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              {t('common.reset', 'Reset')}
            </motion.button>
          )}
        </div>
      )}

      {/* Question Text */}
      {showQuestionText && (
        <div>
          <h3 className="text-lg font-medium text-on-surface">
            {publicQuestion.text || t('questionPreview.questionText', 'Question text')}
            {publicQuestion.isRequired && <span className="text-error ml-1">*</span>}
          </h3>
          {publicQuestion.description && <p className="text-sm text-on-surface-variant mt-1">{publicQuestion.description}</p>}
        </div>
      )}

      {/* Question Renderer - The actual preview */}
      <div className={rendererClassName}>
        <QuestionRenderer question={publicQuestion} value={value} onChange={handleChange} disabled={!isInteractive} />
      </div>
    </div>
  );
}

// ============ Simplified Preview for Editors ============

interface EditorPreviewProps {
  /** The question to preview */
  question: DraftQuestion;
  /** Additional CSS classes */
  className?: string;
  /** Title for the preview section */
  title?: string;
}

/**
 * Simplified preview component for use in question editors.
 * Non-interactive by default, just shows how the question will look.
 */
export function EditorPreview({ question, className, title }: EditorPreviewProps) {
  const { t } = useTranslation();

  return (
    <div className={cn('p-4 rounded-2xl bg-surface-container/50', className)}>
      <p className="text-sm text-on-surface-variant mb-3">{title || t('questionEditor.preview', 'Preview')}</p>
      <UnifiedQuestionPreview question={question} isInteractive={false} showHeader={false} showQuestionText={false} />
    </div>
  );
}

export default UnifiedQuestionPreview;
