import { useTranslation } from 'react-i18next';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button, Dialog, DialogContent, DialogHeader } from '@/components/ui';

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  isSaving?: boolean;
  onOpenChange: (open: boolean) => void;
  onDiscard: () => void;
  onSave: () => void;
}

export function UnsavedChangesDialog({ isOpen, isSaving = false, onOpenChange, onDiscard, onSave }: UnsavedChangesDialogProps) {
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
            <Button variant="text" onClick={onDiscard} disabled={isSaving}>
              {t('surveyBuilder.discardChanges')}
            </Button>
            {/* <Button variant="tonal" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button> */}
            <Button variant="filled" onClick={onSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t('surveyBuilder.saving')}
                </>
              ) : (
                t('common.save')
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
