import { cn } from '@/lib/utils';
import { SurveyStatus, getSurveyStatusLabel } from '@/types';
import { getSurveyStatusStyle } from '@/config';

interface SurveyStatusBadgeProps {
  status: SurveyStatus;
  size?: 'sm' | 'default';
  className?: string;
}

export function SurveyStatusBadge({ status, size = 'default', className }: SurveyStatusBadgeProps) {
  const config = getSurveyStatusStyle(status);

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
