// API response and request types

import type {
  User,
  AuthTokens,
  NamespaceMembership,
  Survey,
  SurveyLink,
  EmailDistributionSummary,
  DistributionRecipient,
  DistributionStats,
  EmailTemplateSummary,
  SurveyTemplateSummary,
  ResponseListItem,
} from './models';
import type { ExportFormat, LogicOperator, LogicAction } from './enums';

// ============ Common API Types ============

/**
 * RFC 7807 Problem Details response format
 * @see https://tools.ietf.org/html/rfc7807
 */
export interface ProblemDetails {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
  // Extension members
  [key: string]: unknown;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
}

// ============ Auth API Types ============
export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RefreshTokenResponse {
  tokens: AuthTokens;
}

// ============ Azure AD SSO Types ============

/**
 * Azure AD configuration for frontend MSAL initialization.
 * Returned by GET /api/auth/azure-ad/config
 */
export interface AzureAdConfig {
  /** Whether Azure AD authentication is enabled on the backend */
  enabled: boolean;
  /** Azure AD Application (Client) ID */
  clientId?: string;
  /** Azure AD Tenant (Directory) ID */
  tenantId?: string;
  /** Azure AD authority URL for authentication */
  authority?: string;
  /** OAuth redirect URI for the frontend application */
  redirectUri?: string;
  /** OAuth scopes to request during authentication */
  scopes?: string[];
}

/**
 * Request body for Azure AD login.
 * POST /api/auth/azure-ad/login
 */
export interface AzureAdLoginRequest {
  /** ID token from Azure AD authentication */
  idToken: string;
  /** Optional access token from Azure AD */
  accessToken?: string;
}

/**
 * Request body for linking Azure AD account.
 * POST /api/auth/azure-ad/link
 */
export interface AzureAdLinkRequest {
  /** ID token from Azure AD authentication */
  idToken: string;
}

// ============ Namespace API Types ============

/** Paginated response for namespace members */
export type MembersPaginatedResponse = PaginatedResponse<NamespaceMembership>;

// ============ Survey API Types ============
/**
 * Query parameters for listing surveys.
 * Matches backend GetSurveysQuery.
 */
export interface SurveyListParams extends PaginationParams {
  /** Filter by survey status (numeric enum value) */
  status?: string;
  /** Search term for filtering surveys by title/description */
  searchTerm?: string;
  /** Filter surveys created on or after this date (ISO 8601 format) */
  fromDate?: string;
  /** Filter surveys created on or before this date (ISO 8601 format) */
  toDate?: string;
  /** Field to sort by */
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'status' | 'responseCount' | 'questionCount';
  /** Sort in descending order (default: true) */
  sortDescending?: boolean;
}

export type SurveysResponse = PaginatedResponse<Survey>;

/**
 * Represents a node (question) in the logic map visualization.
 * Matches backend LogicNodeDto.
 */
export interface LogicNodeDto {
  id: string;
  text: string;
  order: number;
  type: string;
  hasLogic: boolean;
  isConditional: boolean;
}

/**
 * Represents an edge (logic connection) in the logic map visualization.
 * Matches backend LogicEdgeDto.
 */
export interface LogicEdgeDto {
  id: string;
  sourceId: string;
  targetId: string;
  operator: LogicOperator;
  conditionValue: string;
  action: LogicAction;
  label: string;
}

/**
 * Response from GET /api/surveys/{surveyId}/logic-map
 * Matches backend SurveyLogicMapDto - graph-based structure for visualization.
 */
export interface LogicMapResponse {
  surveyId: string;
  nodes: LogicNodeDto[];
  edges: LogicEdgeDto[];
}

// ============ Links API Types ============

/**
 * Link analytics response matching backend LinkAnalyticsDto.
 */
export interface LinkAnalyticsResponse {
  linkId: string;
  linkName: string;
  totalClicks: number;
  uniqueClicks: number;
  totalResponses: number;
  conversionRate: number;
  clicksByDate: { date: string; clicks: number; uniqueClicks: number }[];
  clicksByCountry: { country: string; countryCode: string; clicks: number; percentage: number }[];
  clicksByDevice: { device: string; clicks: number; percentage: number }[];
  clicksByBrowser: { browser: string; clicks: number; percentage: number }[];
  clicksByReferrer: { referrer: string; clicks: number; percentage: number }[];
  topCities: { city: string; country: string; clicks: number }[];
}

