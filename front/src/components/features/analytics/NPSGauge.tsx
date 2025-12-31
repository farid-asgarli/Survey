import { Smile, Meh, Frown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';
import { NpsCategory } from '@/types/enums';
import type { NpsScore } from '@/types';

export interface NPSGaugeProps {
  data?: NpsScore;
  isLoading?: boolean;
  className?: string;
  showBreakdown?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const categoryColors: Record<NpsCategory, string> = {
  [NpsCategory.NeedsImprovement]: 'text-error',
  [NpsCategory.Good]: 'text-warning',
  [NpsCategory.Great]: 'text-info',
  [NpsCategory.Excellent]: 'text-success',
};

const categoryBgColors: Record<NpsCategory, string> = {
  [NpsCategory.NeedsImprovement]: 'bg-error-container text-on-error-container',
  [NpsCategory.Good]: 'bg-warning-container text-on-warning-container',
  [NpsCategory.Great]: 'bg-info-container text-on-info-container',
  [NpsCategory.Excellent]: 'bg-success-container text-on-success-container',
};

export function NPSGauge({ data, isLoading, className, showBreakdown = true, size = 'md' }: NPSGaugeProps) {
  const { t } = useTranslation();
  const sizeClasses = {
    sm: { gauge: 'w-32 h-16', score: 'text-xl', label: 'text-xs' },
    md: { gauge: 'w-48 h-24', score: 'text-3xl', label: 'text-sm' },
    lg: { gauge: 'w-64 h-32', score: 'text-4xl', label: 'text-base' },
  };

  if (isLoading) {
    return (
      <Card variant="elevated" className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent className="flex items-center justify-center py-6">
          <Skeleton className="w-48 h-24 rounded-t-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card variant="elevated" className={className}>
        <CardHeader>
          <CardTitle>{t('analytics.npsScore')}</CardTitle>
          <CardDescription>{t('analytics.npsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-40 items-center justify-center text-on-surface-variant">{t('analytics.noNpsData')}</div>
        </CardContent>
      </Card>
    );
  }

  // NPS ranges from -100 to 100
  const score = Math.round(data.score);
  const percentage = ((score + 100) / 200) * 100;
  const rotation = (percentage - 50) * 1.8; // Convert to degrees (-90 to 90)

  return (
    <Card variant="elevated" className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('analytics.npsScore')}</CardTitle>
            <CardDescription>{t('analytics.npsDescription')}</CardDescription>
          </div>
          {data.category && (
            <span className={cn('px-2 py-1 rounded-lg text-xs font-medium', categoryBgColors[data.category])}>
              {data.categoryDescription || data.category}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center py-4">
        {/* Gauge */}
        <div className="relative">
          <div className={cn('relative overflow-hidden', sizeClasses[size].gauge)}>
            {/* Background arc with gradient */}
            <div className="absolute inset-0 rounded-t-full bg-linear-to-r from-error via-warning to-success" />
            {/* Inner cutout */}
            <div className="absolute inset-3 rounded-t-full bg-surface" />

            {/* Score indicator needle */}
            <div
              className="absolute bottom-0 left-1/2 w-1 h-[calc(100%-12px)] bg-on-surface origin-bottom transition-transform duration-500 rounded-full"
              style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
            >
              {/* Needle head */}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-on-surface" />
            </div>
          </div>

          {/* Score display */}
          <div className="text-center -mt-2">
            <p className={cn('font-bold', sizeClasses[size].score, categoryColors[data.category])}>{score}</p>
            <p className={cn('text-on-surface-variant', sizeClasses[size].label)}>NPS Score</p>
          </div>
        </div>

        {/* Legend */}
        {showBreakdown && (
          <>
            <div className="flex justify-between w-full mt-6 text-xs text-on-surface-variant">
              <div className="flex items-center gap-1">
                <Frown className="h-4 w-4 text-error" />
                <span>{t('analytics.detractors')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Meh className="h-4 w-4 text-warning" />
                <span>{t('analytics.passives')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Smile className="h-4 w-4 text-success" />
                <span>{t('analytics.promoters')}</span>
              </div>
            </div>

            {/* Breakdown bars */}
            <div className="w-full mt-4 space-y-2">
              {/* Stacked bar */}
              <div className="flex h-3 rounded-full overflow-hidden bg-surface-container">
                <div className="bg-error transition-all duration-500" style={{ width: `${data.detractorPercentage}%` }} />
                <div className="bg-warning transition-all duration-500" style={{ width: `${data.passivePercentage}%` }} />
                <div className="bg-success transition-all duration-500" style={{ width: `${data.promoterPercentage}%` }} />
              </div>

              {/* Percentages */}
              <div className="flex justify-between text-xs">
                <div className="text-error">
                  <span className="font-medium">{Math.round(data.detractorPercentage)}%</span>
                  <span className="text-on-surface-variant ml-1">({data.detractors})</span>
                </div>
                <div className="text-warning">
                  <span className="font-medium">{Math.round(data.passivePercentage)}%</span>
                  <span className="text-on-surface-variant ml-1">({data.passives})</span>
                </div>
                <div className="text-success">
                  <span className="font-medium">{Math.round(data.promoterPercentage)}%</span>
                  <span className="text-on-surface-variant ml-1">({data.promoters})</span>
                </div>
              </div>

              {/* Total responses */}
              <p className="text-center text-xs text-on-surface-variant mt-2">
                Based on {data.totalResponses} response{data.totalResponses !== 1 ? 's' : ''}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
