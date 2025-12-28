/**
 * SurveysContent - Content section for surveys list
 */

import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { RefObject } from 'react';
import { Card as UICard, ListContainer, GridSkeleton } from '@/components/ui';
import { SurveyCard, SurveyListItem } from '@/components/features/surveys';
import type { Survey } from '@/types';

interface SurveysContentProps {
  surveys: Survey[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  totalCount: number;
  viewMode: 'grid' | 'list';
  hasActiveFilters: boolean;
  sentinelRef: RefObject<HTMLDivElement | null>;
  onEdit: (survey: Survey) => void;
  onPreview: (survey: Survey) => void;
  onDuplicate: (survey: Survey) => void;
  onShare: (survey: Survey) => void;
  onPublish: (survey: Survey) => void;
  onClose: (survey: Survey) => void;
  onDelete: (survey: Survey) => void;
  onClearFilters: () => void;
  onCreateSurvey: () => void;
  EmptyStateComponent: React.ComponentType<{
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onCreateItem: () => void;
  }>;
}

export function SurveysContent({
  surveys,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  totalCount,
  viewMode,
  hasActiveFilters,
  sentinelRef,
  onEdit,
  onPreview,
  onDuplicate,
  onShare,
  onPublish,
  onClose,
  onDelete,
  onClearFilters,
  onCreateSurvey,
  EmptyStateComponent,
}: SurveysContentProps) {
  const { t } = useTranslation();

  return (
    <ListContainer items={surveys} isLoading={isLoading} viewMode={viewMode}>
      <ListContainer.Loading>
        <GridSkeleton viewMode={viewMode} count={8} gridHeight="h-40" listHeight="h-20" />
      </ListContainer.Loading>

      <ListContainer.Empty>
        <EmptyStateComponent hasActiveFilters={hasActiveFilters} onClearFilters={onClearFilters} onCreateItem={onCreateSurvey} />
      </ListContainer.Empty>

      <ListContainer.Content>
        {viewMode === 'grid' ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {surveys.map((survey) => (
              <SurveyCard
                key={survey.id}
                survey={survey}
                onEdit={() => onEdit(survey)}
                onPreview={() => onPreview(survey)}
                onDuplicate={() => onDuplicate(survey)}
                onShare={() => onShare(survey)}
                onPublish={() => onPublish(survey)}
                onClose={() => onClose(survey)}
                onDelete={() => onDelete(survey)}
              />
            ))}
          </div>
        ) : (
          <UICard variant="outlined" shape="rounded" className="border-2 border-outline-variant/30 overflow-hidden">
            <div className="divide-y divide-outline-variant/30">
              {surveys.map((survey) => (
                <SurveyListItem
                  key={survey.id}
                  survey={survey}
                  onEdit={() => onEdit(survey)}
                  onPreview={() => onPreview(survey)}
                  onDuplicate={() => onDuplicate(survey)}
                  onShare={() => onShare(survey)}
                  onPublish={() => onPublish(survey)}
                  onClose={() => onClose(survey)}
                  onDelete={() => onDelete(survey)}
                />
              ))}
            </div>
          </UICard>
        )}

        {/* Infinite scroll sentinel & loading indicator */}
        <div ref={sentinelRef} className="py-4">
          {isFetchingNextPage && (
            <div className="flex items-center justify-center gap-2 text-on-surface-variant">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">{t('common.loading')}</span>
            </div>
          )}
          {!hasNextPage && surveys.length > 0 && (
            <p className="text-center text-sm text-on-surface-variant">
              {surveys.length === totalCount
                ? t('surveys.showingAll', { count: totalCount })
                : t('surveys.showingOf', { shown: surveys.length, total: totalCount })}
            </p>
          )}
        </div>
      </ListContainer.Content>
    </ListContainer>
  );
}
