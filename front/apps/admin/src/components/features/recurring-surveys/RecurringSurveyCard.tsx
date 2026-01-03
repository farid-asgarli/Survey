import { useTranslation } from 'react-i18next';
import { Pause, Play, MoreVertical, Trash2, History, Settings, Zap, Users } from 'lucide-react';
import { Card, Badge, IconButton, Menu, MenuItem, MenuSeparator, Tooltip } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useDateTimeFormatter } from '@/hooks';
import { RecurrencePattern } from '@/types/enums';
import type { RecurringSurveyListItem } from '@/types';

interface RecurringSurveyCardProps {
  recurringSurvey: RecurringSurveyListItem;
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onTrigger?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onViewHistory?: (id: string) => void;
  isLoading?: boolean;
}

// Pattern labels for display
const patternLabels: Record<RecurrencePattern, string> = {
  [RecurrencePattern.Daily]: 'Daily',
  [RecurrencePattern.Weekly]: 'Weekly',
  [RecurrencePattern.BiWeekly]: 'Bi-weekly',
  [RecurrencePattern.Monthly]: 'Monthly',
  [RecurrencePattern.Quarterly]: 'Quarterly',
  [RecurrencePattern.Custom]: 'Custom',
};

export function RecurringSurveyCard({
  recurringSurvey,
  onPause,
  onResume,
  onTrigger,
  onEdit,
  onDelete,
  onViewHistory,
  isLoading,
}: RecurringSurveyCardProps) {
  const { t } = useTranslation();
  const { formatDateTime, formatRelativeTime } = useDateTimeFormatter();
  // Derive status from isActive
  const isActive = recurringSurvey.isActive;
  const statusLabel = isActive ? 'Active' : 'Paused';
  const statusClassName = isActive ? 'bg-success-container text-on-success-container' : 'bg-warning-container text-on-warning-container';
  const StatusIcon = isActive ? Play : Pause;

  // Pattern badge
  const patternLabel = patternLabels[recurringSurvey.pattern] || recurringSurvey.pattern;

  // Action permissions
  const canPause = isActive;
  const canResume = !isActive;
  const canTrigger = isActive;
  const canEdit = true;

  return (
    <Card variant="elevated" shape="rounded" className={cn('relative overflow-hidden', isLoading && 'opacity-60 pointer-events-none')}>
      {/* Status indicator bar */}
      <div className={cn('absolute top-0 left-0 right-0 h-1', isActive ? 'bg-success' : 'bg-warning')} />

      <div className="p-5 pt-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={cn('text-xs', statusClassName)}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusLabel}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {patternLabel}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold text-on-surface truncate">{recurringSurvey.name}</h3>
            <p className="text-sm text-on-surface-variant truncate mt-0.5">{recurringSurvey.surveyTitle}</p>
          </div>

          <Menu
            trigger={
              <IconButton variant="standard" size="sm" aria-label={t('a11y.moreOptions')}>
                <MoreVertical className="h-4 w-4" />
              </IconButton>
            }
            align="end"
          >
            {canTrigger && onTrigger && (
              <MenuItem onClick={() => onTrigger(recurringSurvey.id)} icon={<Zap className="h-4 w-4" />}>
                Run Now
              </MenuItem>
            )}
            {canPause && onPause && (
              <MenuItem onClick={() => onPause(recurringSurvey.id)} icon={<Pause className="h-4 w-4" />}>
                Pause
              </MenuItem>
            )}
            {canResume && onResume && (
              <MenuItem onClick={() => onResume(recurringSurvey.id)} icon={<Play className="h-4 w-4" />}>
                Resume
              </MenuItem>
            )}
            {onViewHistory && (
              <MenuItem onClick={() => onViewHistory(recurringSurvey.id)} icon={<History className="h-4 w-4" />}>
                View History
              </MenuItem>
            )}
            {canEdit && onEdit && (
              <MenuItem onClick={() => onEdit(recurringSurvey.id)} icon={<Settings className="h-4 w-4" />}>
                Edit Schedule
              </MenuItem>
            )}
            {onDelete && (
              <>
                <MenuSeparator />
                <MenuItem onClick={() => onDelete(recurringSurvey.id)} destructive icon={<Trash2 className="h-4 w-4" />}>
                  Delete
                </MenuItem>
              </>
            )}
          </Menu>
        </div>

        {/* Recipients count */}
        {recurringSurvey.recipientCount > 0 && (
          <div className="mt-3 flex items-center gap-2 text-sm text-on-surface-variant">
            <Users className="h-4 w-4" />
            <span>{t('recurringSurveys.recipientCount', { count: recurringSurvey.recipientCount })}</span>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-outline-variant/30">
          {/* Next run */}
          <div className="text-center">
            <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">{t('recurringSurveys.nextRun')}</p>
            <Tooltip content={formatDateTime(recurringSurvey.nextRunAt)}>
              <p className="text-sm font-medium text-on-surface truncate">{isActive ? formatRelativeTime(recurringSurvey.nextRunAt) : '—'}</p>
            </Tooltip>
          </div>

          {/* Last run */}
          <div className="text-center border-x border-outline-variant/30">
            <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">{t('recurringSurveys.lastRun')}</p>
            <Tooltip content={formatDateTime(recurringSurvey.lastRunAt)}>
              <p className="text-sm font-medium text-on-surface truncate">{formatRelativeTime(recurringSurvey.lastRunAt)}</p>
            </Tooltip>
          </div>

          {/* Total runs */}
          <div className="text-center">
            <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">{t('recurringSurveys.totalRuns')}</p>
            <p className="text-sm font-medium text-on-surface">{recurringSurvey.totalRuns}</p>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-outline-variant/30">
          {canPause && onPause && (
            <Tooltip content={t('recurringSurveys.pauseTooltip')}>
              <IconButton
                variant="filled-tonal"
                size="sm"
                aria-label={t('a11y.pauseRecurring')}
                onClick={() => onPause(recurringSurvey.id)}
                className="bg-warning-container/50 text-on-warning-container hover:bg-warning-container"
              >
                <Pause className="h-4 w-4" />
              </IconButton>
            </Tooltip>
          )}
          {canResume && onResume && (
            <Tooltip content={t('recurringSurveys.resumeTooltip')}>
              <IconButton
                variant="filled-tonal"
                size="sm"
                aria-label={t('a11y.resumeRecurring')}
                onClick={() => onResume(recurringSurvey.id)}
                className="bg-success-container/50 text-on-success-container hover:bg-success-container"
              >
                <Play className="h-4 w-4" />
              </IconButton>
            </Tooltip>
          )}
          {canTrigger && onTrigger && (
            <Tooltip content={t('recurringSurveys.triggerTooltip')}>
              <IconButton variant="filled-tonal" size="sm" aria-label={t('a11y.triggerRun')} onClick={() => onTrigger(recurringSurvey.id)}>
                <Zap className="h-4 w-4" />
              </IconButton>
            </Tooltip>
          )}
          <div className="flex-1" />
          {onViewHistory && (
            <Tooltip content={t('recurringSurveys.viewHistoryTooltip')}>
              <IconButton variant="standard" size="sm" aria-label={t('a11y.viewHistory')} onClick={() => onViewHistory(recurringSurvey.id)}>
                <History className="h-4 w-4" />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </div>
    </Card>
  );
}
