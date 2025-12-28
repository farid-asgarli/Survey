import { useTranslation } from 'react-i18next';
import { createListEmptyState } from '@/components/ui';
import { Building2 } from 'lucide-react';
import type { NamespacesEmptyStateProps } from '../types';

/**
 * Empty state component for namespaces with translations
 */
export function NamespacesEmptyState({ hasActiveFilters, onClearFilters, onCreateItem }: NamespacesEmptyStateProps) {
  const { t } = useTranslation();

  const EmptyStateComponent = createListEmptyState({
    icon: <Building2 className="h-7 w-7" />,
    entityName: t('workspaces.workspace'),
    entityNamePlural: t('workspaces.workspaces'),
    emptyTitle: t('workspaces.welcome'),
    emptyDescription: t('workspaces.welcomeDescription'),
    createActionLabel: t('workspaces.createFirst'),
    filteredDescription: t('workspaces.tryAdjustSearch'),
  });

  return <EmptyStateComponent hasActiveFilters={hasActiveFilters} onClearFilters={onClearFilters} onCreateItem={onCreateItem} />;
}
