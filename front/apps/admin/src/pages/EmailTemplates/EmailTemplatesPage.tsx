/**
 * EmailTemplatesPage - Manage email templates for survey distributions
 *
 * Features:
 * - useListPageState hook for combined state management
 * - useEntityActions hook for CRUD operations
 * - ListPageLayout compound component for consistent structure
 * - createListEmptyState factory for empty states
 * - Visual Email Editor with drag-drop blocks (Outlook compatible)
 * - Navigates to full-screen editor at /email-templates/:id/edit
 */

import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Star, Clock, Mail } from 'lucide-react';
import { renderPageIcon } from '@/config';
import { Button, Card, Chip, Tabs, TabsList, TabsTrigger, ListContainer, GridSkeleton, EmptyState } from '@/components/ui';
import { ListPageLayout } from '@/components/layout/ListPageLayout';
import { EmailTemplateCard, CreateEmailTemplateDialog } from '@/components/features/email-templates';
import { useEmailTemplates, useDeleteEmailTemplate, useSetDefaultEmailTemplate, useDuplicateEmailTemplate } from '@/hooks/queries/useEmailTemplates';
import { useListPageState, useEntityActions, useDialogState, useViewTransitionNavigate, useDateTimeFormatter } from '@/hooks';
import { usePreferencesStore } from '@/stores';
import type { EmailTemplateSummary, ViewMode } from '@/types';
import { FILTER_CONFIGS, SEARCH_CONFIG, EmailTemplatesEmptyState } from './constants';
import type { FilterType, EmailTemplateFilters } from './types';

