import { useTranslation } from 'react-i18next';
import { Settings2 } from 'lucide-react';
import { Button, Textarea, Dialog, DialogContent, DialogHeader } from '@/components/ui';

interface SurveySettingsDialogProps {
  isOpen: boolean;
  description: string;
  thankYouMessage: string;
  welcomeMessage: string;
  onOpenChange: (open: boolean) => void;
  onDescriptionChange: (value: string) => void;
  onThankYouMessageChange: (value: string) => void;
  onWelcomeMessageChange: (value: string) => void;
}

export function SurveySettingsDialog({
  isOpen,
  description,
  thankYouMessage,
  welcomeMessage,
  onOpenChange,
  onDescriptionChange,
  onThankYouMessageChange,
  onWelcomeMessageChange,
}: SurveySettingsDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent showClose={false}>
        <DialogHeader
          hero
          icon={<Settings2 className="h-7 w-7" />}
          title={t('surveyBuilder.settings')}
          description={t('surveyBuilder.settings')}
          showClose
        />
        <div className="space-y-6 p-4">
          {/* Survey Description */}
          <Textarea
            label={t('common.description')}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder={t('surveys.form.descriptionPlaceholder')}
            rows={3}
          />

          {/* Thank You Message */}
          <Textarea
            label={t('surveyBuilder.thankYouMessage')}
            value={thankYouMessage}
            onChange={(e) => onThankYouMessageChange(e.target.value)}
            placeholder={t('surveyBuilder.thankYouMessage')}
            helperText={t('surveyBuilder.thankYouMessageDesc')}
            rows={2}
          />

          {/* Welcome Message */}
          <Textarea
            label={t('surveyBuilder.welcomeMessage')}
            value={welcomeMessage}
            onChange={(e) => onWelcomeMessageChange(e.target.value)}
            placeholder={t('surveyBuilder.welcomeMessage')}
            helperText={t('surveyBuilder.welcomeMessageDesc')}
            rows={2}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
            <Button variant="text" onClick={() => onOpenChange(false)}>
              {t('common.close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
