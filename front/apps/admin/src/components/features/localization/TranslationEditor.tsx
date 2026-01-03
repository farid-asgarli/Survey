// Translation Editor - Side-by-side translation interface
// Shows source language (read-only) on the left and target language (editable) on the right

import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Check, Loader2, Sparkles } from 'lucide-react';
import { Button, Input, Textarea } from '@/components/ui';
import { cn } from '@/lib/utils';
import { LANGUAGE_INFO } from './SurveyLanguageSwitcher';
import type { SurveyTranslationDto, QuestionTranslationsDto } from '@/types';

export interface TranslationField {
  key: string;
  label: string;
  sourceValue: string;
  targetValue: string;
  isMultiline?: boolean;
  isRequired?: boolean;
}

interface TranslationEditorProps {
  /** Survey ID for context */
  surveyId: string;
  /** Source language code (default language) */
  sourceLanguage: string;
  /** Target language code (language being translated to) */
  targetLanguage: string;
  /** Source translation data */
  sourceTranslation: SurveyTranslationDto;
  /** Target translation data (may have empty fields) */
  targetTranslation: SurveyTranslationDto;
  /** Question translations for both languages */
  questions?: QuestionTranslationsDto[];
  /** Callback when translation changes */
  onTranslationChange: (updates: Partial<SurveyTranslationDto>) => void;
  /** Callback when save is triggered */
  onSave: () => void;
  /** Whether save is in progress */
  isSaving?: boolean;
  /** Whether the editor is read-only */
  isReadOnly?: boolean;
}

/**
 * Get display info for a language code
 */
function getLanguageInfo(code: string) {
  return LANGUAGE_INFO[code] || { name: code.toUpperCase(), nativeName: code.toUpperCase(), flag: '🌐' };
}

/**
 * Check if a field needs translation (source has value but target doesn't)
 */
function needsTranslation(sourceValue: string | undefined, targetValue: string | undefined): boolean {
  return !!sourceValue && !targetValue;
}

/**
 * Single translation field row with source and target
 */
