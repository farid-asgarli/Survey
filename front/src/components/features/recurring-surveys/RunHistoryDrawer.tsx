import { useMemo } from 'react';
import {
  History,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  SkipForward,
  Loader2,
  RefreshCw,
  BarChart2,
  Mail,
  Users,
  CalendarClock,
} from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, OverlayHeader, Button, Badge, Skeleton, EmptyState, Tooltip } from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatDateTime, formatDurationMs } from '@/utils';
import { useRecurringRunsInfinite } from '@/hooks/queries/useRecurringSurveys';
import { RunStatus, getRunStatusLabel } from '@/types/enums';
import type { RecurringSurvey, RecurringSurveyListItem, RecurringRun } from '@/types';

interface RunHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recurringSurvey?: RecurringSurvey | RecurringSurveyListItem | null;
}

const statusConfig: Record<RunStatus, { className: string; icon: typeof CheckCircle2 }> = {
  [RunStatus.Scheduled]: {
    className: 'bg-info-container text-on-info-container',
    icon: Clock,
  },
  [RunStatus.Running]: {
    className: 'bg-primary-container text-on-primary-container',
    icon: Loader2,
  },
  [RunStatus.Completed]: {
    className: 'bg-success-container text-on-success-container',
    icon: CheckCircle2,
  },
  [RunStatus.PartiallyCompleted]: {
    className: 'bg-warning-container text-on-warning-container',
    icon: AlertTriangle,
  },
  [RunStatus.Failed]: {
    className: 'bg-error-container text-on-error-container',
    icon: XCircle,
  },
  [RunStatus.Cancelled]: {
    className: 'bg-surface-container text-on-surface-variant',
    icon: SkipForward,
  },
  [RunStatus.Skipped]: {
    className: 'bg-surface-container text-on-surface-variant',
    icon: SkipForward,
  },
};

function RunHistoryItem({ run }: { run: RecurringRun }) {
  const status = statusConfig[run.status];
  const StatusIcon = status.icon;

  return (
    <div className="flex items-start gap-3 p-4 bg-surface-container-low rounded-2xl">
      {/* Status icon */}
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl shrink-0',
          run.status === RunStatus.Running && 'animate-pulse',
          status.className
        )}
      >
        <StatusIcon className={cn('h-5 w-5', run.status === RunStatus.Running && 'animate-spin')} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={cn('text-xs', status.className)}>{getRunStatusLabel(run.status)}</Badge>
          <Badge variant="secondary" className="text-xs">
            Run #{run.runNumber}
          </Badge>
          {run.responsesCount > 0 && (
            <Tooltip content="Responses collected">
              <Badge variant="secondary" className="text-xs">
                <BarChart2 className="h-3 w-3 mr-1" />
                {run.responsesCount} response{run.responsesCount !== 1 ? 's' : ''}
              </Badge>
            </Tooltip>
          )}
        </div>

        {/* Email stats */}
        {(run.sentCount > 0 || run.recipientsCount > 0) && (
          <div className="mt-2 flex items-center gap-3 text-xs text-on-surface-variant">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {run.recipientsCount} recipients
            </span>
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {run.sentCount} sent
            </span>
            {run.failedCount > 0 && (
              <span className="flex items-center gap-1 text-error">
                <XCircle className="h-3 w-3" />
                {run.failedCount} failed
              </span>
            )}
          </div>
        )}

        {/* Times */}
        <div className="mt-2 space-y-1 text-sm text-on-surface-variant">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>Scheduled: {formatDateTime(run.scheduledAt)}</span>
          </div>
          {run.startedAt && (
            <div className="flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5 shrink-0" />
              <span>Started: {formatDateTime(run.startedAt)}</span>
            </div>
          )}
          {run.completedAt && (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>
                Completed: {formatDateTime(run.completedAt)} ({formatDurationMs(run.durationMs)})
              </span>
            </div>
          )}
        </div>

        {/* Error message */}
        {run.errorMessage && (
          <div className="mt-2 p-2 bg-error-container/30 rounded-lg">
            <p className="text-sm text-error flex items-start gap-1.5">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              {run.errorMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function RunHistorySkeleton() {
  return (
    <div className="flex items-start gap-3 p-4 bg-surface-container-low rounded-2xl">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  );
}

export function RunHistoryDrawer({ open, onOpenChange, recurringSurvey }: RunHistoryDrawerProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } = useRecurringRunsInfinite(recurringSurvey?.id, {
    pageSize: 20,
  });

  // Flatten pages into single array
  const runs = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.items);
  }, [data]);

  const totalCount = data?.pages[0]?.totalCount ?? 0;

  // Stats calculation
  const stats = useMemo(() => {
    const completed = runs.filter((r) => r.status === RunStatus.Completed).length;
    const failed = runs.filter((r) => r.status === RunStatus.Failed).length;
    const skipped = runs.filter((r) => r.status === RunStatus.Skipped).length;
    const totalResponses = runs.reduce((sum, r) => sum + r.responsesCount, 0);
    return { completed, failed, skipped, totalResponses };
  }, [runs]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} side="right">
      <DrawerContent className="w-full max-w-lg" showClose={false}>
        <DrawerHeader
          hero
          icon={<History className="h-7 w-7" />}
          title="Run History"
          description={recurringSurvey?.name || 'Recurring Survey'}
          showClose
        >
          {/* Stats pills */}
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <OverlayHeader.StatsPill icon={<CalendarClock />} value={totalCount} label="runs" />
            <OverlayHeader.StatsPill icon={<BarChart2 />} value={stats.totalResponses} label="responses" />
          </div>
        </DrawerHeader>

        {/* Stats summary - more compact grid */}
        {runs.length > 0 && (
          <div className="px-5 pt-4 pb-2">
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-2 bg-success-container/30 rounded-xl">
                <p className="text-lg font-bold text-success">{stats.completed}</p>
                <p className="text-xs text-on-surface-variant">Completed</p>
              </div>
              <div className="text-center p-2 bg-error-container/30 rounded-xl">
                <p className="text-lg font-bold text-error">{stats.failed}</p>
                <p className="text-xs text-on-surface-variant">Failed</p>
              </div>
              <div className="text-center p-2 bg-warning-container/30 rounded-xl">
                <p className="text-lg font-bold text-warning">{stats.skipped}</p>
                <p className="text-xs text-on-surface-variant">Skipped</p>
              </div>
              <div className="text-center p-2 bg-primary-container/30 rounded-xl">
                <p className="text-lg font-bold text-primary">{stats.totalResponses}</p>
                <p className="text-xs text-on-surface-variant">Responses</p>
              </div>
            </div>
          </div>
        )}

        <DrawerBody>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <RunHistorySkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <EmptyState
              icon={<AlertTriangle className="h-8 w-8" />}
              title="Failed to load history"
              description="Something went wrong while loading the run history."
              action={{
                label: 'Try Again',
                onClick: () => refetch(),
              }}
            />
          ) : runs.length === 0 ? (
            <EmptyState
              icon={<History className="h-8 w-8" />}
              title="No runs yet"
              description="This recurring survey hasn't run yet. The first run will be triggered according to the schedule."
            />
          ) : (
            <div className="space-y-3">
              {runs.map((run) => (
                <RunHistoryItem key={run.id} run={run} />
              ))}

              {/* Load more button */}
              {hasNextPage && (
                <div className="pt-2">
                  <Button
                    variant="tonal"
                    className="w-full"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    loading={isFetchingNextPage}
                  >
                    Load More
                  </Button>
                </div>
              )}
            </div>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
