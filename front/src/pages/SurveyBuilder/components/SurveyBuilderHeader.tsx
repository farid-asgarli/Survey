// Survey Builder Header - M3 Expressive Design
// Follows Material Design 3 Expressive principles:
// - No shadows (uses color elevation)
// - Dynamic shapes (rounded-full for buttons)
// - Semantic color tokens
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, Eye, Undo2, Redo2, Settings, Check, Loader2, Palette, Lock } from 'lucide-react';
import { Button, Tooltip, IconButton } from '@/components/ui';
import { SurveyStatusBadge } from '@/components/features/surveys';
import { SurveyLanguageSwitcher, type LanguageStatus } from '@/components/features/localization';
import { SurveyStatus } from '@/types';

interface SurveyBuilderHeaderProps {
  surveyTitle: string;
  surveyStatus?: SurveyStatus;
  questionsCount: number;
  isDirty: boolean;
  isSaving: boolean;
  isReadOnly: boolean;
  canUndo: boolean;
  canRedo: boolean;
  showThemePanel: boolean;
  // Localization props
  editingLanguage: string;
  defaultLanguage: string;
  availableLanguages: string[];
  onBack: () => void;
  onTitleChange: (title: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onToggleThemePanel: () => void;
  onOpenSettings: () => void;
  onPreview: () => void;
  onLanguageChange: (languageCode: string) => void;
  onAddLanguage: () => void;
  onEditTranslation?: () => void;
}

export function SurveyBuilderHeader({
  surveyTitle,
  surveyStatus,
  questionsCount,
  isDirty,
  isSaving,
  isReadOnly,
  canUndo,
  canRedo,
  showThemePanel,
  editingLanguage,
  defaultLanguage,
  availableLanguages,
  onBack,
  onTitleChange,
  onUndo,
  onRedo,
  onSave,
  onToggleThemePanel,
  onOpenSettings,
  onPreview,
  onLanguageChange,
  onAddLanguage,
  onEditTranslation,
}: SurveyBuilderHeaderProps) {
  const { t } = useTranslation();

  // Convert available languages to LanguageStatus format
  const languageStatuses: LanguageStatus[] = availableLanguages.map((code) => ({
    code,
    isDefault: code === defaultLanguage,
    // TODO: Calculate actual completion percentage from translations
    completionPercent: code === defaultLanguage ? 100 : undefined,
  }));

  return (
    <div className="shrink-0 flex flex-col">
      {/* Read-only Banner */}
      {isReadOnly && (
        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-warning-container text-on-warning-container text-sm">
          <Lock className="w-4 h-4" />
          <span>{t('surveyBuilder.readOnlyBanner', 'This survey is published and cannot be edited. You are viewing it in read-only mode.')}</span>
        </div>
      )}

      <header className="h-14 flex items-center justify-between px-4 bg-surface border-b border-outline-variant/30">
        {/* Left section - Back & Title */}
        <div className="flex items-center gap-3">
          <Tooltip content={t('surveyBuilder.backToSurveys')}>
            <Button variant="text" size="sm" onClick={onBack} className="rounded-lg">
              <ArrowLeft className="w-4 h-4 mr-1" />
              {t('common.back', 'Back')}
            </Button>
          </Tooltip>

          <div className="h-6 w-px bg-outline-variant/30" />

          <div className="flex flex-col">
            {isReadOnly ? (
              <span className="text-base font-semibold text-on-surface">{surveyTitle || t('surveyBuilder.untitledSurvey')}</span>
            ) : (
              <input
                type="text"
                value={surveyTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                className="text-base font-semibold text-on-surface bg-transparent border-none outline-none focus:ring-0 px-0 py-0"
                placeholder={t('surveyBuilder.untitledSurvey')}
              />
            )}
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span>
                {questionsCount} {t('surveys.questions')}
              </span>
              {surveyStatus !== undefined && surveyStatus !== SurveyStatus.Draft && (
                <>
                  <span className="text-on-surface-variant/30">•</span>
                  <SurveyStatusBadge status={surveyStatus} size="sm" />
                </>
              )}
              {!isReadOnly && isDirty && (
                <>
                  <span className="text-on-surface-variant/30">•</span>
                  <span className="text-warning">{t('surveyBuilder.unsaved')}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center - Undo/Redo Pills (only in edit mode) */}
        {!isReadOnly && (
          <div className="flex items-center gap-1 p-1.5 bg-surface-container rounded-full">
            <Tooltip content={`${t('surveyBuilder.undo')} (Ctrl+Z)`}>
              <IconButton variant="standard" size="sm" onClick={onUndo} disabled={!canUndo} aria-label={t('surveyBuilder.undo')}>
                <Undo2 className="w-4 h-4" />
              </IconButton>
            </Tooltip>
            <Tooltip content={`${t('surveyBuilder.redo')} (Ctrl+Y)`}>
              <IconButton variant="standard" size="sm" onClick={onRedo} disabled={!canRedo} aria-label={t('surveyBuilder.redo')}>
                <Redo2 className="w-4 h-4" />
              </IconButton>
            </Tooltip>
          </div>
        )}

        {/* Center - Read-only indicator (only in read-only mode) */}
        {isReadOnly && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container border-2 border-outline-variant/30">
            <Eye className="w-4 h-4 text-on-surface-variant" />
            <span className="text-sm font-semibold text-on-surface-variant">{t('surveyBuilder.viewOnly', 'View Only')}</span>
          </div>
        )}

        {/* Right section - Actions */}
        <div className="flex items-center gap-2">
          {/* Save Status Indicator - only in edit mode */}
          {!isReadOnly && (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container border-2 border-outline-variant/20">
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    <span className="text-xs font-medium text-on-surface-variant">{t('surveyBuilder.saving')}</span>
                  </>
                ) : isDirty ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-warning" />
                    <span className="text-xs font-medium text-warning">{t('surveyBuilder.unsaved')}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 text-success" />
                    <span className="text-xs font-medium text-on-surface-variant">{t('surveyBuilder.saved')}</span>
                  </>
                )}
              </div>

              <div className="h-5 w-px bg-outline-variant/30" />
            </>
          )}

