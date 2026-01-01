// Constants and configuration for Distributions page

import { AlertCircle, CheckCircle2, Clock, Pause, Send, XCircle } from 'lucide-react';
import { DistributionStatus } from '@/types';
import type { EmailDistributionSummary } from '@/types';

// Status configuration for visual presentation
export const statusConfigKeys: Record<DistributionStatus, { labelKey: string; color: string; icon: typeof AlertCircle }> = {
  [DistributionStatus.Draft]: { labelKey: 'distributions.statusDraft', color: 'bg-surface-container text-on-surface', icon: AlertCircle },
  [DistributionStatus.Scheduled]: { labelKey: 'distributions.statusScheduled', color: 'bg-warning-container text-on-warning-container', icon: Clock },
  [DistributionStatus.Sending]: { labelKey: 'distributions.statusSending', color: 'bg-primary-container text-on-primary-container', icon: Send },
  [DistributionStatus.Sent]: { labelKey: 'distributions.statusSent', color: 'bg-success-container text-on-success-container', icon: CheckCircle2 },
  [DistributionStatus.PartiallyFailed]: {
    labelKey: 'distributions.statusPartiallyFailed',
    color: 'bg-warning-container text-on-warning-container',
    icon: AlertCircle,
  },
  [DistributionStatus.Failed]: { labelKey: 'distributions.statusFailed', color: 'bg-error-container text-on-error-container', icon: XCircle },
  [DistributionStatus.Cancelled]: {
    labelKey: 'distributions.statusCancelled',
    color: 'bg-surface-container-high text-on-surface-variant',
    icon: Pause,
  },
};

// Mock data for fallback when API is not available (uses summary type for list view)
export const mockDistributions: EmailDistributionSummary[] = [
  {
    id: '1',
    surveyId: '1',
    surveyTitle: 'Customer Feedback Survey',
    subject: 'We value your feedback',
    totalRecipients: 500,
    sentCount: 498,
    openedCount: 245,
    status: DistributionStatus.Sent,
    sentAt: '2024-12-15T10:00:00',
    createdAt: '2024-12-14T10:00:00',
  },
  {
    id: '2',
    surveyId: '2',
    surveyTitle: 'Product Survey',
    subject: 'Share your thoughts',
    totalRecipients: 150,
    sentCount: 0,
    openedCount: 0,
    status: DistributionStatus.Scheduled,
    scheduledAt: '2024-12-20T09:00:00',
    createdAt: '2024-12-18T10:00:00',
  },
  {
    id: '3',
    surveyId: '3',
    surveyTitle: 'Service Improvement Survey',
    subject: 'Help us improve',
    totalRecipients: 1000,
    sentCount: 1000,
    openedCount: 420,
    status: DistributionStatus.Sent,
    sentAt: '2024-12-10T14:00:00',
    createdAt: '2024-12-09T10:00:00',
  },
  {
    id: '4',
    surveyId: '4',
    surveyTitle: 'Quick Poll',
    subject: 'Quick survey request',
    totalRecipients: 250,
    sentCount: 0,
    openedCount: 0,
    status: DistributionStatus.Draft,
    createdAt: '2024-12-16T10:00:00',
  },
];
