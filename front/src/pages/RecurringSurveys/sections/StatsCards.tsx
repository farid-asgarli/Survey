import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, Play, Pause, CheckCircle2 } from 'lucide-react';
import { Card, Skeleton } from '@/components/ui';
import type { RecurringSurveyListItem } from '@/types';

interface StatsCardsProps {
  recurringSurveys: RecurringSurveyListItem[];
  isLoading: boolean;
}

export function StatsCards({ recurringSurveys, isLoading }: StatsCardsProps) {
  const { t } = useTranslation();

  const stats = useMemo(() => {
    const active = recurringSurveys.filter((rs) => rs.isActive).length;
    const inactive = recurringSurveys.filter((rs) => !rs.isActive).length;
    const totalRuns = recurringSurveys.reduce((sum, rs) => sum + rs.totalRuns, 0);
    return { total: recurringSurveys.length, active, inactive, totalRuns };
  }, [recurringSurveys]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <Card variant="filled" className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container/50">
            <RefreshCw className="h-5 w-5 text-on-primary-container" />
          </div>
          <div>
            <p className="text-2xl font-bold text-on-surface">{stats.total}</p>
            <p className="text-xs text-on-surface-variant">{t('recurringSurveys.stats.total')}</p>
          </div>
        </div>
      </Card>

      <Card variant="filled" className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-container/50">
            <Play className="h-5 w-5 text-on-success-container" />
          </div>
          <div>
            <p className="text-2xl font-bold text-success">{stats.active}</p>
            <p className="text-xs text-on-surface-variant">{t('recurringSurveys.stats.active')}</p>
          </div>
        </div>
      </Card>

      <Card variant="filled" className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-container/50">
            <Pause className="h-5 w-5 text-on-warning-container" />
          </div>
          <div>
            <p className="text-2xl font-bold text-warning">{stats.inactive}</p>
            <p className="text-xs text-on-surface-variant">{t('recurringSurveys.stats.paused')}</p>
          </div>
        </div>
      </Card>

      <Card variant="filled" className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info-container/50">
            <CheckCircle2 className="h-5 w-5 text-on-info-container" />
          </div>
          <div>
            <p className="text-2xl font-bold text-info">{stats.totalRuns}</p>
            <p className="text-xs text-on-surface-variant">{t('recurringSurveys.stats.totalRuns')}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
