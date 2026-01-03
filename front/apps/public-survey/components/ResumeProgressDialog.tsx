/**
 * Resume Progress Dialog - Prompts user to resume saved progress or start fresh
 * Matches admin preview styling with M3 Expressive design
 */

'use client';

import { Dialog, DialogContent, Button } from '@survey/ui-primitives';
import { History, RefreshCw } from 'lucide-react';
import type { TranslationKey } from '@/lib/i18n';

interface ResumeProgressDialogProps {
  open: boolean;
  onResume: () => void;
  onStartFresh: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export function ResumeProgressDialog({ open, onResume, onStartFresh, t }: ResumeProgressDialogProps) {
  // We don't allow dismissing via backdrop click - user must choose an action
  const handleOpenChange = () => {
    // No-op - force user to choose resume or start fresh
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showClose={false} size="sm">
        <div className="p-6 sm:p-8 max-w-md mx-auto">
          {/* Icon */}
          <div className="flex justify-center mb-5 sm:mb-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-primary-container/60 border-2 border-primary/20 flex items-center justify-center">
              <History className="w-7 h-7 sm:w-8 sm:h-8 text-on-primary-container" aria-hidden="true" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-lg sm:text-xl font-bold text-on-surface text-center mb-2 sm:mb-3 font-heading">{t('resume.title')}</h2>

          {/* Description */}
          <p className="text-sm sm:text-base text-on-surface-variant text-center mb-6 sm:mb-8">{t('resume.description')}</p>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button variant="filled" size="lg" onClick={onResume} className="w-full gap-2">
              <History className="w-5 h-5" aria-hidden="true" />
              {t('resume.continue')}
            </Button>
            <Button variant="outline" size="lg" onClick={onStartFresh} className="w-full gap-2">
              <RefreshCw className="w-5 h-5" aria-hidden="true" />
              {t('resume.startFresh')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
