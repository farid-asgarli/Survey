// Translation Editor Dialog - Modal wrapper for the translation editor
// Opens from language switcher to edit translations for a specific language

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, EmptyState } from '@/components/ui';
import { TranslationEditor } from './TranslationEditor';
import { getLanguageInfo } from '@/config/languages';
import { useSurveyTranslations, useUpdateSurveyTranslation } from '@/hooks';
import type { SurveyTranslationDto } from '@/types';

interface TranslationEditorDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog should close */
  onOpenChange: (open: boolean) => void;
  /** Survey ID */
  surveyId: string;
  /** Default language of the survey (source) */
  defaultLanguage: string;
  /** Language being edited (target) */
  targetLanguage: string;
  /** Whether the survey is read-only */
  isReadOnly?: boolean;
}

export function TranslationEditorDialog({
  open,
  onOpenChange,
  surveyId,
  defaultLanguage,
  targetLanguage,
  isReadOnly = false,
}: TranslationEditorDialogProps) {
  const { t } = useTranslation();

  // Fetch all translations for the survey
  const { data: translationsData, isLoading, error } = useSurveyTranslations(open ? surveyId : undefined);

  // Update mutation
  const updateMutation = useUpdateSurveyTranslation();

  // Find source and target translations
  const { sourceTranslation, targetTranslation } = useMemo(() => {
    if (!translationsData) {
      return { sourceTranslation: null, targetTranslation: null };
    }

    const source = translationsData.translations.find((t) => t.languageCode === defaultLanguage);
    const target = translationsData.translations.find((t) => t.languageCode === targetLanguage);

    return { sourceTranslation: source, targetTranslation: target };
  }, [translationsData, defaultLanguage, targetLanguage]);

  // Local state for pending changes
  const pendingChanges = useMemo<Partial<SurveyTranslationDto>>(() => ({}), []);

  const handleTranslationChange = (updates: Partial<SurveyTranslationDto>) => {
    Object.assign(pendingChanges, updates);
  };

  const handleSave = async () => {
    if (!targetTranslation) return;

    await updateMutation.mutateAsync({
      surveyId,
      languageCode: targetLanguage,
      data: {
        ...targetTranslation,
        ...pendingChanges,
      },
    });
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const targetLang = getLanguageInfo(targetLanguage);

  // Don't render if editing the default language (no translation needed)
  if (targetLanguage === defaultLanguage) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="xl" onClose={handleClose} showClose={true}>
        <DialogHeader
          hero
          icon={<Globe className="w-6 h-6" />}
          title={t('localization.editTranslation', 'Edit {{language}} Translation', {
            language: targetLang.nativeName,
          })}
          description={t('localization.editTranslationDesc', 'Translate survey content from the default language')}
          variant="primary"
        />

        <div className="h-[60vh] overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-on-surface-variant">{t('localization.loadingTranslations', 'Loading translations...')}</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full p-6">
              <EmptyState
                icon={<Globe className="w-6 h-6" />}
                title={t('localization.errorLoading', 'Failed to load translations')}
                description={t('localization.errorLoadingDesc', 'Please try again later')}
                iconVariant="secondary"
              />
            </div>
          ) : !sourceTranslation || !targetTranslation ? (
            <div className="flex items-center justify-center h-full p-6">
              <EmptyState
                icon={<Globe className="w-6 h-6" />}
                title={t('localization.noTranslation', 'Translation not found')}
                description={t('localization.noTranslationDesc', 'This language translation does not exist yet')}
              />
            </div>
          ) : (
            <TranslationEditor
              key={targetLanguage} // Reset component state when language changes
              sourceLanguage={defaultLanguage}
              targetLanguage={targetLanguage}
              sourceTranslation={sourceTranslation}
              targetTranslation={targetTranslation}
              onTranslationChange={handleTranslationChange}
              onSave={handleSave}
              isSaving={updateMutation.isPending}
              isReadOnly={isReadOnly}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
