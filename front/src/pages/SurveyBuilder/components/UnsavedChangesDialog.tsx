import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { Button, Dialog, DialogContent, DialogHeader } from '@/components/ui';

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDiscard: () => void;
  onSave: () => void;
}

export function UnsavedChangesDialog({ isOpen, onOpenChange, onDiscard, onSave }: UnsavedChangesDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent showClose={false}>
        <DialogHeader
          hero
          icon={<AlertTriangle className="h-7 w-7" />}
          title={t('surveyBuilder.unsavedChanges')}
          description={t('surveyBuilder.unsavedChangesDesc')}
          variant="warning"
          showClose
        />
        <div className="p-4">
          <div className="flex justify-end gap-3">
            <Button variant="text" onClick={onDiscard}>
              {t('surveyBuilder.discardChanges')}
            </Button>
            <Button variant="tonal" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="filled" onClick={onSave}>
              {t('common.save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
