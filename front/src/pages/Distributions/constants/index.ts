// Constants and configuration for Distributions page

import { AlertCircle, CheckCircle2, Clock, Pause, Send, XCircle } from 'lucide-react';
import { DistributionStatus } from '@/types';

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
