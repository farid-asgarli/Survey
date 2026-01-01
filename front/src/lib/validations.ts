import { z } from 'zod';
import i18n from '@/i18n';

// Helper function to get translation with current language
const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);

// ============ Base Schemas ============

export const emailSchema = z
  .string()
  .min(1, { message: t('validation.emailRequired') })
  .email({ message: t('validation.email') });

export const passwordSchema = z
  .string()
  .min(1, { message: t('validation.passwordRequired') })
  .min(8, { message: t('validation.passwordMinLength') });

export const strongPasswordSchema = z
  .string()
  .min(1, { message: t('validation.passwordRequired') })
  .min(8, { message: t('validation.passwordMinLength') })
  .regex(/[A-Z]/, { message: t('validation.passwordUppercase') })
  .regex(/[a-z]/, { message: t('validation.passwordLowercase') })
  .regex(/[0-9]/, { message: t('validation.passwordNumber') })
  .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: t('validation.passwordSpecial') });

export const nameSchema = (fieldName = 'Name') =>
  z
    .string()
    .min(1, { message: t('validation.fieldRequired', { field: fieldName }) })
    .min(2, { message: t('validation.minLength', { count: 2 }) })
    .max(50, { message: t('validation.nameMaxLength', { max: 50 }) });

export const requiredStringSchema = (fieldName = 'This field') => z.string().min(1, { message: t('validation.fieldRequired', { field: fieldName }) });

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
    confirmPassword: z.string().min(1, { message: t('validation.confirmPasswordRequired') }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: t('validation.passwordMismatch'),
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const resetPasswordSchema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, { message: t('validation.confirmPasswordRequired') }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: t('validation.passwordMismatch'),
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ============ Theme Editor Schema ============

export const themeEditorSchema = z.object({
  name: requiredStringSchema('Theme name'),
  // Colors
  primaryColor: z.string().min(1, { message: t('validation.primaryColorRequired') }),
  secondaryColor: z.string(),
  accentColor: z.string(),
  backgroundColor: z.string().min(1, { message: t('validation.backgroundColorRequired') }),
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
  operator: z.string().min(1, { message: t('validation.operatorRequired') }),
  conditionValue: z.string().optional(),
  action: z.string().min(1, { message: t('validation.actionRequired') }),
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
  sendTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: t('validation.invalidTimeFormat') }),
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
    { label: t('password.requirements.minChars'), met: password.length >= 8 },
    { label: t('password.requirements.uppercase'), met: /[A-Z]/.test(password) },
    { label: t('password.requirements.lowercase'), met: /[a-z]/.test(password) },
    { label: t('password.requirements.number'), met: /[0-9]/.test(password) },
    { label: t('password.requirements.specialChar'), met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];
}

export function areAllRequirementsMet(password: string): boolean {
  return getPasswordRequirements(password).every((r) => r.met);
}

/** @alias areAllRequirementsMet - for backwards compatibility */
export const isStrongPassword = areAllRequirementsMet;

export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  const requirements = getPasswordRequirements(password);
  const metCount = requirements.filter((r) => r.met).length;

  const strengthMap: PasswordStrength[] = [
    { score: 0, label: t('password.strength.veryWeak'), color: 'bg-error' },
    { score: 1, label: t('password.strength.weak'), color: 'bg-error' },
    { score: 2, label: t('password.strength.fair'), color: 'bg-warning' },
    { score: 3, label: t('password.strength.good'), color: 'bg-tertiary' },
    { score: 4, label: t('password.strength.strong'), color: 'bg-success' },
  ];

  // Additional checks for stronger passwords
  let score = metCount;

  // Bonus for length
  if (password.length >= 12) {
    score = Math.min(score + 1, 5);
  }

  // Map to 0-4 range
  const normalizedScore = Math.min(Math.floor((score * 4) / 5), 4);

  return strengthMap[normalizedScore];
}

