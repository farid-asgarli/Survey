/**
 * Welcome View - Survey introduction and start screen
 * Matches admin preview styling with M3 Expressive design
 */

'use client';

import type { PublicSurvey } from '@survey/types';
import { Button, cn } from '@survey/ui-primitives';
import { ArrowRight, Clock, HelpCircle } from 'lucide-react';
import { useSurveyStore } from '@/store/survey-store';
import type { TranslationKey } from '@/lib/i18n';

interface WelcomeViewProps {
  survey: PublicSurvey;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export function WelcomeView({ survey, t }: WelcomeViewProps) {
  const { startSurvey, isLoading, hasRestoredProgress } = useSurveyStore();
  const estimatedMinutes = Math.ceil(survey.questions.length * 0.5);

  const handleStart = () => {
    startSurvey();
  };

  // Logo size mapping (matches admin: 0=small, 1=medium, 2=large, 3=extra-large)
  const logoSizeMap: Record<number, string> = {
    0: 'w-14 h-14 sm:w-16 sm:h-16',
    1: 'w-20 h-20 sm:w-24 sm:h-24',
    2: 'w-24 h-24 sm:w-28 sm:h-28',
    3: 'w-28 h-28 sm:w-32 sm:h-32',
  };

  const logoSize = survey.theme?.logoSize ?? 1;

  return (
    <section
      className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-8 sm:py-12 relative overflow-hidden"
      aria-labelledby="survey-title"
    >
      {/* ========== DECORATIVE BACKGROUND SHAPES ========== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Large primary blob - top left */}
        <div className="absolute -top-24 -left-24 sm:-top-32 sm:-left-32 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 rounded-full bg-primary-container/10" />
        {/* Secondary accent - bottom right */}
        <div className="absolute -bottom-16 -right-16 sm:-bottom-24 sm:-right-24 w-48 sm:w-64 md:w-72 h-48 sm:h-64 md:h-72 rounded-[2.5rem] bg-secondary-container/10 rotate-12" />
        {/* Small floating pill - top right */}
        <div className="absolute top-20 sm:top-28 right-8 sm:right-16 w-16 sm:w-20 h-6 sm:h-8 rounded-full bg-primary-container/15" />
      </div>

      {/* ========== MAIN CONTENT CONTAINER ========== */}
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-xl">
        {/* ========== LOGO / BRAND HERO ========== */}
        <div className="mb-8 sm:mb-10 flex flex-col items-center">
          {survey.theme?.logoUrl ? (
            <div
              className={cn(
                'rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-outline-variant/30',
                'transition-[border-radius,border-color] duration-500',
                'hover:border-primary/40 hover:rounded-3xl',
                survey.theme.showLogoBackground && 'p-3 sm:p-4',
                logoSizeMap[logoSize] || logoSizeMap[1]
              )}
              style={{
                backgroundColor: survey.theme.showLogoBackground ? survey.theme.logoBackgroundColor || 'var(--color-surface-container)' : undefined,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={survey.theme.logoUrl}
                alt={survey.theme.brandingTitle ? `${survey.theme.brandingTitle} logo` : 'Survey logo'}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            /* Default logo container when no logo URL */
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-primary-container border-2 border-primary/20 flex items-center justify-center transition-[border-radius,border-color] duration-500 hover:border-primary/40 hover:rounded-3xl">
              <HelpCircle className="w-10 h-10 sm:w-12 sm:h-12 text-on-primary-container" />
            </div>
          )}

          {/* Branding Text */}
          {(survey.theme?.brandingTitle || survey.theme?.brandingSubtitle) && (
            <div className="mt-4 sm:mt-5">
              {survey.theme.brandingTitle && (
                <p className="text-lg sm:text-xl font-bold text-on-surface tracking-tight">{survey.theme.brandingTitle}</p>
              )}
              {survey.theme.brandingSubtitle && (
                <p className="text-sm sm:text-base text-on-surface-variant mt-0.5 font-medium">{survey.theme.brandingSubtitle}</p>
              )}
            </div>
          )}
        </div>

        {/* ========== SURVEY TITLE ========== */}
        <h1
          id="survey-title"
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-on-surface leading-tight tracking-tight mb-3 sm:mb-4 px-2 font-heading"
        >
          {survey.title}
        </h1>

        {/* ========== DESCRIPTION ========== */}
        {survey.description && (
          <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed mb-6 sm:mb-8 max-w-md px-2">{survey.description}</p>
        )}

        {/* ========== WELCOME MESSAGE CARD ========== */}
        {survey.welcomeMessage && (
          <div className="w-full max-w-md mb-6 sm:mb-8 bg-surface-container-low rounded-2xl sm:rounded-3xl border border-outline-variant/20 p-4 sm:p-6 transition-[border-radius,border-color] duration-300 hover:border-primary/25">
            <div
              className="prose prose-sm sm:prose-base prose-gray dark:prose-invert text-on-surface leading-relaxed text-left"
              dangerouslySetInnerHTML={{ __html: survey.welcomeMessage }}
            />
          </div>
        )}

        {/* ========== RESUME NOTIFICATION ========== */}
        {hasRestoredProgress && (
          <div className="w-full max-w-md mb-6 p-4 bg-secondary-container/50 rounded-xl border border-secondary/20" role="alert">
            <p className="text-sm text-on-secondary-container font-medium">{t('survey.resumeNotice')}</p>
          </div>
        )}

        {/* ========== SURVEY META CHIPS ========== */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-8 sm:mb-10 justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-container/30 text-on-primary-container border border-primary/15 text-sm font-medium">
            <HelpCircle className="w-4 h-4" aria-hidden="true" />
            <span>
              {survey.questions.length} {t('survey.questions')}
            </span>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high text-on-surface-variant text-sm font-medium">
            <Clock className="w-4 h-4" aria-hidden="true" />
            <span>
              ~{estimatedMinutes} {t('survey.minutes')}
            </span>
          </div>

          {survey.isAnonymous && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high text-on-surface-variant text-sm font-medium">
              <span>{t('survey.anonymous')}</span>
            </div>
          )}
        </div>

        {/* ========== CTA BUTTON ========== */}
        <div className="flex flex-col items-center">
          <Button
            variant="filled"
            size="xl"
            onClick={handleStart}
            disabled={isLoading}
            loading={isLoading}
            aria-busy={isLoading}
            className="gap-3 px-10 sm:px-12 group"
          >
            <span>{isLoading ? t('survey.starting') : hasRestoredProgress ? t('survey.continue') : t('survey.start')}</span>
            {!isLoading && <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />}
          </Button>

          {/* Helper text */}
          <p className="mt-4 sm:mt-5 text-xs sm:text-sm text-on-surface-variant/60 font-medium">{t('survey.anonymousNote')}</p>
        </div>
      </div>
    </section>
  );
}
