/**
 * SurveysHeader - Header section for the surveys page
 */

import { useTranslation } from 'react-i18next';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';
import { ListPageLayout } from '@/components/layout/ListPageLayout';
import { renderPageIcon } from '@/config';

interface SurveysHeaderProps {
  totalCount: number;
  isLoading: boolean;
  isRefetching: boolean;
  onRefresh: () => void;
  onCreateSurvey: () => void;
}

export function SurveysHeader({ totalCount, isLoading, isRefetching, onRefresh, onCreateSurvey }: SurveysHeaderProps) {
  const { t } = useTranslation();

  return (
    <ListPageLayout.Header
      title={t('surveys.title')}
      description={isLoading ? t('common.loading') : t('surveys.count', { count: totalCount })}
      icon={renderPageIcon('surveys')}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="text" size="sm" onClick={onRefresh} disabled={isRefetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </Button>
          <Button className="hidden md:flex" onClick={onCreateSurvey}>
            <Plus className="h-4 w-4 mr-2" />
            {t('surveys.createSurvey')}
          </Button>
        </div>
      }
    />
  );
}
