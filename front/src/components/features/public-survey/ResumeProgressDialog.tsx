// Resume Progress Dialog - Prompts user to resume saved progress or start fresh

import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, Button } from '@/components/ui';
import { History, RefreshCw } from 'lucide-react';

interface ResumeProgressDialogProps {
  open: boolean;
  onResume: () => void;
  onStartFresh: () => void;
}

export function ResumeProgressDialog({ open, onResume, onStartFresh }: ResumeProgressDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent showClose={false}>
        <div className="p-6 max-w-md mx-auto">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-3xl bg-primary-container/60 flex items-center justify-center">
              <History className="w-8 h-8 text-on-primary-container" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-on-surface text-center mb-3">{t('publicSurvey.resumeTitle')}</h2>

          {/* Description */}
          <p className="text-on-surface-variant text-center mb-8">{t('publicSurvey.resumeDescription')}</p>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button size="lg" onClick={onResume} className="w-full gap-2">
              <History className="w-5 h-5" />
              {t('publicSurvey.continueSurvey')}
            </Button>
            <Button variant="outline" size="lg" onClick={onStartFresh} className="w-full gap-2">
              <RefreshCw className="w-5 h-5" />
              {t('publicSurvey.startFresh')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
