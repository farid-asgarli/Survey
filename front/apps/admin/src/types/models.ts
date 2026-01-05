// Domain models for Survey App
// All enums are imported from enums.ts and use numeric values

export {
  SubscriptionTier,
  MemberRole,
  SurveyStatus,
  SurveyType,
  CxMetricType,
  QuestionType,
  NpsQuestionType,
  RatingStyle,
  YesNoStyle,
  LogicOperator,
  LogicAction,
  LinkType,
  DistributionStatus,
  RecipientStatus,
  EmailTemplateType,
  ButtonStyle,
  ThemeLayout,
  LogoPosition,
  LogoSize,
  ProgressBarStyle,
  BackgroundImagePosition,
  RecurrencePattern,
  RunStatus,
  AudienceType,
  NpsCategory,
  NpsTrendDirection,
  NpsTrendGroupBy,
  NpsSegmentBy,
  ExportFormat,
  NamespacePermission,
  DayOfWeek,
  // Label maps for display (static fallbacks)
  SubscriptionTierLabels,
  MemberRoleLabels,
  SurveyStatusLabels,
  QuestionTypeLabels,
  RatingStyleLabels,
  YesNoStyleLabels,
  LogicOperatorLabels,
  LogicActionLabels,
  LinkTypeLabels,
  DistributionStatusLabels,
  RecipientStatusLabels,
  EmailTemplateTypeLabels,
  ButtonStyleLabels,
  ThemeLayoutLabels,
  LogoPositionLabels,
  ProgressBarStyleLabels,
  RecurrencePatternLabels,
  RunStatusLabels,
  AudienceTypeLabels,
  NpsCategoryLabels,
  NpsSegmentByLabels,
  ExportFormatLabels,
  NamespacePermissionLabels,
  DayOfWeekLabels,
  BackgroundImagePositionLabels,
  // Localized label getter functions
  getSubscriptionTierLabel,
  getMemberRoleLabel,
  getSurveyStatusLabel,
  getQuestionTypeLabel,
  getRatingStyleLabel,
  getYesNoStyleLabel,
  getLogicOperatorLabel,
  getLogicActionLabel,
  getLinkTypeLabel,
  getDistributionStatusLabel,
  getRecipientStatusLabel,
  getEmailTemplateTypeLabel,
  getButtonStyleLabel,
  getThemeLayoutLabel,
  getLogoPositionLabel,
  getProgressBarStyleLabel,
  getRecurrencePatternLabel,
  getRunStatusLabel,
  getAudienceTypeLabel,
  getNpsCategoryLabel,
  getNpsSegmentByLabel,
  getExportFormatLabel,
  getNamespacePermissionLabel,
  getDayOfWeekLabel,
  getBackgroundImagePositionLabel,
} from './enums';

import {
  SubscriptionTier,
  MemberRole,
  SurveyStatus,
  SurveyType,
  CxMetricType,
  QuestionType,
  NpsQuestionType,
  RatingStyle,
  YesNoStyle,
  LogicOperator,
  LogicAction,
  LinkType,
  DistributionStatus,
  RecipientStatus,
  EmailTemplateType,
  ButtonStyle,
  ThemeLayout,
  LogoPosition,
  LogoSize,
  ProgressBarStyle,
  BackgroundImagePosition,
  RecurrencePattern,
  RunStatus,
  AudienceType,
  NpsCategory,
  NpsTrendDirection,
  DayOfWeek,
} from './enums';

// ============ User & Auth ============
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  emailConfirmed: boolean;
  /** Avatar ID from the predefined collection (e.g., "avatar-01") */
  avatarId?: string | null;
  lastLoginAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile extends User {
  namespaces: UserNamespaceMembership[];
}

