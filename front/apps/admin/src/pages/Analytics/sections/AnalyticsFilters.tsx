import { Select } from '@/components/ui';
import { AnalyticsDateFilter, type DateRange } from '@/components/features/analytics';

interface AnalyticsFiltersProps {
  showSurveySelector: boolean;
  surveyOptions: Array<{ value: string; label: string }>;
  selectedSurveyId: string;
  surveysLoading: boolean;
  dateRange: DateRange;
  onSurveyChange: (value: string) => void;
  onDateRangeChange: (range: DateRange) => void;
}

export function AnalyticsFilters({
  showSurveySelector,
  surveyOptions,
  selectedSurveyId,
  surveysLoading,
  dateRange,
  onSurveyChange,
  onDateRangeChange,
}: AnalyticsFiltersProps) {
  return (
    <div className="px-4 md:px-6 py-3 flex flex-col sm:flex-row gap-3 border-b border-outline-variant/30 bg-surface-container-lowest">
      {showSurveySelector && (
        <Select options={surveyOptions} value={selectedSurveyId} onChange={onSurveyChange} className="sm:w-80" disabled={surveysLoading} />
      )}
      <div className="flex-1" />
      <AnalyticsDateFilter value={dateRange} onChange={onDateRangeChange} />
    </div>
  );
}
