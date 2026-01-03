/**
 * Progress Bar - Visual progress indicator for survey completion
 * Matches admin preview styling with multiple display styles
 */

'use client';

import { useMemo } from 'react';
import { ProgressBarStyle } from '@survey/types';
import type { ProgressBarStyle as ProgressBarStyleType } from '@survey/types';
import { cn } from '@survey/ui-primitives';

interface ProgressBarProps {
  progress: number;
  currentQuestion: number;
  totalQuestions: number;
  style?: ProgressBarStyleType;
  showLabel?: boolean;
  progressLabel?: string;
  className?: string;
}

export function ProgressBar({
  progress,
  currentQuestion,
  totalQuestions,
  style = ProgressBarStyle.Bar,
  showLabel = true,
  progressLabel = 'Progress',
  className,
}: ProgressBarProps) {
  const progressPercent = Math.min(100, Math.max(0, progress));

  const label = useMemo(() => {
    switch (style) {
      case ProgressBarStyle.Percentage:
        return `${progressPercent}%`;
      case ProgressBarStyle.Steps:
        return `${currentQuestion + 1} / ${totalQuestions}`;
      default:
        return null;
    }
  }, [style, progressPercent, currentQuestion, totalQuestions]);

  // Hidden style - render nothing
  if (style === ProgressBarStyle.None) {
    return null;
  }

  // Dots style - animated step indicators
  if (style === ProgressBarStyle.Dots) {
    return (
      <div className={cn('flex items-center justify-center gap-1.5 sm:gap-2 py-4', className)}>
        {Array.from({ length: totalQuestions }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-1.5 sm:h-2 rounded-full transition-all duration-300',
              index < currentQuestion
                ? 'w-4 sm:w-6 bg-primary'
                : index === currentQuestion
                  ? 'w-6 sm:w-8 bg-primary'
                  : 'w-1.5 sm:w-2 bg-outline-variant/50'
            )}
            aria-hidden="true"
          />
        ))}
        <span className="sr-only">
          {progressLabel}: {currentQuestion + 1} of {totalQuestions}
        </span>
      </div>
    );
  }

  // Bar style (default) with optional percentage/steps label
  return (
    <div className={cn('w-full space-y-2', className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs sm:text-sm">
          <span className="text-on-surface-variant">{progressLabel}</span>
          <span className="text-primary font-semibold">{label || `${progressPercent}%`}</span>
        </div>
      )}
      <div className="w-full h-1.5 sm:h-2 bg-surface-container-highest rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${progressLabel}: ${progressPercent}%`}
        />
      </div>
    </div>
  );
}

/**
 * Step Indicator - Alternative progress visualization
 * Shows animated pills that expand for current/completed steps
 */
interface StepIndicatorProps {
  current: number;
  total: number;
  className?: string;
}

export function StepIndicator({ current, total, className }: StepIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            'h-1.5 rounded-full transition-all duration-300',
            i < current ? 'w-6 bg-primary' : i === current ? 'w-8 bg-primary' : 'w-1.5 bg-outline-variant/50'
          )}
          aria-hidden="true"
        />
      ))}
      <span className="sr-only">
        Step {current + 1} of {total}
      </span>
    </div>
  );
}