export function EmailTemplatesPage() {
  const { t } = useTranslation();
  const navigate = useViewTransitionNavigate();
  const { formatDate } = useDateTimeFormatter();

  // Dialog state using reusable hooks
  const createDialog = useDialogState();

  // Queries
  const { data: templatesResponse, isLoading, error } = useEmailTemplates();
  const templates = templatesResponse?.items ?? [];

  // Mutations
  const deleteTemplate = useDeleteEmailTemplate();
  const setDefaultTemplate = useSetDefaultEmailTemplate();
  const duplicateTemplate = useDuplicateEmailTemplate();

  // User preferences
  const dashboardPrefs = usePreferencesStore((s) => s.preferences.dashboard);

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
    filteredItems: filteredTemplatesBase,
    emptyStateProps,
  } = useListPageState<EmailTemplateSummary, EmailTemplateFilters>({
    initialFilters: { type: 'all' },
    filterConfigs: FILTER_CONFIGS,
    items: templates,
    searchConfig: SEARCH_CONFIG,
    initialViewMode: dashboardPrefs.defaultViewMode as ViewMode,
  });

  // Sort filtered templates: default first, then by created date
  const filteredTemplates = useMemo(() => {
    return [...filteredTemplatesBase].sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredTemplatesBase]);

  // Use entity actions hook for CRUD operations with toast notifications
  const { handleDelete, handleDuplicate, ConfirmDialog } = useEntityActions<EmailTemplateSummary>({
    entityName: 'template',
    getDisplayName: (template) => template.name,
    delete: {
      action: async (template) => {
        if (template.isDefault) {
          throw new Error(t('emailTemplates.errors.cannotDeleteDefault'));
        }
        await deleteTemplate.mutateAsync(template.id);
      },
    },
    duplicate: {
      action: (template) =>
        duplicateTemplate.mutateAsync({
          id: template.id,
          request: { newName: `${template.name} (${t('common.copy')})` },
        }),
    },
  });

  // Handler for setting default template
  const handleSetDefault = useCallback(
    async (template: EmailTemplateSummary) => {
      if (template.isDefault) return;
      await setDefaultTemplate.mutateAsync(template.id);
    },
    [setDefaultTemplate]
  );

  // Handlers - Navigate to full-screen editor
  const handleEdit = useCallback(
    (templateId: string) => {
      navigate(`/email-templates/${templateId}/edit`);
    },
    [navigate]
  );

  const handleCreateSuccess = useCallback(
    (templateId: string) => {
      createDialog.close();
      // Navigate to the editor for the newly created template
      navigate(`/email-templates/${templateId}/edit`);
    },
    [createDialog, navigate]
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
      <ListPageLayout.Header
        icon={renderPageIcon('email-templates')}
        title={t('emailTemplates.title')}
        description={t('emailTemplates.description')}
        actions={
          <Button onClick={() => createDialog.open()} className='hidden sm:flex'>
            <Plus className='h-4 w-4 mr-2' />
            {t('emailTemplates.newTemplate')}
          </Button>
        }
      />

      {/* Toolbar with filters */}
      <ListPageLayout.Toolbar searchPlaceholder={t('emailTemplates.searchPlaceholder')}>
        <Tabs value={String(filters.type)} onValueChange={(v) => setFilter('type', v as FilterType)}>
          <TabsList>
            <TabsTrigger value='all'>{t('common.all')}</TabsTrigger>
            <TabsTrigger value='Invitation'>{t('emailTemplates.types.invitation')}</TabsTrigger>
            <TabsTrigger value='Reminder'>{t('emailTemplates.types.reminder')}</TabsTrigger>
            <TabsTrigger value='ThankYou'>{t('emailTemplates.types.thankYou')}</TabsTrigger>
            <TabsTrigger value='Custom'>{t('emailTemplates.types.custom')}</TabsTrigger>
          </TabsList>
        </Tabs>
      </ListPageLayout.Toolbar>

      {/* Active filters bar */}
      <ListPageLayout.FiltersBar />

      {/* Content */}
      <ListPageLayout.Content>
        <ListContainer items={filteredTemplates} isLoading={isLoading} hasError={!!error} viewMode={viewMode}>
          <ListContainer.Loading>
            <GridSkeleton viewMode={viewMode} count={6} gridHeight='h-40' listHeight='h-20' />
          </ListContainer.Loading>

          <ListContainer.Error>
            <EmptyState
              icon={<Mail className='h-7 w-7' />}
              title={t('emailTemplates.errors.loadFailed')}
              description={t('emailTemplates.errors.loadFailedDescription')}
              iconVariant='muted'
              action={{
                label: t('common.retry'),
                onClick: () => window.location.reload(),
                variant: 'outline',
              }}
            />
          </ListContainer.Error>

          <ListContainer.Empty>
            <EmailTemplatesEmptyState {...emptyStateProps} onCreateItem={() => createDialog.open()} />
          </ListContainer.Empty>

          <ListContainer.Content>
            {viewMode === 'grid' ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {filteredTemplates.map((template) => (
                  <EmailTemplateCard
                    key={template.id}
                    template={template}
                    onEdit={() => handleEdit(template.id)}
                    onPreview={() => handleEdit(template.id)}
                    onDuplicate={() => handleDuplicate?.(template)}
                    onDelete={() => handleDelete?.(template)}
                    onSetDefault={() => handleSetDefault?.(template)}
                  />
                ))}
              </div>
            ) : (
              <div className='space-y-2'>
                {filteredTemplates.map((template) => (
                  <Card key={template.id} variant='elevated' className='p-4 cursor-pointer group' onClick={() => handleEdit(template.id)}>
                    <div className='flex items-center gap-4'>
                      <div className='h-12 w-12 rounded-xl bg-primary-container/50 flex items-center justify-center shrink-0'>
                        <Mail className='h-6 w-6 text-primary' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2'>
                          <h3 className='font-semibold text-on-surface truncate'>{template.name}</h3>
                          {template.isDefault && (
                            <Chip size='sm' className='bg-primary text-on-primary'>
                              <Star className='h-3 w-3 mr-1' fill='currentColor' />
                              {t('common.default')}
                            </Chip>
                          )}
                        </div>
                        <p className='text-sm text-on-surface-variant truncate'>{template.subject}</p>
                      </div>
                      <div className='flex items-center gap-2 shrink-0'>
                        <Chip size='sm' variant='assist'>
                          {template.type}
                        </Chip>
                        <span className='text-xs text-on-surface-variant flex items-center gap-1'>
                          <Clock className='h-3 w-3' />
                          {formatDate(template.createdAt)}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ListContainer.Content>
        </ListContainer>
      </ListPageLayout.Content>

      {/* FAB for mobile */}
      <ListPageLayout.FAB icon={<Plus className='h-6 w-6' />} label={t('emailTemplates.newTemplate')} onClick={() => createDialog.open()} />

      {/* Dialogs */}
      <ListPageLayout.Dialogs>
        <CreateEmailTemplateDialog open={createDialog.isOpen} onOpenChange={createDialog.setOpen} onSuccess={handleCreateSuccess} />
        <ConfirmDialog />
      </ListPageLayout.Dialogs>
    </ListPageLayout>
  );
}
