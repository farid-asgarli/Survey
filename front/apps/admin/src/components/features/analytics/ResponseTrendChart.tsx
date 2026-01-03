import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface ResponseTrendChartProps {
  data: Record<string, number> | undefined;
  isLoading?: boolean;
  className?: string;
  title?: string;
  description?: string;
}

export function ResponseTrendChart({ data, isLoading, className, title, description }: ResponseTrendChartProps) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t('analytics.responseTrend');
  const resolvedDescription = description ?? t('analytics.responseTrendDesc');
  // Transform the data into an array sorted by date
  const chartData = useMemo(() => {
    if (!data) return [];

    return Object.entries(data)
      .map(([date, count]) => ({
        date,
        count,
        // Format date for display (short month/day)
        label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14); // Show last 14 days
  }, [data]);

  const maxCount = Math.max(...chartData.map((d) => d.count), 1);
  const totalResponses = chartData.reduce((sum, d) => sum + d.count, 0);

  if (isLoading) {
    return (
      <Card variant="elevated" className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!chartData.length) {
    return (
      <Card variant="elevated" className={className}>
        <CardHeader>
          <CardTitle>{resolvedTitle}</CardTitle>
          <CardDescription>{resolvedDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-40 items-center justify-center text-on-surface-variant">{t('analytics.noResponseData')}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{resolvedTitle}</CardTitle>
            <CardDescription>{resolvedDescription}</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-on-surface">{totalResponses}</p>
            <p className="text-xs text-on-surface-variant">{t('analytics.totalResponses')}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Simple bar chart */}
        <div className="flex items-end gap-1 sm:gap-2 h-40">
          {chartData.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              {/* Tooltip on hover */}
              <div className="relative group flex-1 w-full flex items-end">
                <div
                  className={cn('w-full rounded-t-lg transition-all duration-300 ease-out', 'bg-primary hover:bg-primary/80', 'cursor-pointer')}
                  style={{
                    height: `${Math.max((item.count / maxCount) * 100, 4)}%`,
                  }}
                />
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-surface-container-highest text-on-surface text-xs rounded-lg px-2 py-1 whitespace-nowrap border-2 border-outline-variant">
                    <p className="font-medium">{t('analytics.responsesCount', { count: item.count })}</p>
                    <p className="text-on-surface-variant">{item.label}</p>
                  </div>
                </div>
              </div>
              {/* X-axis label - show every other label on small screens */}
              <span
                className={cn(
                  'text-[10px] sm:text-xs text-on-surface-variant truncate max-w-full',
                  index % 2 !== 0 && chartData.length > 7 ? 'hidden sm:block' : ''
                )}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