function TranslationFieldRow({
  field,
  sourceLanguage,
  targetLanguage,
  onChange,
  isReadOnly,
}: {
  field: TranslationField;
  sourceLanguage: string;
  targetLanguage: string;
  onChange: (value: string) => void;
  isReadOnly?: boolean;
}) {
  const { t } = useTranslation();
  const sourceLang = getLanguageInfo(sourceLanguage);
  const targetLang = getLanguageInfo(targetLanguage);
  const needsWork = needsTranslation(field.sourceValue, field.targetValue);

  const InputComponent = field.isMultiline ? Textarea : Input;

  return (
    <div className="grid grid-cols-2 gap-4 py-4 border-b border-outline-variant/20 last:border-b-0">
      {/* Source (read-only) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-on-surface-variant">{field.label}</span>
          <span className="text-xs text-on-surface-variant/60">
            {sourceLang.flag} {sourceLang.nativeName}
          </span>
        </div>
        <div
          className={cn(
            'px-3 py-2 rounded-lg bg-surface-container-highest/50 text-on-surface',
            'border border-outline-variant/30',
            field.isMultiline && 'min-h-20'
          )}
        >
          {field.sourceValue || <span className="text-on-surface-variant/50 italic">{t('localization.noContent', 'No content')}</span>}
        </div>
      </div>

      {/* Target (editable) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-on-surface-variant">{field.label}</span>
          <span className="text-xs text-on-surface-variant/60">
            {targetLang.flag} {targetLang.nativeName}
          </span>
          {needsWork && (
            <span className="flex items-center gap-1 text-xs text-warning">
              <AlertTriangle className="w-3 h-3" />
              {t('localization.needsTranslation', 'Needs translation')}
            </span>
          )}
        </div>
        <InputComponent
          value={field.targetValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('localization.enterTranslation', 'Enter translation...')}
          disabled={isReadOnly}
          className={cn(needsWork && 'border-warning/50 focus:border-warning', field.isMultiline && 'min-h-20 resize-y')}
        />
      </div>
    </div>
  );
}

export function TranslationEditor({
  sourceLanguage,
  targetLanguage,
  sourceTranslation,
  targetTranslation,
  onTranslationChange,
  onSave,
  isSaving = false,
  isReadOnly = false,
}: Omit<TranslationEditorProps, 'surveyId' | 'questions'>) {
  const { t } = useTranslation();

  // Use key to reset state when target language changes
  // This creates a fresh component state when the language switches
  const [edits, setEdits] = useState<Partial<SurveyTranslationDto>>({});

  // Merge original data with edits
  const localTranslation = useMemo(
    () => ({
      title: edits.title ?? targetTranslation.title,
      description: edits.description ?? targetTranslation.description,
      welcomeMessage: edits.welcomeMessage ?? targetTranslation.welcomeMessage,
      thankYouMessage: edits.thankYouMessage ?? targetTranslation.thankYouMessage,
    }),
    [targetTranslation, edits]
  );

  // Track if there are unsaved changes
  const isDirty = Object.keys(edits).length > 0;

  const handleFieldChange = useCallback(
    (key: string, value: string) => {
      setEdits((prev) => ({ ...prev, [key]: value }));
      onTranslationChange({ [key]: value });
    },
    [onTranslationChange]
  );

  const handleSave = useCallback(() => {
    onSave();
    setEdits({}); // Clear edits after save
  }, [onSave]);

  // Build fields list
  const fields: TranslationField[] = useMemo(
    () => [
      {
        key: 'title',
        label: t('localization.fields.title', 'Survey Title'),
        sourceValue: sourceTranslation.title,
        targetValue: localTranslation.title || '',
        isRequired: true,
      },
      {
        key: 'description',
        label: t('localization.fields.description', 'Description'),
        sourceValue: sourceTranslation.description || '',
        targetValue: localTranslation.description || '',
        isMultiline: true,
      },
      {
        key: 'welcomeMessage',
        label: t('localization.fields.welcomeMessage', 'Welcome Message'),
        sourceValue: sourceTranslation.welcomeMessage || '',
        targetValue: localTranslation.welcomeMessage || '',
        isMultiline: true,
      },
      {
        key: 'thankYouMessage',
        label: t('localization.fields.thankYouMessage', 'Thank You Message'),
        sourceValue: sourceTranslation.thankYouMessage || '',
        targetValue: localTranslation.thankYouMessage || '',
        isMultiline: true,
      },
    ],
    [sourceTranslation, localTranslation, t]
  );

  // Calculate completion stats
  const stats = useMemo(() => {
    const total = fields.filter((f) => f.sourceValue).length;
    const translated = fields.filter((f) => f.sourceValue && f.targetValue).length;
    const percent = total > 0 ? Math.round((translated / total) * 100) : 100;
    return { total, translated, percent };
  }, [fields]);

  const sourceLang = getLanguageInfo(sourceLanguage);
  const targetLang = getLanguageInfo(targetLanguage);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface-container-lowest">
        <div>
          <h2 className="text-lg font-semibold text-on-surface">
            {t('localization.translateTo', 'Translate to {{language}}', { language: targetLang.nativeName })}
          </h2>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {t('localization.sourceLanguage', 'Source: {{language}}', { language: sourceLang.nativeName })}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Completion indicator */}
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-outline-variant/30 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  stats.percent === 100 ? 'bg-success' : stats.percent >= 50 ? 'bg-warning' : 'bg-error'
                )}
                style={{ width: `${stats.percent}%` }}
              />
            </div>
            <span className="text-sm text-on-surface-variant">
              {stats.translated}/{stats.total}
            </span>
          </div>

          {/* Save button */}
          {!isReadOnly && (
            <Button variant="filled" size="sm" onClick={handleSave} disabled={!isDirty} loading={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  {t('common.saving', 'Saving...')}
                </>
              ) : isDirty ? (
                <>
                  <Check className="w-4 h-4 mr-1.5" />
                  {t('common.saveChanges', 'Save Changes')}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1.5" />
                  {t('common.saved', 'Saved')}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Translation Fields */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Survey metadata fields */}
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-on-surface-variant uppercase tracking-wide mb-4">
            {t('localization.surveyDetails', 'Survey Details')}
          </h3>

          {fields.map((field) => (
            <TranslationFieldRow
              key={field.key}
              field={field}
              sourceLanguage={sourceLanguage}
              targetLanguage={targetLanguage}
              onChange={(value) => handleFieldChange(field.key, value)}
              isReadOnly={isReadOnly}
            />
          ))}
        </div>

        {/* TODO: Question translations section - Phase 2 */}
        {/* Questions require more complex handling with options */}
      </div>

      {/* Footer with auto-translate hint */}
      {!isReadOnly && (
        <div className="px-6 py-3 border-t border-outline-variant/30 bg-surface-container-lowest/50">
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>{t('localization.autoTranslateHint', 'Auto-translate feature coming soon!')}</span>
          </div>
        </div>
      )}
    </div>
  );
}
