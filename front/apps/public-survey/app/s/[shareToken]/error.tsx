'use client';

import { useEffect, useMemo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { createTranslator, type SupportedLanguage } from '@/lib/i18n';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary for survey pages
 * Note: This is a client component, so we detect language from browser
 */
export default function Error({ error, reset }: ErrorProps) {
  // Detect language from browser
  const lang = useMemo((): SupportedLanguage => {
    if (typeof navigator === 'undefined') return 'en';
    const browserLang = navigator.language?.split('-')[0];
    if (browserLang === 'az' || browserLang === 'ru') return browserLang;
    return 'en';
  }, []);

  const t = useMemo(() => createTranslator(lang), [lang]);

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Survey page error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-error/10">
            <AlertTriangle className="w-10 h-10 text-error" />
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-4 text-2xl font-bold text-on-surface font-heading">{t('error.title')}</h1>

        {/* Description */}
        <p className="text-on-surface-variant mb-8">{t('error.description')}</p>

        {/* Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary/90 transition-all duration-200"
          >
            <RefreshCw className="w-5 h-5" />
            {t('error.retry')}
          </button>
        </div>

        {/* Error ID for support */}
        {error.digest && <p className="mt-8 text-xs text-on-surface-variant/50">Error ID: {error.digest}</p>}
      </div>
    </div>
  );
}
