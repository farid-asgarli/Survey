import { useTranslation } from 'react-i18next';
import { ClipboardList } from 'lucide-react';
import { EmptyState } from '@/components/ui';

interface ResponsesEmptyStateProps {
  hasFilters: boolean;
}

export function ResponsesEmptyState({ hasFilters }: ResponsesEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <EmptyState
      icon={<ClipboardList className="h-7 w-7" />}
      title={hasFilters ? t('responses.noFound') : t('responses.noResponses')}
      description={hasFilters ? t('responses.noFoundDesc') : t('responses.noResponsesDesc')}
      iconVariant={hasFilters ? 'default' : 'muted'}
    />
  );
}
