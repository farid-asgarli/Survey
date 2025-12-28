import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { AnswerOptionStats } from '@/types';

export interface RatingChartProps {
  questionText: string;
  data?: AnswerOptionStats[];
  totalAnswers: number;
  averageValue?: number;
  minValue?: number;
  maxValue?: number;
  isLoading?: boolean;
  className?: string;
  showStars?: boolean;
}

export function RatingChart({
  questionText,
  data,
  totalAnswers,
  averageValue,
  minValue = 1,
  maxValue = 5,
  isLoading,
  className,
  showStars = true,
}: RatingChartProps) {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <Card variant='outlined' className={className}>
        <CardHeader className='pb-3'>
          <Skeleton className='h-5 w-3/4' />
        </CardHeader>
        <CardContent>
          <Skeleton className='h-12 w-24 mx-auto mb-4' />
          <div className='space-y-2'>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className='h-6 w-full' />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.length) {
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

  // Sort by option value (rating number)
  const sortedData = [...data].sort((a, b) => {
    const aVal = parseInt(a.option, 10);
    const bVal = parseInt(b.option, 10);
    return bVal - aVal; // Descending (5 stars first)
  });

  const maxCount = Math.max(...sortedData.map((d) => d.count), 1);
  const range = maxValue - minValue + 1;

  // Color based on rating position in range
  const getBarColor = (rating: number) => {
    const position = (rating - minValue) / (maxValue - minValue);
    if (position >= 0.8) return 'bg-success';
    if (position >= 0.6) return 'bg-info';
    if (position >= 0.4) return 'bg-warning';
    return 'bg-error';
  };

  return (
    <Card variant='outlined' className={className}>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base font-medium line-clamp-2'>{questionText}</CardTitle>
        <p className='text-xs text-on-surface-variant'>{t('charts.responseCount', { count: totalAnswers })}</p>
      </CardHeader>
      <CardContent>
        {/* Average rating display */}
        {averageValue !== undefined && (
          <div className='flex flex-col items-center mb-6'>
            <div className='flex items-center gap-2'>
              <span className='text-4xl font-bold text-on-surface'>{averageValue.toFixed(1)}</span>
              {showStars && <Star className='h-8 w-8 text-warning fill-warning' />}
            </div>
            <p className='text-sm text-on-surface-variant'>{t('charts.averageRatingOutOf', { max: maxValue })}</p>

            {/* Star visualization */}
            {showStars && range <= 10 && (
              <div className='flex gap-1 mt-2'>
                {Array.from({ length: range }, (_, i) => {
                  const starValue = minValue + i;
                  const filled = starValue <= Math.round(averageValue);
                  const partial = !filled && starValue - 0.5 <= averageValue;
                  return (
                    <Star
                      key={i}
                      className={cn(
                        'h-5 w-5 transition-colors',
                        filled ? 'text-warning fill-warning' : partial ? 'text-warning fill-warning/50' : 'text-outline-variant'
                      )}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Distribution bars */}
        <div className='space-y-2'>
          {sortedData.map((item, index) => {
            const rating = parseInt(item.option, 10);
            return (
              <div key={index} className='flex items-center gap-3'>
                {/* Rating label */}
                <div className='flex items-center gap-1 w-12 shrink-0'>
                  <span className='text-sm font-medium text-on-surface'>{item.option}</span>
                  {showStars && range <= 5 && <Star className='h-3.5 w-3.5 text-warning fill-warning' />}
                </div>

                {/* Bar */}
                <div className='flex-1 h-3 bg-surface-container rounded-full overflow-hidden'>
                  <div
                    className={cn('h-full rounded-full transition-all duration-500 ease-out', getBarColor(rating))}
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  />
                </div>

                {/* Count and percentage */}
                <div className='text-sm text-on-surface-variant w-20 text-right shrink-0'>
                  {item.count} ({Math.round(item.percentage)}%)
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
