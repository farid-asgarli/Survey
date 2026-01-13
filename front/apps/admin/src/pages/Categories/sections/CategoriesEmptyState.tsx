/**
 * CategoriesEmptyState - Empty state for categories page
 */

import { useTranslation } from 'react-i18next';
import { Tags, Plus, FilterX } from 'lucide-react';
import { EmptyState } from '@/components/ui';

interface CategoriesEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
  onCreateCategory: () => void;
}

export function CategoriesEmptyState({ hasFilters, onClearFilters, onCreateCategory }: CategoriesEmptyStateProps) {
  const { t } = useTranslation();

  if (hasFilters) {
    return (
      <EmptyState
        icon={FilterX}
        title={t('categories.noResults')}
        description={t('categories.noResultsDescription')}
        action={{
          label: t('common.clearFilters'),
          onClick: onClearFilters,
          variant: 'outline',
        }}
      />
    );
  }

  return (
    <EmptyState
      icon={Tags}
      title={t('categories.empty')}
      description={t('categories.emptyDescription')}
      action={{
        label: t('categories.createCategory'),
        onClick: onCreateCategory,
        icon: <Plus className='h-4 w-4 mr-2' />,
      }}
    />
  );
}
