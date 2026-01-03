import { Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'info';
  onClick?: () => void;
}

export function StatCard({ title, value, subtitle, icon, color, onClick }: StatCardProps) {
  const colorClasses = {
    primary: {
      container: 'bg-primary-container/40 border-primary/20 hover:border-primary/40',
      icon: 'bg-primary/15 text-primary border-primary/25',
      text: 'text-primary',
    },
    secondary: {
      container: 'bg-secondary-container/40 border-secondary/20 hover:border-secondary/40',
      icon: 'bg-secondary/15 text-secondary border-secondary/25',
      text: 'text-secondary',
    },
    tertiary: {
      container: 'bg-tertiary-container/40 border-tertiary/20 hover:border-tertiary/40',
      icon: 'bg-tertiary/15 text-tertiary border-tertiary/25',
      text: 'text-tertiary',
    },
    success: {
      container: 'bg-success-container/40 border-success/20 hover:border-success/40',
      icon: 'bg-success/15 text-success border-success/25',
      text: 'text-success',
    },
    warning: {
      container: 'bg-warning-container/40 border-warning/20 hover:border-warning/40',
      icon: 'bg-warning/15 text-warning border-warning/25',
      text: 'text-warning',
    },
    info: {
      container: 'bg-info-container/40 border-info/20 hover:border-info/40',
      icon: 'bg-info/15 text-info border-info/25',
      text: 'text-info',
    },
  };

  const classes = colorClasses[color];

  return (
    <Card
      variant="outlined"
      shape="rounded"
      className={cn('border-2 transition-colors duration-200', classes.container, onClick && 'cursor-pointer')}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-on-surface-variant mb-1">{title}</p>
            <p className={cn('text-3xl font-bold tracking-tight', classes.text)}>{value}</p>
            {subtitle && <p className="text-xs text-on-surface-variant mt-1.5">{subtitle}</p>}
          </div>
          <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl border-2 shrink-0', classes.icon)}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
