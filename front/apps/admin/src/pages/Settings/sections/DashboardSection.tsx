import { useTranslation } from 'react-i18next';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  SelectionCard,
  SelectionCardLabel,
  SelectionCardIcon,
  SelectionCardGroup,
  Switch,
  Select,
} from '@/components/ui';
import { LayoutGrid, List, ArrowUpDown, PanelLeftClose, Home } from 'lucide-react';
import { usePreferencesStore } from '@/stores';
import { useUpdateSinglePreference } from '@/hooks';
import { cn } from '@/lib/utils';
import type { ViewMode, SortField, SortOrder, HomeWidget } from '@/types';

const VIEW_MODES: { id: ViewMode; labelKey: string; icon: typeof LayoutGrid }[] = [
  { id: 'grid', labelKey: 'settings.dashboard.gridView', icon: LayoutGrid },
  { id: 'list', labelKey: 'settings.dashboard.listView', icon: List },
];

const SORT_FIELDS: { id: SortField; labelKey: string }[] = [
  { id: 'updatedAt', labelKey: 'settings.dashboard.sortByUpdated' },
  { id: 'createdAt', labelKey: 'settings.dashboard.sortByCreated' },
  { id: 'title', labelKey: 'settings.dashboard.sortByTitle' },
  { id: 'status', labelKey: 'settings.dashboard.sortByStatus' },
  { id: 'responseCount', labelKey: 'settings.dashboard.sortByResponses' },
];

const SORT_ORDERS: { id: SortOrder; labelKey: string }[] = [
  { id: 'desc', labelKey: 'settings.dashboard.descending' },
  { id: 'asc', labelKey: 'settings.dashboard.ascending' },
];

const ITEMS_PER_PAGE_OPTIONS = [
  { value: 6, labelKey: 'settings.dashboard.items6' },
  { value: 12, labelKey: 'settings.dashboard.items12' },
  { value: 18, labelKey: 'settings.dashboard.items18' },
  { value: 24, labelKey: 'settings.dashboard.items24' },
  { value: 36, labelKey: 'settings.dashboard.items36' },
  { value: 48, labelKey: 'settings.dashboard.items48' },
];

const HOME_WIDGETS: { id: HomeWidget; labelKey: string; descKey: string }[] = [
  { id: 'stats', labelKey: 'settings.dashboard.widgetStats', descKey: 'settings.dashboard.widgetStatsDesc' },
  { id: 'recent', labelKey: 'settings.dashboard.widgetRecent', descKey: 'settings.dashboard.widgetRecentDesc' },
  { id: 'quick-actions', labelKey: 'settings.dashboard.widgetQuickActions', descKey: 'settings.dashboard.widgetQuickActionsDesc' },
  { id: 'pinned', labelKey: 'settings.dashboard.widgetPinned', descKey: 'settings.dashboard.widgetPinnedDesc' },
  { id: 'analytics', labelKey: 'settings.dashboard.widgetAnalytics', descKey: 'settings.dashboard.widgetAnalyticsDesc' },
];