// ============ Validation Helper Functions ============
// These provide simple string | null returns for manual validation

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function validateEmail(email: string): string | null {
  if (!email) {
    return t('validation.emailRequired');
  }
  if (!isValidEmail(email)) {
    return t('validation.email');
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return t('validation.passwordRequired');
  }
  if (password.length < 8) {
    return t('validation.passwordMinLength');
  }
  return null;
}

export function validateConfirmPassword(password: string, confirmPassword: string): string | null {
  if (!confirmPassword) {
    return t('validation.confirmPasswordRequired');
  }
  if (password !== confirmPassword) {
    return t('validation.passwordMismatch');
  }
  return null;
}

export function validateName(name: string, fieldName = 'Name'): string | null {
  if (!name) {
    return t('validation.fieldRequired', { field: fieldName });
  }
  if (name.length < 2) {
    return t('validation.minLength', { count: 2 });
  }
  if (name.length > 50) {
    return t('validation.nameMaxLength', { max: 50 });
  }
  return null;
}

export function validateRequired(value: string, fieldName = 'This field'): string | null {
  if (!value || !value.trim()) {
    return t('validation.fieldRequired', { field: fieldName });
  }
  return null;
}

export function validateMinLength(value: string, minLength: number): string | null {
  if (value && value.length < minLength) {
    return t('validation.minLength', { count: minLength });
  }
  return null;
}

export function validateMaxLength(value: string, maxLength: number): string | null {
  if (value && value.length > maxLength) {
    return t('validation.maxLength', { count: maxLength });
  }
  return null;
}

// ============ Survey Schemas ============

export const createSurveySchema = z.object({
  title: z.string().min(1, { message: t('validation.titleRequired') }),
  description: z.string().optional(),
});

export type CreateSurveyFormData = z.infer<typeof createSurveySchema>;

// ============ Template Schemas ============

export const createTemplateSchema = z.object({
  name: z.string().min(1, { message: t('validation.nameRequired') }),
  description: z.string().optional(),
  category: z.string().min(1, { message: t('validation.categoryRequired') }),
  isPublic: z.boolean(),
  surveyId: z.string().optional(),
  languageCode: z.string().min(2).max(10),
});

export type CreateTemplateFormData = z.infer<typeof createTemplateSchema>;

export const useTemplateSchema = z.object({
  title: z.string().min(1, { message: t('validation.titleRequired') }),
  description: z.string().optional(),
});

export type UseTemplateFormData = z.infer<typeof useTemplateSchema>;

// ============ Email Template Schemas ============

export const createEmailTemplateSchema = z.object({
  name: z.string().min(1, { message: t('validation.templateNameRequired') }),
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
    .min(1, { message: t('validation.linksRequired') })
    .refine(
      (val) => {
        const num = parseInt(val, 10);
        return !isNaN(num) && num >= 1 && num <= 1000;
      },
      { message: t('validation.mustBeBetween', { min: 1, max: 1000 }) }
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
  name: z
    .string()
    .min(1, { message: t('validation.nameRequired') })
    .min(2, { message: t('validation.nameMinLength') })
    .max(100, { message: t('validation.nameMaxLength', { max: 100 }) }),
  slug: z
    .string()
    .min(1, { message: t('validation.slugRequired') })
    .min(2, { message: t('validation.slugMinLength') })
    .max(50, { message: t('validation.slugMaxLength', { max: 50 }) })
    .regex(/^[a-z0-9-]+$/, { message: t('validation.slugFormat') }),
  description: z.string().optional(),
});

export type CreateNamespaceFormData = z.infer<typeof createNamespaceSchema>;

export const namespaceSettingsSchema = z.object({
  name: z
    .string()
    .min(1, { message: t('validation.nameRequired') })
    .min(2, { message: t('validation.nameMinLength') }),
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
      { message: t('validation.url') }
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
  name: z.string().min(1, { message: t('validation.keyNameRequired') }),
  scopes: z.array(z.string()).min(1, { message: t('validation.scopeRequired') }),
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
    currentPassword: z.string().min(1, { message: t('validation.currentPasswordRequired') }),
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, { message: t('validation.confirmPasswordRequired') }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: t('validation.passwordMismatch'),
    path: ['confirmPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
