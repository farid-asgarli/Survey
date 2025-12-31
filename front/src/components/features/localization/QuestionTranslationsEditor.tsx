// Question Translations Editor - Side-by-side translation for survey questions
//
// Features:
// - List of all questions with translation status
// - Side-by-side source/target view
// - Support for question text, description, and options
// - Progress tracking per question

import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight, Check, AlertTriangle, HelpCircle, ListChecks, Star } from 'lucide-react';
import { Input, Textarea, Tooltip } from '@/components/ui';
import { cn } from '@/lib/utils';
import { getLanguageInfo } from '@/config/languages';
import type { QuestionTranslationsDto, QuestionTranslationItemDto } from '@/types';

// Extended type for question with settings (options, etc.)
export interface QuestionWithSettings extends QuestionTranslationsDto {
  type: string;
  /** Source question text from default language */
  sourceText: string;
  /** Source description from default language */
  sourceDescription?: string;
  /** Source options from default language (for choice questions) */
  sourceOptions?: string[];
  /** Source matrix rows (for matrix questions) */
  sourceMatrixRows?: string[];
  /** Source matrix columns (for matrix questions) */
  sourceMatrixColumns?: string[];
  /** Source min/max labels (for rating/scale questions) */
  sourceMinLabel?: string;
  sourceMaxLabel?: string;
}

export interface QuestionTranslationUpdate {
  questionId: string;
  text?: string;
  description?: string;
  /** Translated options (same order as source) */
  options?: string[];
  /** Translated matrix rows */
  matrixRows?: string[];
  /** Translated matrix columns */
  matrixColumns?: string[];
  /** Translated min/max labels */
  minLabel?: string;
  maxLabel?: string;
}

interface QuestionTranslationsEditorProps {
  /** Questions with their translations */
  questions: QuestionWithSettings[];
  /** Source language code (default language) */
  sourceLanguage: string;
  /** Target language code (language being translated to) */
  targetLanguage: string;
  /** Callback when a question translation changes */
  onChange: (update: QuestionTranslationUpdate) => void;
  /** Whether the editor is read-only */
  isReadOnly?: boolean;
  /** Currently expanded question ID */
  expandedQuestionId?: string;
  /** Callback when a question is expanded/collapsed */
  onExpandQuestion?: (questionId: string | undefined) => void;
}

/**
 * Get translation for a specific language from translations array
 */
function getTranslation(translations: QuestionTranslationItemDto[], languageCode: string): QuestionTranslationItemDto | undefined {
  return translations.find((t) => t.languageCode === languageCode);
}

/**
 * Calculate question translation completeness
 */
function getQuestionCompleteness(question: QuestionWithSettings, targetLanguage: string): { complete: number; total: number; percent: number } {
  const targetTranslation = getTranslation(question.translations, targetLanguage);
  let total = 1; // At minimum, the question text
  let complete = 0;

  // Check text
  if (targetTranslation?.text) complete++;

  // Check description if source has it
  if (question.sourceDescription) {
    total++;
    if (targetTranslation?.description) complete++;
  }

  // Check options
  if (question.sourceOptions?.length) {
    total += question.sourceOptions.length;
    // Check if we have translated options
    const translatedOptions = targetTranslation?.translatedSettings?.options;
    if (translatedOptions?.length) {
      complete += Math.min(translatedOptions.filter(Boolean).length, question.sourceOptions.length);
    }
  }

  // Check matrix rows/columns
  if (question.sourceMatrixRows?.length) {
    total += question.sourceMatrixRows.length;
    const translatedRows = targetTranslation?.translatedSettings?.matrixRows;
    if (translatedRows?.length) {
      complete += Math.min(translatedRows.filter(Boolean).length, question.sourceMatrixRows.length);
    }
  }
  if (question.sourceMatrixColumns?.length) {
    total += question.sourceMatrixColumns.length;
    const translatedColumns = targetTranslation?.translatedSettings?.matrixColumns;
    if (translatedColumns?.length) {
      complete += Math.min(translatedColumns.filter(Boolean).length, question.sourceMatrixColumns.length);
    }
  }

  // Check labels
  if (question.sourceMinLabel) {
    total++;
    if (targetTranslation?.translatedSettings?.minLabel) complete++;
  }
  if (question.sourceMaxLabel) {
    total++;
    if (targetTranslation?.translatedSettings?.maxLabel) complete++;
  }

  const percent = total > 0 ? Math.round((complete / total) * 100) : 100;
  return { complete, total, percent };
}

