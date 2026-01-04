/**
 * Link Error View - Displays specific error messages for survey link issues
 * Handles: already used, expired, deactivated, invalid, max usage reached
 */

import { AlertCircle, Clock, Lock, XCircle, Ban } from 'lucide-react';
import type { TranslationKey } from '@/lib/i18n';

// Error types based on backend error messages
export type LinkErrorType =
  | 'linkAlreadyUsed'
  | 'linkExpired'
  | 'linkDeactivated'
  | 'linkInvalid'
  | 'maxUsageReached'
  | 'surveyNotAccepting'
  | 'notFound';

interface LinkErrorViewProps {
  errorType: LinkErrorType;
  t: (key: TranslationKey) => string;
}

const errorConfig: Record<LinkErrorType, { icon: typeof AlertCircle; colorClass: string }> = {
  linkAlreadyUsed: { icon: XCircle, colorClass: 'text-warning' },
  linkExpired: { icon: Clock, colorClass: 'text-on-surface-variant' },
  linkDeactivated: { icon: Ban, colorClass: 'text-error' },
  linkInvalid: { icon: AlertCircle, colorClass: 'text-error' },
  maxUsageReached: { icon: Lock, colorClass: 'text-warning' },
  surveyNotAccepting: { icon: Lock, colorClass: 'text-on-surface-variant' },
  notFound: { icon: AlertCircle, colorClass: 'text-error' },
};

export function LinkErrorView({ errorType, t }: LinkErrorViewProps) {
  const config = errorConfig[errorType];
  const Icon = config.icon;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-surface-container">
            <Icon className={`w-10 h-10 ${config.colorClass}`} />
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-4 text-2xl font-bold text-on-surface font-heading">{t(`error.${errorType}.title` as TranslationKey)}</h1>

        {/* Description */}
        <p className="text-on-surface-variant mb-6">{t(`error.${errorType}.description` as TranslationKey)}</p>

        {/* Hint */}
        <p className="text-sm text-on-surface-variant/70">{t(`error.${errorType}.hint` as TranslationKey)}</p>
      </div>
    </div>
  );
}

/**
 * Maps backend error messages to frontend error types
 */
export function mapBackendErrorToType(errorMessage: string): LinkErrorType {
  const errorMap: Record<string, LinkErrorType> = {
    'Application.SurveyLink.LinkAlreadyUsed': 'linkAlreadyUsed',
    'Application.SurveyLink.LinkDeactivated': 'linkDeactivated',
    'Application.SurveyLink.LinkInvalid': 'linkInvalid',
    'Application.SurveyLink.MaxUsageReached': 'maxUsageReached',
    'Errors.SurveyLinkExpired': 'linkExpired',
    'Application.SurveyLink.LinkExpired': 'linkExpired',
    'This survey is not currently accepting responses.': 'surveyNotAccepting',
    'Application.Survey.NotAcceptingResponses': 'surveyNotAccepting',
  };

  // Check for exact match first
  if (errorMap[errorMessage]) {
    return errorMap[errorMessage];
  }

  // Check for partial match (case insensitive)
  const lowerMessage = errorMessage.toLowerCase();
  if (lowerMessage.includes('already used') || lowerMessage.includes('one-time')) {
    return 'linkAlreadyUsed';
  }
  if (lowerMessage.includes('expired')) {
    return 'linkExpired';
  }
  if (lowerMessage.includes('deactivated')) {
    return 'linkDeactivated';
  }
  if (lowerMessage.includes('maximum usage') || lowerMessage.includes('max use')) {
    return 'maxUsageReached';
  }
  if (lowerMessage.includes('not accepting')) {
    return 'surveyNotAccepting';
  }

  // Default to generic invalid
  return 'linkInvalid';
}
