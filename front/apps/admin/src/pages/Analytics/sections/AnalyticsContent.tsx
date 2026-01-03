import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { AnalyticsSummaryCards, ResponseTrendChart, NPSGauge, QuestionAnalyticsCard } from '@/components/features/analytics';
import { cn } from '@/lib/utils';
import { NpsCategory } from '@/types/enums';
import type { SurveyAnalytics, SurveyNpsSummary, QuestionAnalytics, NpsQuestion } from '@/types';

interface AnalyticsContentProps {
  analytics?: SurveyAnalytics;
  npsData?: SurveyNpsSummary;
}

export function AnalyticsContent({ analytics, npsData }: AnalyticsContentProps) {
  const { t } = useTranslation();
  const hasNpsQuestions = npsData?.questions && npsData.questions.length > 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <AnalyticsSummaryCards analytics={analytics} />

      {/* Charts Row */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Response Trend */}
        <ResponseTrendChart data={analytics?.responsesByDate} title={t('analytics.responseTrend')} description={t('analytics.responseTrendDesc')} />

        {/* NPS Gauge or Completion Chart */}
        {hasNpsQuestions && npsData?.overallScore ? (
          <NPSGauge data={npsData.overallScore} />
        ) : (
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>{t('analytics.responseDistribution')}</CardTitle>
              <CardDescription>{t('analytics.completionBreakdown')}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-6">
              <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                {/* Simple completion pie */}
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="20" className="text-surface-container" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="20"
                      strokeDasharray={`${(analytics?.completionRate || 0) * 2.51} 251`}
                      className="text-success transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-on-surface">{Math.round(analytics?.completionRate || 0)}%</span>
                  </div>
                </div>
                <div className="flex gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span className="text-on-surface-variant">
                      {t('analytics.completed')} ({analytics?.completedResponses || 0})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-surface-container" />
                    <span className="text-on-surface-variant">
                      {t('analytics.partial')} ({analytics?.partialResponses || 0})
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Question Analytics */}
      {analytics?.questions && analytics.questions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-on-surface">{t('analytics.questionInsights')}</h2>
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {analytics.questions.map((question: QuestionAnalytics) => (
              <QuestionAnalyticsCard key={question.questionId} question={question} />
            ))}
          </div>
        </div>
      )}

      {/* NPS Questions (if multiple) */}
      {npsData?.questions && npsData.questions.length > 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-on-surface">{t('analytics.npsQuestions')}</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {npsData.questions.map((npsQuestion: NpsQuestion) => (
              <Card key={npsQuestion.questionId} variant="outlined">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium line-clamp-2">{npsQuestion.questionText}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-on-surface">{Math.round(npsQuestion.score.score)}</span>
                    <span
                      className={cn(
                        'px-2 py-1 rounded text-xs font-medium',
                        npsQuestion.score.category === NpsCategory.Excellent && 'bg-success-container text-on-success-container',
                        npsQuestion.score.category === NpsCategory.Great && 'bg-info-container text-on-info-container',
                        npsQuestion.score.category === NpsCategory.Good && 'bg-warning-container text-on-warning-container',
                        npsQuestion.score.category === NpsCategory.NeedsImprovement && 'bg-error-container text-on-error-container'
                      )}
                    >
                      {npsQuestion.score.categoryDescription || npsQuestion.score.category}
                    </span>
                  </div>
                  <div className="flex gap-3 mt-3 text-xs text-on-surface-variant">
                    <span>👍 {npsQuestion.score.promoters}</span>
                    <span>😐 {npsQuestion.score.passives}</span>
                    <span>👎 {npsQuestion.score.detractors}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
