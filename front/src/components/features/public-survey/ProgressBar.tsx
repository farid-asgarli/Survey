// Progress Bar - Shows survey completion progress

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export function ProgressBar({ current, total, className }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between items-center text-sm">
        <span className="text-on-surface-variant">
          Question {current} of {total}
        </span>
        <span className="text-primary font-semibold">{percentage}%</span>
      </div>
      <div className="h-2 rounded-full bg-surface-container-highest overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all duration-500 ease-out" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

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
        />
      ))}
    </div>
  );
}
