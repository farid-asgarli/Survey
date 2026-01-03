/**
 * SurveysToolbar - Toolbar with filters and search for surveys page
 */

import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger, DateRangePicker } from '@/components/ui';
import { ListPageLayout } from '@/components/layout/ListPageLayout';
import type { SurveyStatus } from '@/types';

export type StatusFilter = SurveyStatus | 'all';

interface SurveysToolbarProps {
  searchPlaceholder?: string;
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  fromDate?: string;
  toDate?: string;
  onDateChange: (from: string | undefined, to: string | undefined) => void;
}

export function SurveysToolbar({ searchPlaceholder, statusFilter, onStatusFilterChange, fromDate, toDate, onDateChange }: SurveysToolbarProps) {
  const { t } = useTranslation();

  return (
    <ListPageLayout.Toolbar
      searchPlaceholder={searchPlaceholder}
      actions={
        <DateRangePicker
          fromDate={fromDate}
          toDate={toDate}
          onChange={(from, to) => {
            onDateChange(from, to);
          }}
        />
      }
    >
      <Tabs value={String(statusFilter)} onValueChange={(v) => onStatusFilterChange(v as StatusFilter)} variant="segmented">
        <TabsList>
          <TabsTrigger value="all">{t('surveys.filters.all')}</TabsTrigger>
          <TabsTrigger value="Draft">{t('surveys.filters.draft')}</TabsTrigger>
          <TabsTrigger value="Published">{t('surveys.filters.published')}</TabsTrigger>
          <TabsTrigger value="Closed">{t('surveys.filters.closed')}</TabsTrigger>
          <TabsTrigger value="Archived">{t('surveys.status.archived')}</TabsTrigger>
        </TabsList>
      </Tabs>
    </ListPageLayout.Toolbar>
  );
}
