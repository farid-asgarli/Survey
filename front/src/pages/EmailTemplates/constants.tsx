/**
 * Constants and configurations for Email Templates page
 */

import { Inbox } from 'lucide-react';
import { FilterMatchers, type ExtendedFilterConfig } from '@/hooks';
import { createListEmptyState } from '@/components/ui';
import type { EmailTemplateSummary } from '@/types';
import type { FilterType } from './types';

/** Filter configurations for the email templates list page */
export const FILTER_CONFIGS: ExtendedFilterConfig<EmailTemplateSummary, unknown>[] = [
  {
    key: 'type',
    defaultValue: 'all' as const,
    label: 'Type',
    formatValue: (v) => String(v),
    getValue: (template: EmailTemplateSummary) => template.type,
    matches: (itemValue: unknown, filterValue: unknown): boolean => FilterMatchers.equalOrAll(itemValue, filterValue as FilterType),
  },
];

/** Search configuration for client-side filtering */
export const SEARCH_CONFIG = {
  fields: ['name', 'subject'] as (keyof EmailTemplateSummary)[],
};

/** Pre-configured empty state component for email templates */
export const EmailTemplatesEmptyState = createListEmptyState({
  icon: <Inbox className="h-7 w-7" />,
  entityName: 'email template',
  entityNamePlural: 'email templates',
  emptyDescription: 'Create your first email template to streamline survey distribution and maintain consistent messaging.',
  createActionLabel: 'Create Template',
});
