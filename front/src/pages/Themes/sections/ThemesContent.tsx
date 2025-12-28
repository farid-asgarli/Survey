/**
 * ThemesContent - Content section for displaying themes
 */

import { ListContainer, ListGrid, GridSkeleton } from '@/components/ui';
import { ThemePreviewCard } from '@/components/features/themes';
import type { SurveyTheme } from '@/types';

interface ThemesContentProps {
  themes: SurveyTheme[];
  isLoading: boolean;
  viewMode: 'grid' | 'list';
  defaultTheme?: SurveyTheme;
  hasActiveFilters: boolean;
  emptyStateElement: React.ReactNode;
  onEdit: (theme: SurveyTheme) => void;
  onDuplicate: (theme: SurveyTheme) => void;
  onDelete: (theme: SurveyTheme) => void;
  onSetDefault: (theme: SurveyTheme) => void;
}

export function ThemesContent({
  themes,
  isLoading,
  viewMode,
  defaultTheme,
  emptyStateElement,
  onEdit,
  onDuplicate,
  onDelete,
  onSetDefault,
}: ThemesContentProps) {
  return (
    <ListContainer items={themes} isLoading={isLoading} viewMode={viewMode}>
      <ListContainer.Loading>
        <GridSkeleton viewMode={viewMode} count={6} gridHeight="h-56" listHeight="h-32" />
      </ListContainer.Loading>

      <ListContainer.Empty>{emptyStateElement}</ListContainer.Empty>

      <ListContainer.Content>
        <ListGrid
          items={themes}
          keyExtractor={(theme) => theme.id}
          viewMode={viewMode}
          renderItem={(theme) => (
            <ThemePreviewCard
              theme={theme}
              isDefault={theme.id === defaultTheme?.id}
              onEdit={() => onEdit(theme)}
              onDuplicate={() => onDuplicate(theme)}
              onDelete={() => onDelete(theme)}
              onSetDefault={() => onSetDefault(theme)}
              showActions
              compact={viewMode === 'list'}
            />
          )}
        />
      </ListContainer.Content>
    </ListContainer>
  );
}
