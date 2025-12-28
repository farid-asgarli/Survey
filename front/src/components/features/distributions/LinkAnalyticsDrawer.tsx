import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDateShort, formatDateTime, getToday, getDaysAgo } from '@/utils';
import {
  TrendingUp,
  MousePointerClick,
  Users,
  MapPin,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Globe,
  Loader2,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCcw,
  AlertCircle,
} from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  Card,
  CardContent,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  LinearProgress,
  OverlayHeader,
} from '@/components/ui';
import { useLinkAnalytics } from '@/hooks/queries/useLinks';
import type { SurveyLink, LinkAnalyticsResponse } from '@/types';
import { cn } from '@/lib/utils';

interface LinkAnalyticsDrawerProps {
  link: SurveyLink | null;
  surveyId: string;
  onClose: () => void;
}

// Get default date range (last 30 days)
function getDefaultDateRange(): { startDate: string; endDate: string } {
  return {
    startDate: getDaysAgo(30),
    endDate: getToday(),
  };
}

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  className,
}: {
  label: string;
  value: string | number;
  icon: typeof TrendingUp;
  trend?: { value: number; label: string };
  className?: string;
}) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <ArrowUpRight className='w-3 h-3 text-success' />;
    if (trend.value < 0) return <ArrowDownRight className='w-3 h-3 text-error' />;
    return <Minus className='w-3 h-3 text-on-surface-variant' />;
  };

  return (
    <Card variant='filled' className={cn('overflow-hidden', className)}>
      <CardContent className='p-4'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container-highest'>
            <Icon className='w-5 h-5 text-on-surface-variant' />
          </div>
          <div className='flex-1'>
            <p className='text-2xl font-semibold text-on-surface'>{value}</p>
            <p className='text-xs text-on-surface-variant'>{label}</p>
          </div>
          {trend && (
            <div className='flex items-center gap-1 text-xs'>
              {getTrendIcon()}
              <span className={trend.value > 0 ? 'text-success' : trend.value < 0 ? 'text-error' : 'text-on-surface-variant'}>
                {Math.abs(trend.value)}% {trend.label}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MiniBarChart({ data }: { data: { date: string; clicks: number; uniqueClicks: number }[] }) {
  const maxCount = Math.max(...data.map((d) => d.clicks), 1);
  // Show last 14 days or all data if less
  const recentData = data.slice(-14);

  return (
    <div className='space-y-2'>
      <div className='h-24 flex items-end gap-1'>
        {recentData.map((d) => (
          <div
            key={d.date}
            className='flex-1 bg-primary/80 rounded-t-sm transition-all duration-200 hover:bg-primary cursor-pointer'
            style={{ height: `${(d.clicks / maxCount) * 100}%`, minHeight: d.clicks > 0 ? 4 : 0 }}
            title={`${formatDateShort(d.date)}: ${d.clicks} clicks (${d.uniqueClicks} unique)`}
          />
        ))}
      </div>
      <div className='flex justify-between text-xs text-on-surface-variant'>
        <span>{recentData.length > 0 ? formatDateShort(recentData[0].date) : '-'}</span>
        <span>{recentData.length > 0 ? formatDateShort(recentData[recentData.length - 1].date) : '-'}</span>
      </div>
    </div>
  );
}

// Country flag emoji mapping
const countryFlags: Record<string, string> = {
  US: '🇺🇸',
  GB: '🇬🇧',
  DE: '🇩🇪',
  FR: '🇫🇷',
  CA: '🇨🇦',
  AU: '🇦🇺',
  JP: '🇯🇵',
  CN: '🇨🇳',
  IN: '🇮🇳',
  BR: '🇧🇷',
  MX: '🇲🇽',
  ES: '🇪🇸',
  IT: '🇮🇹',
  NL: '🇳🇱',
  RU: '🇷🇺',
  KR: '🇰🇷',
  AE: '🇦🇪',
  SG: '🇸🇬',
  HK: '🇭🇰',
  SE: '🇸🇪',
  NO: '🇳🇴',
  DK: '🇩🇰',
  FI: '🇫🇮',
  PL: '🇵🇱',
  CH: '🇨🇭',
  AT: '🇦🇹',
  BE: '🇧🇪',
  IE: '🇮🇪',
  NZ: '🇳🇿',
  ZA: '🇿🇦',
};

function EmptyDataMessage({ message }: { message: string }) {
  return (
    <div className='flex flex-col items-center justify-center py-8 text-center'>
      <AlertCircle className='w-8 h-8 text-on-surface-variant/50 mb-2' />
      <p className='text-sm text-on-surface-variant'>{message}</p>
    </div>
  );
}

function GeoDistribution({ data, emptyMessage }: { data: LinkAnalyticsResponse['clicksByCountry'] | undefined; emptyMessage: string }) {
  if (!data || data.length === 0) {
    return <EmptyDataMessage message={emptyMessage} />;
  }

  return (
    <div className='space-y-3'>
      {data.map((item) => (
        <div key={item.country} className='flex items-center gap-3'>
          <div className='flex items-center gap-2 flex-1 min-w-0'>
            <span className='text-lg'>{countryFlags[item.countryCode] || '🌍'}</span>
            <span className='text-sm truncate'>{item.country}</span>
          </div>
          <div className='flex items-center gap-2 w-32'>
            <LinearProgress value={item.percentage} size='sm' className='flex-1' />
            <span className='text-xs text-on-surface-variant w-10 text-right'>{item.percentage.toFixed(0)}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Device icon mapping
const deviceIcons: Record<string, typeof Monitor> = {
  Desktop: Monitor,
  Mobile: Smartphone,
  Tablet: Tablet,
};

function DeviceDistribution({ data, emptyMessage }: { data: LinkAnalyticsResponse['clicksByDevice'] | undefined; emptyMessage: string }) {
  if (!data || data.length === 0) {
    return <EmptyDataMessage message={emptyMessage} />;
  }

  return (
    <div className='space-y-3'>
      {data.map((item) => {
        const Icon = deviceIcons[item.device] || Monitor;
        return (
          <div key={item.device} className='flex items-center gap-3'>
            <div className='flex items-center gap-2 flex-1 min-w-0'>
              <Icon className='w-4 h-4 text-on-surface-variant' />
              <span className='text-sm'>{item.device}</span>
            </div>
            <div className='flex items-center gap-2 w-32'>
              <LinearProgress value={item.percentage} size='sm' className='flex-1' />
              <span className='text-xs text-on-surface-variant w-10 text-right'>{item.percentage.toFixed(0)}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ReferrerDistribution({
  data,
  emptyMessage,
  directLabel,
}: {
  data: LinkAnalyticsResponse['clicksByReferrer'] | undefined;
  emptyMessage: string;
  directLabel: string;
}) {
  if (!data || data.length === 0) {
    return <EmptyDataMessage message={emptyMessage} />;
  }

  return (
    <div className='space-y-3'>
      {data.map((item) => (
        <div key={item.referrer} className='flex items-center gap-3'>
          <div className='flex items-center gap-2 flex-1 min-w-0'>
            <Globe className='w-4 h-4 text-on-surface-variant' />
            <span className='text-sm truncate'>{item.referrer || directLabel}</span>
          </div>
          <div className='flex items-center gap-2 w-32'>
            <LinearProgress value={item.percentage} size='sm' className='flex-1' />
            <span className='text-xs text-on-surface-variant w-10 text-right'>{item.percentage.toFixed(0)}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-2 gap-3'>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className='h-24 rounded-2xl' />
        ))}
      </div>
      <Skeleton className='h-48 rounded-2xl' />
      <Skeleton className='h-48 rounded-2xl' />
    </div>
  );
}

function ErrorState({ onRetry, title, description, retryLabel }: { onRetry: () => void; title: string; description: string; retryLabel: string }) {
  return (
    <div className='flex flex-col items-center justify-center py-12 text-center'>
      <AlertCircle className='w-12 h-12 text-error mb-4' />
      <h4 className='text-lg font-medium text-on-surface mb-2'>{title}</h4>
      <p className='text-sm text-on-surface-variant mb-4'>{description}</p>
      <Button onClick={onRetry} variant='tonal'>
        <RefreshCcw className='w-4 h-4 mr-2' />
        {retryLabel}
      </Button>
    </div>
  );
}

export function LinkAnalyticsDrawer({ link, surveyId, onClose }: LinkAnalyticsDrawerProps) {
  const { t } = useTranslation();
  const [dateRange] = useState(getDefaultDateRange);

  // Fetch analytics from API
  const { data: analytics, isLoading, error, refetch } = useLinkAnalytics(link ? surveyId : undefined, link?.id, dateRange.startDate, dateRange.endDate);

  // Memoize conversion rate calculation
  const conversionRate = useMemo(() => {
    if (!analytics) return '0.0';
    return analytics.conversionRate?.toFixed(1) ?? '0.0';
  }, [analytics]);

  if (!link) return null;

  return (
    <Drawer open={!!link} onOpenChange={() => onClose()} side='right'>
      <DrawerContent className='max-w-lg' showClose={false}>
        <DrawerHeader
          hero
          icon={<TrendingUp className='h-7 w-7' />}
          title={t('linkAnalytics.title')}
          description={
            <>
              {t('linkAnalytics.description')} <code className='bg-surface/80 px-1.5 py-0.5 rounded text-xs'>{link.token}</code>
            </>
          }
          showClose
        >
          {/* Stats pills */}
          {analytics && (
            <div className='flex items-center gap-3 mt-4 flex-wrap'>
              <OverlayHeader.StatsPill icon={<MousePointerClick />} value={analytics.totalClicks?.toLocaleString() ?? 0} label={t('linkAnalytics.clicks')} />
              <OverlayHeader.StatsPill icon={<Users />} value={analytics.totalResponses?.toLocaleString() ?? 0} label={t('linkAnalytics.responses')} />
              <OverlayHeader.Badge icon={<TrendingUp />} text={t('linkAnalytics.conversion', { rate: conversionRate })} variant='success' />
            </div>
          )}
        </DrawerHeader>

        <DrawerBody className='pt-5'>
          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorState
              onRetry={() => refetch()}
              title={t('linkAnalytics.error.title')}
              description={t('linkAnalytics.error.description')}
              retryLabel={t('common.tryAgain')}
            />
          ) : analytics ? (
            <div className='space-y-6'>
              {/* Secondary Metrics */}
              <div className='grid grid-cols-2 gap-3'>
                <StatCard label={t('linkAnalytics.uniqueClicks')} value={analytics.uniqueClicks?.toLocaleString() ?? 0} icon={Users} />
                <StatCard label={t('linkAnalytics.topCountries')} value={analytics.clicksByCountry?.length ?? 0} icon={MapPin} />
              </div>

              {/* Clicks Over Time */}
              {analytics.clicksByDate && analytics.clicksByDate.length > 0 && (
                <Card variant='outlined'>
                  <CardContent className='p-4'>
                    <h4 className='text-sm font-medium mb-4 flex items-center gap-2'>
                      <Calendar className='w-4 h-4' />
                      {t('linkAnalytics.clicksOverTime')}
                    </h4>
                    <MiniBarChart data={analytics.clicksByDate} />
                  </CardContent>
                </Card>
              )}

              {/* Distribution Tabs */}
              <Tabs defaultValue='geo'>
                <TabsList className='w-full'>
                  <TabsTrigger value='geo' className='flex-1'>
                    <MapPin className='w-4 h-4 mr-1.5' />
                    {t('linkAnalytics.tabs.geography')}
                  </TabsTrigger>
                  <TabsTrigger value='device' className='flex-1'>
                    {t('linkAnalytics.tabs.device')}
                  </TabsTrigger>
                  <TabsTrigger value='referrer' className='flex-1'>
                    {t('linkAnalytics.tabs.referrer')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value='geo' className='mt-4'>
                  <Card variant='outlined'>
                    <CardContent className='p-4'>
                      <h4 className='text-sm font-medium mb-4'>{t('linkAnalytics.geoDistribution')}</h4>
                      <GeoDistribution data={analytics.clicksByCountry} emptyMessage={t('linkAnalytics.noGeoData')} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value='device' className='mt-4'>
                  <Card variant='outlined'>
                    <CardContent className='p-4'>
                      <h4 className='text-sm font-medium mb-4'>{t('linkAnalytics.deviceBreakdown')}</h4>
                      <DeviceDistribution data={analytics.clicksByDevice} emptyMessage={t('linkAnalytics.noDeviceData')} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value='referrer' className='mt-4'>
                  <Card variant='outlined'>
                    <CardContent className='p-4'>
                      <h4 className='text-sm font-medium mb-4'>{t('linkAnalytics.trafficSources')}</h4>
                      <ReferrerDistribution
                        data={analytics.clicksByReferrer}
                        emptyMessage={t('linkAnalytics.noReferrerData')}
                        directLabel={t('linkAnalytics.direct')}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Link Details */}
              <Card variant='filled'>
                <CardContent className='p-4'>
                  <h4 className='text-sm font-medium mb-3'>{t('linkAnalytics.linkDetails')}</h4>
                  <dl className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <dt className='text-on-surface-variant'>{t('linkAnalytics.details.created')}</dt>
                      <dd>{formatDateTime(link.createdAt)}</dd>
                    </div>
                    <div className='flex justify-between'>
                      <dt className='text-on-surface-variant'>{t('linkAnalytics.details.type')}</dt>
                      <dd>{link.type}</dd>
                    </div>
                    {link.name && (
                      <div className='flex justify-between'>
                        <dt className='text-on-surface-variant'>{t('linkAnalytics.details.name')}</dt>
                        <dd>{link.name}</dd>
                      </div>
                    )}
                    <div className='flex justify-between'>
                      <dt className='text-on-surface-variant'>{t('linkAnalytics.details.status')}</dt>
                      <dd className={link.isActive ? 'text-success' : 'text-error'}>
                        {link.isActive ? t('linkAnalytics.details.active') : t('linkAnalytics.details.inactive')}
                      </dd>
                    </div>
                    {link.expiresAt && (
                      <div className='flex justify-between'>
                        <dt className='text-on-surface-variant'>{t('linkAnalytics.details.expires')}</dt>
                        <dd>{formatDateTime(link.expiresAt)}</dd>
                      </div>
                    )}
                    {link.maxUses && (
                      <div className='flex justify-between'>
                        <dt className='text-on-surface-variant'>{t('linkAnalytics.details.maxResponses')}</dt>
                        <dd>
                          {link.responseCount} / {link.maxUses}
                        </dd>
                      </div>
                    )}
                    {link.hasPassword && (
                      <div className='flex justify-between'>
                        <dt className='text-on-surface-variant'>{t('linkAnalytics.details.passwordProtected')}</dt>
                        <dd>{t('common.yes')}</dd>
                      </div>
                    )}
                    {link.source && (
                      <div className='flex justify-between'>
                        <dt className='text-on-surface-variant'>{t('linkAnalytics.details.utmSource')}</dt>
                        <dd>{link.source}</dd>
                      </div>
                    )}
                    {link.medium && (
                      <div className='flex justify-between'>
                        <dt className='text-on-surface-variant'>{t('linkAnalytics.details.utmMedium')}</dt>
                        <dd>{link.medium}</dd>
                      </div>
                    )}
                    {link.campaign && (
                      <div className='flex justify-between'>
                        <dt className='text-on-surface-variant'>{t('linkAnalytics.details.utmCampaign')}</dt>
                        <dd>{link.campaign}</dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-12 text-center'>
              <Loader2 className='w-8 h-8 text-primary animate-spin mb-4' />
              <p className='text-on-surface-variant'>{t('linkAnalytics.loading')}</p>
            </div>
          )}
        </DrawerBody>

        <DrawerFooter>
          <Button variant='text' onClick={onClose}>
            {t('common.close')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
