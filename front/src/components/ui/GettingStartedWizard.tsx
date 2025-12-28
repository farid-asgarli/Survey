// GettingStartedWizard - Task-oriented guide for first-time users
// A step-by-step wizard to help users understand the survey creation workflow

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket,
  Building2,
  ClipboardList,
  HelpCircle,
  Palette,
  Eye,
  Share2,
  Users,
  BarChart3,
  PartyPopper,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Plus,
  FileStack,
  Link2,
  Mail,
  PieChart,
  TrendingUp,
  Download,
  Keyboard,
  ArrowRight,
  CheckCircle2,
  Circle,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { useAuthStore } from '@/stores/authStore';
import { preferencesApi } from '@/services/api';
import { toast } from './Toast';

interface GettingStartedWizardProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

interface StepConfig {
  id: number;
  icon: LucideIcon;
  titleKey: string;
  descriptionKey: string;
}

const STEPS: StepConfig[] = [
  { id: 0, icon: Rocket, titleKey: 'gettingStarted.welcome.title', descriptionKey: 'gettingStarted.welcome.description' },
  { id: 1, icon: Building2, titleKey: 'gettingStarted.workspace.title', descriptionKey: 'gettingStarted.workspace.description' },
  { id: 2, icon: ClipboardList, titleKey: 'gettingStarted.createSurvey.title', descriptionKey: 'gettingStarted.createSurvey.description' },
  { id: 3, icon: HelpCircle, titleKey: 'gettingStarted.questions.title', descriptionKey: 'gettingStarted.questions.description' },
  { id: 4, icon: Palette, titleKey: 'gettingStarted.themes.title', descriptionKey: 'gettingStarted.themes.description' },
  { id: 5, icon: Eye, titleKey: 'gettingStarted.preview.title', descriptionKey: 'gettingStarted.preview.description' },
  { id: 6, icon: Share2, titleKey: 'gettingStarted.distribute.title', descriptionKey: 'gettingStarted.distribute.description' },
  { id: 7, icon: Users, titleKey: 'gettingStarted.responses.title', descriptionKey: 'gettingStarted.responses.description' },
  { id: 8, icon: BarChart3, titleKey: 'gettingStarted.analytics.title', descriptionKey: 'gettingStarted.analytics.description' },
  { id: 9, icon: PartyPopper, titleKey: 'gettingStarted.complete.title', descriptionKey: 'gettingStarted.complete.description' },
];

