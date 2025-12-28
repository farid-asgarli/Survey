/**
 * Mock data for Email Templates page
 * Used as fallback when API is not available
 */

import type { EmailTemplateSummary } from '@/types';
import { EmailTemplateType } from '@/types/enums';

export const mockTemplates: EmailTemplateSummary[] = [
  {
    id: '1',
    name: 'Customer Satisfaction Survey',
    subject: 'We value your feedback - Please take our survey',
    type: EmailTemplateType.SurveyInvitation,
    isDefault: true,
    createdAt: '2024-12-01T10:00:00',
  },
  {
    id: '2',
    name: 'Friendly Reminder',
    subject: 'Reminder: Your feedback is still needed',
    type: EmailTemplateType.SurveyReminder,
    isDefault: false,
    createdAt: '2024-12-05T10:00:00',
  },
  {
    id: '3',
    name: 'Thank You Message',
    subject: 'Thank you for completing our survey!',
    type: EmailTemplateType.ThankYou,
    isDefault: false,
    createdAt: '2024-12-08T10:00:00',
  },
  {
    id: '4',
    name: 'Product Launch Survey',
    subject: 'Help us shape the future of our product',
    type: EmailTemplateType.Custom,
    isDefault: false,
    createdAt: '2024-12-10T10:00:00',
  },
];
