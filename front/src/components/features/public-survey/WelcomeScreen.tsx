// Welcome Screen - Initial screen shown before survey starts
// M3 Expressive design with shape variety, border interactions, and subtle motion
// Uses container queries (@sm:, @md:) for proper preview responsiveness

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import { ArrowRight, Clock, HelpCircle, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  title: string;
  description?: string;
  welcomeMessage?: string;
  questionCount: number;
  onStart: () => void;
  /** Logo URL to display instead of the default icon */
  logoUrl?: string;
  /** Logo size: 0=small, 1=medium (default), 2=large, 3=extra-large */
  logoSize?: number;
  /** Whether to show a background behind the logo */
  showLogoBackground?: boolean;
  /** Background color for the logo */
  logoBackgroundColor?: string;
  /** Branding title displayed next to the logo */
  brandingTitle?: string;
  /** Branding subtitle displayed below the title */
  brandingSubtitle?: string;
}

export function WelcomeScreen({
  title,
  description,
  welcomeMessage,
  questionCount,
  onStart,
  logoUrl,
  logoSize,
  showLogoBackground,
  logoBackgroundColor,
  brandingTitle,
  brandingSubtitle,
}: WelcomeScreenProps) {
  const { t } = useTranslation();
  const estimatedMinutes = Math.ceil(questionCount * 0.5);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-12 relative overflow-hidden">
      {/* Decorative shapes - M3 Expressive abstract elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Top-left organic shape */}
        <div className="absolute -top-20 -left-20 w-40 @sm:w-52 @md:w-64 h-40 @sm:h-52 @md:h-64 rounded-[4rem] bg-primary-container/20 rotate-12 animate-float" />
        {/* Top-right pill */}
        <div className="absolute top-16 -right-8 w-24 @sm:w-28 @md:w-32 h-12 @sm:h-14 @md:h-16 rounded-full bg-tertiary-container/15 -rotate-6" />
        {/* Bottom-left squircle */}
        <div
          className="absolute -bottom-12 left-1/4 w-28 @sm:w-34 @md:w-40 h-28 @sm:h-34 @md:h-40 rounded-4xl bg-secondary-container/15 rotate-45"
          style={{ animationDelay: '1s' }}
        />
        {/* Bottom-right organic */}
        <div
          className="absolute bottom-20 -right-16 w-32 @sm:w-40 @md:w-48 h-32 @sm:h-40 @md:h-48 rounded-5xl bg-primary-container/10 -rotate-12 animate-float"
          style={{ animationDelay: '1.5s' }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full">
        {/* Hero icon cluster - M3 Expressive shape variety */}
        <div className="relative mb-6 @sm:mb-8 @md:mb-10 flex flex-col items-center">
          {/* Main icon container - large squircle */}
          {logoUrl ? (
            <>
              <div
                className={`rounded-2xl @sm:rounded-2xl @md:rounded-3xl flex items-center justify-center overflow-hidden ${
                  showLogoBackground ? 'p-2 border-2 border-outline-variant/30' : ''
                } ${
                  logoSize === 0
                    ? 'w-14 h-14 @sm:w-16 @sm:h-16 @md:w-18 @md:h-18'
                    : logoSize === 2
                    ? 'w-24 h-24 @sm:w-28 @sm:h-28 @md:w-32 @md:h-32'
                    : logoSize === 3
                    ? 'w-28 h-28 @sm:w-32 @sm:h-32 @md:w-40 @md:h-40'
                    : 'w-20 h-20 @sm:w-24 @sm:h-24 @md:w-28 @md:h-28'
                }`}
                style={showLogoBackground ? { backgroundColor: logoBackgroundColor || '#ffffff' } : undefined}
              >
                <img src={logoUrl} alt={t('a11y.surveyLogo')} className="w-full h-full object-contain" />
              </div>
              {/* Branding title and subtitle */}
              {(brandingTitle || brandingSubtitle) && (
                <div className="mt-3 @sm:mt-4 text-center">
                  {brandingTitle && <p className="text-base @sm:text-lg font-semibold text-on-surface">{brandingTitle}</p>}
                  {brandingSubtitle && <p className="text-sm @sm:text-base text-on-surface-variant mt-0.5">{brandingSubtitle}</p>}
                </div>
              )}
            </>
          ) : (
            <div className="w-16 h-16 @sm:w-20 @sm:h-20 @md:w-24 @md:h-24 rounded-2xl @sm:rounded-2xl @md:rounded-3xl bg-primary-container border-2 border-primary/20 flex items-center justify-center">
              <Sparkles className="w-8 h-8 @sm:w-10 @sm:h-10 @md:w-12 @md:h-12 text-on-primary-container" strokeWidth={1.5} />
            </div>
          )}
        </div>

        {/* Title - Expressive typography */}
        <h1 className="text-xl @sm:text-2xl @md:text-3xl font-bold text-on-surface mb-4 @sm:mb-5 leading-tight tracking-tight px-2">{title}</h1>

        {/* Description */}
        {description && (
          <p className="text-base @sm:text-lg @md:text-xl text-on-surface-variant mb-6 @sm:mb-8 max-w-xl leading-relaxed px-2">{description}</p>
        )}

        {/* Welcome message card - Expressive container with distinct shape */}
        {welcomeMessage && (
          <div className="p-4 @sm:p-6 @md:p-8 rounded-2xl @sm:rounded-3xl bg-surface-container border-2 border-outline-variant/40 mb-8 @sm:mb-10 max-w-xl w-full text-left transition-all duration-300 hover:border-primary/30">
            <p className="text-sm @sm:text-base text-on-surface leading-relaxed whitespace-pre-wrap">{welcomeMessage}</p>
          </div>
        )}

        {/* Survey stats - Expressive info chips with shape variety */}
        <div className="flex flex-col @sm:flex-row flex-wrap items-center justify-center gap-3 @sm:gap-4 mb-8 @sm:mb-10 @md:mb-12 w-full px-2">
          {/* Questions chip - rounded rectangle */}
          <div className="flex items-center gap-2 @sm:gap-3 px-4 @sm:px-5 @md:px-6 py-2.5 @sm:py-3 rounded-xl @sm:rounded-2xl bg-surface-container-high border-2 border-outline-variant/30 transition-all duration-200 hover:border-primary/40 w-full @sm:w-auto">
            <div className="w-8 h-8 @sm:w-9 @sm:h-9 @md:w-10 @md:h-10 rounded-lg @sm:rounded-xl bg-primary-container/60 flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4 @sm:w-4.5 @sm:h-4.5 @md:w-5 @md:h-5 text-on-primary-container" strokeWidth={2} />
            </div>
            <div className="text-left">
              <div className="text-lg @sm:text-xl @md:text-2xl font-bold text-primary leading-none">{questionCount}</div>
              <div className="text-xs @sm:text-sm text-on-surface-variant">{t('welcomeScreen.questions', { count: questionCount })}</div>
            </div>
          </div>

          {/* Time chip - pill shape */}
          <div className="flex items-center gap-2 @sm:gap-3 px-4 @sm:px-5 @md:px-6 py-2.5 @sm:py-3 rounded-xl @sm:rounded-full bg-surface-container-high border-2 border-outline-variant/30 transition-all duration-200 hover:border-secondary/40 w-full @sm:w-auto">
            <div className="w-8 h-8 @sm:w-9 @sm:h-9 @md:w-10 @md:h-10 rounded-full bg-secondary-container/60 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 @sm:w-4.5 @sm:h-4.5 @md:w-5 @md:h-5 text-on-secondary-container" strokeWidth={2} />
            </div>
            <div className="text-left">
              <div className="text-lg @sm:text-xl @md:text-2xl font-bold text-secondary leading-none">~{estimatedMinutes}</div>
              <div className="text-xs @sm:text-sm text-on-surface-variant">{t('welcomeScreen.minutes')}</div>
            </div>
          </div>
        </div>

        {/* Start button - Hero action with expressive styling */}
        <Button
          size="lg"
          onClick={onStart}
          className="gap-2 @sm:gap-3 px-8 @sm:px-10 @md:px-14 text-base @sm:text-lg transition-all duration-200 group w-full @sm:w-auto"
        >
          {t('welcomeScreen.startSurvey')}
          <ArrowRight className="w-4 h-4 @sm:w-5 @sm:h-5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Button>

        {/* Subtle encouragement text */}
        <p className="mt-4 @sm:mt-5 @md:mt-6 text-xs @sm:text-sm text-on-surface-variant/70">
          {t('welcomeScreen.anonymousNote', { defaultValue: 'Your responses help us improve' })}
        </p>
      </div>
    </div>
  );
}
