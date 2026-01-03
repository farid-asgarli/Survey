// Languages Tab - M3 Expressive Design (Redesigned)
//
// Features:
// - Wide, immersive split-panel layout for translation editing
// - No shadows (uses border/color elevation)
// - Shape morphing on interactive elements
// - Semantic color tokens throughout
// - Rounded-full buttons and pills
// - Hero header with rich statistics overview
// - Beautiful language cards with visual progress indicators
// - Side-by-side source/target editing experience
//
// Architecture:
// - Language list view (default) → click language → Translation editor view
// - Translation editor: Split panel with source preview (left) + editable target (right)
// - Tabs for Survey Details | Questions
// - Back button returns to language list

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Globe,
  Plus,
  FileDown,
  FileUp,
  Loader2,
  Check,
  AlertTriangle,
  Languages,
  FileText,
  MessageSquare,
  X,
  CircleCheck,
  Wand2,
} from 'lucide-react';
import { Button, BackButton, Tabs, TabsList, TabsTrigger, TabsContent, EmptyState, Input, Textarea, IconButton } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useSurveyTranslations, useBulkUpdateTranslations, useDeleteSurveyTranslation, useDialogState } from '@/hooks';
import { LanguageList, type LanguageStats } from './LanguageList';
import { AddLanguageDialog } from './AddLanguageDialog';
import { LANGUAGE_INFO } from './SurveyLanguageSwitcher';
import { QuestionTranslationsEditor, type QuestionWithSettings, type QuestionTranslationUpdate } from './QuestionTranslationsEditor';
import type { SurveyTranslationDto, QuestionTranslationsDto, Question, QuestionTranslationUpdateDto } from '@/types';

/** Minimal question fields required for translation */
type TranslatableQuestion = Pick<Question, 'id' | 'type' | 'text' | 'description' | 'settings'>;

interface LanguagesTabProps {
  /** Survey ID */
  surveyId: string;
  /** Default language of the survey */
  defaultLanguage: string;
  /** Available languages */
  availableLanguages: string[];
  /** Questions in the survey (for translation) - accepts Question or DraftQuestion */
  questions: TranslatableQuestion[];
  /** Whether the survey is read-only */
  isReadOnly?: boolean;
  /** Callback to close the drawer */
  onClose?: () => void;
  /** Callback when a language is added */
  onAddLanguage: (languageCode: string, autoTranslate: boolean) => Promise<void>;
  /** Callback when language is deleted */
  onDeleteLanguage?: (languageCode: string) => void;
  /** Additional CSS class */
  className?: string;
}

/**
 * Get language info for display
 */
function getLanguageInfo(code: string) {
  return (
    LANGUAGE_INFO[code] || {
      name: code.toUpperCase(),
      nativeName: code.toUpperCase(),
      flag: '🌐',
    }
  );
}

/**
 * Calculate language statistics from translations data
 */
function calculateLanguageStats(
  languageCode: string,
  defaultLanguage: string,
  translations: SurveyTranslationDto[],
  questionTranslations: QuestionTranslationsDto[]
): LanguageStats {
  const translation = translations.find((t) => t.languageCode === languageCode);
  const isDefault = languageCode === defaultLanguage;

  // Survey fields (title, description, welcomeMessage, thankYouMessage)
  const surveyFieldsTotal = 4;
  let surveyFieldsTranslated = 0;

  if (translation) {
    if (translation.title) surveyFieldsTranslated++;
    if (translation.description) surveyFieldsTranslated++;
    if (translation.welcomeMessage) surveyFieldsTranslated++;
    if (translation.thankYouMessage) surveyFieldsTranslated++;
  }

  // Question fields
  let questionsTotal = 0;
  let questionsTranslated = 0;

  questionTranslations.forEach((q) => {
    const qTranslation = q.translations.find((t) => t.languageCode === languageCode);
    questionsTotal++; // At minimum, we count the question text

    if (qTranslation?.text) {
      questionsTranslated++;
    }
  });

  return {
    code: languageCode,
    isDefault,
    isEnabled: true,
    surveyFieldsTotal,
    surveyFieldsTranslated,
    questionsTotal,
    questionsTranslated,
  };
}

// ============================================================================
// Translation Field Component - Premium side-by-side field editor
// ============================================================================

