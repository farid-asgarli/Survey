/**
 * Type definitions for Email Templates page
 */

import type { EmailTemplateType } from '@/types';

/** Filter type for email templates - includes 'all' option */
export type FilterType = 'all' | EmailTemplateType;

/** Filter state interface for email templates */
export interface EmailTemplateFilters extends Record<string, unknown> {
  type: FilterType;
}
