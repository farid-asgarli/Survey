// OnboardingWizard - First-time user onboarding experience
// A beautiful, step-by-step wizard to welcome new users and help them set up their preferences

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Palette,
  Globe,
  Bell,
  Rocket,
  ChevronRight,
  ChevronLeft,
  Check,
  Languages,
  AlertCircle,
  Accessibility,
  FileText,
  BarChart3,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, Switch, Input, Avatar, toast } from '@survey/ui-primitives';
import { LogoIcon } from './Logo';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { useAuthStore } from '@/stores/authStore';
import { preferencesApi, usersApi } from '@/services/api';
import { COLOR_PALETTES, THEME_MODES, UI_LANGUAGES } from '@/config';
import type { ThemeMode, ColorPalette, SupportedLanguage } from '@/types';
import { useUserAvatar } from '@/hooks';

interface OnboardingWizardProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

interface StepConfig {
  id: number;
  icon: React.ComponentType<{ className?: string }>;
  titleKey: string;
  descriptionKey: string;
}

const STEPS: StepConfig[] = [
  {
    id: 0,
    icon: () => <LogoIcon size="lg" />,
    titleKey: 'onboarding.welcome.title',
    descriptionKey: 'onboarding.welcome.description',
  },
  {
    id: 1,
    icon: User,
    titleKey: 'onboarding.profile.title',
    descriptionKey: 'onboarding.profile.description',
  },
  {
    id: 2,
    icon: Palette,
    titleKey: 'onboarding.appearance.title',
    descriptionKey: 'onboarding.appearance.description',
  },
  {
    id: 3,
    icon: Accessibility,
    titleKey: 'onboarding.accessibility.title',
    descriptionKey: 'onboarding.accessibility.description',
  },
  {
    id: 4,
    icon: Globe,
    titleKey: 'onboarding.language.title',
    descriptionKey: 'onboarding.language.description',
  },
  {
    id: 5,
    icon: Bell,
    titleKey: 'onboarding.notifications.title',
    descriptionKey: 'onboarding.notifications.description',
  },
  {
    id: 6,
    icon: Rocket,
    titleKey: 'onboarding.complete.title',
    descriptionKey: 'onboarding.complete.description',
  },
];

