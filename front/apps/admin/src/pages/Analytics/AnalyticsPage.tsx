import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout';
import { getDefaultDateRange, type DateRange } from '@/components/features/analytics';
import { useSurveyAnalytics, useSurveyNps } from '@/hooks/queries/useAnalytics';
import { useSurveysList } from '@/hooks/queries/useSurveys';
import {
  AnalyticsHeader,
  AnalyticsFilters,
  AnalyticsContent,
  NoSurveySelected,
  ErrorState,
  LoadingState,
  NoResponsesState,
} from './sections';

export function AnalyticsPage() {
  const { t } = useTranslation();
  const { surveyId: urlSurveyId } = useParams<{ surveyId?: string }>();
  const navigate = useNavigate();

  const [selectedSurveyId, setSelectedSurveyId] = useState<string>(urlSurveyId || '');
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());

  // Fetch surveys for dropdown
  const { data: surveysData, isLoading: surveysLoading } = useSurveysList({ status: 'all' });

  // Get the active survey ID (from URL or selection)
  const activeSurveyId = urlSurveyId || selectedSurveyId;

  // Fetch analytics data
  const {
    data: analytics,
    isLoading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useSurveyAnalytics(activeSurveyId || undefined);

  // Fetch NPS data (will be empty if survey has no NPS questions)
  const { data: npsData } = useSurveyNps(activeSurveyId || undefined);

  // Build survey options for dropdown
  const surveyOptions = useMemo(() => {
    const options = [{ value: '', label: t('analytics.selectSurvey') }];

    if (surveysData?.items) {
      surveysData.items.forEach((survey) => {
        options.push({
          value: survey.id,
          label: `${survey.title} (${survey.responseCount} ${t('surveys.responses')})`,
        });
      });
    }

    return options;
  }, [surveysData, t]);

  // Find selected survey
  const selectedSurvey = surveysData?.items?.find((s) => s.id === activeSurveyId);

  // Handle survey selection from dropdown
  const handleSurveyChange = (value: string) => {
    setSelectedSurveyId(value);
    if (value) {
      navigate(`/analytics/${value}`, { replace: true });
    } else {
      navigate('/analytics', { replace: true });
    }
  };

  // Handle export
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export analytics for survey:', activeSurveyId);
  };

  const isLoading = surveysLoading || (activeSurveyId && analyticsLoading);

  return (
    <Layout>
      <div className='flex flex-col h-full'>
        {/* Header */}
        <AnalyticsHeader
          selectedSurvey={selectedSurvey}
          activeSurveyId={activeSurveyId}
          analyticsLoading={analyticsLoading}
          onRefresh={() => refetchAnalytics()}
          onExport={handleExport}
        />

        {/* Filters Bar */}
        <AnalyticsFilters
          showSurveySelector={!urlSurveyId}
          surveyOptions={surveyOptions}
          selectedSurveyId={selectedSurveyId}
          surveysLoading={surveysLoading}
          dateRange={dateRange}
          onSurveyChange={handleSurveyChange}
          onDateRangeChange={setDateRange}
        />

        {/* Content */}
        <div className='flex-1 overflow-auto p-4 md:px-6 md:pb-6'>
          {!activeSurveyId ? (
            <NoSurveySelected />
          ) : analyticsError ? (
            <ErrorState onRetry={() => refetchAnalytics()} />
          ) : isLoading ? (
            <LoadingState />
          ) : analytics?.totalResponses === 0 ? (
            <NoResponsesState surveyId={activeSurveyId} onViewSurvey={(id) => navigate(`/surveys/${id}`)} />
          ) : (
            <AnalyticsContent analytics={analytics} npsData={npsData} />
          )}
        </div>
      </div>
    </Layout>
  );
}