// Issue 14: BulkLinkGenerationResponse matching backend BulkLinkGenerationResultDto
export interface BulkLinkGenerationResponse {
  requestedCount: number; // Number of links requested
  generatedCount: number; // Number of links actually generated
  links: SurveyLink[];
}

// ============ Short Links (Public Access) API Types ============

/**
 * Result from GET /api/s/{token} - validates link before accessing survey
 * Matches backend LinkByTokenResult
 */
export interface LinkByTokenResult {
  linkId: string;
  surveyId: string;
  surveyTitle: string;
  isValid: boolean;
  invalidReason?: string;
  requiresPassword: boolean;
}

/**
 * Request body for POST /api/s/{token}/access
 * Matches backend LinkAccessRequest
 */
export interface LinkAccessRequest {
  password?: string;
}

/**
 * Result from POST /api/s/{token}/access - records click and provides survey access
 * Matches backend RecordLinkClickResult
 */
export interface RecordLinkClickResult {
  surveyId: string;
  surveyAccessToken: string;
  clickId: string;
  prefillData?: Record<string, string>;
}

/** Paginated response for survey links list */
export type SurveyLinksResponse = PaginatedResponse<SurveyLink>;

// ============ Distribution API Types ============
/** Paginated response of distribution summaries for list endpoint */
export type DistributionsResponse = PaginatedResponse<EmailDistributionSummary>;

/** Paginated recipients response */
export type DistributionRecipientsResponse = PaginatedResponse<DistributionRecipient>;

/** Distribution statistics response (same as DistributionStats) */
export type DistributionStatsResponse = DistributionStats;

// ============ Template API Types ============

/** Paginated response of email template summaries for list endpoint */
export type EmailTemplatesResponse = PaginatedResponse<EmailTemplateSummary>;

/** Request body for duplicating an email template */
export interface DuplicateEmailTemplateRequest {
  newName?: string;
}

/** Pagination params for email templates list */
export interface EmailTemplateListParams extends PaginationParams {
  searchTerm?: string;
  type?: number;
}

// Survey Templates use paginated response with summary type (no questions array)
export type SurveyTemplatesResponse = PaginatedResponse<SurveyTemplateSummary>;

// ============ Response API Types ============

/**
 * Query parameters for listing responses.
 * Matches backend GetResponsesQuery.
 */
export interface ResponsesListParams extends PaginationParams {
  /** Filter by completion status */
  isComplete?: boolean;
  /** Filter responses created on or after this date (ISO 8601 format) */
  fromDate?: string;
  /** Filter responses created on or before this date (ISO 8601 format) */
  toDate?: string;
  /** Search term for filtering responses */
  searchTerm?: string;
}

/**
 * Paginated list of response summaries.
 * Backend returns PagedResponse<ResponseListItemDto>
 */
export type SurveyResponsesResponse = PaginatedResponse<ResponseListItem>;

/**
 * Bulk delete operation result.
 * Backend returns BulkDeleteResponsesResult
 */
export interface BulkDeleteResponsesResult {
  deletedCount: number;
  failedIds: string[];
  isComplete: boolean;
}

// Export request/response types
export interface ExportResponsesRequest {
  format: ExportFormat;
  columns?: string[];
  fromDate?: string;
  toDate?: string;
  includeIncomplete?: boolean;
  includeMetadata?: boolean;
}

/**
 * Export preview response matching backend ExportPreviewDto
 */
export interface ExportPreviewResponse {
  surveyId: string;
  surveyTitle: string;
  totalResponses: number;
  completedResponses: number;
  incompleteResponses: number;
  columns: ExportColumn[];
  availableFormats: string[];
}

/**
 * Export column matching backend ExportColumnDto
 */
export interface ExportColumn {
  /** Column identifier (Question ID or metadata field name) */
  id: string;
  /** Column header/name */
  name: string;
  /** Column type (Question, Metadata) */
  type: string;
  /** Whether the column is selected by default */
  isDefault: boolean;
}

// ============ Analytics API Types ============
import type { NpsScore, NpsTrend, SurveyNpsSummary, ResponseTrend, NpsTrendGroupBy } from './models';

export type { NpsScore, NpsTrend, SurveyNpsSummary, ResponseTrend, NpsTrendGroupBy };

// ============ Translation API Types ============
// Types for the bulk translation management API

/** DTO for a single survey translation */
export interface SurveyTranslationDto {
  languageCode: string;
  title: string;
  description?: string;
  welcomeMessage?: string;
  thankYouMessage?: string;
  isDefault: boolean;
}