          {/* Language Switcher */}
          <SurveyLanguageSwitcher
            currentLanguage={editingLanguage}
            availableLanguages={languageStatuses}
            onLanguageSelect={onLanguageChange}
            onAddLanguage={onAddLanguage}
            onManageLanguages={editingLanguage !== defaultLanguage ? onEditTranslation : undefined}
            isReadOnly={isReadOnly}
          />

          <div className="h-5 w-px bg-outline-variant/30" />

          {/* Theme Panel Toggle */}
          <Tooltip content={t('surveyBuilder.toggleThemePanel')}>
            <IconButton
              variant={showThemePanel ? 'filled' : 'standard'}
              size="default"
              onClick={onToggleThemePanel}
              aria-label={t('surveyBuilder.toggleThemePanel')}
              aria-pressed={showThemePanel}
            >
              <Palette className="w-5 h-5" />
            </IconButton>
          </Tooltip>

          {/* Settings - only in edit mode */}
          {!isReadOnly && (
            <Tooltip content={t('surveyBuilder.settingsAriaLabel')}>
              <IconButton variant="standard" size="default" onClick={onOpenSettings} aria-label={t('surveyBuilder.settingsAriaLabel')}>
                <Settings className="w-5 h-5" />
              </IconButton>
            </Tooltip>
          )}

          <div className="h-5 w-px bg-outline-variant/30" />

          {/* Preview Button */}
          <Button variant="outline" size="sm" onClick={onPreview}>
            <Eye className="w-4 h-4" />
            {t('surveyBuilder.preview')}
          </Button>

          {/* Save Button - only in edit mode */}
          {!isReadOnly && (
            <Button variant="filled" size="sm" onClick={onSave} loading={isSaving}>
              <Save className="w-4 h-4" />
              {t('common.save')}
            </Button>
          )}
        </div>
      </header>
    </div>
  );
}
