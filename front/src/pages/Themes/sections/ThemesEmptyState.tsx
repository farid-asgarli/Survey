/**
 * ThemesEmptyState - Empty state component for themes
 */

import { useTranslation } from 'react-i18next';
import { Palette } from 'lucide-react';
import { createListEmptyState } from '@/components/ui';

interface ThemesEmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onCreateItem: () => void;
}

export function ThemesEmptyState({ hasActiveFilters, onClearFilters, onCreateItem }: ThemesEmptyStateProps) {
  const { t } = useTranslation();

  const EmptyStateComponent = createListEmptyState({
    icon: <Palette className="h-7 w-7" />,
    entityName: t('themes.theme'),
    entityNamePlural: t('themes.themes'),
    emptyDescription: t('themes.emptyDescription'),
    createActionLabel: t('themes.createTheme'),
  });

  return <EmptyStateComponent hasActiveFilters={hasActiveFilters} onClearFilters={onClearFilters} onCreateItem={onCreateItem} />;
}
