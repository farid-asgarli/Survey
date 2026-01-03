/**
 * TemplatesContent - Content section displaying templates grid
 */

import { useCallback } from 'react';
import { FileStack } from 'lucide-react';
import { GridSkeleton, EmptyState, ListContainer } from '@/components/ui';
import { TemplateCard } from '@/components/features/templates';
import type { SurveyTemplateSummary } from '@/types';
import { useTranslation } from 'react-i18next';

interface TemplatesContentProps {
  templates: SurveyTemplateSummary[];
  isLoading: boolean;
  error?: Error | null;
  hasActiveFilters: boolean;
  onUseTemplate: (template: SurveyTemplateSummary) => void;
  onPreviewTemplate: (template: SurveyTemplateSummary) => void;
  onDeleteTemplate: (template: SurveyTemplateSummary) => void;
  onNoTemplatesAction?: () => void;
}

export function TemplatesContent({
  templates,
  isLoading,
  error,
  hasActiveFilters,
  onUseTemplate,
  onPreviewTemplate,
  onDeleteTemplate,
  onNoTemplatesAction,
}: TemplatesContentProps) {
  const { t } = useTranslation();

  const handleUseTemplate = useCallback(
    (template: SurveyTemplateSummary) => {
      onUseTemplate(template);
    },
    [onUseTemplate]
  );

  const handlePreviewTemplate = useCallback(
    (template: SurveyTemplateSummary) => {
      onPreviewTemplate(template);
    },
    [onPreviewTemplate]
  );

  const handleDeleteTemplate = useCallback(
    (template: SurveyTemplateSummary) => {
      onDeleteTemplate(template);
    },
    [onDeleteTemplate]
  );

  return (
    <ListContainer items={templates} isLoading={isLoading} hasError={!!error}>
      <ListContainer.Loading>
        <GridSkeleton count={6} gridHeight='h-48' />
      </ListContainer.Loading>

      <ListContainer.Error>
        <EmptyState icon={<FileStack className='h-7 w-7' />} title={t('templates.loadError')} description={t('templates.loadErrorDesc')} iconVariant='muted' />
      </ListContainer.Error>

      <ListContainer.Empty>
        <EmptyState
          icon={<FileStack className='h-7 w-7' />}
          title={t('templates.noFound')}
          description={hasActiveFilters ? t('templates.noFoundFilters') : t('templates.noFoundDesc')}
          iconVariant='primary'
          action={
            !hasActiveFilters && onNoTemplatesAction
              ? {
                  label: t('templates.createTemplate'),
                  onClick: onNoTemplatesAction,
                  icon: <FileStack className='h-4 w-4' />,
                }
              : undefined
          }
        />
      </ListContainer.Empty>

      <ListContainer.Content>
        <div className='grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUse={() => handleUseTemplate(template)}
              onPreview={() => handlePreviewTemplate(template)}
              onDelete={() => handleDeleteTemplate(template)}
              isOwner={true}
            />
          ))}
        </div>
      </ListContainer.Content>
    </ListContainer>
  );
}
