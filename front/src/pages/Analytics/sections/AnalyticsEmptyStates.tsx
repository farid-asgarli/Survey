import { useTranslation } from 'react-i18next';
import { BarChart3, FileText, AlertCircle } from 'lucide-react';
import { EmptyState, Skeleton } from '@/components/ui';

export function NoSurveySelected() {
  const { t } = useTranslation();

  return (
    <EmptyState
      icon={<BarChart3 className="h-7 w-7" />}
      title={t('analytics.selectSurveyTitle')}
      description={t('analytics.selectSurveyDesc')}
      iconVariant="default"
      size="full"
    />
  );
}

interface ErrorStateProps {
  onRetry: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <EmptyState
      icon={<AlertCircle className="h-7 w-7" />}
      title={t('analytics.loadError')}
      description={t('analytics.loadErrorDesc')}
      iconVariant="muted"
      size="full"
      action={{
        label: t('errors.tryAgain'),
        onClick: onRetry,
      }}
    />
  );
}

export function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
      <Skeleton className="h-48 rounded-2xl" />
    </div>
  );
}

interface NoResponsesStateProps {
  surveyId: string;
  onViewSurvey: (surveyId: string) => void;
}

export function NoResponsesState({ surveyId, onViewSurvey }: NoResponsesStateProps) {
  const { t } = useTranslation();

  return (
    <EmptyState
      icon={<FileText className="h-7 w-7" />}
      title={t('analytics.noResponses')}
      description={t('analytics.noResponsesDesc')}
      iconVariant="muted"
      size="full"
      action={{
        label: t('analytics.viewSurvey'),
        onClick: () => onViewSurvey(surveyId),
      }}
    />
  );
}
