import { useTranslation } from 'react-i18next';
import { Calendar, Users } from 'lucide-react';
import { Card, Skeleton } from '@/components/ui';
import { parseRelativeTime } from '@/utils';
import { useDateTimeFormatter } from '@/hooks';
import { useUpcomingRuns } from '@/hooks/queries/useRecurringSurveys';

export function UpcomingRunsPreview() {
  const { t } = useTranslation();
  const { formatDateTime } = useDateTimeFormatter();
  const { data: upcomingRuns, isLoading } = useUpcomingRuns(5);

  if (isLoading) {
    return (
      <Card variant='outlined' className='p-5 mb-6'>
        <div className='flex items-center gap-3 mb-4'>
          <Skeleton className='h-10 w-10 rounded-xl' />
          <Skeleton className='h-5 w-32' />
        </div>
        <div className='space-y-3'>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className='h-16 rounded-xl' />
          ))}
        </div>
      </Card>
    );
  }

  if (!upcomingRuns || upcomingRuns.length === 0) {
    return null;
  }

  return (
    <Card variant='outlined' className='p-5 mb-6'>
      <div className='flex items-center gap-3 mb-4'>
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container/50'>
          <Calendar className='h-5 w-5 text-primary' />
        </div>
        <div>
          <h3 className='font-semibold text-on-surface'>{t('recurringSurveys.upcomingRuns')}</h3>
          <p className='text-xs text-on-surface-variant'>{upcomingRuns.length} scheduled</p>
        </div>
      </div>
      <div className='space-y-2'>
        {upcomingRuns.map((run, index) => {
          const relTime = parseRelativeTime(run.scheduledAt);
          return (
            <div
              key={`${run.recurringSurveyId}-${index}`}
              className='flex items-center gap-3 p-3 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors'
              title={formatDateTime(run.scheduledAt)}
            >
              {/* Time indicator */}
              <div className='flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 shrink-0'>
                {relTime ? (
                  <>
                    {relTime.prefix && <span className='text-xs font-medium text-primary/70'>{relTime.prefix}</span>}
                    <span className='text-sm font-bold text-primary'>{relTime.value}</span>
                    {relTime.unit && <span className='text-xs font-medium text-primary/70'>{relTime.unit}</span>}
                  </>
                ) : (
                  <span className='text-xs font-medium text-primary'>{t('recurringSurveys.soon')}</span>
                )}
              </div>

              {/* Content */}
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-medium text-on-surface truncate'>{run.recurringSurveyName}</p>
                <p className='text-xs text-on-surface-variant truncate'>{run.surveyTitle}</p>
              </div>

              {/* Recipients badge */}
              <div className='flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-xs text-on-surface-variant shrink-0'>
                <Users className='h-3 w-3' />
                <span>{run.estimatedRecipients}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
