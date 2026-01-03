import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent, Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { AnswerOptionStats } from '@/types';
import { CHART_COLORS, getPrimaryColorWithOpacity } from '@/config';

export interface ChoiceChartProps {
  questionText: string;
  data?: AnswerOptionStats[];
  totalAnswers: number;
  isLoading?: boolean;
  className?: string;
  variant?: 'bar' | 'pie';
  colorScheme?: 'primary' | 'mixed';
}

export function ChoiceChart({ questionText, data, totalAnswers, isLoading, className, variant = 'bar', colorScheme = 'primary' }: ChoiceChartProps) {
  const { t } = useTranslation();
  // Sort by count descending
  const sortedData = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => b.count - a.count);
  }, [data]);

  const maxCount = Math.max(...(sortedData?.map((d) => d.count) || []), 1);

  if (isLoading) {
    return (
      <Card variant='outlined' className={className}>
        <CardHeader className='pb-3'>
          <Skeleton className='h-5 w-3/4' />
        </CardHeader>
        <CardContent className='space-y-3'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='space-y-2'>
              <Skeleton className='h-4 w-1/3' />
              <Skeleton className='h-6 w-full' />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!sortedData.length) {
    return (
      <Card variant='outlined' className={className}>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base font-medium line-clamp-2'>{questionText}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-on-surface-variant'>{t('charts.noResponsesYet')}</p>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'pie') {
    return (
      <Card variant='outlined' className={className}>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base font-medium line-clamp-2'>{questionText}</CardTitle>
          <p className='text-xs text-on-surface-variant'>{t('charts.responseCount', { count: totalAnswers })}</p>
        </CardHeader>
        <CardContent>
          <div className='flex items-start gap-4'>
            {/* Pie chart */}
            <div className='relative w-24 h-24 shrink-0'>
              <svg viewBox='0 0 100 100' className='transform -rotate-90'>
                {
                  sortedData.reduce(
                    (acc, item, index) => {
                      const startAngle = acc.currentAngle;
                      const angle = (item.percentage / 100) * 360;
                      const endAngle = startAngle + angle;

                      // Calculate arc path
                      const x1 = 50 + 45 * Math.cos((startAngle * Math.PI) / 180);
                      const y1 = 50 + 45 * Math.sin((startAngle * Math.PI) / 180);
                      const x2 = 50 + 45 * Math.cos((endAngle * Math.PI) / 180);
                      const y2 = 50 + 45 * Math.sin((endAngle * Math.PI) / 180);
                      const largeArc = angle > 180 ? 1 : 0;

                      const colorClass =
                        colorScheme === 'mixed'
                          ? CHART_COLORS[index % CHART_COLORS.length].replace('bg-', '')
                          : index === 0
                          ? 'primary'
                          : `primary/${Math.max(30, 100 - index * 15)}`;

                      acc.paths.push(
                        <path
                          key={index}
                          d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          className={cn('transition-opacity hover:opacity-80', `fill-${colorClass}`)}
                          style={{
                            fill: colorScheme === 'primary' ? getPrimaryColorWithOpacity(index) : undefined,
                          }}
                        />
                      );
                      acc.currentAngle = endAngle;
                      return acc;
                    },
                    { paths: [] as React.JSX.Element[], currentAngle: 0 }
                  ).paths
                }
              </svg>
            </div>

            {/* Legend */}
            <div className='flex-1 space-y-1.5 overflow-hidden'>
              {sortedData.slice(0, 5).map((item, index) => (
                <div key={item.optionId} className='flex items-center gap-2 text-sm'>
                  <div
                    className={cn('w-3 h-3 rounded-sm shrink-0', colorScheme === 'mixed' ? CHART_COLORS[index % CHART_COLORS.length] : 'bg-primary')}
                    style={colorScheme === 'primary' ? { opacity: Math.max(0.3, 1 - index * 0.15) } : undefined}
                  />
                  <span className='truncate text-on-surface'>{item.option}</span>
                  <span className='text-on-surface-variant ml-auto shrink-0'>{Math.round(item.percentage)}%</span>
                </div>
              ))}
              {sortedData.length > 5 && <p className='text-xs text-on-surface-variant'>{t('charts.moreOptions', { count: sortedData.length - 5 })}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default: Bar chart
  return (
    <Card variant='outlined' className={className}>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base font-medium line-clamp-2'>{questionText}</CardTitle>
        <p className='text-xs text-on-surface-variant'>{t('charts.responseCount', { count: totalAnswers })}</p>
      </CardHeader>
      <CardContent className='space-y-3'>
        {sortedData.map((item, index) => (
          <div key={item.optionId} className='space-y-1.5'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-on-surface truncate flex-1 mr-2'>{item.option}</span>
              <span className='text-on-surface-variant shrink-0'>
                {item.count} ({Math.round(item.percentage)}%)
              </span>
            </div>
            <div className='h-2 bg-surface-container rounded-full overflow-hidden'>
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500 ease-out',
                  colorScheme === 'mixed' ? CHART_COLORS[index % CHART_COLORS.length] : 'bg-primary'
                )}
                style={{
                  width: `${(item.count / maxCount) * 100}%`,
                  opacity: colorScheme === 'primary' ? Math.max(0.4, 1 - index * 0.1) : 1,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
