import { useTranslation } from 'react-i18next';
import { LoadingIndicator } from '@/components/ui';
import { ErrorScreen } from '@/components/features/public-survey';
import { PublicSurveyLayout } from '../components/PublicSurveyLayout';

interface LoadingSectionProps {
  title?: string;
}

export function LoadingSection({ title }: LoadingSectionProps) {
  const { t } = useTranslation();

  return (
    <PublicSurveyLayout title={title}>
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingIndicator size="lg" label={t('publicSurveyPage.loading')} />
      </div>
    </PublicSurveyLayout>
  );
}

interface ErrorSectionProps {
  message: string;
  onRetry: () => void;
}

export function ErrorSection({ message, onRetry }: ErrorSectionProps) {
  return (
    <PublicSurveyLayout>
      <ErrorScreen message={message} onRetry={onRetry} />
    </PublicSurveyLayout>
  );
}