/**
 * Single question translation item
 */
function QuestionTranslationItem({
  question,
  index,
  sourceLanguage,
  targetLanguage,
  isExpanded,
  isReadOnly,
  onToggle,
  onChange,
}: {
  question: QuestionWithSettings;
  index: number;
  sourceLanguage: string;
  targetLanguage: string;
  isExpanded: boolean;
  isReadOnly: boolean;
  onToggle: () => void;
  onChange: (update: QuestionTranslationUpdate) => void;
}) {
  const { t } = useTranslation();
  const sourceLang = getLanguageInfo(sourceLanguage);
  const targetLang = getLanguageInfo(targetLanguage);

  const sourceTranslation = getTranslation(question.translations, sourceLanguage);
  const targetTranslation = getTranslation(question.translations, targetLanguage);

  const completeness = getQuestionCompleteness(question, targetLanguage);
  const isComplete = completeness.percent === 100;

  // Derive initial values from props - local state tracks user edits
  const initialText = targetTranslation?.text || '';
  const initialDescription = targetTranslation?.description || '';
  const initialMinLabel = targetTranslation?.translatedSettings?.minLabel || '';
  const initialMaxLabel = targetTranslation?.translatedSettings?.maxLabel || '';

  // Local state for edits - use key pattern to reset state when target changes
  const [localText, setLocalText] = useState(initialText);
  const [localDescription, setLocalDescription] = useState(initialDescription);
  const [localMinLabel, setLocalMinLabel] = useState(initialMinLabel);
  const [localMaxLabel, setLocalMaxLabel] = useState(initialMaxLabel);

  // Use key pattern to sync local state when target translation changes
  // This is the recommended pattern instead of useEffect with setState
  const [prevInitialText, setPrevInitialText] = useState(initialText);
  const [prevInitialDescription, setPrevInitialDescription] = useState(initialDescription);
  const [prevInitialMinLabel, setPrevInitialMinLabel] = useState(initialMinLabel);
  const [prevInitialMaxLabel, setPrevInitialMaxLabel] = useState(initialMaxLabel);

  if (initialText !== prevInitialText) {
    setPrevInitialText(initialText);
    setLocalText(initialText);
  }
  if (initialDescription !== prevInitialDescription) {
    setPrevInitialDescription(initialDescription);
    setLocalDescription(initialDescription);
  }
  if (initialMinLabel !== prevInitialMinLabel) {
    setPrevInitialMinLabel(initialMinLabel);
    setLocalMinLabel(initialMinLabel);
  }
  if (initialMaxLabel !== prevInitialMaxLabel) {
    setPrevInitialMaxLabel(initialMaxLabel);
    setLocalMaxLabel(initialMaxLabel);
  }

  const handleTextChange = useCallback(
    (value: string) => {
      setLocalText(value);
      onChange({ questionId: question.questionId, text: value });
    },
    [question.questionId, onChange]
  );

  const handleDescriptionChange = useCallback(
    (value: string) => {
      setLocalDescription(value);
      onChange({ questionId: question.questionId, description: value });
    },
    [question.questionId, onChange]
  );

  const handleMinLabelChange = useCallback(
    (value: string) => {
      setLocalMinLabel(value);
      onChange({ questionId: question.questionId, minLabel: value });
    },
    [question.questionId, onChange]
  );

  const handleMaxLabelChange = useCallback(
    (value: string) => {
      setLocalMaxLabel(value);
      onChange({ questionId: question.questionId, maxLabel: value });
    },
    [question.questionId, onChange]
  );

  const sourceText = sourceTranslation?.text || question.sourceText || '';
  const sourceDesc = sourceTranslation?.description || question.sourceDescription || '';

  return (
    <div
      className={cn(
        // M3 Expressive: Dynamic shape morphing (16px → 24px → 32px for compact)
        'border-2 rounded-2xl transition-[border-radius,border-color,background-color] duration-300 ease-[cubic-bezier(0.2,0,0,1)]',
        isExpanded
          ? 'border-primary/40 bg-surface-container rounded-3xl'
          : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/20 hover:bg-surface-container hover:rounded-3xl'
      )}
    >
      {/* Header - always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 rounded-2xl transition-[border-radius] duration-300"
      >
        {/* Expand/collapse icon */}
        <span
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-full transition-colors',
            isExpanded ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'
          )}
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>

        {/* Question number and type */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="shrink-0 w-8 h-8 rounded-full bg-primary-container/60 text-on-primary-container text-sm font-semibold flex items-center justify-center">
            {index + 1}
          </span>
          <span className="truncate text-sm font-medium text-on-surface">
            {sourceText || t('localization.untitledQuestion', 'Untitled Question')}
          </span>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 shrink-0">
          {isComplete ? (
            <Tooltip content={t('localization.translationComplete', 'Translation complete')}>
              <span className="inline-flex items-center gap-1.5 h-7 px-3 text-xs font-semibold bg-success-container/60 text-on-success-container rounded-full">
                <Check className="w-3.5 h-3.5" />
                {t('common.complete', 'Complete')}
              </span>
            </Tooltip>
          ) : (
            <Tooltip
              content={t('localization.translationIncomplete', '{{percent}}% translated', {
                percent: completeness.percent,
              })}
            >
              <span className="inline-flex items-center gap-1.5 h-7 px-3 text-xs font-semibold bg-warning-container/60 text-on-warning-container rounded-full">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{completeness.percent}%</span>
              </span>
            </Tooltip>
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-5 pb-5 space-y-5 border-t border-outline-variant/20 mt-1 pt-5">
          {/* Question Text */}
          <div className="grid grid-cols-2 gap-5">
            {/* Source */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-on-surface">
                {sourceLang.flag} {t('localization.questionText', 'Question Text')}
              </label>
              <div className="px-4 py-3 rounded-2xl bg-surface-container-high/60 text-sm text-on-surface border border-outline-variant/20 min-h-18">
                {sourceText || <span className="text-on-surface-variant/50 italic">{t('localization.noContent', 'No content')}</span>}
              </div>
            </div>

            {/* Target */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-on-surface">
                {targetLang.flag} {t('localization.questionText', 'Question Text')}
                {!localText && sourceText && (
                  <span className="inline-flex items-center gap-1 h-5 px-2 text-[10px] font-semibold text-warning bg-warning-container/50 rounded-full">
                    <AlertTriangle className="w-3 h-3" />
                    {t('common.required', 'Required')}
                  </span>
                )}
              </label>
              <Textarea
                value={localText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={t('localization.enterTranslation', 'Enter translation...')}
                disabled={isReadOnly}
                className={cn(
                  'min-h-18 resize-y rounded-2xl border-2',
                  !localText && sourceText ? 'border-warning/50 focus:border-warning' : 'border-outline-variant/40'
                )}
              />
            </div>
          </div>

          {/* Description (if source has it) */}
          {sourceDesc && (
            <div className="grid grid-cols-2 gap-5">
              {/* Source */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-on-surface">
                  <HelpCircle className="w-4 h-4 text-on-surface-variant" />
                  {sourceLang.flag} {t('localization.description', 'Description')}
                </label>
                <div className="px-4 py-3 rounded-2xl bg-surface-container-high/60 text-sm text-on-surface border border-outline-variant/20 min-h-14">
                  {sourceDesc}
                </div>
              </div>

              {/* Target */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-on-surface">
                  <HelpCircle className="w-4 h-4 text-on-surface-variant" />
                  {targetLang.flag} {t('localization.description', 'Description')}
                  {!localDescription && (
                    <span className="inline-flex items-center gap-1 h-5 px-2 text-[10px] font-semibold text-warning bg-warning-container/50 rounded-full">
                      <AlertTriangle className="w-3 h-3" />
                    </span>
                  )}
                </label>
                <Textarea
                  value={localDescription}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  placeholder={t('localization.enterTranslation', 'Enter translation...')}
                  disabled={isReadOnly}
                  className={cn(
                    'min-h-14 resize-y rounded-2xl border-2',
                    !localDescription ? 'border-warning/50 focus:border-warning' : 'border-outline-variant/40'
                  )}
                />
              </div>
            </div>
          )}

          {/* Rating Labels (for rating/scale questions) */}
          {(question.sourceMinLabel || question.sourceMaxLabel) && (
            <div className="pt-4 border-t border-outline-variant/20">
              <div className="flex items-center gap-2 text-sm font-semibold text-on-surface mb-4">
                <Star className="w-4 h-4 text-on-surface-variant" />
                {t('localization.ratingLabels', 'Rating Labels')}
              </div>
              <div className="grid grid-cols-2 gap-5">
                {/* Min Label */}
                {question.sourceMinLabel && (
                  <>
                    {/* Source Min */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-on-surface-variant">
                        {sourceLang.flag} {t('localization.lowRatingLabel', 'Low Rating Label')}
                      </label>
                      <div className="px-4 py-2.5 rounded-2xl bg-surface-container-high/60 text-sm text-on-surface border border-outline-variant/20">
                        {question.sourceMinLabel}
                      </div>
                    </div>
                    {/* Target Min */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-on-surface-variant">
                        {targetLang.flag} {t('localization.lowRatingLabel', 'Low Rating Label')}
                        {!localMinLabel && (
                          <span className="inline-flex items-center gap-1 h-5 px-2 text-[10px] font-semibold text-warning bg-warning-container/50 rounded-full">
                            <AlertTriangle className="w-3 h-3" />
                          </span>
                        )}
                      </label>
                      <Input
                        value={localMinLabel}
                        onChange={(e) => handleMinLabelChange(e.target.value)}
                        placeholder={t('localization.enterTranslation', 'Enter translation...')}
                        disabled={isReadOnly}
                        className={cn(
                          'rounded-2xl border-2',
                          !localMinLabel ? 'border-warning/50 focus:border-warning' : 'border-outline-variant/40'
                        )}
                      />
                    </div>
                  </>
                )}

                {/* Max Label */}
                {question.sourceMaxLabel && (
                  <>
                    {/* Source Max */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-on-surface-variant">
                        {sourceLang.flag} {t('localization.highRatingLabel', 'High Rating Label')}
                      </label>
                      <div className="px-4 py-2.5 rounded-2xl bg-surface-container-high/60 text-sm text-on-surface border border-outline-variant/20">
                        {question.sourceMaxLabel}
                      </div>
                    </div>
                    {/* Target Max */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-on-surface-variant">
                        {targetLang.flag} {t('localization.highRatingLabel', 'High Rating Label')}
                        {!localMaxLabel && (
                          <span className="inline-flex items-center gap-1 h-5 px-2 text-[10px] font-semibold text-warning bg-warning-container/50 rounded-full">
                            <AlertTriangle className="w-3 h-3" />
                          </span>
                        )}
                      </label>
                      <Input
                        value={localMaxLabel}
                        onChange={(e) => handleMaxLabelChange(e.target.value)}
                        placeholder={t('localization.enterTranslation', 'Enter translation...')}
                        disabled={isReadOnly}
                        className={cn(
                          'rounded-2xl border-2',
                          !localMaxLabel ? 'border-warning/50 focus:border-warning' : 'border-outline-variant/40'
                        )}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Options (for choice questions) - shown as a hint for now */}
          {question.sourceOptions && question.sourceOptions.length > 0 && (
            <div className="pt-4 border-t border-outline-variant/20">
              <div className="flex items-center gap-2 text-sm font-semibold text-on-surface mb-3">
                <ListChecks className="w-4 h-4 text-on-surface-variant" />
                {t('localization.optionsCount', '{{count}} options', {
                  count: question.sourceOptions.length,
                })}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {question.sourceOptions.map((option, optIndex) => (
                  <div
                    key={optIndex}
                    className="flex items-center gap-3 text-sm p-3 rounded-xl bg-surface-container-high/40 border border-outline-variant/20"
                  >
                    <span className="w-6 h-6 rounded-full bg-primary-container/40 text-on-primary-container text-xs font-semibold flex items-center justify-center">
                      {optIndex + 1}
                    </span>
                    <span className="text-on-surface">{option}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-on-surface-variant/70 italic px-1">
                {t('localization.optionsTranslationHint', 'Option translations coming in next update')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function QuestionTranslationsEditor({
  questions,
  sourceLanguage,
  targetLanguage,
  onChange,
  isReadOnly = false,
  expandedQuestionId,
  onExpandQuestion,
}: QuestionTranslationsEditorProps) {
  const { t } = useTranslation();

  // Local expanded state if not controlled
  const [localExpanded, setLocalExpanded] = useState<string | undefined>(questions[0]?.questionId);

  const expanded = expandedQuestionId ?? localExpanded;
  const setExpanded = onExpandQuestion ?? setLocalExpanded;

  // Calculate overall stats
  const stats = useMemo(() => {
    const totalQuestions = questions.length;
    let completeQuestions = 0;

    questions.forEach((q) => {
      const completeness = getQuestionCompleteness(q, targetLanguage);
      if (completeness.percent === 100) completeQuestions++;
    });

    const percent = totalQuestions > 0 ? Math.round((completeQuestions / totalQuestions) * 100) : 100;

    return { total: totalQuestions, complete: completeQuestions, percent };
  }, [questions, targetLanguage]);

  const handleToggle = useCallback(
    (questionId: string) => {
      setExpanded(expanded === questionId ? undefined : questionId);
    },
    [expanded, setExpanded]
  );

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-on-surface-variant">{t('localization.noQuestions', 'No questions to translate')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header with stats */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container border border-outline-variant/20">
        <h3 className="text-base font-semibold text-on-surface">{t('localization.questions', 'Questions')}</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-on-surface-variant">
            {t('localization.questionsProgress', '{{complete}}/{{total}} complete', {
              complete: stats.complete,
              total: stats.total,
            })}
          </span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-outline-variant/20 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500 ease-out',
                  stats.percent === 100 ? 'bg-success' : stats.percent >= 50 ? 'bg-warning' : 'bg-error'
                )}
                style={{ width: `${stats.percent}%` }}
              />
            </div>
            <span
              className={cn('text-sm font-semibold', stats.percent === 100 ? 'text-success' : stats.percent >= 50 ? 'text-warning' : 'text-error')}
            >
              {stats.percent}%
            </span>
          </div>
        </div>
      </div>

      {/* Question list */}
      <div className="space-y-2">
        {questions.map((question, index) => (
          <QuestionTranslationItem
            key={question.questionId}
            question={question}
            index={index}
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
            isExpanded={expanded === question.questionId}
            isReadOnly={isReadOnly}
            onToggle={() => handleToggle(question.questionId)}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  );
}
