import { TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: { value: number; positive: boolean };
  className?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card variant="elevated" className={className}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container/60">
            <Icon className="h-5 w-5 text-on-primary-container" />
          </div>
          {trend && (
            <div className={cn('flex items-center gap-1 text-sm font-medium', trend.positive ? 'text-success' : 'text-error')}>
              <TrendingUp className={cn('h-4 w-4', !trend.positive && 'rotate-180')} />
              <span>
                {trend.value > 0 ? '+' : ''}
                {trend.value}%
              </span>
            </div>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-on-surface">{value}</p>
          <p className="text-sm text-on-surface-variant">{title}</p>
          {subtitle && <p className="text-xs text-on-surface-variant/70 mt-1">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
