/**
 * ThemesPage - Manage survey themes
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
  useThemes,
  usePublicThemes,
  useCreateTheme,
  useUpdateTheme,
  useDeleteTheme,
  useDuplicateTheme,
  useSetDefaultTheme,
  useThemeDetail,
  useListPageState,
  useEntityActions,
  useDrawerState,
  FilterMatchers,
  type ExtendedFilterConfig,
} from '@/hooks';
import { ThemeEditorDrawer, type ThemeFormData } from '@/components/features/themes';
import { usePreferencesStore } from '@/stores';
import type { SurveyThemeSummary, ViewMode } from '@/types';
import { ThemeLayout, LogoPosition, LogoSize, BackgroundImagePosition } from '@/types/enums';
import { ThemesHeader, ThemesToolbar, ThemesContent, ThemesEmptyState } from './sections';
import { getCurrentLanguage } from '@/i18n';

type ThemeFilter = 'all' | 'system' | 'custom';

type ThemeListFilters = {
  filter: ThemeFilter;
};

/** Filter configuration for the themes list page */
const FILTER_CONFIGS: ExtendedFilterConfig<SurveyThemeSummary, unknown>[] = [
  {
    key: 'filter',
    defaultValue: 'all' as const,
    label: 'Type',
    formatValue: (v) => (v === 'system' ? 'System' : 'Custom'),
    getValue: (theme: SurveyThemeSummary) => (theme.isSystem ? 'system' : 'custom'),
    matches: (itemValue: unknown, filterValue: unknown): boolean => FilterMatchers.equalOrAll(itemValue as string, filterValue as ThemeFilter),
  },
];

