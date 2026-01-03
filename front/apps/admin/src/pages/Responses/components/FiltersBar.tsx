import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { Input, Select, Tabs, TabsList, TabsTrigger, DateRangePicker } from '@/components/ui';
import { FileSpreadsheet } from 'lucide-react';
import type { Survey } from '@/types';
import type { CompletionFilter } from '../types';

interface FiltersBarProps {
  surveyOptions: Array<{ value: string; label: string }>;
  selectedSurveyId: string | undefined;
  onSurveyChange: (value: string) => void;
  surveysLoading: boolean;
  completionFilter: CompletionFilter;
  onCompletionFilterChange: (filter: CompletionFilter) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  fromDate: string | undefined;
  toDate: string | undefined;
  onDateRangeChange: (from: string | undefined, to: string | undefined) => void;
  selectedSurvey?: Survey;
}

export function FiltersBar({
  surveyOptions,
  selectedSurveyId,
  onSurveyChange,
  surveysLoading,
  completionFilter,
  onCompletionFilterChange,
  searchQuery,
  onSearchQueryChange,
  fromDate,
  toDate,
  onDateRangeChange,
  selectedSurvey,
}: FiltersBarProps) {
  const { t } = useTranslation();

  return (
    <div className="p-4 md:px-6 border-b border-outline-variant/30">
      {/* All filters in one row on desktop, stacked on mobile */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Left side: Survey selector + Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Select
            options={surveyOptions}
            value={selectedSurveyId || ''}
            onChange={onSurveyChange}
            placeholder={t('responses.selectSurvey')}
            disabled={surveysLoading}
            className="w-full sm:w-56"
          />

          <Tabs value={completionFilter} onValueChange={(v) => onCompletionFilterChange(v as CompletionFilter)} variant="segmented">
            <TabsList>
              <TabsTrigger value="all">{t('common.all')}</TabsTrigger>
              <TabsTrigger value="complete">{t('responses.complete')}</TabsTrigger>
              <TabsTrigger value="incomplete">{t('responses.incomplete')}</TabsTrigger>
            </TabsList>
          </Tabs>

          {selectedSurvey && (
            <div className="hidden xl:flex items-center gap-2 text-sm text-on-surface-variant pl-2 border-l border-outline-variant/50">
              <FileSpreadsheet className="h-4 w-4 shrink-0" />
              <span>{t('responses.responseCount', { count: selectedSurvey.responseCount })}</span>
            </div>
          )}
        </div>

        {/* Right side: Date range + Search */}
        <div className="flex items-center gap-3 lg:ml-auto">
          <DateRangePicker fromDate={fromDate} toDate={toDate} onChange={onDateRangeChange} />

          <Input
            placeholder={t('responses.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            startIcon={<Search className="h-4 w-4" />}
            className="w-full sm:w-56"
          />
        </div>
      </div>
    </div>
  );
}