export function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  // Get the resolved avatar URL for display
  const { avatarUrl } = useUserAvatar();

  const {
    preferences,
    setThemeMode,
    setColorPalette,
    setLanguage,
    setNotifications,
    setAccessibility,
    setOnboardingCurrentStep,
    completeOnboarding,
    skipOnboarding,
  } = usePreferencesStore();

  const [currentStep, setCurrentStep] = useState(preferences.onboarding.currentStep);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward

  // Refs for focus management and cleanup
  const containerRef = useRef<HTMLDivElement>(null);
  const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Local state for form values
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>(preferences.themeMode);
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette>(preferences.colorPalette);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(preferences.regional.language);
  const [emailNotifications, setEmailNotifications] = useState(preferences.notifications.emailNotifications);
  const [responseAlerts, setResponseAlerts] = useState(preferences.notifications.responseAlerts);
  const [weeklyDigest, setWeeklyDigest] = useState(preferences.notifications.weeklyDigest);

  // Accessibility state
  const [reducedMotion, setReducedMotion] = useState(preferences.accessibility.reducedMotion);
  const [highContrast, setHighContrast] = useState(preferences.accessibility.highContrastMode);
  const [largeText, setLargeText] = useState(
    preferences.accessibility.fontSizeScale === 'large' || preferences.accessibility.fontSizeScale === 'extra-large'
  );
  const [dyslexiaFont, setDyslexiaFont] = useState(preferences.accessibility.dyslexiaFriendlyFont);

  // Cleanup animation timers on unmount
  useEffect(() => {
    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, []);

  // Update step in store whenever it changes
  useEffect(() => {
    setOnboardingCurrentStep(currentStep);
  }, [currentStep, setOnboardingCurrentStep]);

  // Apply theme changes in real-time
  useEffect(() => {
    setThemeMode(selectedTheme);
  }, [selectedTheme, setThemeMode]);

  useEffect(() => {
    setColorPalette(selectedPalette);
  }, [selectedPalette, setColorPalette]);

  useEffect(() => {
    setLanguage(selectedLanguage);
  }, [selectedLanguage, setLanguage]);

  const handleNext = useCallback(async () => {
    if (isAnimating || isSaving) return;

    setIsAnimating(true);

    // Save step-specific data
    if (currentStep === 1) {
      // Save profile
      try {
        setIsSaving(true);
        await usersApi.updateProfile({ firstName, lastName });
        updateUser({ firstName, lastName });
      } catch (error) {
        console.error('Failed to update profile:', error);
      } finally {
        setIsSaving(false);
      }
    } else if (currentStep === 3) {
      // Apply accessibility settings locally
      setAccessibility({
        reducedMotion,
        highContrastMode: highContrast,
        fontSizeScale: largeText ? 'large' : 'medium',
        dyslexiaFriendlyFont: dyslexiaFont,
      });
    } else if (currentStep === 5) {
      // Save notifications
      setNotifications({
        emailNotifications,
        responseAlerts,
        weeklyDigest,
      });
    }

    setDirection(1);
    animationTimerRef.current = setTimeout(() => {
      setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
      setIsAnimating(false);
    }, 150);
  }, [
    currentStep,
    isAnimating,
    isSaving,
    firstName,
    lastName,
    emailNotifications,
    responseAlerts,
    weeklyDigest,
    reducedMotion,
    highContrast,
    largeText,
    dyslexiaFont,
    setNotifications,
    setAccessibility,
    updateUser,
  ]);

  const handleBack = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection(-1);
    animationTimerRef.current = setTimeout(() => {
      setCurrentStep((s) => Math.max(s - 1, 0));
      setIsAnimating(false);
    }, 150);
  }, [isAnimating]);

  const handleComplete = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    try {
      // Save all preferences to backend
      await preferencesApi.updatePreferences({
        themeMode: selectedTheme,
        colorPalette: selectedPalette,
        regional: { language: selectedLanguage },
        accessibility: {
          reducedMotion,
          highContrastMode: highContrast,
          fontSizeScale: largeText ? 'large' : 'medium',
          dyslexiaFriendlyFont: dyslexiaFont,
          screenReaderOptimized: preferences.accessibility.screenReaderOptimized,
        },
        notifications: {
          emailNotifications,
          responseAlerts,
          weeklyDigest,
          marketingEmails: preferences.notifications.marketingEmails,
          completionAlerts: preferences.notifications.completionAlerts,
          distributionReports: preferences.notifications.distributionReports,
        },
        onboarding: {
          status: 'completed',
          currentStep: STEPS.length - 1,
          hasSeenWelcomeTour: true,
          hasCompletedProfileSetup: true,
          hasCreatedFirstSurvey: false,
          completedAt: new Date().toISOString(),
        },
      });
      completeOnboarding();
      toast.success(t('onboarding.completedSuccessfully', 'Setup completed successfully!'));
      onComplete?.();
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setError(t('onboarding.errors.saveFailed', 'Failed to save your preferences. Please try again.'));
      toast.error(t('onboarding.errors.saveFailed', 'Failed to save your preferences'));
    } finally {
      setIsSaving(false);
    }
  }, [
    selectedTheme,
    selectedPalette,
    selectedLanguage,
    reducedMotion,
    highContrast,
    largeText,
    dyslexiaFont,
    preferences.accessibility.screenReaderOptimized,
    emailNotifications,
    responseAlerts,
    weeklyDigest,
    preferences.notifications,
    completeOnboarding,
    onComplete,
    t,
  ]);

  const handleSkip = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    try {
      await preferencesApi.updatePreferences({
        onboarding: {
          status: 'skipped',
          currentStep,
          hasSeenWelcomeTour: currentStep >= 1,
          hasCompletedProfileSetup: currentStep >= 2,
          hasCreatedFirstSurvey: false,
          completedAt: new Date().toISOString(),
        },
      });
      skipOnboarding();
      onSkip?.();
    } catch (error) {
      console.error('Failed to skip onboarding:', error);
      // Even on error, allow user to skip (update local state only)
      skipOnboarding();
      onSkip?.();
    } finally {
      setIsSaving(false);
    }
  }, [currentStep, skipOnboarding, onSkip]);

  // Focus management - keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Escape key to skip
      if (e.key === 'Escape' && !isSaving) {
        handleSkip();
        return;
      }

      // Handle Enter key to proceed (if not on input)
      if (e.key === 'Enter' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        if (currentStep === STEPS.length - 1) {
          handleComplete();
        } else {
          handleNext();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, isSaving, handleSkip, handleComplete, handleNext]);

  const progress = useMemo(() => ((currentStep + 1) / STEPS.length) * 100, [currentStep]);
  const step = STEPS[currentStep];
  const StepIcon = step.icon;
  const isLastStep = currentStep === STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep userName={user?.firstName || t('onboarding.defaultUser')} />;
      case 1:
        return (
          <ProfileStep
            firstName={firstName}
            lastName={lastName}
            avatarUrl={avatarUrl}
            onFirstNameChange={setFirstName}
            onLastNameChange={setLastName}
          />
        );
      case 2:
        return (
          <AppearanceStep
            selectedTheme={selectedTheme}
            selectedPalette={selectedPalette}
            onThemeChange={setSelectedTheme}
            onPaletteChange={setSelectedPalette}
          />
        );
      case 3:
        return (
          <AccessibilityStep
            reducedMotion={reducedMotion}
            highContrast={highContrast}
            largeText={largeText}
            dyslexiaFont={dyslexiaFont}
            onReducedMotionChange={setReducedMotion}
            onHighContrastChange={setHighContrast}
            onLargeTextChange={setLargeText}
            onDyslexiaFontChange={setDyslexiaFont}
          />
        );
      case 4:
        return <LanguageStep selectedLanguage={selectedLanguage} onLanguageChange={setSelectedLanguage} />;
      case 5:
        return (
          <NotificationsStep
            emailNotifications={emailNotifications}
            responseAlerts={responseAlerts}
            weeklyDigest={weeklyDigest}
            onEmailNotificationsChange={setEmailNotifications}
            onResponseAlertsChange={setResponseAlerts}
            onWeeklyDigestChange={setWeeklyDigest}
          />
        );
      case 6:
        return <CompleteStep userName={firstName || user?.firstName || t('onboarding.defaultUser')} />;
      default:
        return null;
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-description"
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-scrim/40 backdrop-blur-md" aria-hidden="true" />

      {/* Main wizard container */}
      <motion.div
        ref={containerRef}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          'relative z-10 w-full max-w-2xl mx-4',
          'bg-surface rounded-3xl',
          'border border-outline-variant/30',
          'shadow-2xl shadow-scrim/20',
          'overflow-hidden'
        )}
      >
        {/* Progress bar */}
        <div
          className="h-1 bg-surface-container-high"
          role="progressbar"
          aria-valuenow={currentStep + 1}
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
        >
          <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
        </div>

        {/* Skip button (only show if not on last step) */}
        {!isLastStep && (
          <div className="absolute top-4 right-4 z-20">
            <Button
              variant="text"
              size="sm"
              onClick={handleSkip}
              disabled={isSaving}
              className="text-on-surface-variant hover:text-on-surface"
              aria-label={t('onboarding.skipAriaLabel', 'Skip onboarding wizard')}
            >
              {t('onboarding.skip')}
            </Button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-8 mt-4 p-3 rounded-xl bg-error-container/30 border border-error/30 flex items-center gap-2"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 text-error shrink-0" />
            <p className="text-sm text-error">{error}</p>
          </motion.div>
        )}

        {/* Header with step indicator */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex items-center gap-4">
            <motion.div
              key={currentStep}
              initial={{ scale: 0.5, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className={cn('flex h-16 w-16 items-center justify-center rounded-2xl', 'bg-primary-container/30')}
              aria-hidden="true"
            >
              <StepIcon className="h-8 w-8 text-primary" />
            </motion.div>
            <div className="flex-1">
              <motion.h2
                id="onboarding-title"
                key={`title-${currentStep}`}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-2xl font-bold text-on-surface"
              >
                {t(step.titleKey)}
              </motion.h2>
              <motion.p
                id="onboarding-description"
                key={`desc-${currentStep}`}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-sm text-on-surface-variant mt-1"
              >
                {t(step.descriptionKey)}
              </motion.p>
            </div>
          </div>

          {/* Step dots */}
          <nav aria-label={t('onboarding.stepNavigation', 'Wizard steps')}>
            <div className="flex items-center justify-center gap-2 mt-6" role="tablist">
              {STEPS.map((s, idx) => (
                <motion.div
                  key={s.id}
                  role="tab"
                  aria-selected={idx === currentStep}
                  aria-label={t('onboarding.stepLabel', 'Step {{current}} of {{total}}', {
                    current: idx + 1,
                    total: STEPS.length,
                  })}
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    idx === currentStep ? 'w-8 bg-primary' : idx < currentStep ? 'w-2 bg-primary/60' : 'w-2 bg-outline-variant/50'
                  )}
                  initial={false}
                  animate={{
                    scale: idx === currentStep ? 1.1 : 1,
                  }}
                />
              ))}
            </div>
          </nav>
        </div>

        {/* Content area with animation */}
        <div className="px-8 py-6 min-h-80" role="tabpanel" aria-labelledby="onboarding-title">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer with navigation */}
        <div className="px-8 py-6 border-t border-outline-variant/20 bg-surface-container-lowest/50">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handleBack} disabled={isFirstStep || isAnimating} className={cn(isFirstStep && 'invisible')}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Button>

            {isLastStep ? (
              <Button variant="filled" onClick={handleComplete} disabled={isSaving} loading={isSaving} className="min-w-35">
                <Rocket className="h-4 w-4 mr-2" />
                {t('onboarding.getStarted')}
              </Button>
            ) : (
              <Button variant="filled" onClick={handleNext} disabled={isAnimating || isSaving} loading={isSaving}>
                {t('common.next')}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

// Step Components

function WelcomeStep({ userName }: { userName: string }) {
  const { t } = useTranslation();

  return (
    <div className="text-center py-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary-container/30 mb-6"
      >
        <LogoIcon size="2xl" />
      </motion.div>
      <motion.h3
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-on-surface mb-3"
      >
        {t('onboarding.welcome.greeting', { name: userName })}
      </motion.h3>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-on-surface-variant max-w-md mx-auto leading-relaxed"
      >
        {t('onboarding.welcome.message')}
      </motion.p>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-6 mt-8"
      >
        {[
          { icon: Palette, label: t('onboarding.features.customize') },
          { icon: Globe, label: t('onboarding.features.language') },
          { icon: Bell, label: t('onboarding.features.notifications') },
        ].map((item, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center">
              <item.icon className="h-6 w-6 text-on-surface-variant" />
            </div>
            <span className="text-xs text-on-surface-variant">{item.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

interface ProfileStepProps {
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
}

function ProfileStep({ firstName, lastName, avatarUrl, onFirstNameChange, onLastNameChange }: ProfileStepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex justify-center mb-6">
        <div className="relative">
          <Avatar src={avatarUrl ?? undefined} fallback={`${firstName?.[0] || '?'}${lastName?.[0] || ''}`} size="xl" className="h-24 w-24" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <User className="h-4 w-4 text-on-primary" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t('onboarding.profile.firstName')}
          value={firstName}
          onChange={(e) => onFirstNameChange(e.target.value)}
          placeholder={t('onboarding.profile.firstNamePlaceholder')}
        />
        <Input
          label={t('onboarding.profile.lastName')}
          value={lastName}
          onChange={(e) => onLastNameChange(e.target.value)}
          placeholder={t('onboarding.profile.lastNamePlaceholder')}
        />
      </div>

      <p className="text-sm text-on-surface-variant text-center">{t('onboarding.profile.hint')}</p>
    </div>
  );
}

interface AppearanceStepProps {
  selectedTheme: ThemeMode;
  selectedPalette: ColorPalette;
  onThemeChange: (theme: ThemeMode) => void;
  onPaletteChange: (palette: ColorPalette) => void;
}

function AppearanceStep({ selectedTheme, selectedPalette, onThemeChange, onPaletteChange }: AppearanceStepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Theme mode selection */}
      <div>
        <h4 className="text-sm font-medium text-on-surface mb-3">{t('onboarding.appearance.themeMode')}</h4>
        <div className="flex gap-3">
          {THEME_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onThemeChange(mode.id)}
              className={cn(
                'flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all',
                selectedTheme === mode.id ? 'border-primary bg-primary-container/20' : 'border-outline-variant/50 hover:border-outline-variant'
              )}
            >
              <mode.icon className={cn('h-6 w-6 shrink-0', selectedTheme === mode.id ? 'text-primary' : 'text-on-surface-variant')} />
              <span className={cn('text-sm font-medium', selectedTheme === mode.id ? 'text-primary' : 'text-on-surface')}>{t(mode.labelKey)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Color palette selection */}
      <div>
        <h4 className="text-sm font-medium text-on-surface mb-3">{t('onboarding.appearance.colorPalette')}</h4>
        <div className="grid grid-cols-3 gap-3">
          {COLOR_PALETTES.map((palette) => (
            <button
              key={palette.id}
              onClick={() => onPaletteChange(palette.id)}
              className={cn(
                'relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                selectedPalette === palette.id ? 'border-primary bg-primary-container/10' : 'border-outline-variant/50 hover:border-outline-variant'
              )}
            >
              <div className="flex gap-1">
                {palette.colors.map((color, idx) => (
                  <div key={idx} className="w-6 h-6 rounded-full border border-outline-variant/30" style={{ backgroundColor: color }} />
                ))}
              </div>
              <span className={cn('text-xs font-medium', selectedPalette === palette.id ? 'text-primary' : 'text-on-surface-variant')}>
                {t(palette.labelKey)}
              </span>
              {selectedPalette === palette.id && (
                <motion.div
                  layoutId="selected-palette"
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="h-3 w-3 text-on-primary" />
                </motion.div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface LanguageStepProps {
  selectedLanguage: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
}

function LanguageStep({ selectedLanguage, onLanguageChange }: LanguageStepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex justify-center mb-4">
        <Languages className="h-12 w-12 text-primary" />
      </div>
      <p className="text-center text-on-surface-variant mb-6">{t('onboarding.language.description')}</p>

      <div className="space-y-3">
        {UI_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onLanguageChange(lang.code as SupportedLanguage)}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all',
              selectedLanguage === lang.code
                ? 'border-primary bg-primary-container/20'
                : 'border-outline-variant/50 hover:border-outline-variant hover:bg-surface-container'
            )}
          >
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold',
                selectedLanguage === lang.code ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
              )}
            >
              {lang.code.toUpperCase()}
            </div>
            <div className="flex-1 text-left">
              <div className={cn('font-medium', selectedLanguage === lang.code ? 'text-primary' : 'text-on-surface')}>{lang.nativeName}</div>
              <div className="text-sm text-on-surface-variant">{lang.name}</div>
            </div>
            {selectedLanguage === lang.code && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-4 w-4 text-on-primary" />
              </motion.div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

interface NotificationsStepProps {
  emailNotifications: boolean;
  responseAlerts: boolean;
  weeklyDigest: boolean;
  onEmailNotificationsChange: (value: boolean) => void;
  onResponseAlertsChange: (value: boolean) => void;
  onWeeklyDigestChange: (value: boolean) => void;
}

function NotificationsStep({
  emailNotifications,
  responseAlerts,
  weeklyDigest,
  onEmailNotificationsChange,
  onResponseAlertsChange,
  onWeeklyDigestChange,
}: NotificationsStepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex justify-center mb-2">
        <div className="w-16 h-16 rounded-2xl bg-primary-container/30 flex items-center justify-center">
          <Bell className="h-8 w-8 text-primary" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-surface-container/50 border border-outline-variant/30">
          <Switch
            checked={emailNotifications}
            onChange={(e) => onEmailNotificationsChange(e.target.checked)}
            label={t('onboarding.notifications.email')}
            description={t('onboarding.notifications.emailDesc')}
          />
        </div>

        <div className="p-4 rounded-2xl bg-surface-container/50 border border-outline-variant/30">
          <Switch
            checked={responseAlerts}
            onChange={(e) => onResponseAlertsChange(e.target.checked)}
            label={t('onboarding.notifications.responses')}
            description={t('onboarding.notifications.responsesDesc')}
          />
        </div>

        <div className="p-4 rounded-2xl bg-surface-container/50 border border-outline-variant/30">
          <Switch
            checked={weeklyDigest}
            onChange={(e) => onWeeklyDigestChange(e.target.checked)}
            label={t('onboarding.notifications.digest')}
            description={t('onboarding.notifications.digestDesc')}
          />
        </div>
      </div>

      <p className="text-xs text-on-surface-variant text-center">{t('onboarding.notifications.hint')}</p>
    </div>
  );
}

interface AccessibilityStepProps {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  dyslexiaFont: boolean;
  onReducedMotionChange: (value: boolean) => void;
  onHighContrastChange: (value: boolean) => void;
  onLargeTextChange: (value: boolean) => void;
  onDyslexiaFontChange: (value: boolean) => void;
}

function AccessibilityStep({
  reducedMotion,
  highContrast,
  largeText,
  dyslexiaFont,
  onReducedMotionChange,
  onHighContrastChange,
  onLargeTextChange,
  onDyslexiaFontChange,
}: AccessibilityStepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex justify-center mb-2">
        <div className="w-16 h-16 rounded-2xl bg-primary-container/30 flex items-center justify-center">
          <Accessibility className="h-8 w-8 text-primary" />
        </div>
      </div>

      <p className="text-center text-on-surface-variant text-sm mb-4">
        {t('onboarding.accessibility.intro', 'Customize your experience for better accessibility')}
      </p>

      <div className="space-y-3">
        <div className="p-4 rounded-2xl bg-surface-container/50 border border-outline-variant/30">
          <Switch
            checked={reducedMotion}
            onChange={(e) => onReducedMotionChange(e.target.checked)}
            label={t('onboarding.accessibility.reducedMotion', 'Reduce Motion')}
            description={t('onboarding.accessibility.reducedMotionDesc', 'Minimize animations and transitions')}
          />
        </div>

        <div className="p-4 rounded-2xl bg-surface-container/50 border border-outline-variant/30">
          <Switch
            checked={highContrast}
            onChange={(e) => onHighContrastChange(e.target.checked)}
            label={t('onboarding.accessibility.highContrast', 'High Contrast')}
            description={t('onboarding.accessibility.highContrastDesc', 'Increase color contrast for better visibility')}
          />
        </div>

        <div className="p-4 rounded-2xl bg-surface-container/50 border border-outline-variant/30">
          <Switch
            checked={largeText}
            onChange={(e) => onLargeTextChange(e.target.checked)}
            label={t('onboarding.accessibility.largeText', 'Large Text')}
            description={t('onboarding.accessibility.largeTextDesc', 'Increase font size throughout the app')}
          />
        </div>

        <div className="p-4 rounded-2xl bg-surface-container/50 border border-outline-variant/30">
          <Switch
            checked={dyslexiaFont}
            onChange={(e) => onDyslexiaFontChange(e.target.checked)}
            label={t('onboarding.accessibility.dyslexiaFont', 'Dyslexia-Friendly Font')}
            description={t('onboarding.accessibility.dyslexiaFontDesc', 'Use a font designed for easier reading')}
          />
        </div>
      </div>

      <p className="text-xs text-on-surface-variant text-center">
        {t('onboarding.accessibility.hint', 'You can adjust these settings anytime in Settings → Accessibility')}
      </p>
    </div>
  );
}

function CompleteStep({ userName }: { userName: string }) {
  const { t } = useTranslation();

  const features = [
    { icon: FileText, label: t('onboarding.complete.createSurvey'), color: 'text-primary' },
    { icon: BarChart3, label: t('onboarding.complete.viewAnalytics'), color: 'text-secondary' },
    { icon: Send, label: t('onboarding.complete.distribute'), color: 'text-tertiary' },
  ];

  return (
    <div className="text-center py-4">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-success-container/30 mb-6"
      >
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }}>
          <Check className="h-12 w-12 text-success" />
        </motion.div>
      </motion.div>

      <motion.h3
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-on-surface mb-3"
      >
        {t('onboarding.complete.ready', { name: userName })}
      </motion.h3>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-on-surface-variant max-w-md mx-auto leading-relaxed mb-6"
      >
        {t('onboarding.complete.message')}
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-4"
      >
        {features.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-surface-container/50">
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
              <item.icon className={cn('h-5 w-5', item.color)} />
            </div>
            <span className="text-xs text-on-surface-variant">{item.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default OnboardingWizard;
