/**
 * SurveysToolbar - Toolbar with filters and search for surveys page
 */

import { useTranslation } from 'react-i18next';
import { Tags, Check, ChevronDown } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, DateRangePicker, Menu, MenuItem } from '@/components/ui';
import { ListPageLayout } from '@/components/layout/ListPageLayout';
import { useCategoryOptions } from '@/hooks';
import { cn } from '@/lib/utils';
import type { SurveyStatus } from '@/types';

export type StatusFilter = SurveyStatus | 'all';

interface SurveysToolbarProps {
  searchPlaceholder?: string;
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  fromDate?: string;
  toDate?: string;
  onDateChange: (from: string | undefined, to: string | undefined) => void;
  categoryFilter?: string;
  onCategoryFilterChange: (categoryId: string | undefined) => void;
}

export function SurveysToolbar({
  searchPlaceholder,
  statusFilter,
  onStatusFilterChange,
  fromDate,
  toDate,
  onDateChange,
  categoryFilter,
  onCategoryFilterChange,
}: SurveysToolbarProps) {
  const { t } = useTranslation();
  const { data: categoryOptions = [] } = useCategoryOptions();

  // Find the selected category
  const selectedCategory = categoryOptions.find((c) => c.id === categoryFilter);

  return (
    <ListPageLayout.Toolbar
      searchPlaceholder={searchPlaceholder}
      actions={
        <div className='flex items-center gap-2'>
          {/* Category Filter */}
          <Menu
            align='end'
            side='bottom'
            maxHeight='280px'
            trigger={
              <button
                className={cn(
                  'flex items-center gap-2 h-11 px-4 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
                  'bg-surface-container hover:bg-surface-container-high border-2 border-outline-variant/40',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                  categoryFilter && 'bg-primary-container/50 border-primary/30'
                )}
              >
                <Tags className='h-4 w-4' />
                {selectedCategory ? (
                  <>
                    <span className='w-2 h-2 rounded-full' style={{ backgroundColor: selectedCategory.color }} />
                    <span>{selectedCategory.name}</span>
                  </>
                ) : (
                  <span>{t('categories.allCategories', 'All Categories')}</span>
                )}
                <ChevronDown className='h-3.5 w-3.5' />
              </button>
            }
          >
            <MenuItem onClick={() => onCategoryFilterChange(undefined)} className={cn(!categoryFilter && 'bg-primary/8')}>
              <span className='flex-1'>{t('categories.allCategories', 'All Categories')}</span>
              {!categoryFilter && <Check className='h-4 w-4 text-primary' />}
            </MenuItem>
            {categoryOptions.map((cat) => {
              const isSelected = categoryFilter === cat.id;
              return (
                <MenuItem key={cat.id} onClick={() => onCategoryFilterChange(cat.id)} className={cn(isSelected && 'bg-primary/8')}>
                  <span className='w-2.5 h-2.5 rounded-full mr-2' style={{ backgroundColor: cat.color }} />
                  <span className='flex-1'>{cat.name}</span>
                  {isSelected && <Check className='h-4 w-4 text-primary' />}
                </MenuItem>
              );
            })}
          </Menu>
          <DateRangePicker
            fromDate={fromDate}
            toDate={toDate}
            onChange={(from, to) => {
              onDateChange(from, to);
            }}
          />
        </div>
      }
    >
      <Tabs value={String(statusFilter)} onValueChange={(v) => onStatusFilterChange(v as StatusFilter)} variant='segmented'>
        <TabsList>
          <TabsTrigger value='all'>{t('surveys.filters.all')}</TabsTrigger>
          <TabsTrigger value='Draft'>{t('surveys.filters.draft')}</TabsTrigger>
          <TabsTrigger value='Published'>{t('surveys.filters.published')}</TabsTrigger>
          <TabsTrigger value='Closed'>{t('surveys.filters.closed')}</TabsTrigger>
          <TabsTrigger value='Archived'>{t('surveys.status.archived')}</TabsTrigger>
        </TabsList>
      </Tabs>
    </ListPageLayout.Toolbar>
  );
}
