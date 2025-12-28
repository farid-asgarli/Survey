// Survey Builder Header - Clean Email Editor-inspired design
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, Eye, Undo2, Redo2, Settings, Check, Loader2, Palette, Lock } from 'lucide-react';
import { Button, Tooltip } from '@/components/ui';
import { SurveyStatusBadge } from '@/components/features/surveys';
import { cn } from '@/lib/utils';
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
  onBack: () => void;
  onTitleChange: (title: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onToggleThemePanel: () => void;
  onOpenSettings: () => void;
  onPreview: () => void;
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
  onBack,
  onTitleChange,
  onUndo,
  onRedo,
  onSave,
  onToggleThemePanel,
  onOpenSettings,
  onPreview,
}: SurveyBuilderHeaderProps) {
  const { t } = useTranslation();

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
          <div className="flex items-center gap-1 p-1 bg-surface-container rounded-lg">
            <Tooltip content={`${t('surveyBuilder.undo')} (Ctrl+Z)`}>
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  canUndo
                    ? 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                    : 'text-on-surface-variant/30 cursor-not-allowed'
                )}
              >
                <Undo2 className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content={`${t('surveyBuilder.redo')} (Ctrl+Y)`}>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  canRedo
                    ? 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                    : 'text-on-surface-variant/30 cursor-not-allowed'
                )}
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        )}

        {/* Center - Read-only indicator (only in read-only mode) */}
        {isReadOnly && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container">
            <Eye className="w-4 h-4 text-on-surface-variant" />
            <span className="text-sm font-medium text-on-surface-variant">{t('surveyBuilder.viewOnly', 'View Only')}</span>
          </div>
        )}

        {/* Right section - Actions */}
        <div className="flex items-center gap-2">
          {/* Save Status Indicator - only in edit mode */}
          {!isReadOnly && (
            <>
              <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-surface-container/50">
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    <span className="text-xs text-on-surface-variant">{t('surveyBuilder.saving')}</span>
                  </>
                ) : isDirty ? (
                  <span className="text-xs text-on-surface-variant">{t('surveyBuilder.unsaved')}</span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 text-success" />
                    <span className="text-xs text-on-surface-variant">{t('surveyBuilder.saved')}</span>
                  </>
                )}
              </div>

              <div className="h-5 w-px bg-outline-variant/30" />
            </>
          )}

          {/* Theme Panel Toggle */}
          <Tooltip content={t('surveyBuilder.toggleThemePanel')}>
            <button
              onClick={onToggleThemePanel}
              className={cn(
                'p-2 rounded-lg transition-colors',
                showThemePanel ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'
              )}
            >
              <Palette className="w-4 h-4" />
            </button>
          </Tooltip>

          {/* Settings - only in edit mode */}
          {!isReadOnly && (
            <Tooltip content={t('surveyBuilder.settingsAriaLabel')}>
              <button onClick={onOpenSettings} className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </Tooltip>
          )}

          <div className="h-5 w-px bg-outline-variant/30" />

          {/* Preview Button */}
          <Button variant="outline" size="sm" onClick={onPreview} className="rounded-lg">
            <Eye className="w-4 h-4 mr-1.5" />
            {t('surveyBuilder.preview')}
          </Button>

          {/* Save Button - only in edit mode */}
          {!isReadOnly && (
            <Button variant="filled" size="sm" onClick={onSave} loading={isSaving} className="rounded-lg">
              <Save className="w-4 h-4 mr-1.5" />
              {t('common.save')}
            </Button>
          )}
        </div>
      </header>
    </div>
  );
}