export function DashboardSection() {
  const { t } = useTranslation();
  const dashboard = usePreferencesStore((s) => s.preferences.dashboard);
  const setDefaultViewMode = usePreferencesStore((s) => s.setDefaultViewMode);
  const setItemsPerPage = usePreferencesStore((s) => s.setItemsPerPage);
  const setSidebarCollapsed = usePreferencesStore((s) => s.setSidebarCollapsed);
  const setDefaultSortField = usePreferencesStore((s) => s.setDefaultSortField);
  const setDefaultSortOrder = usePreferencesStore((s) => s.setDefaultSortOrder);
  const setHomeWidgets = usePreferencesStore((s) => s.setHomeWidgets);
  const { updateDashboard, isPending } = useUpdateSinglePreference();

  const handleViewModeChange = (mode: ViewMode) => {
    setDefaultViewMode(mode);
    updateDashboard({ defaultViewMode: mode });
  };

  const handleItemsPerPageChange = (count: number) => {
    setItemsPerPage(count);
    updateDashboard({ itemsPerPage: count });
  };

  const handleSidebarCollapsedChange = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    updateDashboard({ sidebarCollapsed: collapsed });
  };

  const handleSortFieldChange = (field: SortField) => {
    setDefaultSortField(field);
    updateDashboard({ defaultSortField: field });
  };

  const handleSortOrderChange = (order: SortOrder) => {
    setDefaultSortOrder(order);
    updateDashboard({ defaultSortOrder: order });
  };

  const handleWidgetToggle = (widgetId: HomeWidget) => {
    const current = dashboard.homeWidgets || [];
    const updated = current.includes(widgetId) ? current.filter((id) => id !== widgetId) : [...current, widgetId];
    setHomeWidgets(updated);
    updateDashboard({ homeWidgets: updated });
  };

  return (
    <div className="space-y-6">
      {/* Default View Mode */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 shrink-0 text-primary" />
            {t('settings.dashboard.viewMode')}
          </CardTitle>
          <CardDescription>{t('settings.dashboard.viewModeDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <SelectionCardGroup columns={{ default: 2 }}>
            {VIEW_MODES.map((mode) => {
              const isActive = dashboard.defaultViewMode === mode.id;
              return (
                <SelectionCard
                  key={mode.id}
                  isSelected={isActive}
                  onClick={() => handleViewModeChange(mode.id)}
                  disabled={isPending}
                  shape="rounded-2xl"
                  layout="horizontal"
                  gap={3}
                >
                  <SelectionCardIcon isSelected={isActive} size="md">
                    <mode.icon className="h-5 w-5" />
                  </SelectionCardIcon>
                  <SelectionCardLabel isSelected={isActive}>{t(mode.labelKey)}</SelectionCardLabel>
                </SelectionCard>
              );
            })}
          </SelectionCardGroup>
        </CardContent>
      </Card>

      {/* Items Per Page & Sorting */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5 shrink-0 text-primary" />
            {t('settings.dashboard.listingPreferences')}
          </CardTitle>
          <CardDescription>{t('settings.dashboard.listingPreferencesDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Items Per Page */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-on-surface">{t('settings.dashboard.itemsPerPage')}</label>
            <Select
              value={dashboard.itemsPerPage.toString()}
              onChange={(v) => handleItemsPerPageChange(parseInt(v, 10))}
              disabled={isPending}
              options={ITEMS_PER_PAGE_OPTIONS.map((opt) => ({
                value: opt.value.toString(),
                label: t(opt.labelKey, { count: opt.value }),
              }))}
            />
            <p className="text-xs text-on-surface-variant">{t('settings.dashboard.itemsPerPageHint')}</p>
          </div>

          {/* Default Sort */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface">{t('settings.dashboard.sortBy')}</label>
              <Select
                value={dashboard.defaultSortField}
                onChange={(v) => handleSortFieldChange(v as SortField)}
                disabled={isPending}
                options={SORT_FIELDS.map((field) => ({
                  value: field.id,
                  label: t(field.labelKey),
                }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface">{t('settings.dashboard.sortOrder')}</label>
              <Select
                value={dashboard.defaultSortOrder}
                onChange={(v) => handleSortOrderChange(v as SortOrder)}
                disabled={isPending}
                options={SORT_ORDERS.map((order) => ({
                  value: order.id,
                  label: t(order.labelKey),
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sidebar Preference */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PanelLeftClose className="h-5 w-5 shrink-0 text-primary" />
            {t('settings.dashboard.sidebarBehavior')}
          </CardTitle>
          <CardDescription>{t('settings.dashboard.sidebarBehaviorDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-2xl bg-surface-container p-4">
            <div>
              <p className="font-medium text-on-surface">{t('settings.dashboard.collapsedByDefault')}</p>
              <p className="text-sm text-on-surface-variant">{t('settings.dashboard.collapsedByDefaultDesc')}</p>
            </div>
            <Switch checked={dashboard.sidebarCollapsed} onChange={(e) => handleSidebarCollapsedChange(e.target.checked)} disabled={isPending} />
          </div>
        </CardContent>
      </Card>

      {/* Home Page Widgets */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 shrink-0 text-primary" />
            {t('settings.dashboard.homeWidgets')}
          </CardTitle>
          <CardDescription>{t('settings.dashboard.homeWidgetsDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {HOME_WIDGETS.map((widget) => {
            const isEnabled = (dashboard.homeWidgets || []).includes(widget.id);
            return (
              <div
                key={widget.id}
                className={cn(
                  'flex items-center justify-between rounded-2xl p-4 transition-colors',
                  isEnabled ? 'bg-primary/10' : 'bg-surface-container'
                )}
              >
                <div>
                  <p className={cn('font-medium', isEnabled ? 'text-primary' : 'text-on-surface')}>{t(widget.labelKey)}</p>
                  <p className="text-sm text-on-surface-variant">{t(widget.descKey)}</p>
                </div>
                <Switch checked={isEnabled} onChange={() => handleWidgetToggle(widget.id)} disabled={isPending} />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
