import { RefreshCw } from 'lucide-react';
import type { FilterConfig } from '@/hooks';
import { createListEmptyState } from '@/components/ui';

/** Filter configuration for the recurring surveys list page */
export const FILTER_CONFIGS: FilterConfig<unknown>[] = [
  {
    key: 'status',
    defaultValue: 'all',
    label: 'Status',
    formatValue: (v) => (v === 'active' ? 'Active' : 'Paused'),
  },
];

/** Pre-configured empty state component for recurring surveys */
export const RecurringSurveysEmptyState = createListEmptyState({
  icon: <RefreshCw className="h-7 w-7" />,
  entityName: 'recurring survey',
  entityNamePlural: 'recurring surveys',
  emptyDescription: 'Create a recurring survey to automatically send surveys on a schedule.',
  createActionLabel: 'Create Schedule',
});
