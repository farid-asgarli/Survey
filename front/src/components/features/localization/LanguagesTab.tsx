// Languages Tab - Main container for survey localization management
//
// This component orchestrates the language management experience by composing
// existing components:
// - LanguageList: Shows all languages with progress and actions
// - QuestionTranslationsEditor: Side-by-side question translation
// - AddLanguageDialog: Modal for adding new languages
//
// Architecture:
// - Language list view (default) → click language → Translation editor view
// - Translation editor has tabs: Survey Details | Questions
// - Back button returns to language list

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Plus, FileDown, FileUp, Loader2, ArrowLeft, Check, Sparkles, AlertTriangle } from 'lucide-react';
import { Button, Tabs, TabsList, TabsTrigger, TabsContent, EmptyState, Input, Textarea } from '@/components/ui';
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
// Translation Field Component - Reusable side-by-side field editor
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

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Source */}
      <div className="space-y-2.5">
        <label className="flex items-center gap-2 text-sm font-semibold text-on-surface">
          {sourceFlag} {label}
          {isRequired && <span className="text-error">*</span>}
        </label>
        <div
          className={cn(
            'px-4 py-3 rounded-2xl bg-surface-container-high/60 text-on-surface border border-outline-variant/20 text-sm',
            isMultiline && 'min-h-24'
          )}
        >
          {sourceValue || <span className="text-on-surface-variant/50 italic">{t('localization.noContent', 'No content')}</span>}
        </div>
      </div>

      {/* Target */}
      <div className="space-y-2.5">
        <label className="flex items-center gap-2 text-sm font-semibold text-on-surface">
          {targetFlag} {label}
          {isRequired && <span className="text-error">*</span>}
          {needsWork && (
            <span className="inline-flex items-center gap-1 h-5 px-2 text-[10px] font-semibold text-warning bg-warning-container/50 rounded-full">
              <AlertTriangle className="w-3 h-3" />
              {t('common.required', 'Required')}
            </span>
          )}
        </label>
        {isMultiline ? (
          <Textarea
            value={targetValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t('localization.enterTranslation', 'Enter translation...')}
            disabled={isReadOnly}
            className={cn('min-h-24 resize-y', needsWork && 'border-warning/50 focus:border-warning')}
          />
        ) : (
          <Input
            value={targetValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t('localization.enterTranslation', 'Enter translation...')}
            disabled={isReadOnly}
            className={cn(needsWork && 'border-warning/50 focus:border-warning')}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Progress Card Component
// ============================================================================

interface ProgressCardProps {
  label: string;
  translated: number;
  total: number;
  percent: number;
}

function ProgressCard({ label, translated, total, percent }: ProgressCardProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container border border-outline-variant/20">
      <span className="text-sm font-medium text-on-surface">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm text-on-surface-variant">
          {translated}/{total}
        </span>
        <div className="w-32 h-2 bg-outline-variant/20 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500 ease-out',
              percent === 100 ? 'bg-success' : percent >= 50 ? 'bg-warning' : 'bg-error'
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span
          className={cn(
            'text-sm font-semibold min-w-10 text-right',
            percent === 100 ? 'text-success' : percent >= 50 ? 'text-warning' : 'text-error'
          )}
        >
          {percent}%
        </span>
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
        // Build translatedSettings if any settings fields are present
        const hasTranslatedSettings = update.minLabel || update.maxLabel || update.options || update.matrixRows || update.matrixColumns;

        return {
          questionId,
          languageCode: targetLanguage,
          text: update.text || '',
          description: update.description,
          translatedSettings: hasTranslatedSettings
            ? {
                minLabel: update.minLabel,
                maxLabel: update.maxLabel,
                options: update.options,
                matrixRows: update.matrixRows,
                matrixColumns: update.matrixColumns,
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
  }, [isDirty, surveyId, targetLanguage, localTranslation, questionEdits, bulkUpdateMutation]);

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
        sourceOptions: question?.settings?.options,
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface-container-lowest">
        <div className="flex items-center gap-4">
          <Button variant="text" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-lg font-bold text-on-surface">
              {targetLang.flag} {targetLang.nativeName}
            </h2>
            <p className="text-xs text-on-surface-variant">{t('localization.editingTranslation', 'Editing translation')}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {showSaved && (
            <span className="inline-flex items-center gap-2 h-9 px-4 text-sm font-semibold text-success bg-success-container/50 rounded-full animate-in fade-in">
              <Check className="w-4 h-4" />
              {t('common.saved', 'Saved')}
            </span>
          )}

          {!isReadOnly && (
            <Button variant="filled" size="default" onClick={handleSave} disabled={!isDirty || isSaving} loading={isSaving} className="rounded-full">
              <Check className="w-4 h-4 mr-2" />
              {isSaving ? t('common.saving', 'Saving...') : t('common.saveChanges', 'Save Changes')}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs for Survey vs Questions - Using existing Tabs component */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'survey' | 'questions')}
        variant="pills"
        className="flex-1 flex flex-col overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-outline-variant/20 bg-surface">
          <TabsList className="h-11">
            <TabsTrigger value="survey" className="relative px-5">
              {t('localization.surveyDetails', 'Survey Details')}
              {surveyStats.percent < 100 && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-warning ring-2 ring-surface" />}
            </TabsTrigger>
            <TabsTrigger value="questions" className="relative px-5">
              {t('localization.questions', 'Questions')} ({questionsWithSettings.length})
              {questionStats.percent < 100 && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-warning ring-2 ring-surface" />
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Survey Details Tab */}
        <TabsContent value="survey" className="flex-1 overflow-y-auto p-6 m-0 bg-surface">
          <div className="max-w-4xl mx-auto space-y-6">
            <ProgressCard
              label={t('localization.surveyFieldsProgress', 'Survey fields progress')}
              translated={surveyStats.translated}
              total={surveyStats.total}
              percent={surveyStats.percent}
            />

            <div className="space-y-6">
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
          </div>
        </TabsContent>

        {/* Questions Tab - Uses QuestionTranslationsEditor component */}
        <TabsContent value="questions" className="flex-1 overflow-y-auto p-6 m-0 bg-surface">
          <div className="max-w-4xl mx-auto">
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

      {/* Footer */}
      {!isReadOnly && (
        <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-primary-container/20 border border-primary/10">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-container">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-on-surface">{t('localization.autoTranslateHint', 'Auto-translate feature coming soon!')}</span>
          </div>
        </div>
      )}
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
        />
      </div>
    );
  }

  // Main language list view
  return (
    <div className={cn('h-full flex flex-col bg-surface', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/20 bg-surface-container-lowest">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-container/40 border border-primary/10">
            <Globe className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-on-surface">{t('localization.surveyLanguages', 'Languages')}</h2>
            <p className="text-sm text-on-surface-variant mt-0.5">{t('localization.languagesDescription', 'Manage translations for your survey')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Import/Export - planned */}
          <Button variant="outline" size="default" disabled className="rounded-full">
            <FileDown className="w-4 h-4 mr-2" />
            {t('localization.export', 'Export')}
          </Button>
          <Button variant="outline" size="default" disabled className="rounded-full">
            <FileUp className="w-4 h-4 mr-2" />
            {t('localization.import', 'Import')}
          </Button>

          {!isReadOnly && (
            <Button variant="filled" size="default" onClick={() => addLanguageDialog.open()} className="rounded-full">
              <Plus className="w-4 h-4 mr-2" />
              {t('localization.addLanguage', 'Add Language')}
            </Button>
          )}
        </div>
      </div>

      {/* Language list */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
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

      {/* Overall stats footer */}
      {languageStats.length > 1 && (
        <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <span className="inline-flex items-center gap-2 h-8 px-4 text-sm font-medium bg-surface-container-high rounded-full">
              <Globe className="w-4 h-4 text-on-surface-variant" />
              {t('localization.totalLanguages', '{{count}} languages configured', { count: languageStats.length })}
            </span>
            <span className="inline-flex items-center gap-2 h-8 px-4 text-sm font-medium text-on-surface-variant bg-surface-container-high rounded-full">
              {t('localization.questionsCount', '{{count}} questions', { count: questions.length })}
            </span>
          </div>
        </div>
      )}

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
