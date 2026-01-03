/**
 * SurveysEmptyState - Empty state component for surveys
 */

import { FileText } from 'lucide-react';
import { createListEmptyState } from '@/components/ui';

/** Pre-configured empty state component for surveys */
export const SurveysEmptyState = createListEmptyState({
  icon: <FileText className="h-7 w-7" />,
  entityName: 'survey',
  entityNamePlural: 'surveys',
  emptyDescription: 'Start collecting feedback by creating a new survey',
  createActionLabel: 'Create Survey',
});
