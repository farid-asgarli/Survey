import { useTranslation } from 'react-i18next';
import { Users, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { StatCard } from './StatCard';
import { Skeleton } from '@/components/ui';
import { formatDuration } from '@/utils';
import type { SurveyAnalytics } from '@/types';

export interface AnalyticsSummaryCardsProps {
  analytics?: SurveyAnalytics;
  isLoading?: boolean;
  className?: string;
}

export function AnalyticsSummaryCards({ analytics, isLoading, className }: AnalyticsSummaryCardsProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className={className}>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={className}>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          <StatCard title={t('analyticsSummary.totalResponses')} value="—" icon={Users} />
          <StatCard title={t('analyticsSummary.completionRate')} value="—" icon={CheckCircle2} />
          <StatCard title={t('analyticsSummary.avgCompletionTime')} value="—" icon={Clock} />
          <StatCard title={t('analyticsSummary.partialResponses')} value="—" icon={TrendingUp} />
        </div>
      </div>
    );
  }

  const completionRate = analytics.completionRate;
  const avgTime = analytics.averageCompletionTimeSeconds;

  return (
    <div className={className}>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <StatCard
          title={t('analyticsSummary.totalResponses')}
          value={analytics.totalResponses.toLocaleString()}
          icon={Users}
          subtitle={analytics.completedResponses > 0 ? t('analyticsSummary.completed', { count: analytics.completedResponses }) : undefined}
        />
        <StatCard
          title={t('analyticsSummary.completionRate')}
          value={`${Math.round(completionRate)}%`}
          icon={CheckCircle2}
          subtitle={
            completionRate >= 80
              ? t('analyticsSummary.excellent')
              : completionRate >= 60
              ? t('analyticsSummary.good')
              : completionRate >= 40
              ? t('analyticsSummary.average')
              : t('analyticsSummary.needsImprovement')
          }
        />
        <StatCard title={t('analyticsSummary.avgCompletionTime')} value={avgTime > 0 ? formatDuration(avgTime) : '—'} icon={Clock} />
        <StatCard
          title={t('analyticsSummary.partialResponses')}
          value={analytics.partialResponses.toLocaleString()}
          icon={TrendingUp}
          subtitle={analytics.partialResponses > 0 ? t('analyticsSummary.incompleteSubmissions') : t('analyticsSummary.none')}
        />
      </div>
    </div>
  );
}
