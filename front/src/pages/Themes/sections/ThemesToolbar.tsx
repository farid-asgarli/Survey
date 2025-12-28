/**
 * ThemesToolbar - Toolbar section for filtering themes
 */

import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui';
import { ListPageLayout } from '@/components/layout';

type ThemeFilter = 'all' | 'system' | 'custom';

interface ThemesToolbarProps {
  currentFilter: ThemeFilter;
  onFilterChange: (filter: ThemeFilter) => void;
}

export function ThemesToolbar({ currentFilter, onFilterChange }: ThemesToolbarProps) {
  const { t } = useTranslation();

  return (
    <ListPageLayout.Toolbar searchPlaceholder={t('themes.searchPlaceholder')}>
      <Tabs value={currentFilter} onValueChange={(v) => onFilterChange(v as ThemeFilter)} variant="pills">
        <TabsList>
          <TabsTrigger value="all">{t('common.all')}</TabsTrigger>
          <TabsTrigger value="system">{t('themes.system')}</TabsTrigger>
          <TabsTrigger value="custom">{t('themes.custom')}</TabsTrigger>
        </TabsList>
      </Tabs>
    </ListPageLayout.Toolbar>
  );
}
