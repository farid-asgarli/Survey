/**
 * TemplatesHeader - Header section for the templates page
 */

import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui';
import { ListPageLayout } from '@/components/layout/ListPageLayout';
import { renderPageIcon } from '@/config';

interface TemplatesHeaderProps {
  onCreateTemplate: () => void;
}

export function TemplatesHeader({ onCreateTemplate }: TemplatesHeaderProps) {
  const { t } = useTranslation();

  return (
    <ListPageLayout.Header
      title={t('templates.title')}
      description={t('templates.description')}
      icon={renderPageIcon('templates')}
      actions={
        <Button className="hidden md:flex" onClick={onCreateTemplate}>
          <Plus className="h-4 w-4 mr-2" />
          {t('templates.createTemplate')}
        </Button>
      }
    />
  );
}
