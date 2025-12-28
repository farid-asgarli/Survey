import { z } from 'zod';

// ============ Base Schemas ============

export const emailSchema = z.string().min(1, 'Email is required').email('Please enter a valid email address');

export const passwordSchema = z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters');

export const strongPasswordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[0-9]/, 'Password must contain a number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain a special character');

export const nameSchema = (fieldName = 'Name') =>
  z
    .string()
    .min(1, `${fieldName} is required`)
    .min(2, `${fieldName} must be at least 2 characters`)
    .max(50, `${fieldName} must be less than 50 characters`);

export const requiredStringSchema = (fieldName = 'This field') => z.string().min(1, `${fieldName} is required`);

// ============ Auth Schemas ============

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  rememberMe: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: nameSchema('First name'),
    lastName: nameSchema('Last name'),
    email: emailSchema,
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const resetPasswordSchema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ============ Theme Editor Schema ============

export const themeEditorSchema = z.object({
  name: requiredStringSchema('Theme name'),
  // Colors
  primaryColor: z.string().min(1, 'Primary color is required'),
  secondaryColor: z.string(),
  accentColor: z.string(),
  backgroundColor: z.string().min(1, 'Background color is required'),
  surfaceColor: z.string(),
  textColor: z.string(),
  // Typography
  fontFamily: z.string(),
  headingFontFamily: z.string(),
  fontSize: z.number().min(10).max(24),
  // Layout
  cornerRadius: z.string(),
  spacing: z.string(),
  containerWidth: z.string(),
  // Display Options
  progressBarStyle: z.enum(['Bar', 'Steps', 'Dots']),
  showProgressBar: z.boolean(),
  showQuestionNumbers: z.boolean(),
  questionNumberStyle: z.string(),
  // Button
  buttonStyle: z.enum(['Rounded', 'Pill', 'Square']),
  // Branding
  logoUrl: z.string(),
  backgroundImageUrl: z.string(),
  // Advanced
  customCss: z.string(),
});

export type ThemeEditorFormData = z.infer<typeof themeEditorSchema>;

// ============ Logic Builder Schema ============

export const logicRuleSchema = z.object({
  sourceQuestionId: requiredStringSchema('Source question'),
  operator: z.string().min(1, 'Operator is required'),
  conditionValue: z.string().optional(),
  action: z.string().min(1, 'Action is required'),
  targetQuestionId: z.string().optional(),
});

export type LogicRuleFormData = z.infer<typeof logicRuleSchema>;

// ============ Recurring Survey Schema ============

export const recurringSurveySchema = z.object({
  surveyId: z.string().optional(),
  name: requiredStringSchema('Schedule name'),
  pattern: z.enum(['Daily', 'Weekly', 'BiWeekly', 'Monthly', 'Quarterly', 'Custom']),
  cronExpression: z.string().optional(),
  daysOfWeek: z.array(z.number()).optional(),
  dayOfMonth: z.number().optional(),
  sendTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  timezoneId: z.string(),
  endsAt: z.string().optional(),
  maxRuns: z.number().optional(),
  // Audience
  audienceType: z.enum(['StaticList', 'AllContacts']),
  recipientEmails: z.string().optional(),
  // Reminders
  sendReminders: z.boolean(),
  reminderDaysAfter: z.number().optional(),
  maxReminders: z.number().optional(),
  // Email customization
  customSubject: z.string().optional(),
  customMessage: z.string().optional(),
  // Activation
  activateImmediately: z.boolean().optional(),
});

export type RecurringSurveyFormData = z.infer<typeof recurringSurveySchema>;

// ============ Password Requirements Helper ============

export interface PasswordRequirement {
  label: string;
  met: boolean;
}

export function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /[0-9]/.test(password) },
    { label: 'Contains special character (!@#$%^&*)', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];
}

export function areAllRequirementsMet(password: string): boolean {
  return getPasswordRequirements(password).every((r) => r.met);
}

// ============ Survey Schemas ============

export const createSurveySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

export type CreateSurveyFormData = z.infer<typeof createSurveySchema>;

// ============ Template Schemas ============

export const createTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  isPublic: z.boolean(),
  surveyId: z.string().optional(),
});

export type CreateTemplateFormData = z.infer<typeof createTemplateSchema>;

export const useTemplateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

export type UseTemplateFormData = z.infer<typeof useTemplateSchema>;

// ============ Email Template Schemas ============

export const createEmailTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  type: z.enum(['SurveyInvitation', 'SurveyReminder', 'ThankYou', 'Custom']),
});

export type CreateEmailTemplateFormData = z.infer<typeof createEmailTemplateSchema>;

// ============ Link Schemas ============
// Note: Form uses string values, conversion to numeric enum happens on submit

export const createLinkSchema = z.object({
  linkType: z.enum(['Public', 'Unique', 'Embedded']),
  maxResponses: z.string().optional(),
  expiresAt: z.string().optional(),
  password: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

// Helper to convert string linkType to numeric LinkType
export const linkTypeStringToEnum = {
  Public: 0,
  Unique: 1,
  Embedded: 3,
} as const;

export type CreateLinkFormData = z.infer<typeof createLinkSchema>;

export const bulkLinkSchema = z.object({
  count: z
    .string()
    .min(1, 'Number of links is required')
    .refine(
      (val) => {
        const num = parseInt(val, 10);
        return !isNaN(num) && num >= 1 && num <= 1000;
      },
      { message: 'Must be between 1 and 1000' }
    ),
  namePrefix: z.string().optional(),
  expiresAt: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

export type BulkLinkFormData = z.infer<typeof bulkLinkSchema>;

// ============ Namespace Schemas ============

export const createNamespaceSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  slug: z
    .string()
    .min(1, 'URL slug is required')
    .min(2, 'Slug must be at least 2 characters')
    .max(50, 'Slug must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().optional(),
});

export type CreateNamespaceFormData = z.infer<typeof createNamespaceSchema>;

export const namespaceSettingsSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  logoUrl: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Please enter a valid URL' }
    ),
});

export type NamespaceSettingsFormData = z.infer<typeof namespaceSettingsSchema>;

// ============ Member Schemas ============

export const inviteMemberSchema = z.object({
  email: emailSchema,
  role: z.enum(['Admin', 'Member', 'Viewer']),
});

export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

// ============ API Key Schemas ============

export const createApiKeySchema = z.object({
  name: z.string().min(1, 'Key name is required'),
  scopes: z.array(z.string()).min(1, 'At least one scope is required'),
});

export type CreateApiKeyFormData = z.infer<typeof createApiKeySchema>;

// ============ Forgot Password Schema ============

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ============ Change Password Schema ============

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
