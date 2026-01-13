/**
 * CategoriesPage - Manage survey categories
 *
 * Features:
 * - useListPageState hook for combined state management
 * - useEntityActions hook for CRUD operations
 * - ListPageLayout compound component for consistent structure
 * - Section-based component organization for maintainability
 */

import { useMemo, useCallback, useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ListPageLayout } from '@/components/layout/ListPageLayout';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useSetDefaultCategory,
  useCategoryDetail,
  useListPageState,
  useEntityActions,
  useDrawerState,
  FilterMatchers,
  type ExtendedFilterConfig,
} from '@/hooks';
import { CategoryEditorDrawer, type CategoryFormData } from '@/components/features/categories';
import { usePreferencesStore } from '@/stores';
import type { SurveyCategorySummary, ViewMode } from '@/types';
import { CategoriesHeader, CategoriesToolbar, CategoriesContent, CategoriesEmptyState } from './sections';
import { getCurrentLanguage } from '@/i18n';

type CategoryFilter = 'all' | 'active' | 'inactive';

type CategoryListFilters = {
  filter: CategoryFilter;
};

/** Filter configuration for the categories list page */
const FILTER_CONFIGS: ExtendedFilterConfig<SurveyCategorySummary, unknown>[] = [
  {
    key: 'filter',
    defaultValue: 'all' as const,
    label: 'Status',
    formatValue: (v) => (v === 'active' ? 'Active' : v === 'inactive' ? 'Inactive' : 'All'),
    getValue: (category: SurveyCategorySummary) => (category.isActive ? 'active' : 'inactive'),
    matches: (itemValue: unknown, filterValue: unknown): boolean => FilterMatchers.equalOrAll(itemValue as string, filterValue as CategoryFilter),
  },
];

export function CategoriesPage() {
  // Editor drawer state using reusable hook
  const editorDrawer = useDrawerState<SurveyCategorySummary>();

  // Track the ID of category being edited to fetch full details
  const [editingCategoryId, setEditingCategoryId] = useState<string | undefined>(undefined);

  // API hooks
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories({ includeInactive: true });
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const setDefaultCategory = useSetDefaultCategory();

  // User preferences
  const dashboardPrefs = usePreferencesStore((s) => s.preferences.dashboard);

  // Fetch full category details when editing
  const { data: fullCategoryData } = useCategoryDetail(editingCategoryId);

  // Only use full category data for the editor
  const categoryForEditor = editingCategoryId ? fullCategoryData : undefined;

  // Reset editingCategoryId when drawer closes
  useEffect(() => {
    if (!editorDrawer.isOpen) {
      setEditingCategoryId(undefined);
    }
  }, [editorDrawer.isOpen]);

  // Get all categories
  const allCategories = useMemo(() => {
    return categoriesData?.items || [];
  }, [categoriesData?.items]);

  // Use the combined list page state hook
  const {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    activeFilters,
    clearAllFilters,
    filteredItems: filteredCategories,
    hasActiveFilters,
  } = useListPageState<SurveyCategorySummary, CategoryListFilters>({
    initialFilters: { filter: 'all' },
    filterConfigs: FILTER_CONFIGS,
    items: allCategories,
    searchConfig: {
      fields: ['name', 'description'],
    },
    initialViewMode: dashboardPrefs.defaultViewMode as ViewMode,
  });

  // Find default category
  const defaultCategory = useMemo(() => {
    return allCategories.find((c) => c.isDefault) || allCategories[0];
  }, [allCategories]);

  // Loading state
  const isLoading = isLoadingCategories;

  // Use entity actions hook for CRUD operations
  const { handleDelete, ConfirmDialog } = useEntityActions<SurveyCategorySummary>({
    entityName: 'category',
    getDisplayName: (c) => c.name,
    delete: {
      action: (category) => deleteCategory.mutateAsync(category.id),
    },
  });

  // Handlers
  const handleCreateCategory = useCallback(() => {
    setEditingCategoryId(undefined);
    editorDrawer.openCreate();
  }, [editorDrawer]);

  const handleEditCategory = useCallback(
    (category: SurveyCategorySummary) => {
      setEditingCategoryId(category.id);
      editorDrawer.openEdit(category);
    },
    [editorDrawer]
  );

  const handleSetDefault = useCallback(
    async (category: SurveyCategorySummary) => {
      try {
        await setDefaultCategory.mutateAsync(category.id);
      } catch {
        // Error handled by mutation
      }
    },
    [setDefaultCategory]
  );

  const handleSaveCategory = useCallback(
    async (data: CategoryFormData) => {
      const languageCode = getCurrentLanguage();

      if (editingCategoryId) {
        // Update existing category
        await updateCategory.mutateAsync({
          id: editingCategoryId,
          data: {
            name: data.name,
            description: data.description || undefined,
            color: data.color,
            icon: data.icon,
            isActive: data.isActive,
            languageCode,
          },
        });
      } else {
        // Create new category
        await createCategory.mutateAsync({
          name: data.name,
          description: data.description || undefined,
          color: data.color,
          icon: data.icon,
          languageCode,
        });
      }
    },
    [editingCategoryId, createCategory, updateCategory]
  );

  // Handle filter change
  const handleFilterChange = useCallback(
    (filter: CategoryFilter) => {
      setFilter('filter', filter);
    },
    [setFilter]
  );

  // Empty state element
  const emptyStateElement = <CategoriesEmptyState hasFilters={hasActiveFilters} onClearFilters={clearAllFilters} onCreateCategory={handleCreateCategory} />;

  return (
    <ListPageLayout
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      activeFilters={activeFilters}
      onClearAllFilters={clearAllFilters}
    >
      <CategoriesHeader onCreateCategory={handleCreateCategory} />

      <CategoriesToolbar currentFilter={filters.filter} onFilterChange={handleFilterChange} />

      <ListPageLayout.FiltersBar />

      <ListPageLayout.Content>
        <CategoriesContent
          categories={filteredCategories}
          isLoading={isLoading}
          viewMode={viewMode}
          defaultCategory={defaultCategory}
          hasActiveFilters={hasActiveFilters}
          emptyStateElement={emptyStateElement}
          onEdit={handleEditCategory}
          onDelete={(category) => handleDelete?.(category)}
          onSetDefault={handleSetDefault}
        />
      </ListPageLayout.Content>

      <ListPageLayout.FAB icon={<Plus className='h-6 w-6' />} label='Create Category' onClick={handleCreateCategory} />

      {/* Category Editor Drawer */}
      <CategoryEditorDrawer
        open={editorDrawer.isOpen}
        onOpenChange={editorDrawer.close}
        category={categoryForEditor || editorDrawer.editingItem}
        onSave={handleSaveCategory}
        isSaving={createCategory.isPending || updateCategory.isPending}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </ListPageLayout>
  );
}
