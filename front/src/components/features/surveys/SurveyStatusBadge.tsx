import { cn } from '@/lib/utils';
import { SurveyStatus, getSurveyStatusLabel } from '@/types';

interface SurveyStatusBadgeProps {
  status: SurveyStatus;
  size?: 'sm' | 'default';
  className?: string;
}

const statusConfig: Record<SurveyStatus, { className: string; dotColor: string }> = {
  [SurveyStatus.Draft]: {
    className: 'bg-surface-container-high text-on-surface-variant border-2 border-outline-variant',
    dotColor: 'bg-on-surface-variant',
  },
  [SurveyStatus.Published]: {
    className: 'bg-success-container text-on-success-container border-2 border-success/30',
    dotColor: 'bg-success',
  },
  [SurveyStatus.Closed]: {
    className: 'bg-error-container/60 text-on-error-container border-2 border-error/30',
    dotColor: 'bg-error',
  },
  [SurveyStatus.Archived]: {
    className: 'bg-surface-container text-on-surface-variant/70 border-2 border-outline-variant/50',
    dotColor: 'bg-on-surface-variant/50',
  },
};

export function SurveyStatusBadge({ status, size = 'default', className }: SurveyStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full transition-colors',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        config.className,
        className
      )}
    >
      <span className={cn('rounded-full', size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2', config.dotColor)} />
      {getSurveyStatusLabel(status)}
    </span>
  );
}