export function GettingStartedWizard({ onComplete, onSkip }: GettingStartedWizardProps) {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);

  const { preferences, setGettingStartedCurrentStep, completeGettingStarted, skipGettingStarted } = usePreferencesStore();

  const [currentStep, setCurrentStep] = useState(preferences.onboarding.gettingStartedStep || 0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);

  // Refs for cleanup
  const containerRef = useRef<HTMLDivElement>(null);
  const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    setGettingStartedCurrentStep(currentStep);
  }, [currentStep, setGettingStartedCurrentStep]);

  const handleNext = useCallback(() => {
    if (isAnimating || isSaving) return;
    setIsAnimating(true);
    setDirection(1);
    animationTimerRef.current = setTimeout(() => {
      setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
      setIsAnimating(false);
    }, 150);
  }, [isAnimating, isSaving]);

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
      await preferencesApi.updatePreferences({
        onboarding: {
          hasCompletedGettingStarted: true,
          gettingStartedStep: STEPS.length - 1,
          gettingStartedCompletedAt: new Date().toISOString(),
        },
      });
      completeGettingStarted();
      toast.success(t('gettingStarted.completedSuccessfully', "You're ready to create amazing surveys!"));
      onComplete?.();
    } catch (err) {
      console.error('Failed to save getting started progress:', err);
      setError(t('gettingStarted.errors.saveFailed', 'Failed to save progress. Please try again.'));
      toast.error(t('gettingStarted.errors.saveFailed', 'Failed to save progress'));
    } finally {
      setIsSaving(false);
    }
  }, [completeGettingStarted, onComplete, t]);

  const handleSkip = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    try {
      await preferencesApi.updatePreferences({
        onboarding: {
          hasCompletedGettingStarted: true,
          gettingStartedStep: currentStep,
          gettingStartedCompletedAt: new Date().toISOString(),
        },
      });
      skipGettingStarted();
      onSkip?.();
    } catch (err) {
      console.error('Failed to skip getting started:', err);
      skipGettingStarted();
      onSkip?.();
    } finally {
      setIsSaving(false);
    }
  }, [currentStep, skipGettingStarted, onSkip]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) {
        handleSkip();
        return;
      }

      if (e.key === 'Enter' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        if (currentStep === STEPS.length - 1) {
          handleComplete();
        } else {
          handleNext();
        }
      }

      if (e.key === 'ArrowRight' && !isAnimating) {
        handleNext();
      }

      if (e.key === 'ArrowLeft' && !isAnimating && currentStep > 0) {
        handleBack();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, isSaving, isAnimating, handleSkip, handleComplete, handleNext, handleBack]);

  const progress = useMemo(() => ((currentStep + 1) / STEPS.length) * 100, [currentStep]);
  const step = STEPS[currentStep];
  const StepIcon = step.icon;
  const isLastStep = currentStep === STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  // Animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep userName={user?.firstName || t('gettingStarted.defaultUser', 'there')} />;
      case 1:
        return <WorkspaceStep />;
      case 2:
        return <CreateSurveyStep />;
      case 3:
        return <QuestionsStep />;
      case 4:
        return <ThemesStep />;
      case 5:
        return <PreviewStep />;
      case 6:
        return <DistributeStep />;
      case 7:
        return <ResponsesStep />;
      case 8:
        return <AnalyticsStep />;
      case 9:
        return <CompleteStep userName={user?.firstName || t('gettingStarted.defaultUser', 'there')} />;
      default:
        return null;
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="getting-started-title"
      aria-describedby="getting-started-description"
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

        {/* Skip button */}
        {!isLastStep && (
          <div className="absolute top-4 right-4 z-20">
            <Button
              variant="text"
              size="sm"
              onClick={handleSkip}
              disabled={isSaving}
              className="text-on-surface-variant hover:text-on-surface"
              aria-label={t('gettingStarted.skipAriaLabel', 'Skip getting started guide')}
            >
              {t('gettingStarted.skip', "I'll explore on my own")}
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
                id="getting-started-title"
                key={`title-${currentStep}`}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-2xl font-bold text-on-surface"
              >
                {t(step.titleKey)}
              </motion.h2>
              <motion.p
                id="getting-started-description"
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
          <nav aria-label={t('gettingStarted.stepNavigation', 'Guide steps')}>
            <div className="flex items-center justify-center gap-1.5 mt-6" role="tablist">
              {STEPS.map((s, idx) => (
                <motion.div
                  key={s.id}
                  role="tab"
                  aria-selected={idx === currentStep}
                  aria-label={t('gettingStarted.stepLabel', 'Step {{current}} of {{total}}', { current: idx + 1, total: STEPS.length })}
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    idx === currentStep ? 'w-6 bg-primary' : idx < currentStep ? 'w-2 bg-primary/60' : 'w-2 bg-outline-variant/50'
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
        <div className="px-8 py-6 min-h-85" role="tabpanel" aria-labelledby="getting-started-title">
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
              {t('common.back', 'Back')}
            </Button>

            {isLastStep ? (
              <Button variant="filled" onClick={handleComplete} disabled={isSaving} loading={isSaving} className="min-w-40">
                <Rocket className="h-4 w-4 mr-2" />
                {t('gettingStarted.startCreating', 'Start Creating')}
              </Button>
            ) : (
              <Button variant="filled" onClick={handleNext} disabled={isAnimating || isSaving} loading={isSaving}>
                {t('common.next', 'Next')}
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

// ============ Step Components ============

function WelcomeStep({ userName }: { userName: string }) {
  const { t } = useTranslation();

  const workflowSteps = [
    { icon: ClipboardList, label: t('gettingStarted.welcome.steps.create', 'Create') },
    { icon: Share2, label: t('gettingStarted.welcome.steps.share', 'Share') },
    { icon: BarChart3, label: t('gettingStarted.welcome.steps.analyze', 'Analyze') },
  ];

  return (
    <div className="text-center py-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary-container/30 mb-6"
      >
        <Rocket className="h-12 w-12 text-primary" />
      </motion.div>

      <motion.h3
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-on-surface mb-3"
      >
        {t('gettingStarted.welcome.greeting', "Let's get you started, {{name}}!", { name: userName })}
      </motion.h3>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-on-surface-variant max-w-md mx-auto leading-relaxed mb-8"
      >
        {t(
          'gettingStarted.welcome.message',
          'This quick guide will walk you through the essential steps to create, distribute, and analyze your surveys.'
        )}
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-4"
      >
        {workflowSteps.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center">
                <item.icon className="h-7 w-7 text-primary" />
              </div>
              <span className="text-sm font-medium text-on-surface">{item.label}</span>
            </div>
            {idx < workflowSteps.length - 1 && <ArrowRight className="h-5 w-5 text-outline-variant -mt-6" />}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function WorkspaceStep() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 rounded-2xl bg-primary-container/30 flex items-center justify-center">
          <Building2 className="h-10 w-10 text-primary" />
        </div>
      </div>

      <p className="text-center text-on-surface-variant leading-relaxed">
        {t(
          'gettingStarted.workspace.intro',
          'Workspaces help you organize surveys by team, project, or client. Think of them as folders for your work.'
        )}
      </p>

      <div className="bg-surface-container/50 rounded-2xl p-5 border border-outline-variant/30">
        <h4 className="font-semibold text-on-surface mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          {t('gettingStarted.workspace.benefits.title', 'Workspace Benefits')}
        </h4>
        <ul className="space-y-2">
          {[
            t('gettingStarted.workspace.benefits.organize', 'Organize surveys by project or team'),
            t('gettingStarted.workspace.benefits.collaborate', 'Invite team members to collaborate'),
            t('gettingStarted.workspace.benefits.separate', 'Keep client work separate'),
          ].map((benefit, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-on-surface-variant">
              <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-sm text-on-surface-variant text-center">
        {t('gettingStarted.workspace.hint', 'You can access workspaces from the sidebar or navigation menu.')}
      </p>
    </div>
  );
}

function CreateSurveyStep() {
  const { t } = useTranslation();

  const creationMethods = [
    {
      icon: Plus,
      title: t('gettingStarted.createSurvey.methods.scratch.title', 'Start from Scratch'),
      description: t('gettingStarted.createSurvey.methods.scratch.desc', 'Build a custom survey with full control'),
    },
    {
      icon: FileStack,
      title: t('gettingStarted.createSurvey.methods.template.title', 'Use a Template'),
      description: t('gettingStarted.createSurvey.methods.template.desc', 'Start with pre-built survey templates'),
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-center text-on-surface-variant leading-relaxed">
        {t('gettingStarted.createSurvey.intro', 'Ready to create? You have two options to get started:')}
      </p>

      <div className="grid gap-4">
        {creationMethods.map((method, idx) => (
          <motion.div
            key={idx}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: idx * 0.15 }}
            className="flex items-start gap-4 p-4 rounded-2xl bg-surface-container/50 border border-outline-variant/30"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-container/30 flex items-center justify-center shrink-0">
              <method.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-on-surface">{method.title}</h4>
              <p className="text-sm text-on-surface-variant mt-1">{method.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-on-surface-variant">
        <Keyboard className="h-4 w-4" />
        <span>{t('gettingStarted.createSurvey.shortcut', 'Pro tip: Press Ctrl+N to quickly create a new survey')}</span>
      </div>
    </div>
  );
}

function QuestionsStep() {
  const { t } = useTranslation();

  const questionTypes = [
    { label: t('gettingStarted.questions.types.multipleChoice', 'Multiple Choice'), icon: Circle },
    { label: t('gettingStarted.questions.types.text', 'Text Answer'), icon: FileStack },
    { label: t('gettingStarted.questions.types.rating', 'Rating Scale'), icon: TrendingUp },
    { label: t('gettingStarted.questions.types.nps', 'NPS Score'), icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <p className="text-center text-on-surface-variant leading-relaxed">
        {t('gettingStarted.questions.intro', 'The Survey Builder supports 10+ question types. Here are some popular ones:')}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {questionTypes.map((qType, idx) => (
          <motion.div
            key={idx}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-surface-container/50 border border-outline-variant/30"
          >
            <div className="w-10 h-10 rounded-lg bg-primary-container/30 flex items-center justify-center">
              <qType.icon className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-on-surface">{qType.label}</span>
          </motion.div>
        ))}
      </div>

      <div className="bg-surface-container/50 rounded-2xl p-4 border border-outline-variant/30">
        <h4 className="font-semibold text-on-surface mb-2 text-sm">{t('gettingStarted.questions.builderFeatures.title', 'Builder Features')}</h4>
        <ul className="space-y-1.5 text-sm text-on-surface-variant">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            {t('gettingStarted.questions.builderFeatures.dragDrop', 'Drag & drop to reorder questions')}
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            {t('gettingStarted.questions.builderFeatures.autosave', 'Autosave keeps your work safe')}
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            {t('gettingStarted.questions.builderFeatures.undoRedo', 'Undo/Redo with Ctrl+Z / Ctrl+Y')}
          </li>
        </ul>
      </div>
    </div>
  );
}

function ThemesStep() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 rounded-2xl bg-primary-container/30 flex items-center justify-center">
          <Palette className="h-10 w-10 text-primary" />
        </div>
      </div>

      <p className="text-center text-on-surface-variant leading-relaxed">
        {t('gettingStarted.themes.intro', 'Make your surveys visually appealing with custom themes. Matching your brand has never been easier.')}
      </p>

      <div className="bg-surface-container/50 rounded-2xl p-5 border border-outline-variant/30">
        <h4 className="font-semibold text-on-surface mb-3">{t('gettingStarted.themes.customize.title', 'Customize Everything')}</h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            t('gettingStarted.themes.customize.colors', 'Brand colors'),
            t('gettingStarted.themes.customize.fonts', 'Typography'),
            t('gettingStarted.themes.customize.logo', 'Logo placement'),
            t('gettingStarted.themes.customize.background', 'Backgrounds'),
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-on-surface-variant">
              <Check className="h-4 w-4 text-primary" />
              {item}
            </div>
          ))}
        </div>
      </div>

      <p className="text-sm text-on-surface-variant text-center">
        {t('gettingStarted.themes.hint', 'Access Themes from the sidebar to create reusable designs.')}
      </p>
    </div>
  );
}

function PreviewStep() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 rounded-2xl bg-primary-container/30 flex items-center justify-center">
          <Eye className="h-10 w-10 text-primary" />
        </div>
      </div>

      <p className="text-center text-on-surface-variant leading-relaxed">
        {t('gettingStarted.preview.intro', 'Always preview your survey before sharing! See exactly what respondents will experience.')}
      </p>

      <div className="bg-surface-container/50 rounded-2xl p-5 border border-outline-variant/30">
        <h4 className="font-semibold text-on-surface mb-3">{t('gettingStarted.preview.features.title', 'Preview Features')}</h4>
        <ul className="space-y-2">
          {[
            t('gettingStarted.preview.features.desktop', 'Desktop & mobile views'),
            t('gettingStarted.preview.features.test', 'Test the survey as a respondent'),
            t('gettingStarted.preview.features.logic', 'Verify question logic flows'),
          ].map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm text-on-surface-variant">
              <Check className="h-4 w-4 text-primary" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-sm text-on-surface-variant text-center">
        {t('gettingStarted.preview.hint', 'Click the Preview button in the Survey Builder toolbar.')}
      </p>
    </div>
  );
}

function DistributeStep() {
  const { t } = useTranslation();

  const distributionMethods = [
    {
      icon: Link2,
      title: t('gettingStarted.distribute.methods.link.title', 'Share Link'),
      description: t('gettingStarted.distribute.methods.link.desc', 'Copy and paste anywhere'),
    },
    {
      icon: Mail,
      title: t('gettingStarted.distribute.methods.email.title', 'Email Campaign'),
      description: t('gettingStarted.distribute.methods.email.desc', 'Send to your contact list'),
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-center text-on-surface-variant leading-relaxed">
        {t('gettingStarted.distribute.intro', 'Once your survey is ready, publish it and share with your audience.')}
      </p>

      <div className="grid gap-4">
        {distributionMethods.map((method, idx) => (
          <motion.div
            key={idx}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: idx * 0.15 }}
            className="flex items-start gap-4 p-4 rounded-2xl bg-surface-container/50 border border-outline-variant/30"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-container/30 flex items-center justify-center shrink-0">
              <method.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-on-surface">{method.title}</h4>
              <p className="text-sm text-on-surface-variant mt-1">{method.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-sm text-on-surface-variant text-center">
        {t('gettingStarted.distribute.hint', 'Access Distribute from the sidebar to manage all your survey links.')}
      </p>
    </div>
  );
}

function ResponsesStep() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 rounded-2xl bg-primary-container/30 flex items-center justify-center">
          <Users className="h-10 w-10 text-primary" />
        </div>
      </div>

      <p className="text-center text-on-surface-variant leading-relaxed">
        {t('gettingStarted.responses.intro', 'Watch responses come in real-time! Every submission is captured and stored securely.')}
      </p>

      <div className="bg-surface-container/50 rounded-2xl p-5 border border-outline-variant/30">
        <h4 className="font-semibold text-on-surface mb-3">{t('gettingStarted.responses.features.title', 'Response Management')}</h4>
        <ul className="space-y-2">
          {[
            t('gettingStarted.responses.features.realtime', 'Real-time response notifications'),
            t('gettingStarted.responses.features.individual', 'View individual responses'),
            t('gettingStarted.responses.features.export', 'Export to CSV or Excel'),
          ].map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm text-on-surface-variant">
              <Check className="h-4 w-4 text-primary" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function AnalyticsStep() {
  const { t } = useTranslation();

  const analyticsFeatures = [
    { icon: PieChart, label: t('gettingStarted.analytics.features.charts', 'Charts & Graphs') },
    { icon: TrendingUp, label: t('gettingStarted.analytics.features.trends', 'Trends Over Time') },
    { icon: Download, label: t('gettingStarted.analytics.features.export', 'Export Reports') },
  ];

  return (
    <div className="space-y-6">
      <p className="text-center text-on-surface-variant leading-relaxed">
        {t('gettingStarted.analytics.intro', 'Turn raw data into actionable insights with powerful analytics.')}
      </p>

      <div className="flex justify-center gap-4">
        {analyticsFeatures.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center">
              <feature.icon className="h-7 w-7 text-primary" />
            </div>
            <span className="text-xs font-medium text-on-surface-variant text-center">{feature.label}</span>
          </motion.div>
        ))}
      </div>

      <div className="bg-surface-container/50 rounded-2xl p-5 border border-outline-variant/30">
        <h4 className="font-semibold text-on-surface mb-3">{t('gettingStarted.analytics.insights.title', 'Get Insights On')}</h4>
        <ul className="space-y-2">
          {[
            t('gettingStarted.analytics.insights.completion', 'Completion rates'),
            t('gettingStarted.analytics.insights.response', 'Response patterns'),
            t('gettingStarted.analytics.insights.nps', 'NPS scores & benchmarks'),
          ].map((item, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm text-on-surface-variant">
              <Check className="h-4 w-4 text-primary" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CompleteStep({ userName }: { userName: string }) {
  const { t } = useTranslation();

  const quickActions = [
    { icon: ClipboardList, label: t('gettingStarted.complete.actions.surveys', 'Surveys'), shortcut: 'G S' },
    { icon: FileStack, label: t('gettingStarted.complete.actions.templates', 'Templates'), shortcut: 'G T' },
    { icon: BarChart3, label: t('gettingStarted.complete.actions.analytics', 'Analytics'), shortcut: 'G A' },
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
          <PartyPopper className="h-12 w-12 text-success" />
        </motion.div>
      </motion.div>

      <motion.h3
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-on-surface mb-3"
      >
        {t('gettingStarted.complete.ready', "You're all set, {{name}}!", { name: userName })}
      </motion.h3>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-on-surface-variant max-w-md mx-auto leading-relaxed mb-6"
      >
        {t('gettingStarted.complete.message', 'You now know the essentials. Start creating surveys and gathering valuable insights!')}
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-surface-container/50 rounded-2xl p-4 border border-outline-variant/30"
      >
        <h4 className="text-sm font-semibold text-on-surface mb-3 flex items-center justify-center gap-2">
          <Keyboard className="h-4 w-4" />
          {t('gettingStarted.complete.shortcuts.title', 'Quick Navigation Shortcuts')}
        </h4>
        <div className="flex justify-center gap-4">
          {quickActions.map((action, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                <action.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs text-on-surface-variant">{action.label}</span>
              <kbd className="text-[10px] bg-surface-container-high px-1.5 py-0.5 rounded text-on-surface-variant font-mono">{action.shortcut}</kbd>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default GettingStartedWizard;
