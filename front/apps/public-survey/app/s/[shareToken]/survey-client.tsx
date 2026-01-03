/**
 * Survey Client - Main client-side survey component
 *
 * This component handles the client-side rendering and state management
 * for the public survey experience.
 */

'use client';

import { useEffect, useMemo } from 'react';
import type { PublicSurvey } from '@survey/types';
import { useSurveyStore } from '@/store/survey-store';
import { SurveyShell, WelcomeView, QuestionsView, ThankYouView, ErrorView, ResumeProgressDialog } from '@/components';
import { getQuestionLabels, createTranslator, type SupportedLanguage } from '@/lib/i18n';

interface SurveyClientProps {
  initialSurvey: PublicSurvey;
  shareToken: string;
  apiBaseUrl: string;
  language: SupportedLanguage;
}

export function SurveyClient({ initialSurvey, shareToken, apiBaseUrl, language }: SurveyClientProps) {
  const { survey, viewMode, showResumeDialog, initialize, resumeSurvey, startFresh } = useSurveyStore();

  // Memoize translations to prevent recalculation on every render
  const labels = useMemo(() => getQuestionLabels(language), [language]);
  const t = useMemo(() => createTranslator(language), [language]);

  // Initialize store with server-fetched data
  useEffect(() => {
    initialize(initialSurvey, shareToken, apiBaseUrl, language);
  }, [initialSurvey, shareToken, apiBaseUrl, language, initialize]);

  // Update document language for accessibility
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  // Use initialSurvey for first render to avoid hydration mismatch
  const displaySurvey = survey ?? initialSurvey;

  return (
    <SurveyShell theme={displaySurvey.theme}>
      {/* Logo header for non-welcome views */}
      {viewMode !== 'welcome' && displaySurvey.theme?.logoUrl && (
        <header className="flex justify-center pt-6 pb-2 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={displaySurvey.theme.logoUrl} alt="Survey logo" className="h-10 object-contain" />
        </header>
      )}

      <main className="flex-1 flex flex-col">
        {/* View router */}
        {viewMode === 'welcome' && <WelcomeView survey={displaySurvey} t={t} />}
        {viewMode === 'questions' && <QuestionsView survey={displaySurvey} labels={labels} t={t} />}
        {viewMode === 'thank-you' && <ThankYouView survey={displaySurvey} t={t} />}
        {viewMode === 'error' && <ErrorView t={t} />}
      </main>

      {/* Resume Progress Dialog */}
      <ResumeProgressDialog open={showResumeDialog} onResume={resumeSurvey} onStartFresh={startFresh} t={t} />

      {/* Footer with branding */}
      {displaySurvey.theme?.showPoweredBy !== false && viewMode !== 'thank-you' && (
        <footer className="py-6 text-center shrink-0">
          <p className="text-xs text-on-surface-variant/50">{t('survey.poweredBy')}</p>
        </footer>
      )}
    </SurveyShell>
  );
}
