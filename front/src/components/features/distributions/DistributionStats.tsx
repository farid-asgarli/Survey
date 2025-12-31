// DistributionStats component - Shows email distribution analytics and recipient status

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Send,
  Mail,
  CheckCircle2,
  Eye,
  MousePointerClick,
  AlertTriangle,
  XCircle,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  RefreshCw,
  ChevronDown,
  Search,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Chip,
  LinearProgress,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { useDistributionStats, useDistributionRecipients } from '@/hooks/queries/useDistributions';
import { RecipientStatus, getRecipientStatusLabel } from '@/types';
import type { DistributionStatsResponse, DistributionRecipient } from '@/types';

interface DistributionStatsProps {
  surveyId: string;
  distributionId: string;
  className?: string;
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  percentage?: number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

function StatCard({ label, value, icon, color, percentage, trend, trendValue }: StatCardProps) {
  return (
    <Card variant="filled" className={cn('relative overflow-hidden', color)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium opacity-80 uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {percentage !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                {trend && trend !== 'neutral' && (
                  <span className="flex items-center text-xs">
                    {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {trendValue}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="p-2 rounded-xl bg-surface-container-lowest/20">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// Simple bar chart component
function SimpleBarChart({ data, maxValue }: { data: { label: string; value: number; color: string }[]; maxValue: number }) {
  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-on-surface-variant">{item.label}</span>
            <span className="font-medium text-on-surface">{item.value}</span>
          </div>
          <div className="h-2 rounded-full bg-surface-container-highest overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', item.color)}
              style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Fallback mock recipients data when API is not available
const mockRecipients: DistributionRecipient[] = [
  {
    id: '1',
    distributionId: '1',
    email: 'john.doe@example.com',
    status: RecipientStatus.Opened,
    sentAt: '2024-12-15T10:00:00',
    openedAt: '2024-12-15T10:30:00',
  },
  {
    id: '2',
    distributionId: '1',
    email: 'jane.smith@example.com',
    status: RecipientStatus.Clicked,
    sentAt: '2024-12-15T10:00:00',
    openedAt: '2024-12-15T11:00:00',
    clickedAt: '2024-12-15T11:05:00',
  },
  { id: '3', distributionId: '1', email: 'bob.wilson@example.com', status: RecipientStatus.Delivered, sentAt: '2024-12-15T10:00:00' },
  { id: '4', distributionId: '1', email: 'alice.johnson@example.com', status: RecipientStatus.Bounced, sentAt: '2024-12-15T10:00:00' },
  { id: '5', distributionId: '1', email: 'charlie.brown@example.com', status: RecipientStatus.Sent, sentAt: '2024-12-15T10:00:00' },
  {
    id: '6',
    distributionId: '1',
    email: 'diana.ross@example.com',
    status: RecipientStatus.Opened,
    sentAt: '2024-12-15T10:00:00',
    openedAt: '2024-12-15T14:00:00',
  },
  { id: '7', distributionId: '1', email: 'edward.king@example.com', status: RecipientStatus.Failed },
  { id: '8', distributionId: '1', email: 'fiona.green@example.com', status: RecipientStatus.Pending },
];

const recipientStatusConfig: Record<RecipientStatus, { color: string; icon: typeof Send }> = {
  [RecipientStatus.Pending]: { color: 'bg-surface-container text-on-surface-variant', icon: Clock },
  [RecipientStatus.Sent]: { color: 'bg-primary-container text-on-primary-container', icon: Send },
  [RecipientStatus.Delivered]: { color: 'bg-secondary-container text-on-secondary-container', icon: CheckCircle2 },
  [RecipientStatus.Opened]: { color: 'bg-tertiary-container text-on-tertiary-container', icon: Eye },
  [RecipientStatus.Clicked]: { color: 'bg-success-container text-on-success-container', icon: MousePointerClick },
  [RecipientStatus.Bounced]: { color: 'bg-warning-container text-on-warning-container', icon: AlertTriangle },
  [RecipientStatus.Unsubscribed]: { color: 'bg-warning-container text-on-warning-container', icon: AlertTriangle },
  [RecipientStatus.Failed]: { color: 'bg-error-container text-on-error-container', icon: XCircle },
};

function RecipientRow({ recipient }: { recipient: DistributionRecipient }) {
  const config = recipientStatusConfig[recipient.status];
  const StatusIcon = config.icon;

  return (
    <div className="flex items-center gap-3 py-3 px-4 hover:bg-surface-container-low transition-colors border-b border-outline-variant/30 last:border-0">
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', config.color)}>
        <StatusIcon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-on-surface truncate">{recipient.email}</p>
        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          {recipient.sentAt && <span>Sent: {new Date(recipient.sentAt).toLocaleString()}</span>}
          {recipient.openedAt && (
            <>
              <span>•</span>
              <span>Opened: {new Date(recipient.openedAt).toLocaleString()}</span>
            </>
          )}
          {recipient.clickedAt && (
            <>
              <span>•</span>
              <span>Clicked: {new Date(recipient.clickedAt).toLocaleString()}</span>
            </>
          )}
        </div>
      </div>
      <Chip size="sm" className={config.color}>
        {getRecipientStatusLabel(recipient.status)}
      </Chip>
    </div>
  );
}

export function DistributionStats({ surveyId, distributionId, className }: DistributionStatsProps) {
  const { t } = useTranslation();
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
    isRefetching: isRefetchingStats,
  } = useDistributionStats(surveyId, distributionId);
  const [statusFilter, setStatusFilter] = useState<RecipientStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch recipients with infinite scroll
  const {
    data: recipientsData,
    isLoading: recipientsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError: recipientsError,
  } = useDistributionRecipients(surveyId, distributionId, {
    status: statusFilter !== 'all' ? statusFilter : undefined,
    pageSize: 20,
  });

  // Flatten paginated recipients data
  const apiRecipients = useMemo(() => {
    if (!recipientsData?.pages) return [];
    return recipientsData.pages.flatMap((page) => page.items);
  }, [recipientsData]);

  // Use API recipients if available, otherwise use mock data
  const recipients = apiRecipients.length > 0 || !recipientsError ? apiRecipients : mockRecipients;

  // Filter recipients by search query (client-side filtering for already fetched data)
  const filteredRecipients = useMemo(() => {
    if (!debouncedSearch) return recipients;
    return recipients.filter((r) => r.email.toLowerCase().includes(debouncedSearch.toLowerCase()));
  }, [recipients, debouncedSearch]);

  // Total recipients count
  const totalRecipients = recipientsData?.pages[0]?.totalCount ?? recipients.length;

  // Handle status filter change - reset the query
  const handleStatusFilterChange = useCallback((value: string) => {
    if (value === 'all') {
      setStatusFilter('all');
    } else {
      setStatusFilter(Number(value) as RecipientStatus);
    }
  }, []);

  // Use mock data if API not available
  const displayStats: DistributionStatsResponse = stats || {
    distributionId,
    totalRecipients: 500,
    sent: 498,
    delivered: 480,
    opened: 245,
    clicked: 180,
    bounced: 12,
    failed: 8,
    deliveryRate: 96.4,
    openRate: 51.0,
    clickRate: 73.5,
  };

  const barChartData = [
    { label: 'Sent', value: displayStats.sent, color: 'bg-primary' },
    { label: 'Delivered', value: displayStats.delivered, color: 'bg-secondary' },
    { label: 'Opened', value: displayStats.opened, color: 'bg-tertiary' },
    { label: 'Clicked', value: displayStats.clicked, color: 'bg-success' },
    { label: 'Bounced', value: displayStats.bounced, color: 'bg-warning' },
  ];

  const handleRefresh = useCallback(() => {
    refetchStats();
  }, [refetchStats]);

  if (statsLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-on-surface">{t('distributions.analytics')}</h3>
        <Button variant="tonal" size="sm" onClick={handleRefresh} disabled={isRefetchingStats}>
          <RefreshCw className={cn('w-4 h-4 mr-2', isRefetchingStats && 'animate-spin')} />
          {t('common.refresh')}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('distributions.sent')}
          value={displayStats.sent}
          icon={<Send className="w-5 h-5" />}
          color="bg-primary text-on-primary"
          percentage={displayStats.totalRecipients > 0 ? (displayStats.sent / displayStats.totalRecipients) * 100 : 0}
        />
        <StatCard
          label={t('distributions.delivered')}
          value={displayStats.delivered}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="bg-secondary text-on-secondary"
          percentage={displayStats.deliveryRate}
        />
        <StatCard
          label={t('distributions.statusOpened')}
          value={displayStats.opened}
          icon={<Eye className="w-5 h-5" />}
          color="bg-tertiary text-on-tertiary"
          percentage={displayStats.openRate}
        />
        <StatCard
          label={t('distributions.statusClicked')}
          value={displayStats.clicked}
          icon={<MousePointerClick className="w-5 h-5" />}
          color="bg-success text-on-success"
          percentage={displayStats.clickRate}
        />
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel Chart */}
        <Card variant="outlined">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              {t('distributions.deliveryFunnel')}
            </CardTitle>
            <CardDescription>{t('distributions.performanceBreakdown')}</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={barChartData} maxValue={displayStats.totalRecipients} />
          </CardContent>
        </Card>

        {/* Rates Overview */}
        <Card variant="outlined">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              {t('distributions.performanceRates')}
            </CardTitle>
            <CardDescription>{t('distributions.metricsComparison')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-on-surface-variant">{t('distributions.deliveryRate')}</span>
                <span className="font-semibold text-on-surface">{displayStats.deliveryRate.toFixed(1)}%</span>
              </div>
              <LinearProgress value={displayStats.deliveryRate} size="default" className="bg-primary" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-on-surface-variant">{t('distributions.openRate')}</span>
                <span className="font-semibold text-on-surface">{displayStats.openRate.toFixed(1)}%</span>
              </div>
              <LinearProgress value={displayStats.openRate} size="default" className="bg-tertiary" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-on-surface-variant">{t('distributions.clickRate')}</span>
                <span className="font-semibold text-on-surface">{displayStats.clickRate.toFixed(1)}%</span>
              </div>
              <LinearProgress value={displayStats.clickRate} size="default" className="bg-success" />
            </div>

            <div className="pt-2 border-t border-outline-variant/30 flex justify-between text-sm">
              <span className="text-on-surface-variant">
                {t('distributions.bounced')}: <span className="font-medium text-warning">{displayStats.bounced}</span>
              </span>
              <span className="text-on-surface-variant">
                {t('distributions.failed')}: <span className="font-medium text-error">{displayStats.failed}</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recipients List */}
      <Card variant="outlined">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                {t('distributions.recipients')}
              </CardTitle>
              <CardDescription>{t('distributions.totalRecipients', { count: totalRecipients })}</CardDescription>
            </div>

            {/* Search Filter */}
            <div className="flex items-center gap-2">
              <Input
                placeholder={t('distributions.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startIcon={<Search className="w-4 h-4" />}
                size="sm"
                className="w-48"
              />
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="mt-4">
            <Tabs value={statusFilter === 'all' ? 'all' : String(statusFilter)} onValueChange={(v) => handleStatusFilterChange(v)}>
              <TabsList className="flex-wrap">
                <TabsTrigger value="all" className="text-xs">
                  {t('distributions.statusAll')}
                </TabsTrigger>
                <TabsTrigger value={String(RecipientStatus.Sent)} className="text-xs">
                  {t('distributions.statusSent')}
                </TabsTrigger>
                <TabsTrigger value={String(RecipientStatus.Delivered)} className="text-xs">
                  {t('distributions.statusDelivered')}
                </TabsTrigger>
                <TabsTrigger value={String(RecipientStatus.Opened)} className="text-xs">
                  {t('distributions.statusOpened')}
                </TabsTrigger>
                <TabsTrigger value={String(RecipientStatus.Clicked)} className="text-xs">
                  {t('distributions.statusClicked')}
                </TabsTrigger>
                <TabsTrigger value={String(RecipientStatus.Bounced)} className="text-xs">
                  {t('distributions.statusBounced')}
                </TabsTrigger>
                <TabsTrigger value={String(RecipientStatus.Failed)} className="text-xs">
                  {t('distributions.statusFailed')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {recipientsLoading ? (
            <div className="divide-y divide-outline-variant/30">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 py-3 px-4">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/30">
              {filteredRecipients.length > 0 ? (
                filteredRecipients.map((recipient) => <RecipientRow key={recipient.id} recipient={recipient} />)
              ) : (
                <div className="py-8 text-center">
                  <Mail className="w-8 h-8 mx-auto text-on-surface-variant mb-2" />
                  <p className="text-sm text-on-surface-variant">{t('distributions.noRecipients')}</p>
                </div>
              )}
            </div>
          )}

          {/* Load More Button */}
          {hasNextPage && (
            <div className="p-4 border-t border-outline-variant/30">
              <Button variant="text" onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="w-full">
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    {t('common.loadMore')}
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