interface TranslationFieldProps {
  label: string;
  sourceValue: string;
  targetValue: string;
  sourceFlag: string;
  targetFlag: string;
  isMultiline?: boolean;
  isRequired?: boolean;
  isReadOnly?: boolean;
  onChange: (value: string) => void;
}

function TranslationField({
  label,
  sourceValue,
  targetValue,
  sourceFlag,
  targetFlag,
  isMultiline,
  isRequired,
  isReadOnly,
  onChange,
}: TranslationFieldProps) {
  const { t } = useTranslation();
  const needsWork = sourceValue && !targetValue;
  const isComplete = sourceValue && targetValue;

  return (
    <div className="group rounded-2xl border-2 border-outline-variant/30 bg-surface-container-lowest p-5 transition-all duration-300 hover:border-outline-variant/50 hover:bg-surface-container-low/50">
      {/* Field label with status */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-on-surface flex items-center gap-2">
          {label}
          {isRequired && <span className="text-error">*</span>}
        </span>
        {isComplete ? (
          <span className="inline-flex items-center gap-1.5 h-6 px-2.5 text-xs font-medium text-success bg-success-container/40 rounded-full">
            <CircleCheck className="w-3.5 h-3.5" />
            {t('common.complete', 'Complete')}
          </span>
        ) : needsWork ? (
          <span className="inline-flex items-center gap-1.5 h-6 px-2.5 text-xs font-medium text-warning bg-warning-container/40 rounded-full">
            <AlertTriangle className="w-3.5 h-3.5" />
            {t('common.required', 'Required')}
          </span>
        ) : null}
      </div>

      {/* Side by side columns */}
      <div className="grid grid-cols-2 gap-5">
        {/* Source (read-only) */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-medium text-on-surface-variant uppercase tracking-wider">
            <span className="text-base">{sourceFlag}</span>
            {t('localization.source', 'Source')}
          </label>
          <div
            className={cn(
              'px-4 py-3.5 rounded-2xl bg-surface-container text-on-surface border-2 border-outline-variant/20 text-sm leading-relaxed',
              isMultiline && 'min-h-28'
            )}
          >
            {sourceValue || <span className="text-on-surface-variant/50 italic">{t('localization.noContent', 'No content')}</span>}
          </div>
        </div>

        {/* Target (editable) */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-medium text-on-surface-variant uppercase tracking-wider">
            <span className="text-base">{targetFlag}</span>
            {t('localization.translation', 'Translation')}
          </label>
          {isMultiline ? (
            <Textarea
              value={targetValue}
              onChange={(e) => onChange(e.target.value)}
              placeholder={t('localization.enterTranslation', 'Enter translation...')}
              disabled={isReadOnly}
              className={cn(
                'min-h-28 resize-y transition-all duration-200',
                needsWork && 'border-warning/50 focus:border-warning focus:ring-warning/20',
                isComplete && 'border-success/30'
              )}
            />
          ) : (
            <Input
              value={targetValue}
              onChange={(e) => onChange(e.target.value)}
              placeholder={t('localization.enterTranslation', 'Enter translation...')}
              disabled={isReadOnly}
              className={cn(
                'transition-all duration-200',
                needsWork && 'border-warning/50 focus:border-warning focus:ring-warning/20',
                isComplete && 'border-success/30'
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Translation Editor Panel - Integrated editor using composition
// ============================================================================

interface TranslationEditorPanelProps {
  surveyId: string;
  sourceLanguage: string;
  targetLanguage: string;
  translations: SurveyTranslationDto[];
  questionTranslations: QuestionTranslationsDto[];
  questions: TranslatableQuestion[];
  isReadOnly: boolean;
  onBack: () => void;
  onClose?: () => void;
}

function TranslationEditorPanel({
  surveyId,
  sourceLanguage,
  targetLanguage,
  translations,
  questionTranslations,
  questions,
  isReadOnly,
  onBack,
  onClose,
}: TranslationEditorPanelProps) {
  const { t } = useTranslation();
  const bulkUpdateMutation = useBulkUpdateTranslations();

  const sourceLang = getLanguageInfo(sourceLanguage);
  const targetLang = getLanguageInfo(targetLanguage);

  // Get translations for source and target
  const sourceTranslation = translations.find((tr) => tr.languageCode === sourceLanguage);
  const targetTranslation = translations.find((tr) => tr.languageCode === targetLanguage);

  // Local state for edits
  const [surveyEdits, setSurveyEdits] = useState<Partial<SurveyTranslationDto>>({});
  const [questionEdits, setQuestionEdits] = useState<Record<string, QuestionTranslationUpdate>>({});
  const [activeTab, setActiveTab] = useState<'survey' | 'questions'>('survey');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // Reset edits when target language changes
  useEffect(() => {
    setSurveyEdits({});
    setQuestionEdits({});
  }, [targetLanguage]);

  // Merged local translation values
  const localTranslation = useMemo(
    () => ({
      title: surveyEdits.title ?? targetTranslation?.title ?? '',
      description: surveyEdits.description ?? targetTranslation?.description ?? '',
      welcomeMessage: surveyEdits.welcomeMessage ?? targetTranslation?.welcomeMessage ?? '',
      thankYouMessage: surveyEdits.thankYouMessage ?? targetTranslation?.thankYouMessage ?? '',
    }),
    [targetTranslation, surveyEdits]
  );

  const isDirty = Object.keys(surveyEdits).length > 0 || Object.keys(questionEdits).length > 0;

  // Handle survey field change
  const handleSurveyFieldChange = useCallback((field: string, value: string) => {
    setSurveyEdits((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Handle question translation change
  const handleQuestionChange = useCallback((update: QuestionTranslationUpdate) => {
    setQuestionEdits((prev) => ({
      ...prev,
      [update.questionId]: { ...prev[update.questionId], ...update },
    }));
  }, []);

  // Save all changes
  const handleSave = useCallback(async () => {
    if (!isDirty) return;

    setIsSaving(true);
    try {
      const surveyTranslation: SurveyTranslationDto = {
        languageCode: targetLanguage,
        title: localTranslation.title,
        description: localTranslation.description || undefined,
        welcomeMessage: localTranslation.welcomeMessage || undefined,
        thankYouMessage: localTranslation.thankYouMessage || undefined,
        isDefault: false,
      };

      const questionTranslationUpdates: QuestionTranslationUpdateDto[] = Object.entries(questionEdits).map(([questionId, update]) => {
        // Find existing server-side translation for this question
        const existingQuestionTranslation = questionTranslations.find((qt) => qt.questionId === questionId);
        const existingTargetTranslation = existingQuestionTranslation?.translations.find((t) => t.languageCode === targetLanguage);
        const existingSettings = existingTargetTranslation?.translatedSettings;

        // Merge local edits with existing server values - local edits take priority
        const mergedText = update.text ?? existingTargetTranslation?.text ?? '';
        const mergedDescription = update.description ?? existingTargetTranslation?.description;
        const mergedMinLabel = update.minLabel ?? existingSettings?.minLabel;
        const mergedMaxLabel = update.maxLabel ?? existingSettings?.maxLabel;
        const mergedOptions = update.options ?? existingSettings?.options;
        const mergedMatrixRows = update.matrixRows ?? existingSettings?.matrixRows;
        const mergedMatrixColumns = update.matrixColumns ?? existingSettings?.matrixColumns;
        // Also preserve other translatable settings
        const mergedPlaceholder = existingSettings?.placeholder;
        const mergedValidationMessage = existingSettings?.validationMessage;
        const mergedOtherLabel = existingSettings?.otherLabel;

        // Build translatedSettings if any settings fields are present (merged)
        const hasTranslatedSettings =
          mergedMinLabel ||
          mergedMaxLabel ||
          mergedOptions ||
          mergedMatrixRows ||
          mergedMatrixColumns ||
          mergedPlaceholder ||
          mergedValidationMessage ||
          mergedOtherLabel;

        return {
          questionId,
          languageCode: targetLanguage,
          text: mergedText,
          description: mergedDescription,
          translatedSettings: hasTranslatedSettings
            ? {
                minLabel: mergedMinLabel,
                maxLabel: mergedMaxLabel,
                options: mergedOptions,
                matrixRows: mergedMatrixRows,
                matrixColumns: mergedMatrixColumns,
                placeholder: mergedPlaceholder,
                validationMessage: mergedValidationMessage,
                otherLabel: mergedOtherLabel,
              }
            : undefined,
        };
      });

      await bulkUpdateMutation.mutateAsync({
        surveyId,
        data: {
          translations: [surveyTranslation],
          questionTranslations: questionTranslationUpdates.length > 0 ? questionTranslationUpdates : undefined,
        },
      });

      setSurveyEdits({});
      setQuestionEdits({});
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save translations:', error);
    } finally {
      setIsSaving(false);
    }
  }, [isDirty, surveyId, targetLanguage, localTranslation, questionEdits, questionTranslations, bulkUpdateMutation]);

  // Build survey fields for side-by-side display
  const surveyFields = useMemo(
    () => [
      {
        key: 'title',
        label: t('localization.fields.title', 'Survey Title'),
        sourceValue: sourceTranslation?.title || '',
        targetValue: localTranslation.title,
        isRequired: true,
      },
      {
        key: 'description',
        label: t('localization.fields.description', 'Description'),
        sourceValue: sourceTranslation?.description || '',
        targetValue: localTranslation.description,
        isMultiline: true,
      },
      {
        key: 'welcomeMessage',
        label: t('localization.fields.welcomeMessage', 'Welcome Message'),
        sourceValue: sourceTranslation?.welcomeMessage || '',
        targetValue: localTranslation.welcomeMessage,
        isMultiline: true,
      },
      {
        key: 'thankYouMessage',
        label: t('localization.fields.thankYouMessage', 'Thank You Message'),
        sourceValue: sourceTranslation?.thankYouMessage || '',
        targetValue: localTranslation.thankYouMessage,
        isMultiline: true,
      },
    ],
    [sourceTranslation, localTranslation, t]
  );

  // Build questions with settings for editor (reuses QuestionTranslationsEditor)
  const questionsWithSettings: QuestionWithSettings[] = useMemo(() => {
    return questionTranslations.map((qt) => {
      const question = questions.find((q) => q.id === qt.questionId);
      const sourceT = qt.translations.find((tr) => tr.languageCode === sourceLanguage);

      return {
        ...qt,
        type: question?.type?.toString() || 'unknown',
        sourceText: sourceT?.text || question?.text || '',
        sourceDescription: sourceT?.description || question?.description,
        sourceOptions: question?.settings?.options?.map((opt) => opt.text),
        sourceMatrixRows: question?.settings?.matrixRows,
        sourceMatrixColumns: question?.settings?.matrixColumns,
        sourceMinLabel: question?.settings?.minLabel,
        sourceMaxLabel: question?.settings?.maxLabel,
      };
    });
  }, [questionTranslations, questions, sourceLanguage]);

  // Calculate completion stats - count all fields, not just those with source values
  // This ensures consistency with the card percentage display
  const surveyStats = useMemo(() => {
    const total = 4; // title, description, welcomeMessage, thankYouMessage
    let translated = 0;
    if (localTranslation.title) translated++;
    if (localTranslation.description) translated++;
    if (localTranslation.welcomeMessage) translated++;
    if (localTranslation.thankYouMessage) translated++;
    const percent = Math.round((translated / total) * 100);
    return { total, translated, percent };
  }, [localTranslation]);

  const questionStats = useMemo(() => {
    // Use the actual questions array length as total, not questionsWithSettings
    // This ensures consistency with the card percentage even when API data is incomplete
    const total = questions.length;
    let translated = 0;
    questionsWithSettings.forEach((q) => {
      const targetT = q.translations.find((tr) => tr.languageCode === targetLanguage);
      const localEdit = questionEdits[q.questionId];
      if (targetT?.text || localEdit?.text) translated++;
    });
    // Don't return 100% when total is 0 - return 0% instead or handle empty state
    const percent = total > 0 ? Math.round((translated / total) * 100) : 0;
    return { total, translated, percent };
  }, [questions.length, questionsWithSettings, targetLanguage, questionEdits]);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left sidebar - Language overview and navigation */}
      <div className="hidden lg:flex w-80 shrink-0 flex-col border-r border-outline-variant/20 bg-surface-container-lowest">
        {/* Language header */}
        <div className="shrink-0 p-5 border-b border-outline-variant/20">
          <BackButton onClick={onBack} label={t('localization.allLanguages', 'All languages')} hideTooltip className="mb-4" />
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-container/40 border-2 border-primary/20">
              <span className="text-3xl">{targetLang.flag}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">{targetLang.nativeName}</h2>
              <p className="text-sm text-on-surface-variant">{targetLang.name}</p>
            </div>
          </div>
        </div>

        {/* Translation progress */}
        <div className="p-5 border-b border-outline-variant/20">
          <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
            {t('localization.translationProgress', 'Translation Progress')}
          </h3>

          {/* Overall progress ring visualization */}
          <div className="flex items-center gap-4 mb-5">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full -rotate-90">
                <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" className="text-outline-variant/20" />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray={`${((surveyStats.percent + questionStats.percent) / 2 / 100) * 176} 176`}
                  strokeLinecap="round"
                  className={cn((surveyStats.percent + questionStats.percent) / 2 === 100 ? 'text-success' : 'text-primary')}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-on-surface">
                {Math.round((surveyStats.percent + questionStats.percent) / 2)}%
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface">
                {(surveyStats.percent + questionStats.percent) / 2 === 100
                  ? t('localization.complete', 'Complete!')
                  : t('localization.inProgress', 'In progress')}
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">{t('localization.overallCompletion', 'Overall completion')}</p>
            </div>
          </div>

          {/* Detail progress bars */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-on-surface flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  {t('localization.surveyDetails', 'Survey Details')}
                </span>
                <span className="text-on-surface-variant">
                  {surveyStats.translated}/{surveyStats.total}
                </span>
              </div>
              <div className="h-2 bg-outline-variant/20 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', surveyStats.percent === 100 ? 'bg-success' : 'bg-primary')}
                  style={{ width: `${surveyStats.percent}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-on-surface flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {t('localization.questions', 'Questions')}
                </span>
                <span className="text-on-surface-variant">
                  {questionStats.translated}/{questionStats.total}
                </span>
              </div>
              <div className="h-2 bg-outline-variant/20 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', questionStats.percent === 100 ? 'bg-success' : 'bg-primary')}
                  style={{ width: `${questionStats.percent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Source language info */}
        <div className="p-5 flex-1">
          <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
            {t('localization.sourceLanguage', 'Source Language', { language: sourceLang.nativeName })}
          </h3>
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container">
            <span className="text-2xl">{sourceLang.flag}</span>
            <div>
              <p className="text-sm font-medium text-on-surface">{sourceLang.nativeName}</p>
              <p className="text-xs text-on-surface-variant">{sourceLang.name}</p>
            </div>
          </div>
        </div>

        {/* Auto-translate hint */}
        {!isReadOnly && (
          <div className="shrink-0 p-5 border-t border-outline-variant/20">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary-container/30">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-secondary-container">
                <Wand2 className="w-4 h-4 text-on-secondary-container" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-on-surface">{t('localization.aiTranslation', 'AI Translation')}</p>
                <p className="text-[10px] text-on-surface-variant">{t('localization.comingSoon', 'Coming soon')}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header (shown on smaller screens) */}
        <div className="lg:hidden shrink-0 bg-primary-container/30 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BackButton onClick={onBack} iconOnly hideTooltip className="rounded-full bg-surface/80" />
              <div className="flex items-center gap-2">
                <span className="text-xl">{targetLang.flag}</span>
                <span className="font-semibold text-on-surface">{targetLang.nativeName}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {showSaved && (
                <span className="inline-flex items-center gap-1.5 h-7 px-3 text-xs font-semibold text-success bg-success-container/60 rounded-full">
                  <Check className="w-3.5 h-3.5" />
                </span>
              )}
              {!isReadOnly && (
                <Button variant="filled" size="sm" onClick={handleSave} disabled={!isDirty || isSaving} loading={isSaving} className="rounded-full">
                  <Check className="w-3.5 h-3.5 mr-1" />
                  {t('common.save', 'Save')}
                </Button>
              )}
              {onClose && (
                <IconButton variant="standard" size="sm" onClick={onClose} aria-label={t('common.close')}>
                  <X className="w-4 h-4" />
                </IconButton>
              )}
            </div>
          </div>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:flex shrink-0 items-center justify-between px-6 py-4 border-b border-outline-variant/20 bg-surface">
          <h3 className="text-lg font-semibold text-on-surface">{t('localization.editTranslations', 'Edit Translations')}</h3>
          <div className="flex items-center gap-3">
            {showSaved && (
              <span className="inline-flex items-center gap-2 h-9 px-4 text-sm font-semibold text-success bg-success-container/60 rounded-full animate-in fade-in">
                <CircleCheck className="w-4 h-4" />
                {t('common.saved', 'Saved')}
              </span>
            )}
            {!isReadOnly && (
              <Button
                variant="filled"
                size="default"
                onClick={handleSave}
                disabled={!isDirty || isSaving}
                loading={isSaving}
                className="rounded-full"
              >
                <Check className="w-4 h-4 mr-2" />
                {isSaving ? t('common.saving', 'Saving...') : t('common.saveChanges', 'Save Changes')}
              </Button>
            )}
            {onClose && (
              <IconButton variant="standard" size="sm" onClick={onClose} aria-label={t('common.close')}>
                <X className="w-5 h-5" />
              </IconButton>
            )}
          </div>
        </div>

        {/* Tabs for Survey vs Questions */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'survey' | 'questions')}
          variant="pills"
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="shrink-0 px-6 py-3 border-b border-outline-variant/20 bg-surface-container-lowest">
            <TabsList className="h-10">
              <TabsTrigger value="survey" className="relative px-5 gap-2">
                <FileText className="w-4 h-4" />
                {t('localization.surveyDetails', 'Survey Details')}
                {surveyStats.percent < 100 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-warning ring-2 ring-surface" />
                )}
              </TabsTrigger>
              <TabsTrigger value="questions" className="relative px-5 gap-2">
                <MessageSquare className="w-4 h-4" />
                {t('localization.questions', 'Questions')} ({questionsWithSettings.length})
                {questionStats.percent < 100 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-warning ring-2 ring-surface" />
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Survey Details Tab */}
          <TabsContent value="survey" className="flex-1 overflow-y-auto p-6 m-0 bg-surface">
            <div className="max-w-4xl space-y-5">
              {surveyFields.map((field) => (
                <TranslationField
                  key={field.key}
                  label={field.label}
                  sourceValue={field.sourceValue}
                  targetValue={field.targetValue}
                  sourceFlag={sourceLang.flag}
                  targetFlag={targetLang.flag}
                  isMultiline={field.isMultiline}
                  isRequired={field.isRequired}
                  isReadOnly={isReadOnly}
                  onChange={(value) => handleSurveyFieldChange(field.key, value)}
                />
              ))}
            </div>
          </TabsContent>

          {/* Questions Tab - Uses QuestionTranslationsEditor component */}
          <TabsContent value="questions" className="flex-1 overflow-y-auto p-6 m-0 bg-surface">
            <div className="max-w-4xl">
              {questionsWithSettings.length > 0 ? (
                <QuestionTranslationsEditor
                  questions={questionsWithSettings}
                  sourceLanguage={sourceLanguage}
                  targetLanguage={targetLanguage}
                  onChange={handleQuestionChange}
                  isReadOnly={isReadOnly}
                />
              ) : (
                <EmptyState
                  icon={<Globe className="w-6 h-6" />}
                  title={t('localization.noQuestions', 'No questions to translate')}
                  description={t('localization.noQuestionsDesc', 'Add questions to your survey first, then come back to translate them.')}
                  size="default"
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ============================================================================
// Main Languages Tab Component
// ============================================================================

export function LanguagesTab({
  surveyId,
  defaultLanguage,
  availableLanguages,
  questions,
  isReadOnly = false,
  onClose,
  onAddLanguage,
  onDeleteLanguage,
  className,
}: LanguagesTabProps) {
  const { t } = useTranslation();

  // Fetch translations data
  const { data: translationsData, isLoading } = useSurveyTranslations(surveyId);
  const deleteMutation = useDeleteSurveyTranslation();

  // Local state
  const addLanguageDialog = useDialogState();
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [isAddingLanguage, setIsAddingLanguage] = useState(false);

  // Calculate language stats
  const languageStats = useMemo((): LanguageStats[] => {
    if (!translationsData) {
      return availableLanguages.map((code) => ({
        code,
        isDefault: code === defaultLanguage,
        isEnabled: true,
        surveyFieldsTotal: 4,
        surveyFieldsTranslated: code === defaultLanguage ? 4 : 0,
        questionsTotal: questions.length,
        questionsTranslated: code === defaultLanguage ? questions.length : 0,
      }));
    }

    return availableLanguages.map((code) => calculateLanguageStats(code, defaultLanguage, translationsData.translations, translationsData.questions));
  }, [availableLanguages, defaultLanguage, translationsData, questions]);

  // Calculate overall stats for hero header
  const overallStats = useMemo(() => {
    const nonDefaultLanguages = languageStats.filter((l) => !l.isDefault);
    if (nonDefaultLanguages.length === 0) {
      return { totalFields: 0, translatedFields: 0, percent: 100 };
    }

    let totalFields = 0;
    let translatedFields = 0;

    nonDefaultLanguages.forEach((lang) => {
      totalFields += lang.surveyFieldsTotal + lang.questionsTotal;
      translatedFields += lang.surveyFieldsTranslated + lang.questionsTranslated;
    });

    const percent = totalFields > 0 ? Math.round((translatedFields / totalFields) * 100) : 100;
    return { totalFields, translatedFields, percent };
  }, [languageStats]);

  // Handle add language
  const handleAddLanguage = useCallback(
    async (languageCode: string, autoTranslate: boolean) => {
      setIsAddingLanguage(true);
      try {
        await onAddLanguage(languageCode, autoTranslate);
        addLanguageDialog.close();
        setSelectedLanguage(languageCode);
      } catch (error) {
        console.error('Failed to add language:', error);
      } finally {
        setIsAddingLanguage(false);
      }
    },
    [onAddLanguage, addLanguageDialog]
  );

  // Handle delete language
  const handleDeleteLanguage = useCallback(
    async (languageCode: string) => {
      if (languageCode === defaultLanguage) return;

      try {
        await deleteMutation.mutateAsync({ surveyId, languageCode });
        onDeleteLanguage?.(languageCode);

        if (selectedLanguage === languageCode) {
          setSelectedLanguage(null);
        }
      } catch (error) {
        console.error('Failed to delete language:', error);
      }
    },
    [surveyId, defaultLanguage, deleteMutation, onDeleteLanguage, selectedLanguage]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center h-full', className)}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-on-surface-variant">{t('common.loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  // If a language is selected (and not default), show the translation editor
  if (selectedLanguage && selectedLanguage !== defaultLanguage) {
    return (
      <div className={cn('h-full', className)}>
        <TranslationEditorPanel
          surveyId={surveyId}
          sourceLanguage={defaultLanguage}
          targetLanguage={selectedLanguage}
          translations={translationsData?.translations || []}
          questionTranslations={translationsData?.questions || []}
          questions={questions}
          isReadOnly={isReadOnly}
          onBack={() => setSelectedLanguage(null)}
          onClose={onClose}
        />
      </div>
    );
  }

  const defaultLangInfo = getLanguageInfo(defaultLanguage);

  // Main language list view with split panel design (sidebar + content)
  return (
    <div className={cn('h-full flex bg-surface overflow-hidden', className)}>
      {/* Left sidebar - Overview and stats */}
      <div className="hidden lg:flex w-80 shrink-0 flex-col border-r border-outline-variant/20 bg-surface-container-lowest">
        {/* Header with close */}
        <div className="shrink-0 p-5 border-b border-outline-variant/20">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-on-surface">{t('localization.surveyLanguages', 'Survey Languages')}</h2>
            {onClose && (
              <IconButton variant="standard" size="sm" onClick={onClose} aria-label={t('common.close', 'Close')}>
                <X className="w-5 h-5" />
              </IconButton>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary-container/40 border-2 border-secondary/20">
              <Languages className="w-7 h-7 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface">{t('localization.manageLanguages', 'Manage Languages')}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {t('localization.languagesDescription', 'Manage survey languages and translations')}
              </p>
            </div>
          </div>
        </div>

        {/* Stats section */}
        <div className="p-5 border-b border-outline-variant/20">
          <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-4">{t('common.overview', 'Overview')}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-container">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-secondary" />
                <span className="text-sm font-medium text-on-surface">
                  {t('localization.languageCount', { count: languageStats.length, defaultValue: 'Languages' })}
                </span>
              </div>
              <span className="text-lg font-bold text-on-surface">{languageStats.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-container">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-secondary" />
                <span className="text-sm font-medium text-on-surface">{t('localization.questionsLabel', 'Questions')}</span>
              </div>
              <span className="text-lg font-bold text-on-surface">{questions.length}</span>
            </div>
          </div>
        </div>

        {/* Overall progress */}
        {languageStats.length > 1 && (
          <div className="p-5 border-b border-outline-variant/20">
            <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
              {t('localization.translationProgress', 'Translation Progress')}
            </h3>
            <div className="flex items-center gap-4 mb-3">
              <div className="relative w-14 h-14">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="5" className="text-outline-variant/20" />
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeDasharray={`${(overallStats.percent / 100) * 151} 151`}
                    strokeLinecap="round"
                    className={cn(overallStats.percent === 100 ? 'text-success' : 'text-primary')}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-on-surface">{overallStats.percent}%</span>
              </div>
              <div>
                <p className="text-sm font-medium text-on-surface">
                  {overallStats.percent === 100
                    ? t('localization.fullyTranslated', 'Fully translated')
                    : t('localization.overallProgress', { percent: overallStats.percent, defaultValue: `${overallStats.percent}% translated` })}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {overallStats.translatedFields}/{overallStats.totalFields} {t('localization.fieldsLabel', 'fields')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Source language */}
        <div className="p-5 flex-1">
          <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">{t('localization.source', 'Source')}</h3>
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary-container/30 border-2 border-primary/20">
            <span className="text-2xl">{defaultLangInfo.flag}</span>
            <div>
              <p className="text-sm font-medium text-on-surface">{defaultLangInfo.nativeName}</p>
              <p className="text-xs text-on-surface-variant">{t('localization.defaultLanguage', 'Default Language')}</p>
            </div>
          </div>
        </div>

        {/* AI hint */}
        {!isReadOnly && (
          <div className="shrink-0 p-5 border-t border-outline-variant/20">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-tertiary-container/30">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-tertiary-container">
                <Wand2 className="w-4 h-4 text-on-tertiary-container" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-on-surface">{t('localization.autoTranslateHint', 'AI Translation')}</p>
                <p className="text-[10px] text-on-surface-variant">{t('common.comingSoon', 'Coming soon')}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden shrink-0 bg-secondary-container/30 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Languages className="w-6 h-6 text-secondary" />
              <span className="font-semibold text-on-surface">{t('localization.surveyLanguages', 'Survey Languages')}</span>
            </div>
            {onClose && (
              <IconButton variant="standard" size="sm" onClick={onClose} aria-label={t('common.close', 'Close')}>
                <X className="w-5 h-5" />
              </IconButton>
            )}
          </div>
        </div>

        {/* Action bar */}
        <div className="shrink-0 flex items-center justify-between gap-3 px-6 py-3 border-b border-outline-variant/20 bg-surface">
          <div className="text-sm text-on-surface-variant">{t('localization.clickToEdit', 'Click on a language to edit its translations')}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled className="rounded-full">
              <FileDown className="w-4 h-4 mr-1.5" />
              {t('localization.export', 'Export')}
            </Button>
            <Button variant="outline" size="sm" disabled className="rounded-full">
              <FileUp className="w-4 h-4 mr-1.5" />
              {t('localization.import', 'Import')}
            </Button>
            {!isReadOnly && (
              <Button variant="filled" size="sm" onClick={() => addLanguageDialog.open()} className="rounded-full">
                <Plus className="w-4 h-4 mr-1.5" />
                {t('localization.addLanguage', 'Add Language')}
              </Button>
            )}
          </div>
        </div>

        {/* Language list */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl">
            {languageStats.length > 0 ? (
              <LanguageList
                languages={languageStats}
                selectedLanguage={selectedLanguage || undefined}
                isReadOnly={isReadOnly}
                onSelect={setSelectedLanguage}
                onDelete={handleDeleteLanguage}
              />
            ) : (
              <EmptyState
                icon={<Globe className="w-8 h-8" />}
                title={t('localization.noLanguages', 'No languages configured')}
                description={t('localization.noLanguagesDesc', 'Add languages to make your survey available in multiple languages.')}
                iconVariant="primary"
                action={
                  !isReadOnly
                    ? {
                        label: t('localization.addLanguage', 'Add Language'),
                        onClick: () => addLanguageDialog.open(),
                        icon: <Plus className="w-4 h-4" />,
                      }
                    : undefined
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* Add Language Dialog */}
      <AddLanguageDialog
        open={addLanguageDialog.isOpen}
        onOpenChange={addLanguageDialog.setOpen}
        existingLanguages={availableLanguages}
        defaultLanguage={defaultLanguage}
        onAddLanguage={handleAddLanguage}
        isLoading={isAddingLanguage}
      />
    </div>
  );
}