/** DTO for translated question settings (options, labels, etc.) */
export interface TranslatedQuestionSettingsDto {
  /** Translated options for choice-based questions */
  options?: string[];
  /** Translated minimum label for scale/rating questions */
  minLabel?: string;
  /** Translated maximum label for scale/rating questions */
  maxLabel?: string;
  /** Translated rows for matrix questions */
  matrixRows?: string[];
  /** Translated columns for matrix questions */
  matrixColumns?: string[];
  /** Translated placeholder text for text questions */
  placeholder?: string;
  /** Translated validation error message */
  validationMessage?: string;
  /** Translated "Other" option label */
  otherLabel?: string;
}

/** DTO for a single question translation */
export interface QuestionTranslationItemDto {
  languageCode: string;
  text: string;
  description?: string;
  isDefault: boolean;
  /** Translated question settings (options, labels, matrix rows/columns, etc.) */
  translatedSettings?: TranslatedQuestionSettingsDto;
}

/** DTO containing all translations for a question */
export interface QuestionTranslationsDto {
  questionId: string;
  order: number;
  translations: QuestionTranslationItemDto[];
}

/** Response DTO containing all translations for a survey */
export interface SurveyTranslationsResponse {
  surveyId: string;
  defaultLanguage: string;
  translations: SurveyTranslationDto[];
  questions: QuestionTranslationsDto[];
}

/** DTO for updating a single question's translation */
export interface QuestionTranslationUpdateDto {
  questionId: string;
  languageCode: string;
  text: string;
  description?: string;
  /** Translated question settings (options, labels, matrix rows/columns, etc.) */
  translatedSettings?: TranslatedQuestionSettingsDto;
}

/** Request to bulk update all translations for a survey */
export interface BulkUpdateSurveyTranslationsRequest {
  translations: SurveyTranslationDto[];
  questionTranslations?: QuestionTranslationUpdateDto[];
}

/** Request to update a single translation for a survey */
export interface UpdateSurveyTranslationRequest {
  title: string;
  description?: string;
  welcomeMessage?: string;
  thankYouMessage?: string;
}

/** Result DTO for bulk translation operations */
export interface BulkTranslationResultDto {
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  errors: string[];
  languages: string[];
  /** Translation completion status per language (percentage 0-100) */
  completionStatus?: Record<string, number>;
}

export interface NpsTrendParams {
  fromDate?: string;
  toDate?: string;
  groupBy?: NpsTrendGroupBy;
}

// ============ Recurring Surveys API Types ============
import type { RecurringSurveyListItem, RecurringRun } from './models';

// Backend returns paginated response with 'items' key
export type RecurringSurveysResponse = PaginatedResponse<RecurringSurveyListItem>;

// Backend returns paginated response with 'items' key
export type RecurringRunsResponse = PaginatedResponse<RecurringRun>;

export interface RecurringRunsParams extends PaginationParams {
  status?: string;
}

// Re-export model types for convenience
export type {
  User,
  AuthTokens,
  Namespace,
  NamespaceMembership,
  Survey,
  Question,
  QuestionSettings,
  QuestionLogic,
  SurveyLink,
  BulkLinkGenerationRequest,
  BulkLinkGenerationResult,
  EmailDistribution,
  EmailDistributionSummary,
  DistributionRecipient,
  DistributionStats,
  EmailTemplate,
  EmailTemplateSummary,
  EmailTemplateType,
  CreateEmailTemplateRequest,
  UpdateEmailTemplateRequest,
  SurveyTheme,
  SurveyTemplate,
  SurveyTemplateSummary,
  TemplateQuestion,
  TemplateCategory,
  CreateTemplateRequest,
  CreateTemplateQuestionRequest,
  CreateTemplateFromSurveyRequest,
  UpdateTemplateRequest,
  UpdateTemplateQuestionRequest,
  CreateSurveyFromTemplateRequest,
  SurveyResponse,
  ResponseListItem,
  Answer,
  QuestionAnalytics,
  AnswerOptionStats,
  MatrixAnalyticsCell,
  MatrixAnalyticsData,
  NpsCategory,
  NpsTrendDirection,
  NpsTrendPoint,
  NpsQuestion,
  NpsQuestionType,
  RecurringSurvey,
  RecurringSurveyListItem,
  RecurringRun,
  UpcomingRun,
  RecurrencePattern,
  RecurrenceFrequency,
  RunStatus,
  AudienceType,
  DayOfWeek,
  UpdateRecurringSurveyRequest,
  MemberRole,
  ThemeLayout,
  LogoPosition,
  InviteMemberResponse,
} from './models';
