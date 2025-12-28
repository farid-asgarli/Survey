import { useTranslation } from 'react-i18next';
import { FileText, Users, Clock, TrendingUp } from 'lucide-react';
import { useViewTransitionNavigate } from '@/hooks';
import { StatCard } from './StatCard';

interface DashboardStatsProps {
  stats: {
    total: number;
    published: number;
    drafts: number;
    totalResponses: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const { t } = useTranslation();
  const navigate = useViewTransitionNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title={t('dashboard.stats.totalSurveys')}
        value={stats.total}
        subtitle={t('dashboard.stats.allTimeSurveys')}
        icon={<FileText className="h-5 w-5" />}
        color="primary"
        onClick={() => navigate('/surveys')}
      />
      <StatCard
        title={t('dashboard.stats.activeSurveys')}
        value={stats.published}
        subtitle={t('dashboard.stats.currentlyCollecting')}
        icon={<TrendingUp className="h-5 w-5" />}
        color="success"
        onClick={() => navigate('/surveys?status=Published')}
      />
      <StatCard
        title={t('dashboard.stats.draftSurveys')}
        value={stats.drafts}
        subtitle={t('dashboard.stats.readyToPublish')}
        icon={<Clock className="h-5 w-5" />}
        color="warning"
        onClick={() => navigate('/surveys?status=Draft')}
      />
      <StatCard
        title={t('dashboard.stats.totalResponses')}
        value={stats.totalResponses.toLocaleString()}
        subtitle={t('dashboard.stats.acrossAllSurveys')}
        icon={<Users className="h-5 w-5" />}
        color="info"
        onClick={() => navigate('/responses')}
      />
    </div>
  );
}
