/**
 * CategoriesToolbar - Toolbar section for filtering categories
 */

import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui';
import { ListPageLayout } from '@/components/layout/ListPageLayout';

type CategoryFilter = 'all' | 'active' | 'inactive';

interface CategoriesToolbarProps {
  currentFilter: CategoryFilter;
  onFilterChange: (filter: CategoryFilter) => void;
}

export function CategoriesToolbar({ currentFilter, onFilterChange }: CategoriesToolbarProps) {
  const { t } = useTranslation();

  return (
    <ListPageLayout.Toolbar searchPlaceholder={t('categories.searchPlaceholder')}>
      <Tabs value={currentFilter} onValueChange={(v) => onFilterChange(v as CategoryFilter)} variant='pills'>
        <TabsList>
          <TabsTrigger value='all'>{t('common.all')}</TabsTrigger>
          <TabsTrigger value='active'>{t('common.active')}</TabsTrigger>
          <TabsTrigger value='inactive'>{t('common.inactive')}</TabsTrigger>
        </TabsList>
      </Tabs>
    </ListPageLayout.Toolbar>
  );
}
