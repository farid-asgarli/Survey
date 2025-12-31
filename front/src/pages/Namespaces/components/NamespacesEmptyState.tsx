import { useTranslation } from 'react-i18next';
import { ListEmptyState } from '@/components/ui';
import { Building2 } from 'lucide-react';
import type { NamespacesEmptyStateProps } from '../types';

/**
 * Empty state component for namespaces with translations
 */
export function NamespacesEmptyState({ hasActiveFilters, onClearFilters, onCreateItem }: NamespacesEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <ListEmptyState
      icon={<Building2 className="h-7 w-7" />}
      entityName={t('workspaces.workspace')}
      hasActiveFilters={hasActiveFilters}
      onClearFilters={onClearFilters}
      onCreateItem={onCreateItem}
      title={hasActiveFilters ? undefined : t('workspaces.welcome')}
      description={hasActiveFilters ? t('workspaces.tryAdjustSearch') : t('workspaces.welcomeDescription')}
      createActionLabel={t('workspaces.createFirst')}
    />
  );
}
