// Thank You Screen - Shown after survey completion
// Uses container queries (@sm:, @md:) for proper preview responsiveness

import { CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui';
import { useTranslation } from 'react-i18next';

interface ThankYouScreenProps {
  message?: string;
  redirectUrl?: string;
}

export function ThankYouScreen({ message, redirectUrl }: ThankYouScreenProps) {
  const { t } = useTranslation();
  const defaultMessage = t('publicSurvey.thankYouMessage');

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-8 @sm:py-10 @md:py-16 min-h-full">
      {/* Success animation */}
      <div className="relative mb-5 @sm:mb-6 @md:mb-8">
        <div className="w-16 h-16 @sm:w-20 @sm:h-20 @md:w-24 @md:h-24 rounded-2xl @md:rounded-3xl bg-success-container border-2 border-success/20 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 @sm:w-10 @sm:h-10 @md:w-14 @md:h-14 text-success" />
        </div>
        {/* Decorative elements */}
        <div className="absolute -top-1 -right-1 @md:-top-2 @md:-right-2 w-4 h-4 @sm:w-5 @sm:h-5 @md:w-6 @md:h-6 rounded-full bg-success/30 animate-float" />
        <div
          className="absolute -bottom-1 -left-2 @md:-bottom-1 @md:-left-3 w-3 h-3 @md:w-4 @md:h-4 rounded-full bg-success/20 animate-float"
          style={{ animationDelay: '1s' }}
        />
      </div>

      {/* Title */}
      <h1 className="text-xl @sm:text-2xl @md:text-3xl font-bold text-on-surface mb-3 @md:mb-4">{t('publicSurvey.thankYouTitle')}</h1>

      {/* Message */}
      <p className="text-sm @sm:text-base @md:text-lg text-on-surface-variant mb-5 @sm:mb-6 @md:mb-8 max-w-lg whitespace-pre-wrap px-2">
        {message || defaultMessage}
      </p>

      {/* Redirect link */}
      {redirectUrl && (
        <Button variant="tonal" size="default" asChild className="gap-2">
          <a href={redirectUrl} target="_blank" rel="noopener noreferrer">
            {t('publicSurvey.continue')}
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      )}

      {/* Close message */}
      <p className="text-xs @sm:text-sm text-on-surface-variant/70 mt-8 @sm:mt-10 @md:mt-12">{t('publicSurvey.closeMessage')}</p>
    </div>
  );
}
