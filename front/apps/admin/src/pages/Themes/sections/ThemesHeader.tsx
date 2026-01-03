/**
 * ThemesHeader - Header section for the themes page
 */

import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui';
import { ListPageLayout } from '@/components/layout/ListPageLayout';
import { renderPageIcon } from '@/config';

interface ThemesHeaderProps {
  onCreateTheme: () => void;
}

export function ThemesHeader({ onCreateTheme }: ThemesHeaderProps) {
  const { t } = useTranslation();

  return (
    <ListPageLayout.Header
      icon={renderPageIcon('themes')}
      title={t('navigation.themes')}
      description={t('themes.description')}
      actions={
        <Button className="hidden md:flex" onClick={onCreateTheme}>
          <Plus className="h-4 w-4 mr-2" />
          {t('themes.createTheme')}
        </Button>
      }
    />
  );
}
