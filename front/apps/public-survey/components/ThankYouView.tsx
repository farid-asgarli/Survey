/**
 * Thank You View - Survey completion confirmation
 * Matches admin preview styling with M3 Expressive design
 */

'use client';

import type { PublicSurvey } from '@survey/types';
import { Button } from '@survey/ui-primitives';
import { CheckCircle, ExternalLink } from 'lucide-react';
import type { TranslationKey } from '@/lib/i18n';

interface ThankYouViewProps {
  survey: PublicSurvey;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  redirectUrl?: string;
}

export function ThankYouView({ survey, t, redirectUrl }: ThankYouViewProps) {
  return (
    <section
      className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-10 md:py-16"
      aria-labelledby="thank-you-title"
      role="status"
      aria-live="polite"
    >
      <div className="max-w-xl w-full text-center">
        {/* Success icon with decorative elements */}
        <div className="relative mb-5 sm:mb-6 md:mb-8 inline-block">
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-success-container border-2 border-success/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 text-success" aria-hidden="true" />
          </div>
          {/* Decorative floating elements */}
          <div
            className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-success/30 animate-float"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-1 -left-2 md:-bottom-1 md:-left-3 w-3 h-3 md:w-4 md:h-4 rounded-full bg-success/20 animate-float"
            style={{ animationDelay: '1s' }}
            aria-hidden="true"
          />
        </div>

        {/* Thank you title */}
        <h1 id="thank-you-title" className="text-xl sm:text-2xl md:text-3xl font-bold text-on-surface mb-3 md:mb-4 font-heading">
          {t('survey.thankYou')}
        </h1>

        {/* Thank you message */}
        {survey.thankYouMessage ? (
          <div
            className="text-sm sm:text-base md:text-lg text-on-surface-variant mb-5 sm:mb-6 md:mb-8 max-w-lg mx-auto prose prose-gray dark:prose-invert px-2"
            dangerouslySetInnerHTML={{ __html: survey.thankYouMessage }}
          />
        ) : (
          <p className="text-sm sm:text-base md:text-lg text-on-surface-variant mb-5 sm:mb-6 md:mb-8 max-w-lg mx-auto whitespace-pre-wrap px-2">
            {t('survey.thankYouDefault')}
          </p>
        )}

        {/* Redirect link button */}
        {redirectUrl && (
          <Button variant="tonal" size="default" asChild className="gap-2">
            <a href={redirectUrl} target="_blank" rel="noopener noreferrer">
              {t('survey.continue')}
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
          </Button>
        )}

        {/* Close message */}
        <p className="text-xs sm:text-sm text-on-surface-variant/70 mt-8 sm:mt-10 md:mt-12">{t('survey.closeMessage')}</p>

        {/* Branding footer */}
        {survey.theme?.showPoweredBy !== false && (
          <footer className="mt-8 pt-6 border-t border-outline-variant/30">
            <p className="text-sm text-on-surface-variant/60">{t('survey.poweredBy')}</p>
          </footer>
        )}
      </div>
    </section>
  );
}
