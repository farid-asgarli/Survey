import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout';
import { useSurveysList } from '@/hooks';
import { useNamespaceStore, useAuthStore } from '@/stores';
import { getCurrentHour } from '@/utils';
import { SurveyStatus } from '@/types';
import { DashboardHero, DashboardStats, DashboardContent, DashboardSkeleton } from './sections';

export function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { activeNamespace } = useNamespaceStore();

  // Fetch surveys data
  const { data: surveysResponse, isLoading } = useSurveysList();
  const surveys = useMemo(() => surveysResponse?.items || [], [surveysResponse?.items]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = surveys.length;
    const published = surveys.filter((s) => s.status === SurveyStatus.Published).length;
    const drafts = surveys.filter((s) => s.status === SurveyStatus.Draft).length;
    const totalResponses = surveys.reduce((sum, s) => sum + s.responseCount, 0);

    return { total, published, drafts, totalResponses };
  }, [surveys]);

  // Get recent surveys (last 5)
  const recentSurveys = useMemo(() => {
    return [...surveys].sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()).slice(0, 5);
  }, [surveys]);

  const firstName = user?.firstName || t('common.greetingFallback');
  const greeting = useMemo(() => {
    const hour = getCurrentHour();
    if (hour < 12) return t('dashboard.greeting.morning');
    if (hour < 17) return t('dashboard.greeting.afternoon');
    return t('dashboard.greeting.evening');
  }, [t]);

  return (
    <Layout>
      <DashboardHero firstName={firstName} greeting={greeting} namespaceName={activeNamespace?.name} />

      {/* Main Content */}
      <div className="p-5 md:p-6">
        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <div className="space-y-6">
            <DashboardStats stats={stats} />
            <DashboardContent recentSurveys={recentSurveys} />
          </div>
        )}
      </div>
    </Layout>
  );
}
