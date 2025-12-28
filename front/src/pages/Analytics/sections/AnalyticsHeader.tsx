import { Download, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { renderPageIcon } from '@/config';
import { cn } from '@/lib/utils';
import type { Survey } from '@/types';

interface AnalyticsHeaderProps {
  selectedSurvey?: Survey;
  activeSurveyId?: string;
  analyticsLoading: boolean;
  onRefresh: () => void;
  onExport: () => void;
}

export function AnalyticsHeader({ selectedSurvey, activeSurveyId, analyticsLoading, onRefresh, onExport }: AnalyticsHeaderProps) {
  const { t } = useTranslation();

  return (
    <PageHeader
      title={selectedSurvey ? selectedSurvey.title : t('analytics.title')}
      description={selectedSurvey ? t('analytics.description') : t('analytics.selectSurveyDesc')}
      icon={renderPageIcon('analytics')}
      actions={
        <div className="flex items-center gap-2">
          {activeSurveyId && (
            <>
              <Button variant="text" size="sm" onClick={onRefresh} disabled={analyticsLoading}>
                <RefreshCw className={cn('h-4 w-4', analyticsLoading && 'animate-spin')} />
              </Button>
              <Button variant="outline" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                {t('responses.export')}
              </Button>
            </>
          )}
        </div>
      }
    />
  );
}
