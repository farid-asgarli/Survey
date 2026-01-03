import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LogoIcon } from './Logo';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

// ============================================================================
// M3 Expressive App Loading Screen
// Beautiful, animated loading screen with multi-stage progress tracking
// ============================================================================

/** Loading stage definition */
export interface LoadingStage {
  /** Unique identifier for the stage */
  id: string;
  /** Localization key or display label */
  label: string;
  /** Whether this stage is complete */
  isComplete: boolean;
  /** Whether this stage is currently active */
  isActive: boolean;
}

export interface AppLoadingScreenProps {
  /** Optional loading message (legacy support) */
  message?: string;
  /** Show progress indicator */
  showProgress?: boolean;
  /** Loading stages for multi-step progress (new API) */
  stages?: LoadingStage[];
  /** Current active stage index (auto-calculated if stages provided) */
  currentStage?: number;
}

// Animated decorative shapes
function DecorativeShapes() {
  return (
    <div className='absolute inset-0 overflow-hidden pointer-events-none'>
      {/* Large primary orb - top right */}
      <div
        className='absolute -top-32 -right-32 w-96 h-96 rounded-full bg-linear-to-br from-primary/20 to-tertiary/10 blur-3xl'
        style={{ animation: 'pulse-slow 4s ease-in-out infinite' }}
      />

      {/* Secondary orb - bottom left */}
      <div
        className='absolute -bottom-40 -left-40 w-125 h-125 rounded-full bg-linear-to-tr from-tertiary/15 to-secondary/10 blur-3xl'
        style={{ animation: 'pulse-slow 5s ease-in-out infinite', animationDelay: '1s' }}
      />

      {/* Floating accent circles */}
      <div className='absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-primary/40 animate-float' style={{ animationDelay: '0s' }} />
      <div className='absolute top-1/3 right-1/3 w-3 h-3 rounded-full bg-tertiary/50 animate-float' style={{ animationDelay: '0.5s' }} />
      <div className='absolute bottom-1/3 left-1/3 w-5 h-5 rounded-full bg-secondary/30 animate-float' style={{ animationDelay: '1s' }} />
      <div className='absolute bottom-1/4 right-1/4 w-2 h-2 rounded-full bg-primary/60 animate-float' style={{ animationDelay: '1.5s' }} />
    </div>
  );
}

// Animated logo with ripple effect
function AnimatedLogo() {
  return (
    <div className='relative'>
      {/* Ripple rings */}
      <div className='absolute inset-0 flex items-center justify-center'>
        <div className='absolute w-24 h-24 rounded-full border-2 border-primary/20 animate-ripple' style={{ animationDelay: '0s' }} />
        <div className='absolute w-24 h-24 rounded-full border-2 border-primary/15 animate-ripple' style={{ animationDelay: '0.5s' }} />
        <div className='absolute w-24 h-24 rounded-full border-2 border-primary/10 animate-ripple' style={{ animationDelay: '1s' }} />
      </div>

      {/* Main logo container */}
      <div className='relative w-20 h-20 rounded-3xl bg-linear-to-br from-primary via-primary to-primary/80 ring-4 ring-primary/20 flex items-center justify-center animate-logo-breathe'>
        <LogoIcon size='xl' className='w-12 h-12' />

        {/* Shine effect */}
        <div className='absolute inset-0 rounded-3xl overflow-hidden'>
          <div className='absolute inset-0 bg-linear-to-tr from-transparent via-white/20 to-transparent -translate-x-full animate-shine' />
        </div>
      </div>
    </div>
  );
}

