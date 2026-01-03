/**
 * ThemesEmptyState - Empty state component for themes
 */

import { useTranslation } from 'react-i18next';
import { Palette } from 'lucide-react';
import { ListEmptyState } from '@/components/ui';

interface ThemesEmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onCreateItem: () => void;
}

export function ThemesEmptyState({ hasActiveFilters, onClearFilters, onCreateItem }: ThemesEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <ListEmptyState
      icon={<Palette className="h-7 w-7" />}
      entityName={t('themes.theme')}
      hasActiveFilters={hasActiveFilters}
      onClearFilters={onClearFilters}
      onCreateItem={onCreateItem}
      description={hasActiveFilters ? undefined : t('themes.emptyDescription')}
      createActionLabel={t('themes.createTheme')}
    />
  );
}
