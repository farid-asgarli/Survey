/**
 * ThemesPage - Manage survey themes
 *
 * Features:
 * - useListPageState hook for combined state management
 * - useEntityActions hook for CRUD operations
 * - ListPageLayout compound component for consistent structure
 * - Section-based component organization for maintainability
 */

import { useMemo, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { ListPageLayout } from '@/components/layout';
import {
  useThemes,
  usePublicThemes,
  useCreateTheme,
  useUpdateTheme,
  useDeleteTheme,
  useDuplicateTheme,
  useSetDefaultTheme,
  useListPageState,
  useEntityActions,
  useDrawerState,
  FilterMatchers,
  type ExtendedFilterConfig,
} from '@/hooks';
import { ThemeEditorDrawer, type ThemeFormData } from '@/components/features/themes';
import type { SurveyTheme } from '@/types';
import { ThemesHeader, ThemesToolbar, ThemesContent, ThemesEmptyState } from './sections';

type ThemeFilter = 'all' | 'system' | 'custom';

type ThemeListFilters = {
  filter: ThemeFilter;
};

/** Filter configuration for the themes list page */
const FILTER_CONFIGS: ExtendedFilterConfig<SurveyTheme, unknown>[] = [
  {
    key: 'filter',
    defaultValue: 'all' as const,
    label: 'Type',
    formatValue: (v) => (v === 'system' ? 'System' : 'Custom'),
    getValue: (theme: SurveyTheme) => (theme.isSystem ? 'system' : 'custom'),
    matches: (itemValue: unknown, filterValue: unknown): boolean => FilterMatchers.equalOrAll(itemValue as string, filterValue as ThemeFilter),
  },
];

export function ThemesPage() {
  // Editor drawer state using reusable hook
  const editorDrawer = useDrawerState<SurveyTheme>();

  // API hooks
  const { data: themesData, isLoading: isLoadingThemes } = useThemes();
  const { data: publicThemesData, isLoading: isLoadingPublic } = usePublicThemes();
  const createTheme = useCreateTheme();
  const updateTheme = useUpdateTheme();
  const deleteTheme = useDeleteTheme();
  const duplicateTheme = useDuplicateTheme();
  const setDefaultTheme = useSetDefaultTheme();

  // Combine themes - namespace themes take priority, public themes as fallback
  const allThemes = useMemo(() => {
    const namespaceThemes = themesData?.items || [];
    const publicThemes = publicThemesData?.items || [];

    // Use a Map to deduplicate themes by ID, namespace themes take priority
    const themeMap = new Map<string, SurveyTheme>();
    namespaceThemes.forEach((t) => themeMap.set(t.id, t));
    publicThemes.forEach((t) => {
      if (!themeMap.has(t.id)) {
        themeMap.set(t.id, t);
      }
    });

    return Array.from(themeMap.values());
  }, [themesData?.items, publicThemesData?.items]);

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
    filteredItems: filteredThemes,
    hasActiveFilters,
  } = useListPageState<SurveyTheme, ThemeListFilters>({
    initialFilters: { filter: 'all' },
    filterConfigs: FILTER_CONFIGS,
    items: allThemes,
    searchConfig: {
      fields: ['name'],
    },
  });

  // Find default theme
  const defaultTheme = useMemo(() => {
    return allThemes.find((t) => t.isDefault) || allThemes.find((t) => t.isSystem) || allThemes[0];
  }, [allThemes]);

  // Loading state
  const isLoading = isLoadingThemes || isLoadingPublic;

  // Use entity actions hook for CRUD operations
  const { handleDelete, handleDuplicate, ConfirmDialog } = useEntityActions<SurveyTheme>({
    entityName: 'theme',
    getDisplayName: (t) => t.name,
    delete: {
      action: (theme) => deleteTheme.mutateAsync(theme.id),
    },
    duplicate: {
      action: (theme) => duplicateTheme.mutateAsync(theme.id),
    },
  });

  // Handlers
  const handleCreateTheme = useCallback(() => {
    editorDrawer.openCreate();
  }, [editorDrawer]);

  const handleEditTheme = useCallback(
    (theme: SurveyTheme) => {
      editorDrawer.openEdit(theme);
    },
    [editorDrawer]
  );

  const handleSetDefault = useCallback(
    async (theme: SurveyTheme) => {
      await setDefaultTheme.mutateAsync(theme.id);
    },
    [setDefaultTheme]
  );

  const handleSaveTheme = useCallback(
    async (data: ThemeFormData) => {
      try {
        const themeData = {
          name: data.name,
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          accentColor: data.accentColor || undefined,
          backgroundColor: data.backgroundColor,
          surfaceColor: data.surfaceColor || undefined,
          textColor: data.textColor || undefined,
          fontFamily: data.fontFamily,
          headingFontFamily: data.headingFontFamily || undefined,
          fontSize: data.fontSize,
          cornerRadius: data.cornerRadius || undefined,
          spacing: data.spacing || undefined,
          containerWidth: data.containerWidth || undefined,
          progressBarStyle: data.progressBarStyle || undefined,
          showProgressBar: data.showProgressBar,
          showQuestionNumbers: data.showQuestionNumbers,
          questionNumberStyle: data.questionNumberStyle || undefined,
          logoUrl: data.logoUrl || undefined,
          backgroundImageUrl: data.backgroundImageUrl || undefined,
          buttonStyle: data.buttonStyle,
          customCss: data.customCss || undefined,
        };

        if (editorDrawer.editingItem?.id) {
          await updateTheme.mutateAsync({
            id: editorDrawer.editingItem.id,
            data: themeData,
          });
        } else {
          await createTheme.mutateAsync(themeData);
        }
        editorDrawer.close();
      } catch {
        throw new Error('Save failed');
      }
    },
    [editorDrawer, createTheme, updateTheme]
  );

  return (
    <ListPageLayout
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      activeFilters={activeFilters}
      onClearAllFilters={clearAllFilters}
    >
      {/* Header */}
      <ThemesHeader onCreateTheme={handleCreateTheme} />

      {/* Toolbar with filters */}
      <ThemesToolbar currentFilter={filters.filter} onFilterChange={(filter: ThemeFilter) => setFilter('filter', filter)} />

      {/* Active filters bar */}
      <ListPageLayout.FiltersBar />

      {/* Content */}
      <ListPageLayout.Content>
        <ThemesContent
          themes={filteredThemes}
          isLoading={isLoading}
          viewMode={viewMode}
          defaultTheme={defaultTheme}
          hasActiveFilters={hasActiveFilters}
          emptyStateElement={
            <ThemesEmptyState hasActiveFilters={hasActiveFilters} onClearFilters={clearAllFilters} onCreateItem={handleCreateTheme} />
          }
          onEdit={handleEditTheme}
          onDuplicate={(theme: SurveyTheme) => handleDuplicate?.(theme)}
          onDelete={(theme: SurveyTheme) => handleDelete?.(theme)}
          onSetDefault={handleSetDefault}
        />
      </ListPageLayout.Content>

      {/* FAB for mobile */}
      <ListPageLayout.FAB icon={<Plus className="h-6 w-6" />} onClick={handleCreateTheme} />

      {/* Theme Editor Drawer */}
      <ThemeEditorDrawer
        open={editorDrawer.isOpen}
        onOpenChange={editorDrawer.setOpen}
        theme={editorDrawer.editingItem}
        onSave={handleSaveTheme}
        isSaving={createTheme.isPending || updateTheme.isPending}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </ListPageLayout>
  );
}
