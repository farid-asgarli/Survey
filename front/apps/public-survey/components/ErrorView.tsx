/**
 * Error View - Survey error state display
 * Matches admin preview styling with M3 Expressive design
 */

'use client';

import { Button } from '@survey/ui-primitives';
import { useSurveyStore } from '@/store/survey-store';
import { AlertCircle, RefreshCw } from 'lucide-react';
import type { TranslationKey } from '@/lib/i18n';

interface ErrorViewProps {
  customMessage?: string;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export function ErrorView({ customMessage, t }: ErrorViewProps) {
  const { error, reset, setViewMode } = useSurveyStore();

  const handleRetry = () => {
    // Reset errors and go back to welcome
    reset();
    setViewMode('welcome');
  };

  return (
    <section
      className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-10 md:py-16"
      aria-labelledby="error-title"
      role="alert"
    >
      <div className="max-w-md w-full text-center">
        {/* Error icon */}
        <div className="mb-5 sm:mb-6 md:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl md:rounded-3xl bg-error-container/60 border-2 border-error/20 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-error" aria-hidden="true" />
          </div>
        </div>

        {/* Error title */}
        <h1 id="error-title" className="text-lg sm:text-xl md:text-2xl font-bold text-on-surface mb-3 md:mb-4 px-2 font-heading">
          {t('error.title')}
        </h1>

        {/* Error message */}
        <p className="text-sm sm:text-base md:text-lg text-on-surface-variant mb-5 sm:mb-6 md:mb-8 max-w-md px-2">
          {customMessage || error || t('error.description')}
        </p>

        {/* Retry button */}
        <div className="flex justify-center gap-4">
          <Button variant="tonal" onClick={handleRetry} className="gap-2">
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            {t('error.retry')}
          </Button>
        </div>
      </div>
    </section>
  );
}
