// Centralized Survey Status Configuration
// Status colors, styles, and chip variants for consistent UI across the app

import { SurveyStatus } from '@/types';

// Status styling for SurveyStatusBadge component
export const surveyStatusStyles: Record<SurveyStatus, { className: string; dotColor: string }> = {
  [SurveyStatus.Draft]: {
    className: 'bg-surface-container-high text-on-surface-variant border-2 border-outline-variant',
    dotColor: 'bg-on-surface-variant',
  },
  [SurveyStatus.Published]: {
    className: 'bg-success-container text-on-success-container border-2 border-success/30',
    dotColor: 'bg-success',
  },
  [SurveyStatus.Closed]: {
    className: 'bg-error-container/60 text-on-error-container border-2 border-error/30',
    dotColor: 'bg-error',
  },
  [SurveyStatus.Archived]: {
    className: 'bg-surface-container text-on-surface-variant/70 border-2 border-outline-variant/50',
    dotColor: 'bg-on-surface-variant/50',
  },
};

// Chip variants for status display (e.g., RecentSurveyItem)
export type StatusChipVariant = 'assist' | 'success' | 'warning';

export const surveyStatusChipVariants: Record<SurveyStatus, StatusChipVariant> = {
  [SurveyStatus.Draft]: 'warning',
  [SurveyStatus.Published]: 'success',
  [SurveyStatus.Closed]: 'assist',
  [SurveyStatus.Archived]: 'assist',
};

// Helper function to get status chip variant
export function getSurveyStatusChipVariant(status: SurveyStatus): StatusChipVariant {
  return surveyStatusChipVariants[status];
}

// Helper function to get status styles
export function getSurveyStatusStyle(status: SurveyStatus) {
  return surveyStatusStyles[status];
}
