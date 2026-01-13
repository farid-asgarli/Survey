/**
 * CategoriesContent - Content section for displaying categories
 */

import { ListContainer, ListGrid, GridSkeleton } from '@/components/ui';
import { CategoryCard } from '@/components/features/categories';
import type { SurveyCategorySummary } from '@/types';

interface CategoriesContentProps {
  categories: SurveyCategorySummary[];
  isLoading: boolean;
  viewMode: 'grid' | 'list';
  defaultCategory?: SurveyCategorySummary;
  hasActiveFilters: boolean;
  emptyStateElement: React.ReactNode;
  onEdit: (category: SurveyCategorySummary) => void;
  onDelete: (category: SurveyCategorySummary) => void;
  onSetDefault: (category: SurveyCategorySummary) => void;
}

export function CategoriesContent({ categories, isLoading, viewMode, emptyStateElement, onEdit, onDelete, onSetDefault }: CategoriesContentProps) {
  return (
    <ListContainer items={categories} isLoading={isLoading} viewMode={viewMode}>
      <ListContainer.Loading>
        <GridSkeleton viewMode={viewMode} count={6} gridHeight='h-48' listHeight='h-20' />
      </ListContainer.Loading>

      <ListContainer.Empty>{emptyStateElement}</ListContainer.Empty>

      <ListContainer.Content>
        <ListGrid
          items={categories}
          keyExtractor={(category) => category.id}
          viewMode={viewMode}
          renderItem={(category) => (
            <CategoryCard
              category={category}
              onEdit={() => onEdit(category)}
              onDelete={() => onDelete(category)}
              onSetDefault={() => onSetDefault(category)}
              showActions
              compact={viewMode === 'list'}
            />
          )}
        />
      </ListContainer.Content>
    </ListContainer>
  );
}