// Animated loading dots
function LoadingDots() {
  return (
    <div className='flex items-center gap-1.5'>
      {[0, 1, 2].map((i) => (
        <div key={i} className='w-2 h-2 rounded-full bg-primary animate-bounce-dot' style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );
}

// Progress bar component
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className='w-48 h-1.5 bg-surface-container-highest rounded-full overflow-hidden'>
      <div className='h-full bg-linear-to-r from-primary to-tertiary rounded-full transition-all duration-500 ease-out' style={{ width: `${progress}%` }} />
    </div>
  );
}

// Multi-stage progress indicator
function StageIndicator({ stages }: { stages: LoadingStage[] }) {
  const { t } = useTranslation();

  return (
    <div className='flex flex-col items-center gap-3 w-full max-w-xs'>
      {/* Stage pills */}
      <div className='flex items-center gap-2'>
        {stages.map((stage, index) => (
          <div key={stage.id} className='flex items-center gap-2'>
            <div
              className={cn(
                'w-2.5 h-2.5 rounded-full transition-all duration-500',
                stage.isComplete && 'bg-primary scale-100',
                stage.isActive && !stage.isComplete && 'bg-primary/60 animate-pulse scale-110',
                !stage.isActive && !stage.isComplete && 'bg-surface-container-highest scale-100'
              )}
            />
            {index < stages.length - 1 && (
              <div className={cn('w-6 h-0.5 rounded-full transition-all duration-500', stage.isComplete ? 'bg-primary' : 'bg-surface-container-highest')} />
            )}
          </div>
        ))}
      </div>

      {/* Current stage label with animated transition */}
      <div className='h-5 flex items-center justify-center overflow-hidden'>
        {stages.map((stage) => (
          <span
            key={stage.id}
            className={cn(
              'text-xs font-medium text-on-surface-variant transition-all duration-300 absolute',
              stage.isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            )}
          >
            {stage.isComplete ? (
              <span className='flex items-center gap-1.5 text-primary'>
                <Check className='w-3 h-3' />
                {t(stage.label, stage.label)}
              </span>
            ) : (
              t(stage.label, stage.label)
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

// Stage-based progress bar
function StageProgressBar({ stages }: { stages: LoadingStage[] }) {
  const completedStages = stages.filter((s) => s.isComplete).length;
  const activeStage = stages.find((s) => s.isActive);

  // Calculate progress: completed stages + partial progress on active stage
  const baseProgress = (completedStages / stages.length) * 100;
  const activeProgress = activeStage && !activeStage.isComplete ? (1 / stages.length) * 50 : 0;
  const totalProgress = Math.min(baseProgress + activeProgress, 95);

  return (
    <div className='w-56 h-1 bg-surface-container-highest rounded-full overflow-hidden'>
      <div
        className='h-full bg-linear-to-r from-primary via-primary to-tertiary rounded-full transition-all duration-700 ease-out'
        style={{ width: `${totalProgress}%` }}
      />
    </div>
  );
}

export function AppLoadingScreen({ message, showProgress = true, stages }: AppLoadingScreenProps) {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState(t('common.initializing'));

  // Determine if using stages or legacy mode
  const useStages = stages && stages.length > 0;

  // Simulate loading progress (only for legacy mode without stages)
  useEffect(() => {
    if (useStages) return; // Skip simulation if using stages

    const texts = [t('common.initializing'), t('common.loadingResources'), t('common.preparingWorkspace'), t('common.almostReady')];
    let currentIndex = 0;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 400);

    const textInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % texts.length;
      setLoadingText(texts[currentIndex]);
    }, 1500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
    };
  }, [useStages, t]);

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-surface'>
      <DecorativeShapes />

      {/* Main content */}
      <div className='relative z-10 flex flex-col items-center'>
        {/* Animated logo */}
        <AnimatedLogo />

        {/* App name */}
        <h1 className='mt-8 text-2xl font-bold text-on-surface'>{t('common.appName')}</h1>

        {/* Loading message */}
        <div className='mt-4 flex items-center gap-2 text-on-surface-variant'>
          {useStages ? (
            <StageIndicator stages={stages} />
          ) : (
            <>
              <span className='text-sm font-medium'>{message || loadingText}</span>
              <LoadingDots />
            </>
          )}
        </div>

        {/* Progress bar */}
        {showProgress && <div className='mt-6'>{useStages ? <StageProgressBar stages={stages} /> : <ProgressBar progress={progress} />}</div>}
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
          50% { transform: translateY(-20px) scale(1.1); opacity: 1; }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes ripple {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .animate-ripple {
          animation: ripple 2s ease-out infinite;
        }

        @keyframes logo-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-logo-breathe {
          animation: logo-breathe 2s ease-in-out infinite;
        }

        @keyframes shine {
          0% { transform: translateX(-100%) rotate(12deg); }
          100% { transform: translateX(200%) rotate(12deg); }
        }
        .animate-shine {
          animation: shine 3s ease-in-out infinite;
        }

        @keyframes bounce-dot {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        .animate-bounce-dot {
          animation: bounce-dot 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// Minimal Loading Spinner - For smaller loading states
// ============================================================================

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const spinnerSizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <div className={cn('relative', spinnerSizes[size], className)}>
      {/* Outer ring */}
      <div className='absolute inset-0 rounded-full border-2 border-primary/20' />
      {/* Spinning arc */}
      <div className='absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin' />
    </div>
  );
}

// ============================================================================
// Page Transition Loader - For route transitions
// ============================================================================

export function PageTransitionLoader() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-surface'>
      <div className='flex flex-col items-center gap-4'>
        <div className='relative'>
          {/* Pulsing background */}
          <div className='absolute inset-0 w-16 h-16 rounded-2xl bg-primary/10 animate-ping' />
          {/* Logo */}
          <div className='relative w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-primary/80 flex items-center justify-center ring-2 ring-primary/20'>
            <LogoIcon size='lg' />
          </div>
        </div>
        <LoadingSpinner size='sm' />
      </div>
    </div>
  );
}

export default AppLoadingScreen;
