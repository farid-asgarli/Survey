import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// M3 Expressive App Loading Screen
// Beautiful, animated loading screen for initial app load
// ============================================================================

export interface AppLoadingScreenProps {
  /** Optional loading message */
  message?: string;
  /** Show progress indicator */
  showProgress?: boolean;
}

// Animated decorative shapes
function DecorativeShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large primary orb - top right */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-linear-to-br from-primary/20 to-tertiary/10 blur-3xl"
        style={{ animation: 'pulse-slow 4s ease-in-out infinite' }}
      />

      {/* Secondary orb - bottom left */}
      <div
        className="absolute -bottom-40 -left-40 w-125 h-125 rounded-full bg-linear-to-tr from-tertiary/15 to-secondary/10 blur-3xl"
        style={{ animation: 'pulse-slow 5s ease-in-out infinite', animationDelay: '1s' }}
      />

      {/* Floating accent circles */}
      <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-primary/40 animate-float" style={{ animationDelay: '0s' }} />
      <div className="absolute top-1/3 right-1/3 w-3 h-3 rounded-full bg-tertiary/50 animate-float" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-1/3 left-1/3 w-5 h-5 rounded-full bg-secondary/30 animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-2 h-2 rounded-full bg-primary/60 animate-float" style={{ animationDelay: '1.5s' }} />
    </div>
  );
}

// Animated logo with ripple effect
function AnimatedLogo() {
  return (
    <div className="relative">
      {/* Ripple rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute w-24 h-24 rounded-full border-2 border-primary/20 animate-ripple" style={{ animationDelay: '0s' }} />
        <div className="absolute w-24 h-24 rounded-full border-2 border-primary/15 animate-ripple" style={{ animationDelay: '0.5s' }} />
        <div className="absolute w-24 h-24 rounded-full border-2 border-primary/10 animate-ripple" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main logo container */}
      <div className="relative w-20 h-20 rounded-3xl bg-linear-to-br from-primary via-primary to-primary/80 shadow-2xl shadow-primary/30 flex items-center justify-center animate-logo-breathe">
        <Sparkles className="w-10 h-10 text-on-primary" />

        {/* Shine effect */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/20 to-transparent -translate-x-full animate-shine" />
        </div>
      </div>
    </div>
  );
}

// Animated loading dots
function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="w-2 h-2 rounded-full bg-primary animate-bounce-dot" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );
}

// Progress bar component
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-48 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
      <div
        className="h-full bg-linear-to-r from-primary to-tertiary rounded-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function AppLoadingScreen({ message, showProgress = true }: AppLoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing');

  // Simulate loading progress
  useEffect(() => {
    const texts = ['Initializing', 'Loading resources', 'Preparing your workspace', 'Almost ready'];
    let currentIndex = 0;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90; // Cap at 90%, actual completion will set to 100%
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
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface">
      <DecorativeShapes />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated logo */}
        <AnimatedLogo />

        {/* App name */}
        <h1 className="mt-8 text-2xl font-bold text-on-surface">SurveyApp</h1>

        {/* Loading message */}
        <div className="mt-4 flex items-center gap-2 text-on-surface-variant">
          <span className="text-sm font-medium">{message || loadingText}</span>
          <LoadingDots />
        </div>

        {/* Progress bar */}
        {showProgress && (
          <div className="mt-6">
            <ProgressBar progress={progress} />
          </div>
        )}
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
      <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
      {/* Spinning arc */}
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
    </div>
  );
}

// ============================================================================
// Page Transition Loader - For route transitions
// ============================================================================

export function PageTransitionLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Pulsing background */}
          <div className="absolute inset-0 w-16 h-16 rounded-2xl bg-primary/10 animate-ping" />
          {/* Logo */}
          <div className="relative w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
            <Sparkles className="w-8 h-8 text-on-primary" />
          </div>
        </div>
        <LoadingSpinner size="sm" />
      </div>
    </div>
  );
}

export default AppLoadingScreen;
