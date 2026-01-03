/**
 * TemplatesPage - Manage survey templates
 *
 * Features:
 * - useListPage hook for state management
 * - useEntityActions hook for CRUD operations
 * - ListPageLayout compound component for consistent structure
 * - Section-based component organization for maintainability
 */

import { useMemo, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { useViewTransitionNavigate } from '@/hooks';
import { ListPageLayout } from '@/components/layout/ListPageLayout';
import { CreateTemplateDialog, TemplatePreviewDrawer, UseTemplateDialog } from '@/components/features/templates';
import type { CreateTemplateData } from '@/components/features/templates/CreateTemplateDialog';
import {
  useTemplatesList,
  useCreateTemplate,
  useCreateTemplateFromSurvey,
  useDeleteTemplate,
  useCreateSurveyFromTemplate,
  type TemplateFilters,
} from '@/hooks/queries/useTemplates';
import { useListPage, useFilteredList, useEntityActions, useDialogState, FilterMatchers, type FilterConfig } from '@/hooks';
import { usePreferencesStore } from '@/stores';
import type { SurveyTemplateSummary, TemplateCategory, ViewMode } from '@/types';
import { TemplatesHeader, TemplatesToolbar, TemplatesContent } from './sections';

type VisibilityFilter = 'all' | 'public' | 'private';

/** Filter configuration for the templates list page */
const FILTER_CONFIGS: FilterConfig<unknown>[] = [
  {
    key: 'visibility',
    defaultValue: 'all',
    label: 'Visibility',
    formatValue: (v) => (v === 'public' ? 'Public' : 'Private'),
  },
  {
    key: 'category',
    defaultValue: 'all',
    label: 'Category',
    formatValue: (v) => String(v),
  },
];

export function TemplatesPage() {
  const navigate = useViewTransitionNavigate();

  // User preferences
  const dashboardPrefs = usePreferencesStore((s) => s.preferences.dashboard);

  // Use the reusable list page hook for common list page state
  const { viewMode, setViewMode, searchQuery, setSearchQuery, filters, setFilter, activeFilters, clearAllFilters } = useListPage<{
    visibility: VisibilityFilter;
    category: TemplateCategory | 'all';
  }>({
    initialViewMode: dashboardPrefs.defaultViewMode as ViewMode,
    initialFilters: { visibility: 'all', category: 'all' },
    filterConfigs: FILTER_CONFIGS,
  });

  // Dialog state using reusable hooks
  const createDialog = useDialogState();
  const previewDrawer = useDialogState<string>(); // stores template ID
  const useTemplateDialog = useDialogState<SurveyTemplateSummary>();

  // Build filters for API
  const apiFilters: TemplateFilters = useMemo(
    () => ({
      visibility: filters.visibility,
      category: filters.category,
      search: searchQuery || undefined,
    }),
    [filters.visibility, filters.category, searchQuery]
  );

  // Query hooks
  const { data: templates = [], isLoading, error } = useTemplatesList(apiFilters);
  const createTemplateMutation = useCreateTemplate();
  const createFromSurveyMutation = useCreateTemplateFromSurvey();
  const deleteTemplateMutation = useDeleteTemplate();
  const createSurveyFromTemplateMutation = useCreateSurveyFromTemplate();

  // Use the new useFilteredList hook for client-side filtering
  const { filteredItems: filteredTemplates, hasActiveFilters } = useFilteredList({
    items: templates,
    filters: { visibility: filters.visibility, category: filters.category },
    filterConfigs: [
      {
        key: 'visibility',
        getValue: (t: SurveyTemplateSummary) => t.isPublic,
        matches: (isPublic: unknown, filter: unknown): boolean => {
          if (filter === 'all') return true;
          return filter === 'public' ? Boolean(isPublic) : !isPublic;
        },
        defaultValue: 'all',
      },
      {
        key: 'category',
        getValue: (t: SurveyTemplateSummary) => t.category,
        matches: (itemValue: unknown, filterValue: unknown): boolean => FilterMatchers.equalOrAll(itemValue as string, filterValue as string | 'all'),
        defaultValue: 'all',
      },
    ],
    searchQuery,
    searchConfig: {
      fields: ['name', 'description'],
    },
  });

  // Use the new useEntityActions hook for CRUD operations
  const { handleDelete, ConfirmDialog } = useEntityActions<SurveyTemplateSummary>({
    entityName: 'template',
    getDisplayName: (t) => t.name,
    delete: {
      action: (template) => deleteTemplateMutation.mutateAsync(template.id),
    },
  });

  // Handlers
  const handleCreateTemplate = async (data: CreateTemplateData) => {
    try {
      if (data.surveyId) {
        await createFromSurveyMutation.mutateAsync({
          surveyId: data.surveyId,
          templateName: data.name,
          description: data.description,
          category: data.category,
          isPublic: data.isPublic,
          languageCode: data.languageCode,
        });
      } else {
        await createTemplateMutation.mutateAsync({
          name: data.name,
          description: data.description,
          category: data.category,
          isPublic: data.isPublic,
          languageCode: data.languageCode,
        });
      }
      createDialog.close();
    } catch {
      // Error handled by interceptor
    }
  };

  const handlePreviewTemplate = useCallback(
    (template: SurveyTemplateSummary) => {
      previewDrawer.open(template.id);
    },
    [previewDrawer]
  );

  const handleUseTemplateClick = useCallback(
    (template: SurveyTemplateSummary) => {
      useTemplateDialog.open(template);
      previewDrawer.close();
    },
    [useTemplateDialog, previewDrawer]
  );

  const handleCreateSurveyFromTemplate = async (data: { title: string; description?: string; languageCode: string }) => {
    if (!useTemplateDialog.selectedItem) return;

    try {
      const newSurvey = await createSurveyFromTemplateMutation.mutateAsync({
        templateId: useTemplateDialog.selectedItem.id,
        data: {
          surveyTitle: data.title,
          description: data.description,
          languageCode: data.languageCode,
        },
      });
      useTemplateDialog.close();
      navigate(`/surveys/${newSurvey.id}/edit`);
    } catch {
      // Error handled by interceptor
    }
  };

  const isCreating = createTemplateMutation.isPending || createFromSurveyMutation.isPending;
  const isCreatingSurvey = createSurveyFromTemplateMutation.isPending;

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
      <TemplatesHeader onCreateTemplate={() => createDialog.open()} />

      {/* Toolbar with filters */}
      <TemplatesToolbar
        visibility={filters.visibility}
        category={filters.category}
        onVisibilityChange={(v) => setFilter('visibility', v)}
        onCategoryChange={(v) => setFilter('category', v)}
      />

      {/* Active filters bar */}
      <ListPageLayout.FiltersBar />

      {/* Content */}
      <ListPageLayout.Content>
        <TemplatesContent
          templates={filteredTemplates}
          isLoading={isLoading}
          error={error}
          hasActiveFilters={hasActiveFilters}
          onUseTemplate={handleUseTemplateClick}
          onPreviewTemplate={handlePreviewTemplate}
          onDeleteTemplate={(template) => handleDelete?.(template)}
          onNoTemplatesAction={() => createDialog.open()}
        />
      </ListPageLayout.Content>

      {/* FAB for mobile */}
      <ListPageLayout.FAB icon={<Plus className='h-6 w-6' />} onClick={() => createDialog.open()} />

      {/* Dialogs */}
      <ListPageLayout.Dialogs>
        <CreateTemplateDialog open={createDialog.isOpen} onOpenChange={createDialog.setOpen} onSubmit={handleCreateTemplate} isLoading={isCreating} />

        <TemplatePreviewDrawer
          open={previewDrawer.isOpen}
          onOpenChange={previewDrawer.setOpen}
          templateId={previewDrawer.selectedItem}
          onUseTemplate={handleUseTemplateClick}
        />

        <UseTemplateDialog
          open={useTemplateDialog.isOpen}
          onOpenChange={useTemplateDialog.setOpen}
          template={useTemplateDialog.selectedItem}
          onSubmit={handleCreateSurveyFromTemplate}
          isLoading={isCreatingSurvey}
        />

        <ConfirmDialog />
      </ListPageLayout.Dialogs>
    </ListPageLayout>
  );
}