export interface UserNamespaceMembership {
  namespaceId: string;
  namespaceName: string;
  namespaceSlug: string;
  role: string;
  joinedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

// User profile update types
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface SelectAvatarResponse {
  avatarId: string | null;
}

/** Standard message response from API endpoints */
export interface MessageResponse {
  message: string;
}

// ============ Namespace ============
export interface Namespace {
  id: string;
  name: string;
  slug: string;
  subscriptionTier: SubscriptionTier;
  isActive: boolean;
  maxUsers: number;
  maxSurveys: number;
  description?: string;
  logoUrl?: string;
  memberCount: number;
  surveyCount: number;
  ownerId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NamespaceMembership {
  membershipId: string;
  namespaceId?: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  /** The avatar ID (e.g., "avatar-01"). Frontend resolves to URL. */
  avatarId?: string;
  role: MemberRole;
  joinedAt: string;
}

export interface CreateNamespaceRequest {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
}

export interface InviteMemberRequest {
  email: string;
  role: MemberRole;
}

/** Response from inviting a member to a namespace */
export interface InviteMemberResponse {
  membershipId: string;
  email: string;
  role: MemberRole;
  isNewUser: boolean;
  inviteToken?: string;
}

/** Request body for updating a member's role - IDs are in URL params */
export interface UpdateMemberRoleRequest {
  role: MemberRole;
}

export interface UpdateMemberRoleResponse {
  membershipId: string;
  userId: string;
  role: MemberRole;
}

// ============ User Search ============

/** User search result for autocomplete */
export interface UserSearchResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarId?: string;
}

// ============ Notifications ============
import { NotificationType } from './enums';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  isRead: boolean;
  readAt?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationCount {
  unreadCount: number;
  totalCount: number;
}

export interface NotificationsResponse {
  items: Notification[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// ============ Survey ============
export interface Survey {
  id: string;
  namespaceId: string;
  title: string;
  description?: string;
  type: SurveyType;
  cxMetricType?: CxMetricType;
  status: SurveyStatus;
  // Backend fields
  welcomeMessage?: string;
  thankYouMessage?: string;
  accessToken?: string;
  // Settings
  allowAnonymousResponses?: boolean;
  allowMultipleResponses: boolean;
  maxResponses?: number;
  // Dates
  startsAt?: string;
  endsAt?: string;
  publishedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  // Theme
  themeId?: string;
  presetThemeId?: string;
  themeCustomizations?: string;
  // Counts - questionCount is used in list views, questions array in detail views
  questionCount: number;
  responseCount: number;
  // Questions array - only populated in detail views (SurveyDetailsDto)
  questions?: Question[];
  // Localization - added for translation-only architecture
  /** The default language code for this survey */
  defaultLanguage: string;
  /** The language of the returned content (based on request) */
  language: string;
  /** List of available language codes for this survey */
  availableLanguages: string[];
}

export interface CreateSurveyRequest {
  title: string;
  description?: string;
  type?: SurveyType;
  cxMetricType?: CxMetricType;
  /** Welcome message shown at the start of the survey */
  welcomeMessage?: string;
  /** Thank you message shown after completion */
  thankYouMessage?: string;
  /** Whether the survey allows anonymous responses */
  isAnonymous?: boolean;
  /** Maximum number of responses allowed */
  maxResponses?: number;
  /** Start date for the survey (ISO 8601 format) */
  startDate?: string;
  /** End date for the survey (ISO 8601 format) */
  endDate?: string;
  /** Initial questions to create with the survey */
  questions?: CreateQuestionRequest[];
  /** Language code for the initial translation */
  languageCode: string;
}

export interface UpdateSurveyRequest {
  surveyId: string;
  /** Title is required by the backend */
  title: string;
  description?: string;
  welcomeMessage?: string;
  thankYouMessage?: string;
  allowAnonymousResponses?: boolean;
  allowMultipleResponses?: boolean;
  maxResponses?: number;
  startsAt?: string;
  endsAt?: string;
  /** Language code for the translation to update */
  languageCode?: string;
}

// ============ Question ============
export interface Question {
  id: string;
  surveyId: string;
  text: string;
  type: QuestionType;
  order: number;
  isRequired: boolean;
  description?: string;
  settings?: QuestionSettings;
  // NPS support
  isNpsQuestion?: boolean;
  npsType?: NpsQuestionType;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Option with stable ID for aggregation.
 * IDs are generated server-side when creating new options.
 */
export interface QuestionOption {
  /** Unique identifier for aggregation (generated by server) */
  id: string;
  /** Display text */
  text: string;
  /** Display order */
  order: number;
}

export interface QuestionSettings {
  // Options for choice questions (with stable IDs)
  options?: QuestionOption[];

  // Rating/Scale settings
  minValue?: number;
  maxValue?: number;
  minLabel?: string;
  maxLabel?: string;

  // Matrix settings (backend uses matrixRows/matrixColumns)
  matrixRows?: string[];
  matrixColumns?: string[];

  // Text settings
  maxLength?: number;
  minLength?: number;
  placeholder?: string;

  // File upload settings
  allowedFileTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;

  // Selection settings
  maxSelections?: number;
  allowOther?: boolean;

  // Other settings
  randomizeOptions?: boolean;
  otherLabel?: string;
  validationPattern?: string;
  validationMessage?: string;
  validationPreset?: string;

  // Rating style (stars, hearts, thumbs, smileys, numbers)
  ratingStyle?: RatingStyle;

  // Yes/No style (text, thumbs, toggle, checkX)
  yesNoStyle?: YesNoStyle;
}

export interface CreateQuestionRequest {
  type: QuestionType;
  text: string;
  description?: string;
  isRequired?: boolean;
  order?: number;
  settings?: QuestionSettings;
  /** Whether this is an NPS question */
  isNpsQuestion?: boolean;
  /** NPS question type (Standard, CustomerSatisfaction, CustomerEffort) */
  npsType?: NpsQuestionType;
  /** Language code for the initial translation */
  languageCode?: string;
}

export interface UpdateQuestionRequest {
  /** Question type (required by backend) */
  type: QuestionType;
  /** Question text (required by backend) */
  text: string;
  description?: string;
  /** Whether the question is required (required by backend) */
  isRequired: boolean;
  order?: number;
  settings?: QuestionSettings;
  /** Whether this is an NPS question */
  isNpsQuestion?: boolean;
  /** NPS question type (Standard, CustomerSatisfaction, CustomerEffort) */
  npsType?: NpsQuestionType;
  /** Language code for the translation to update */
  languageCode?: string;
}

// ============ Question Batch Sync ============

/** Request for batch syncing questions */
export interface BatchSyncQuestionsRequest {
  toCreate: BatchCreateQuestionData[];
  toUpdate: BatchUpdateQuestionData[];
  toDelete: string[];
  finalOrder: string[];
}

/** Data for creating a question in batch sync */
export interface BatchCreateQuestionData {
  tempId: string;
  text: string;
  description?: string;
  type: QuestionType;
  isRequired: boolean;
  order?: number;
  settings?: QuestionSettings;
  isNpsQuestion?: boolean;
  npsType?: NpsQuestionType;
  languageCode?: string;
}

/** Data for updating a question in batch sync */
export interface BatchUpdateQuestionData {
  questionId: string;
  text: string;
  description?: string;
  type: QuestionType;
  isRequired: boolean;
  order?: number;
  settings?: QuestionSettings;
  isNpsQuestion?: boolean;
  npsType?: NpsQuestionType;
  languageCode?: string;
}

/** Result of batch sync operation */
export interface BatchSyncQuestionsResult {
  created: Array<{
    tempId: string;
    realId: string;
    question: Question;
  }>;
  updated: Question[];
  deleted: string[];
  reordered: boolean;
  errors: Array<{
    operation: string;
    questionId?: string;
    message: string;
  }>;
}

// ============ Question Logic ============
export interface QuestionLogic {
  id: string;
  questionId: string;
  sourceQuestionId: string;
  sourceQuestionText?: string;
  operator: LogicOperator;
  conditionValue: string;
  action: LogicAction;
  targetQuestionId?: string;
  targetQuestionText?: string;
  priority: number;
}

export interface CreateLogicRequest {
  sourceQuestionId: string;
  operator: LogicOperator;
  /** Condition value - required unless operator is IsEmpty, IsNotEmpty, IsAnswered, or IsNotAnswered */
  conditionValue?: string;
  action: LogicAction;
  targetQuestionId?: string;
  priority?: number;
}

/**
 * Request to update an existing logic rule.
 * Matches backend UpdateQuestionLogicCommand (priority is required for updates).
 */
export interface UpdateLogicRequest {
  sourceQuestionId: string;
  operator: LogicOperator;
  /** Condition value - required unless operator is IsEmpty, IsNotEmpty, IsAnswered, or IsNotAnswered */
  conditionValue?: string;
  action: LogicAction;
  targetQuestionId?: string;
  /** Priority is required when updating a logic rule */
  priority: number;
}

/**
 * Request to evaluate logic rules for a set of answers.
 * Matches backend EvaluateLogicQuery.
 */
export interface EvaluateLogicRequest {
  currentQuestionId?: string;
  answers: AnswerForEvaluation[];
}

/**
 * Individual answer for logic evaluation.
 * Matches backend AnswerForEvaluationDto.
 */
export interface AnswerForEvaluation {
  questionId: string;
  value: string;
}

/**
 * Response from logic evaluation.
 * Matches backend LogicEvaluationResultDto.
 */
export interface EvaluateLogicResponse {
  visibleQuestionIds: string[];
  hiddenQuestionIds: string[];
  nextQuestionId?: string;
  shouldEndSurvey: boolean;
}

// ============ Survey Links ============
export interface SurveyLink {
  id: string;
  surveyId: string;
  type: LinkType;
  token: string;
  fullUrl: string;
  name?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  isActive: boolean;
  expiresAt?: string;
  maxUses?: number;
  usageCount: number;
  responseCount: number;
  hasPassword: boolean;
  createdAt: string;
  // Extended fields (from SurveyLinkDetailsDto)
  prefillData?: Record<string, string>;
}

export interface CreateLinkRequest {
  type: LinkType;
  name?: string;
  /** Maximum number of times this link can be used */
  maxUses?: number;
  expiresAt?: string;
  password?: string;
  prefillData?: Record<string, string>;
  source?: string;
  medium?: string;
  campaign?: string;
}

export interface UpdateLinkRequest {
  name?: string;
  /** Maximum number of times this link can be used */
  maxUses?: number;
  expiresAt?: string;
  password?: string;
  prefillData?: Record<string, string>;
  source?: string;
  medium?: string;
  campaign?: string;
  isActive?: boolean;
}

export interface BulkLinkGenerationRequest {
  count: number;
  namePrefix?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  expiresAt?: string;
}

// BulkLinkGenerationResult matching backend BulkLinkGenerationResultDto
export interface BulkLinkGenerationResult {
  requestedCount: number;
  generatedCount: number;
  links: SurveyLink[];
}

// ============ Email Distribution ============

/** Statistics for an email distribution */
export interface DistributionStats {
  distributionId: string;
  totalRecipients: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
}

/** Summary DTO for distribution list (matches backend EmailDistributionSummaryDto) */
export interface EmailDistributionSummary {
  id: string;
  surveyId: string;
  surveyTitle: string;
  subject: string;
  scheduledAt?: string;
  sentAt?: string;
  status: DistributionStatus;
  totalRecipients: number;
  sentCount: number;
  openedCount: number;
  createdAt: string;
}

/** Full distribution DTO (matches backend EmailDistributionDto) */
export interface EmailDistribution {
  id: string;
  surveyId: string;
  surveyTitle: string;
  emailTemplateId?: string;
  emailTemplateName?: string;
  subject: string;
  body: string;
  senderName?: string;
  senderEmail?: string;
  status: DistributionStatus;
  scheduledAt?: string;
  sentAt?: string;
  stats: DistributionStats;
  createdAt: string;
  updatedAt?: string;
}

export interface DistributionRecipient {
  id: string;
  email: string;
  name?: string;
  status: RecipientStatus;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  openCount: number;
  clickCount: number;
  errorMessage?: string;
}

export interface RecipientInput {
  email: string;
  name?: string;
}

export interface CreateDistributionRequest {
  emailTemplateId?: string;
  subject: string;
  body: string;
  recipients: RecipientInput[];
  senderName?: string;
  senderEmail?: string;
}

// ============ Email Templates ============
export interface EmailTemplate {
  id: string;
  namespaceId: string;
  name: string;
  subject: string;
  htmlBody: string;
  plainTextBody?: string;
  /** JSON representation of the visual editor design state (blocks and styles) */
  designJson?: string;
  type: EmailTemplateType;
  isDefault: boolean;
  availablePlaceholders?: string[];
  createdAt: string;
  updatedAt?: string;

  // Localization - added for translation-only architecture
  /** The default language code for this email template */
  defaultLanguage: string;
  /** The language of the returned content (based on request) */
  language: string;
  /** List of available language codes for this email template */
  availableLanguages: string[];
}

export interface EmailTemplateSummary {
  id: string;
  name: string;
  type: EmailTemplateType;
  subject: string;
  isDefault: boolean;
  createdAt: string;

  // Localization - added for translation-only architecture
  /** The default language code for this email template */
  defaultLanguage: string;
}

export interface CreateEmailTemplateRequest {
  name: string;
  subject: string;
  htmlBody: string;
  plainTextBody?: string;
  /** JSON representation of the visual editor design state (blocks and styles) */
  designJson?: string;
  type: EmailTemplateType;
  isDefault?: boolean;
  /** Language code for the initial translation */
  languageCode?: string;
}

export interface UpdateEmailTemplateRequest {
  name?: string;
  subject?: string;
  htmlBody?: string;
  plainTextBody?: string;
  /** JSON representation of the visual editor design state (blocks and styles) */
  designJson?: string;
  type?: EmailTemplateType;
  isDefault?: boolean;
  /** Language code for the translation to update */
  languageCode?: string;
}

// ============ Survey Themes ============
export interface ThemeColors {
  // Primary
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;

  // Secondary
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;

  // Surface
  surface: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  onSurface: string;
  onSurfaceVariant: string;

  // Outline
  outline: string;
  outlineVariant: string;

  // Semantic
  error: string;
  success: string;

  // Legacy - deprecated but kept for backward compatibility
  background: string;
  text: string;
  accent: string;
}

export interface ThemeTypography {
  fontFamily: string;
  headingFontFamily: string;
  baseFontSize: number;
}

export interface ThemeLayoutDto {
  layout: ThemeLayout;
  backgroundImageUrl?: string;
  backgroundPosition: BackgroundImagePosition;
  showProgressBar: boolean;
  progressBarStyle: ProgressBarStyle;
}

export interface ThemeBranding {
  logoUrl?: string;
  logoPosition: LogoPosition;
  logoSize: LogoSize;
  showLogoBackground: boolean;
  logoBackgroundColor?: string;
  brandingTitle?: string;
  brandingSubtitle?: string;
  showPoweredBy: boolean;
}

export interface ThemeButton {
  style: ButtonStyle;
  textColor: string;
}

/**
 * Summary/list item for themes.
 * Matches backend SurveyThemeSummaryDto - used in list views.
 */
export interface SurveyThemeSummary {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  isPublic: boolean;
  isSystem: boolean;
  isDark: boolean;
  /** Primary color (flat field for list display) */
  primaryColor: string;
  /** Secondary color (flat field for list display) */
  secondaryColor: string;
  /** Background color (flat field for list display) */
  backgroundColor: string;
  /** Layout type */
  layout: ThemeLayout;
  usageCount: number;
  createdAt: string;
}

/**
 * Full theme details.
 * Matches backend SurveyThemeDto - used in detail/edit views.
 */
export interface SurveyTheme {
  id: string;
  namespaceId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  isPublic: boolean;
  isSystem: boolean;
  isDark: boolean;
  colors: ThemeColors;
  typography: ThemeTypography;
  layout: ThemeLayoutDto;
  branding: ThemeBranding;
  button: ThemeButton;
  customCss?: string;
  usageCount: number;
  createdAt: string;
  updatedAt?: string;

  // Localization - added for translation-only architecture
  /** The default language code for this theme */
  defaultLanguage: string;
  /** The language of the returned content (based on request) */
  language: string;
  /** List of available language codes for this theme */
  availableLanguages: string[];
}

// ============ Survey Templates ============
export type TemplateCategory = 'feedback' | 'hr' | 'research' | 'events' | 'education' | 'marketing' | 'healthcare' | 'other';

export interface TemplateQuestion {
  id: string;
  text: string;
  type: QuestionType;
  order: number;
  isRequired: boolean;
  description?: string;
  settings?: QuestionSettings;

  // Localization - added for translation-only architecture
  /** The default language code for this template question */
  defaultLanguage: string;
}

/**
 * Summary DTO for template listings (list endpoint).
 * Matches backend SurveyTemplateSummaryDto - no questions array for performance.
 */
export interface SurveyTemplateSummary {
  id: string;
  name: string;
  description?: string;
  category?: string;
  isPublic: boolean;
  usageCount: number;
  questionCount: number;
  createdAt: string;
  updatedAt?: string;
  /** The default language code for this template */
  defaultLanguage: string;
}

/**
 * Full template DTO with questions (detail endpoint).
 * Matches backend SurveyTemplateDto.
 */
export interface SurveyTemplate {
  id: string;
  namespaceId: string;
  name: string;
  description?: string;
  category?: string;
  isPublic: boolean;
  welcomeMessage?: string;
  thankYouMessage?: string;
  defaultAllowAnonymous: boolean;
  defaultAllowMultipleResponses: boolean;
  usageCount: number;
  questionCount: number;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  questions: TemplateQuestion[];

  // Localization - added for translation-only architecture
  /** The default language code for this template */
  defaultLanguage: string;
  /** The language of the returned content (based on request) */
  language: string;
  /** List of available language codes for this template */
  availableLanguages: string[];
}

/** Question data for creating template questions */
export interface CreateTemplateQuestionRequest {
  text: string;
  description?: string;
  type: QuestionType;
  isRequired: boolean;
  order: number;
  settings?: QuestionSettings;
}

/** Request to create a new template - matches backend CreateTemplateCommand */
export interface CreateTemplateRequest {
  name: string;
  description?: string;
  category?: string;
  isPublic?: boolean;
  welcomeMessage?: string;
  thankYouMessage?: string;
  defaultAllowAnonymous?: boolean;
  defaultAllowMultipleResponses?: boolean;
  /** Language code for the initial translation */
  languageCode: string;
  /** Questions to include in the template */
  questions?: CreateTemplateQuestionRequest[];
}

/** Request to create a template from an existing survey - matches backend CreateTemplateFromSurveyCommand */
export interface CreateTemplateFromSurveyRequest {
  surveyId: string;
  /** Name for the new template - maps to backend TemplateName */
  templateName: string;
  description?: string;
  category?: string;
  isPublic?: boolean;
  /** Language code for the initial translation */
  languageCode?: string;
}

/** Question data for updating template questions */
export interface UpdateTemplateQuestionRequest {
  /** Question ID - null for new questions */
  id?: string;
  text: string;
  description?: string;
  type: QuestionType;
  isRequired: boolean;
  order: number;
  settings?: QuestionSettings;
}

/** Request to update a template - matches backend UpdateTemplateCommand */
export interface UpdateTemplateRequest {
  name: string;
  description?: string;
  category?: string;
  isPublic?: boolean;
  welcomeMessage?: string;
  thankYouMessage?: string;
  defaultAllowAnonymous?: boolean;
  defaultAllowMultipleResponses?: boolean;
  /** Language code for the translation to update */
  languageCode?: string;
  /** Questions to include in the template (replaces existing) */
  questions?: UpdateTemplateQuestionRequest[];
}

/** Request to create a survey from a template - matches backend CreateSurveyFromTemplateCommand */
export interface CreateSurveyFromTemplateRequest {
  /** Title for the new survey - maps to backend SurveyTitle */
  surveyTitle: string;
  description?: string;
  /** Language code for the survey's default language */
  languageCode?: string;
}

// ============ Responses ============
/**
 * Full survey response with all answers.
 * Matches backend SurveyResponseDto.
 * Note: IP addresses are not exposed for GDPR compliance.
 */
export interface SurveyResponse {
  id: string;
  surveyId: string;
  /** Survey title - always present from backend */
  surveyTitle: string;
  respondentEmail?: string;
  respondentName?: string;
  isComplete: boolean;
  startedAt: string;
  submittedAt?: string;
  timeSpentSeconds?: number;
  answers: Answer[];
}

export interface ResponseListItem {
  id: string;
  surveyId: string;
  surveyTitle: string;
  respondentId?: string;
  respondentEmail?: string;
  respondentName?: string;
  isComplete: boolean;
  startedAt: string;
  submittedAt?: string;
  timeSpentSeconds?: number;
  answerCount: number;
}

/**
 * Selected option in an answer.
 */
export interface SelectedOption {
  /** Option ID (for aggregation) */
  id: string;
  /** Option text at time of selection (historical record) */
  text: string;
}

/**
 * Answer data.
 * Matches backend AnswerDto.
 */
export interface Answer {
  id: string;
  questionId: string;
  /** Selected options for choice questions */
  selectedOptions?: SelectedOption[];
  /** Text value for text questions or "Other" input */
  text?: string;
  /** Display text (computed from options + text) */
  displayValue: string;
  answeredAt: string;
  /** File URLs for file upload questions */
  fileUrls?: string[];
  /** Matrix answers - key is row label, value is selected column label */
  matrixAnswers?: Record<string, string>;
}

// NOTE: SubmitResponseRequest is defined in public-survey.ts - use that instead

// ============ Recurring Surveys ============
// Keep RecurrenceFrequency as alias for backward compatibility
export type RecurrenceFrequency = RecurrencePattern;

export interface RecurringSurvey {
  id: string;
  surveyId: string;
  surveyTitle: string;
  namespaceId: string;
  name: string;
  isActive: boolean;
  // Schedule
  pattern: RecurrencePattern;
  cronExpression?: string;
  sendTime: string;
  timezoneId: string;
  daysOfWeek?: DayOfWeek[];
  dayOfMonth?: number;
  // Audience
  audienceType: AudienceType;
  recipientEmails?: string[];
  audienceListId?: string;
  recipientCount: number;
  // Options
  sendReminders: boolean;
  reminderDaysAfter: number;
  maxReminders: number;
  customSubject?: string;
  customMessage?: string;
  // Tracking
  nextRunAt?: string;
  lastRunAt?: string;
  totalRuns: number;
  endsAt?: string;
  maxRuns?: number;
  // Audit
  createdAt: string;
  createdBy?: string;
}

export interface RecurringSurveyListItem {
  id: string;
  surveyId: string;
  surveyTitle: string;
  name: string;
  isActive: boolean;
  pattern: RecurrencePattern;
  nextRunAt?: string;
  lastRunAt?: string;
  totalRuns: number;
  recipientCount: number;
  createdAt: string;
}

export interface RecurringRun {
  id: string;
  recurringSurveyId: string;
  runNumber: number;
  scheduledAt: string;
  startedAt?: string;
  completedAt?: string;
  status: RunStatus;
  recipientsCount: number;
  sentCount: number;
  failedCount: number;
  responsesCount: number;
  errorMessage?: string;
  durationMs: number;
}

export interface UpcomingRun {
  recurringSurveyId: string;
  recurringSurveyName: string;
  surveyTitle: string;
  scheduledAt: string;
  estimatedRecipients: number;
}

export interface CreateRecurringSurveyRequest {
  surveyId: string;
  name: string;
  // Schedule
  pattern: RecurrencePattern;
  cronExpression?: string;
  sendTime: string;
  timezoneId: string;
  daysOfWeek?: DayOfWeek[];
  dayOfMonth?: number;
  // Audience
  audienceType: AudienceType;
  recipientEmails?: string[];
  audienceListId?: string;
  // Options
  sendReminders?: boolean;
  reminderDaysAfter?: number;
  maxReminders?: number;
  customSubject?: string;
  customMessage?: string;
  // End conditions
  endsAt?: string;
  maxRuns?: number;
  // Activation
  activateImmediately?: boolean;
}

export interface UpdateRecurringSurveyRequest {
  id: string;
  name: string;
  // Schedule
  pattern: RecurrencePattern;
  cronExpression?: string;
  sendTime: string;
  timezoneId: string;
  daysOfWeek?: DayOfWeek[];
  dayOfMonth?: number;
  // Audience
  audienceType: AudienceType;
  recipientEmails?: string[];
  audienceListId?: string;
  // Options
  sendReminders?: boolean;
  reminderDaysAfter?: number;
  maxReminders?: number;
  customSubject?: string;
  customMessage?: string;
  // End conditions
  endsAt?: string;
  maxRuns?: number;
}

// ============ Analytics ============
export interface SurveyAnalytics {
  surveyId: string;
  surveyTitle: string;
  totalResponses: number;
  completedResponses: number;
  partialResponses: number;
  completionRate: number;
  averageCompletionTimeSeconds: number;
  firstResponseAt?: string;
  lastResponseAt?: string;
  responsesByDate?: Record<string, number>;
  questions: QuestionAnalytics[];
}

export interface MatrixAnalyticsCell {
  row: string;
  column: string;
  count: number;
  percentage: number;
}

export interface MatrixAnalyticsData {
  rows: string[];
  columns: string[];
  cells: MatrixAnalyticsCell[];
  totalResponses: number;
}

export interface QuestionAnalytics {
  questionId: string;
  questionText: string;
  /** Question type - backend returns as string (e.g., "SingleChoice", "Text") */
  questionType: QuestionType | string;
  totalAnswers: number;
  skippedCount: number;
  answerOptions?: AnswerOptionStats[];
  averageRating?: number;
  averageValue?: number;
  minValue?: number;
  maxValue?: number;
  sampleAnswers?: string[];
  matrixData?: MatrixAnalyticsData;
  /** "Other" responses count (when AllowOther is enabled) */
  otherCount?: number;
  /** Sample "Other" text responses */
  otherResponses?: string[];
}

export interface AnswerOptionStats {
  /** Option ID for stable identification */
  optionId: string;
  /** Current option text */
  option: string;
  count: number;
  percentage: number;
}

// ============ NPS Analytics ============
export interface NpsScore {
  score: number;
  promoters: number;
  passives: number;
  detractors: number;
  totalResponses: number;
  promoterPercentage: number;
  passivePercentage: number;
  detractorPercentage: number;
  category: NpsCategory;
  categoryDescription: string;
}

export interface NpsTrendPoint {
  date: string;
  score: number;
  responseCount: number;
  promoters: number;
  passives: number;
  detractors: number;
}

export interface NpsTrend {
  surveyId: string;
  dataPoints: NpsTrendPoint[];
  averageScore: number;
  changeFromPrevious: number;
  trendDirection: NpsTrendDirection;
  fromDate: string;
  toDate: string;
}

export interface NpsQuestion {
  questionId: string;
  questionText: string;
  npsType: NpsQuestionType;
  score: NpsScore;
}

export interface SurveyNpsSummary {
  surveyId: string;
  surveyTitle: string;
  overallScore?: NpsScore;
  questions: NpsQuestion[];
  fromDate?: string;
  toDate?: string;
}

// Response Trends
export interface ResponseTrend {
  surveyId: string;
  fromDate: string;
  toDate: string;
  totalResponses: number;
  averageResponsesPerDay: number;
  dailyResponses: Record<string, number>;
  responsesByHour: Record<number, number>;
  responsesByDayOfWeek: Record<string, number>;
}

// ============ User Preferences/Settings ============

export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorPalette =
  | 'purple'
  | 'blue'
  | 'green'
  | 'orange'
  | 'pink'
  | 'teal'
  | 'amber'
  | 'indigo'
  | 'coral'
  | 'midnight'
  | 'monochrome'
  | 'slate';
export type FontSizeScale = 'small' | 'medium' | 'large' | 'extra-large';
export type DateFormatOption = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
export type TimeFormatOption = '12h' | '24h';
export type DecimalSeparator = 'dot' | 'comma';
export type ThousandsSeparator = 'comma' | 'dot' | 'space' | 'none';
export type SupportedLanguage = 'en' | 'az' | 'ru';
export type ViewMode = 'grid' | 'list';
export type SortField = 'title' | 'createdAt' | 'updatedAt' | 'status' | 'responseCount';
export type SortOrder = 'asc' | 'desc';
export type QuestionNumberingStyle = 'numbers' | 'letters' | 'none';
export type PageBreakBehavior = 'auto' | 'manual' | 'per-question';
export type HomeWidget = 'stats' | 'recent' | 'quick-actions' | 'pinned' | 'analytics';

export interface AccessibilitySettings {
  highContrastMode: boolean;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
  fontSizeScale: FontSizeScale;
  dyslexiaFriendlyFont: boolean;
}

export interface RegionalSettings {
  language: SupportedLanguage;
  dateFormat: DateFormatOption;
  timeFormat: TimeFormatOption;
  timezone: string;
  decimalSeparator: DecimalSeparator;
  thousandsSeparator: ThousandsSeparator;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  responseAlerts: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
  completionAlerts: boolean;
  distributionReports: boolean;
}

export interface DashboardSettings {
  defaultViewMode: ViewMode;
  itemsPerPage: number;
  sidebarCollapsed: boolean;
  defaultSortField: SortField;
  defaultSortOrder: SortOrder;
  homeWidgets: HomeWidget[];
  pinnedSurveyIds: string[];
}

export interface SurveyBuilderSettings {
  defaultQuestionRequired: boolean;
  defaultThemeId: string | null;
  defaultWelcomeMessage: string;
  defaultThankYouMessage: string;
  autoSaveInterval: number;
  questionNumberingStyle: QuestionNumberingStyle;
  showQuestionDescriptions: boolean;
  defaultPageBreakBehavior: PageBreakBehavior;
}

export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';

export interface OnboardingSettings {
  status: OnboardingStatus;
  completedAt: string | null;
  currentStep: number;
  hasSeenWelcomeTour: boolean;
  hasCompletedProfileSetup: boolean;
  hasCreatedFirstSurvey: boolean;
  // Getting Started Guide tracking
  hasCompletedGettingStarted: boolean;
  gettingStartedStep: number;
  gettingStartedCompletedAt: string | null;
}

export interface UserPreferences {
  // Appearance
  themeMode: ThemeMode;
  colorPalette: ColorPalette;
  // Grouped settings
  accessibility: AccessibilitySettings;
  regional: RegionalSettings;
  notifications: NotificationSettings;
  dashboard: DashboardSettings;
  surveyBuilder: SurveyBuilderSettings;
  onboarding: OnboardingSettings;
}

export interface UpdateUserPreferencesRequest {
  themeMode?: ThemeMode;
  colorPalette?: ColorPalette;
  accessibility?: Partial<AccessibilitySettings>;
  regional?: Partial<RegionalSettings>;
  notifications?: Partial<NotificationSettings>;
  dashboard?: Partial<DashboardSettings>;
  surveyBuilder?: Partial<SurveyBuilderSettings>;
  onboarding?: Partial<OnboardingSettings>;
}