export function ThemesPage() {
  // Editor drawer state using reusable hook
  const editorDrawer = useDrawerState<SurveyThemeSummary>();

  // Track the ID of theme being edited to fetch full details
  const [editingThemeId, setEditingThemeId] = useState<string | undefined>(undefined);

  // API hooks
  const { data: themesData, isLoading: isLoadingThemes } = useThemes();
  const { data: publicThemesData, isLoading: isLoadingPublic } = usePublicThemes();
  const createTheme = useCreateTheme();
  const updateTheme = useUpdateTheme();
  const deleteTheme = useDeleteTheme();
  const duplicateTheme = useDuplicateTheme();
  const setDefaultTheme = useSetDefaultTheme();

  // User preferences
  const dashboardPrefs = usePreferencesStore((s) => s.preferences.dashboard);

  // Fetch full theme details when editing (includes branding, logo, etc.)
  const { data: fullThemeData, isLoading: isLoadingFullTheme } = useThemeDetail(editingThemeId);

  // Only use full theme data for the editor - don't fallback to summary
  // When creating new theme, this will be undefined (which is correct)
  const themeForEditor = editingThemeId ? fullThemeData : undefined;

  // Reset editingThemeId when drawer closes - this is intentional state sync
  useEffect(() => {
    if (!editorDrawer.isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional state sync when drawer closes
      setEditingThemeId(undefined);
    }
  }, [editorDrawer.isOpen]);

  // Combine themes - namespace themes take priority, public themes as fallback
  const allThemes = useMemo(() => {
    const namespaceThemes = themesData?.items || [];
    const publicThemes = publicThemesData?.items || [];

    // Use a Map to deduplicate themes by ID, namespace themes take priority
    const themeMap = new Map<string, SurveyThemeSummary>();
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
  } = useListPageState<SurveyThemeSummary, ThemeListFilters>({
    initialFilters: { filter: 'all' },
    filterConfigs: FILTER_CONFIGS,
    items: allThemes,
    searchConfig: {
      fields: ['name'],
    },
    initialViewMode: dashboardPrefs.defaultViewMode as ViewMode,
  });

  // Find default theme
  const defaultTheme = useMemo(() => {
    return allThemes.find((t) => t.isDefault) || allThemes.find((t) => t.isSystem) || allThemes[0];
  }, [allThemes]);

  // Loading state
  const isLoading = isLoadingThemes || isLoadingPublic;

  // Use entity actions hook for CRUD operations
  const { handleDelete, handleDuplicate, ConfirmDialog } = useEntityActions<SurveyThemeSummary>({
    entityName: 'theme',
    getDisplayName: (t) => t.name,
    delete: {
      action: (theme) => deleteTheme.mutateAsync(theme.id),
    },
    duplicate: {
      action: (theme) => duplicateTheme.mutateAsync({ id: theme.id }),
    },
  });

  // Handlers
  const handleCreateTheme = useCallback(() => {
    setEditingThemeId(undefined);
    editorDrawer.openCreate();
  }, [editorDrawer]);

  const handleEditTheme = useCallback(
    (theme: SurveyThemeSummary) => {
      setEditingThemeId(theme.id);
      editorDrawer.openEdit(theme);
    },
    [editorDrawer]
  );

  const handleSetDefault = useCallback(
    async (theme: SurveyThemeSummary) => {
      await setDefaultTheme.mutateAsync(theme.id);
    },
    [setDefaultTheme]
  );

  const handleSaveTheme = useCallback(
    async (data: ThemeFormData) => {
      try {
        // Build nested structure matching backend CreateThemeDto/UpdateThemeDto
        const themeData = {
          name: data.name,
          isPublic: true,
          languageCode: fullThemeData?.defaultLanguage || getCurrentLanguage(),
          colors: {
            primary: data.primaryColor,
            secondary: data.secondaryColor,
            background: data.backgroundColor,
            surface: data.surfaceColor,
            text: data.textColor,
            accent: data.accentColor,
            // Provide defaults for required Material Design 3 colors
            onPrimary: '#FFFFFF',
            primaryContainer: data.accentColor || '#EADDFF',
            onPrimaryContainer: '#21005D',
            onSecondary: '#FFFFFF',
            secondaryContainer: '#E8DEF8',
            onSecondaryContainer: '#1D192B',
            surfaceContainerLowest: '#FFFFFF',
            surfaceContainerLow: '#F7F2FA',
            surfaceContainer: '#F3EDF7',
            surfaceContainerHigh: '#ECE6F0',
            surfaceContainerHighest: '#E6E0E9',
            onSurface: data.textColor,
            onSurfaceVariant: '#49454F',
            outline: '#79747E',
            outlineVariant: '#CAC4D0',
            error: '#B3261E',
            success: '#2AA86A',
          },
          typography: {
            fontFamily: data.fontFamily,
            headingFontFamily: data.headingFontFamily || data.fontFamily,
            baseFontSize: data.fontSize,
          },
          layout: {
            layout: ThemeLayout.Classic,
            backgroundImageUrl: data.backgroundImageUrl || undefined,
            backgroundPosition: BackgroundImagePosition.Cover,
            showProgressBar: data.showProgressBar,
            progressBarStyle: data.progressBarStyle,
          },
          branding: {
            logoUrl: data.logoUrl || undefined,
            logoPosition: LogoPosition.TopLeft,
            logoSize: data.logoSize as LogoSize,
            showLogoBackground: data.showLogoBackground,
            logoBackgroundColor: data.showLogoBackground ? data.logoBackgroundColor : undefined,
            brandingTitle: data.brandingTitle || undefined,
            brandingSubtitle: data.brandingSubtitle || undefined,
            showPoweredBy: true,
          },
          button: {
            style: data.buttonStyle,
            textColor: '#FFFFFF',
          },
          customCss: data.customCss || undefined,
        };

        if (editingThemeId) {
          await updateTheme.mutateAsync({
            id: editingThemeId,
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
    [editingThemeId, fullThemeData, editorDrawer, createTheme, updateTheme]
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
          emptyStateElement={<ThemesEmptyState hasActiveFilters={hasActiveFilters} onClearFilters={clearAllFilters} onCreateItem={handleCreateTheme} />}
          onEdit={handleEditTheme}
          onDuplicate={(theme: SurveyThemeSummary) => handleDuplicate?.(theme)}
          onDelete={(theme: SurveyThemeSummary) => handleDelete?.(theme)}
          onSetDefault={handleSetDefault}
        />
      </ListPageLayout.Content>

      {/* FAB for mobile */}
      <ListPageLayout.FAB icon={<Plus className='h-6 w-6' />} onClick={handleCreateTheme} />

      {/* Theme Editor Drawer */}
      <ThemeEditorDrawer
        open={editorDrawer.isOpen}
        onOpenChange={editorDrawer.setOpen}
        theme={themeForEditor}
        onSave={handleSaveTheme}
        isSaving={createTheme.isPending || updateTheme.isPending || isLoadingFullTheme}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </ListPageLayout>
  );
}
