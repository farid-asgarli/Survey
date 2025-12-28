import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, OnboardingWizard, GettingStartedWizard } from '@/components/ui';
import { Info, Sparkles, RefreshCw, ExternalLink, Heart, Rocket } from 'lucide-react';
import { usePreferencesStore } from '@/stores';
import { preferencesApi } from '@/services/api';

export function AboutSection() {
  const { t } = useTranslation();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showGettingStarted, setShowGettingStarted] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isResettingGuide, setIsResettingGuide] = useState(false);
  const resetOnboarding = usePreferencesStore((s) => s.resetOnboarding);
  const resetGettingStarted = usePreferencesStore((s) => s.resetGettingStarted);
  const onboardingStatus = usePreferencesStore((s) => s.preferences.onboarding.status);
  const hasCompletedGettingStarted = usePreferencesStore((s) => s.preferences.onboarding.hasCompletedGettingStarted);

  const handleRestartOnboarding = async () => {
    setIsResetting(true);
    try {
      // Reset onboarding on backend
      await preferencesApi.updatePreferences({
        onboarding: {
          status: 'not_started',
          currentStep: 0,
          hasSeenWelcomeTour: false,
          hasCompletedProfileSetup: false,
          hasCreatedFirstSurvey: false,
          completedAt: null,
        },
      });
      // Reset in local store
      resetOnboarding();
      // Show the wizard
      setShowOnboarding(true);
    } catch (error) {
      console.error('Failed to reset onboarding:', error);
    } finally {
      setIsResetting(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
  };

  const handleRestartGettingStarted = async () => {
    setIsResettingGuide(true);
    try {
      // Reset getting started on backend
      await preferencesApi.updatePreferences({
        onboarding: {
          hasCompletedGettingStarted: false,
          gettingStartedStep: 0,
          gettingStartedCompletedAt: null,
        },
      });
      // Reset in local store
      resetGettingStarted();
      // Show the wizard
      setShowGettingStarted(true);
    } catch (error) {
      console.error('Failed to reset getting started guide:', error);
    } finally {
      setIsResettingGuide(false);
    }
  };

  const handleGettingStartedComplete = () => {
    setShowGettingStarted(false);
  };

  const handleGettingStartedSkip = () => {
    setShowGettingStarted(false);
  };

  return (
    <>
      <div className="space-y-6">
        {/* App Info */}
        <Card variant="elevated" padding="none">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container/30">
                <Info className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>{t('settings.about.title')}</CardTitle>
                <CardDescription>{t('settings.about.description')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container/50">
              <div>
                <p className="font-medium text-on-surface">{t('common.appName')}</p>
                <p className="text-sm text-on-surface-variant">{t('settings.about.version', { version: '1.0.0' })}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <Heart className="h-4 w-4 text-error" />
                <span>{t('settings.about.madeWith')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Setup Wizard */}
        <Card variant="elevated" padding="none">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container/30">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>{t('settings.about.setupWizard')}</CardTitle>
                <CardDescription>{t('settings.about.setupWizardDescription')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-4">
            <div className="p-4 rounded-2xl bg-surface-container/50 border border-outline-variant/30">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-on-surface">{t('onboarding.restartOnboarding')}</p>
                  <p className="text-sm text-on-surface-variant mt-1">{t('onboarding.restartOnboardingDescription')}</p>
                  {onboardingStatus === 'completed' && (
                    <p className="text-xs text-success mt-2 flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-success" />
                      {t('settings.about.onboardingCompleted')}
                    </p>
                  )}
                  {onboardingStatus === 'skipped' && (
                    <p className="text-xs text-warning mt-2 flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-warning" />
                      {t('settings.about.onboardingSkipped')}
                    </p>
                  )}
                </div>
                <Button variant="tonal" onClick={handleRestartOnboarding} disabled={isResetting} loading={isResetting}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t('settings.about.restart')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started Guide */}
        <Card variant="elevated" padding="none">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-tertiary-container/30">
                <Rocket className="h-6 w-6 text-tertiary" />
              </div>
              <div>
                <CardTitle>{t('gettingStarted.trigger.title')}</CardTitle>
                <CardDescription>{t('gettingStarted.trigger.description')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-4">
            <div className="p-4 rounded-2xl bg-surface-container/50 border border-outline-variant/30">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-on-surface">{t('gettingStarted.welcome.title')}</p>
                  <p className="text-sm text-on-surface-variant mt-1">{t('gettingStarted.welcome.description')}</p>
                  {hasCompletedGettingStarted && (
                    <p className="text-xs text-success mt-2 flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-success" />
                      {t('settings.about.onboardingCompleted')}
                    </p>
                  )}
                </div>
                <Button variant="tonal" onClick={handleRestartGettingStarted} disabled={isResettingGuide} loading={isResettingGuide}>
                  <Rocket className="h-4 w-4 mr-2" />
                  {t('gettingStarted.trigger.restart')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <Card variant="elevated" padding="none">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-container/30">
                <ExternalLink className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <CardTitle>{t('settings.about.resources')}</CardTitle>
                <CardDescription>{t('settings.about.resourcesDescription')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="grid gap-3">
              {[
                { label: t('settings.about.documentation'), href: '#' },
                { label: t('settings.about.support'), href: '#' },
                { label: t('settings.about.privacy'), href: '#' },
                { label: t('settings.about.terms'), href: '#' },
              ].map((link, idx) => (
                <a
                  key={idx}
                  href={link.href}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container transition-colors"
                >
                  <span className="text-on-surface">{link.label}</span>
                  <ExternalLink className="h-4 w-4 text-on-surface-variant" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onboarding Wizard Modal */}
      {showOnboarding && <OnboardingWizard onComplete={handleOnboardingComplete} onSkip={handleOnboardingSkip} />}

      {/* Getting Started Wizard Modal */}
      {showGettingStarted && <GettingStartedWizard onComplete={handleGettingStartedComplete} onSkip={handleGettingStartedSkip} />}
    </>
  );
}
