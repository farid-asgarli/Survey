import { useTranslation } from 'react-i18next';
import { FileText, Plus, Send, BarChart3, ArrowRight } from 'lucide-react';
import { Button, Card, CardContent, EmptyState } from '@/components/ui';
import { useViewTransitionNavigate } from '@/hooks';
import { RecentSurveyItem } from './RecentSurveyItem';
import { QuickAction } from './QuickAction';
import type { Survey } from '@/types';

interface DashboardContentProps {
  recentSurveys: Survey[];
}

export function DashboardContent({ recentSurveys }: DashboardContentProps) {
  const { t } = useTranslation();
  const navigate = useViewTransitionNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Recent Surveys */}
      <div className="lg:col-span-2">
        <Card variant="outlined" shape="rounded" className="border-2 border-outline-variant/30">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-on-surface">{t('dashboard.recentSurveys')}</h2>
              <Button variant="text" size="sm" onClick={() => navigate('/surveys')}>
                {t('common.viewAll')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            {recentSurveys.length > 0 ? (
              <div className="-mx-5 divide-y divide-outline-variant/30">
                {recentSurveys.map((survey) => (
                  <RecentSurveyItem key={survey.id} survey={survey} onClick={() => navigate(`/surveys/${survey.id}/edit`)} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FileText className="h-7 w-7" />}
                title={t('dashboard.noSurveysYet')}
                description={t('dashboard.createFirstSurvey')}
                iconVariant="muted"
                action={{
                  label: t('dashboard.createSurvey'),
                  onClick: () => navigate('/surveys?create=true'),
                  icon: <Plus className="h-4 w-4" />,
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6">
        {/* Quick Actions */}
        <Card variant="outlined" shape="rounded" className="border-2 border-outline-variant/30">
          <CardContent className="p-5">
            <h2 className="text-lg font-bold text-on-surface mb-2">{t('dashboard.quickActions')}</h2>
            <div className="-mx-5 divide-y divide-outline-variant/30">
              <QuickAction
                icon={<Plus className="h-5 w-5" />}
                label={t('dashboard.createSurvey')}
                description={t('dashboard.startFromScratch')}
                onClick={() => navigate('/surveys?create=true')}
              />
              <QuickAction
                icon={<FileText className="h-5 w-5" />}
                label={t('dashboard.useTemplate')}
                description={t('dashboard.preBuiltTemplates')}
                onClick={() => navigate('/templates')}
              />
              <QuickAction
                icon={<Send className="h-5 w-5" />}
                label={t('dashboard.distribute')}
                description={t('dashboard.shareYourSurveys')}
                onClick={() => navigate('/distributions')}
              />
              <QuickAction
                icon={<BarChart3 className="h-5 w-5" />}
                label={t('dashboard.viewAnalytics')}
                description={t('dashboard.insightsReports')}
                onClick={() => navigate('/analytics')}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
