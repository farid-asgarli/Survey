// API response and request types

import type {
  User,
  AuthTokens,
  Namespace,
  NamespaceMembership,
  Survey,
  Question,
  QuestionLogic,
  SurveyLink,
  EmailDistribution,
  DistributionRecipient,
  EmailTemplate,
  EmailTemplateSummary,
  SurveyTheme,
  SurveyTemplate,
  SurveyResponse as SurveyResponseModel,
} from './models';
import type { ExportFormat } from './enums';

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

// ============ Namespace API Types ============

export interface NamespaceResponse {
  namespace: Namespace;
}

export interface MembersResponse {
  members: NamespaceMembership[];
}

// ============ Survey API Types ============
export interface SurveyListParams extends PaginationParams {
  status?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
}

export type SurveysResponse = PaginatedResponse<Survey>;

export interface SurveyDetailResponse {
  survey: Survey;
}

// ============ Question API Types ============
export interface QuestionsResponse {
  questions: Question[];
}

export interface QuestionResponse {
  question: Question;
}

export interface ReorderQuestionsRequest {
  questionIds: string[];
}

// ============ Logic API Types ============
export interface LogicResponse {
  rules: QuestionLogic[];
}

export interface LogicMapResponse {
  questions: {
    id: string;
    text: string;
    order: number;
    logicRules: QuestionLogic[];
  }[];
}

// ============ Links API Types ============
export interface LinksResponse {
  links: SurveyLink[];
}

export interface LinkResponse {
  link: SurveyLink;
}

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

// ============ Distribution API Types ============
export interface DistributionsResponse {
  distributions: EmailDistribution[];
}

export interface DistributionResponse {
  distribution: EmailDistribution;
}

export type DistributionRecipientsResponse = PaginatedResponse<DistributionRecipient>;

export interface DistributionStatsResponse {
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

// ============ Template API Types ============
// Note: Backend returns arrays directly, not wrapped in { templates: [...] }
export type EmailTemplatesResponse = EmailTemplateSummary[];

// Single template response is the template directly
export type EmailTemplateResponse = EmailTemplate;

// Survey Templates use paginated response
export type SurveyTemplatesResponse = PaginatedResponse<SurveyTemplate>;

export interface SurveyTemplateResponse {
  template: SurveyTemplate;
}

export interface SurveyTemplateListParams extends PaginationParams {
  category?: string;
  search?: string;
  isPublic?: boolean;
}

// ============ Theme API Types ============
export interface ThemesResponse {
  themes: SurveyTheme[];
}

export interface ThemeResponse {
  theme: SurveyTheme;
}

// ============ Response API Types ============
export interface ResponsesListParams extends PaginationParams {
  isCompleted?: boolean;
  fromDate?: string;
  toDate?: string;
}

export type SurveyResponsesResponse = PaginatedResponse<SurveyResponseModel>;

export interface SingleResponseResponse {
  response: SurveyResponseModel;
}

export interface SubmitResponseResponse {
  responseId: string;
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

export interface ExportPreviewResponse {
  availableColumns: ExportColumn[];
  totalResponses: number;
  completeResponses: number;
  incompleteResponses: number;
}

export interface ExportColumn {
  id: string;
  label: string;
  type: 'question' | 'metadata' | 'system';
  questionId?: string;
}

// ============ Analytics API Types ============
import type { NpsScore, NpsTrend, SurveyNpsSummary, ResponseTrend, NpsTrendGroupBy } from './models';

export type { NpsScore, NpsTrend, SurveyNpsSummary, ResponseTrend, NpsTrendGroupBy };

export interface NpsTrendParams {
  fromDate?: string;
  toDate?: string;
  groupBy?: NpsTrendGroupBy;
}

export interface ResponseTrendParams {
  fromDate: string;
  toDate: string;
}

export interface ExportAnalyticsParams {
  format: ExportFormat;
  includeOpenEnded?: boolean;
  includeMetadata?: boolean;
}

// ============ Recurring Surveys API Types ============
import type { RecurringSurvey, RecurringSurveyListItem, RecurringRun, UpcomingRun } from './models';

// Backend returns paginated response with 'items' key
export type RecurringSurveysResponse = PaginatedResponse<RecurringSurveyListItem>;

export interface RecurringSurveyResponse {
  recurringSurvey: RecurringSurvey;
}

export interface UpcomingRunsResponse {
  upcomingRuns: UpcomingRun[];
}

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
  DistributionRecipient,
  EmailTemplate,
  EmailTemplateSummary,
  EmailTemplateType,
  CreateEmailTemplateRequest,
  UpdateEmailTemplateRequest,
  SurveyTheme,
  SurveyTemplate,
  TemplateCategory,
  CreateTemplateRequest,
  CreateTemplateFromSurveyRequest,
  UpdateTemplateRequest,
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
} from './models';
