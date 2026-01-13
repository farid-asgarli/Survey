/**
 * CategoriesHeader - Header section for the categories page
 */

import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui';
import { ListPageLayout } from '@/components/layout/ListPageLayout';
import { renderPageIcon } from '@/config';

interface CategoriesHeaderProps {
  onCreateCategory: () => void;
}

export function CategoriesHeader({ onCreateCategory }: CategoriesHeaderProps) {
  const { t } = useTranslation();

  return (
    <ListPageLayout.Header
      icon={renderPageIcon('categories')}
      title={t('navigation.categories')}
      description={t('categories.description')}
      actions={
        <Button className='hidden md:flex' onClick={onCreateCategory}>
          <Plus className='h-4 w-4 mr-2' />
          {t('categories.createCategory')}
        </Button>
      }
    />
  );
}
