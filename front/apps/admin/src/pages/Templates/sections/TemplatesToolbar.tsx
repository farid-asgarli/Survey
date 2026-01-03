/**
 * TemplatesToolbar - Toolbar section with filters for templates page
 */

import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger, Select } from '@/components/ui';
import { ListPageLayout } from '@/components/layout/ListPageLayout';
import { TEMPLATE_CATEGORIES } from '@/components/features/templates';
import type { TemplateCategory } from '@/types';
import type { CategoryInfo } from '@/components/features/templates/templateUtils';

type VisibilityFilter = 'all' | 'public' | 'private';

interface TemplatesToolbarProps {
  visibility: VisibilityFilter;
  category: TemplateCategory | 'all';
  onVisibilityChange: (value: VisibilityFilter) => void;
  onCategoryChange: (value: TemplateCategory | 'all') => void;
}

export function TemplatesToolbar({ visibility, category, onVisibilityChange, onCategoryChange }: TemplatesToolbarProps) {
  const { t } = useTranslation();

  const categoryOptions = TEMPLATE_CATEGORIES.map((c: CategoryInfo) => ({
    value: c.value,
    label: c.label,
  }));

  return (
    <ListPageLayout.Toolbar showSearch showViewModeToggle={false} searchPlaceholder={t('templates.searchPlaceholder')}>
      <Tabs value={visibility} onValueChange={(v) => onVisibilityChange(v as VisibilityFilter)} variant="segmented">
        <TabsList>
          <TabsTrigger value="all">{t('common.all')}</TabsTrigger>
          <TabsTrigger value="public">{t('templates.public')}</TabsTrigger>
          <TabsTrigger value="private">{t('templates.myTemplates')}</TabsTrigger>
        </TabsList>
      </Tabs>

      <Select
        options={categoryOptions}
        value={category}
        onChange={(v) => onCategoryChange(v as TemplateCategory | 'all')}
        className="w-full sm:w-44"
      />
    </ListPageLayout.Toolbar>
  );
}
