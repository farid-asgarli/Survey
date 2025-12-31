// API Service for Survey App backend communication

import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { getApiBaseUrl, API_ENDPOINTS } from '@/config/api';
import { getAccessToken, useAuthStore, getActiveNamespaceId } from '@/stores';
import { toast } from '@/components/ui';
import { getErrorMessage, isProblemDetails, getCurrentISOTimestamp } from '@/utils';
import { getCurrentLanguage } from '@/i18n';
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UploadAvatarResponse,
  CreateNamespaceRequest,
  InviteMemberRequest,
  CreateSurveyRequest,
  UpdateSurveyRequest,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  BatchSyncQuestionsRequest,
  BatchSyncQuestionsResult,
  CreateLogicRequest,
  CreateLinkRequest,
  UpdateLinkRequest,
  CreateDistributionRequest,
  CreateEmailTemplateRequest,
  UpdateEmailTemplateRequest,
  LoginResponse,
  RegisterResponse,
  RefreshTokenResponse,
  NamespaceResponse,
  MembersResponse,
  SurveysResponse,
  SurveyListParams,
  LogicMapResponse,
  LinkAnalyticsResponse,
  BulkLinkGenerationRequest,
  BulkLinkGenerationResponse,
  DistributionStatsResponse,
  SurveyTemplatesResponse,
  SurveyAnalytics,
  SurveyNpsSummary,
  NpsTrend,
  NpsTrendParams,
  NpsScore,
  User,
  Namespace,
  Survey,
  Question,
  QuestionLogic,
  SurveyLink,
  EmailDistribution,
  EmailTemplate,
  EmailTemplateSummary,
  SurveyTheme,
  SurveyTemplate,
  ExportFormat,
  RecipientStatus,
  UpdateMemberRoleRequest,
  UpdateMemberRoleResponse,
} from '@/types';

// Create axios instance with base configuration
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token and namespace context
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add namespace context header for multi-tenant operations
      const namespaceId = getActiveNamespaceId();
      if (namespaceId && config.headers) {
        config.headers['X-Namespace-Id'] = namespaceId;
      }

      // Add Accept-Language header for localized responses
      if (config.headers) {
        config.headers['Accept-Language'] = getCurrentLanguage();
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for success toasts, error handling and token refresh
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Show success toast for mutating requests (POST, PUT, PATCH, DELETE)
      // Skip GET requests and auth endpoints (they have custom handling)
      const method = response.config.method?.toUpperCase();
      const url = response.config.url || '';
      const isMutatingRequest = method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
      const isAuthEndpoint = url.includes('/auth/');
      const isRefreshEndpoint = url.includes('/refresh');

      // Check for custom header to suppress toast (for cases where manual toast is preferred)
      const suppressToast = response.config.headers?.['X-Suppress-Toast'] === 'true';

      if (isMutatingRequest && !isAuthEndpoint && !isRefreshEndpoint && !suppressToast) {
        // Extract success message from response if available, otherwise use default
        const successMessage = getSuccessMessage(method, url);
        if (successMessage) {
          toast.success(successMessage);
        }
      }

      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Handle 401 Unauthorized - attempt token refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const { tokens } = useAuthStore.getState();
          if (tokens?.refreshToken && tokens?.accessToken) {
            // Backend expects both token (expired access token) and refreshToken
            const response = await axios.post<{ token: string; refreshToken: string; expiresAt: string }>(
              `${getApiBaseUrl()}${API_ENDPOINTS.auth.refresh}`,
              {
                token: tokens.accessToken,
                refreshToken: tokens.refreshToken,
              }
            );

            const newTokens = {
              accessToken: response.data.token,
              refreshToken: response.data.refreshToken,
              expiresAt: response.data.expiresAt,
            };

            useAuthStore.getState().setTokens(newTokens);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            }

            return client(originalRequest);
          }
        } catch {
          // Refresh failed, logout user
          useAuthStore.getState().logout();
        }
      }

      // Show error toast for all errors (except during token refresh)
      // Skip auth endpoints as they have custom error handling
      const url = originalRequest?.url || '';
      const isAuthEndpoint = url.includes('/auth/');
      const isRefreshAttempt = originalRequest?._retry;
      const suppressToast = originalRequest?.headers?.['X-Suppress-Toast'] === 'true';

      if (!isAuthEndpoint && !isRefreshAttempt && !suppressToast) {
        const errorMessage = getErrorMessage(error, 'An error occurred');
        const data = error.response?.data;

        // Check if it's a warning (some APIs return warnings with 400 status)
        if (isProblemDetails(data) && data.type?.includes('warning')) {
          toast.warning(errorMessage);
        } else {
          toast.error(errorMessage);
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
};

/**
 * Generate a user-friendly success message based on the HTTP method and URL
 */
function getSuccessMessage(method: string, url: string): string | null {
  // Extract resource name from URL (e.g., /api/v1/surveys -> surveys)
  const urlParts = url.split('/').filter(Boolean);
  const resourceIndex = urlParts.findIndex((part) => part === 'v1') + 1;
  const resource = urlParts[resourceIndex]?.replace(/-/g, ' ') || 'item';

  // Singularize resource name for better messages
  const singularResource = resource.endsWith('s') ? resource.slice(0, -1) : resource;

  // Check if this is an action endpoint (e.g., /surveys/{id}/publish)
  const lastPart = urlParts[urlParts.length - 1];
  const isActionEndpoint = lastPart && !isUUID(lastPart) && urlParts.length > resourceIndex + 1;

  if (isActionEndpoint) {
    // Format action name (e.g., "publish" -> "Published")
    const action = lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
    return `${singularResource.charAt(0).toUpperCase() + singularResource.slice(1)} ${action.toLowerCase()}d successfully`;
  }

  switch (method) {
    case 'POST':
      return `${singularResource.charAt(0).toUpperCase() + singularResource.slice(1)} created successfully`;
    case 'PUT':
    case 'PATCH':
      return `${singularResource.charAt(0).toUpperCase() + singularResource.slice(1)} updated successfully`;
    case 'DELETE':
      return `${singularResource.charAt(0).toUpperCase() + singularResource.slice(1)} deleted successfully`;
    default:
      return null;
  }
}

/**
 * Check if a string is a UUID
 */
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export const apiClient = createApiClient();

// ============ Auth API ============

// Raw API response types (as returned by backend)
interface RawAuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

// Transform raw auth response to expected format
const transformAuthResponse = (raw: RawAuthResponse): LoginResponse => ({
  user: {
    ...raw.user,
    // Provide defaults for optional fields not returned by API
    createdAt: raw.user.createdAt || getCurrentISOTimestamp(),
    updatedAt: raw.user.updatedAt || getCurrentISOTimestamp(),
  },
  tokens: {
    accessToken: raw.token,
    refreshToken: raw.refreshToken,
    expiresAt: raw.expiresAt,
  },
});

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<RawAuthResponse>(API_ENDPOINTS.auth.login, data);
    return transformAuthResponse(response.data);
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RawAuthResponse>(API_ENDPOINTS.auth.register, data);
    return transformAuthResponse(response.data);
  },

  refreshToken: async (refreshToken: string, accessToken: string): Promise<RefreshTokenResponse> => {
    // Backend expects both token (expired access token) and refreshToken
    const response = await apiClient.post<RawAuthResponse>(API_ENDPOINTS.auth.refresh, {
      token: accessToken,
      refreshToken,
    });
    return {
      tokens: {
        accessToken: response.data.token,
        refreshToken: response.data.refreshToken,
        expiresAt: response.data.expiresAt,
      },
    };
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.auth.forgotPassword, data);
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.auth.resetPassword, data);
  },
};

// ============ Users API ============
export const usersApi = {
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>(API_ENDPOINTS.users.me);
    return response.data;
  },

  updateCurrentUser: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.put<User>(API_ENDPOINTS.users.me, data);
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await apiClient.put<User>(API_ENDPOINTS.users.me, data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.users.changePassword, data);
  },

  uploadAvatar: async (file: File): Promise<UploadAvatarResponse> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.post<UploadAvatarResponse>(API_ENDPOINTS.users.avatar, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteAvatar: async (): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.users.avatar);
  },
};

// ============ User Preferences API ============
import type { UserPreferences, UpdateUserPreferencesRequest } from '@/types';

export const preferencesApi = {
  getPreferences: async (): Promise<UserPreferences> => {
    const response = await apiClient.get<UserPreferences>(API_ENDPOINTS.users.settings);
    return response.data;
  },

  updatePreferences: async (data: UpdateUserPreferencesRequest): Promise<UserPreferences> => {
    const response = await apiClient.put<UserPreferences>(API_ENDPOINTS.users.settings, data);
    return response.data;
  },
};

// ============ Namespaces API ============

export const namespacesApi = {
  list: async (): Promise<Namespace[]> => {
    const response = await apiClient.get<Namespace[]>(API_ENDPOINTS.namespaces.list);
    return response.data;
  },

  getById: async (id: string): Promise<Namespace> => {
    const response = await apiClient.get<NamespaceResponse>(API_ENDPOINTS.namespaces.byId(id));
    return response.data.namespace;
  },

  getBySlug: async (slug: string): Promise<Namespace> => {
    const response = await apiClient.get<NamespaceResponse>(API_ENDPOINTS.namespaces.bySlug(slug));
    return response.data.namespace;
  },

  create: async (data: CreateNamespaceRequest): Promise<Namespace> => {
    const response = await apiClient.post<NamespaceResponse>(API_ENDPOINTS.namespaces.list, data);
    return response.data.namespace;
  },

  update: async (id: string, data: Partial<CreateNamespaceRequest>): Promise<Namespace> => {
    const response = await apiClient.put<NamespaceResponse>(API_ENDPOINTS.namespaces.byId(id), data);
    return response.data.namespace;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.namespaces.byId(id));
  },

  getMembers: async (id: string): Promise<MembersResponse['members']> => {
    const response = await apiClient.get<MembersResponse>(API_ENDPOINTS.namespaces.members(id));
    return response.data.members ?? response.data ?? [];
  },

  inviteMember: async (id: string, data: InviteMemberRequest): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.namespaces.members(id), data);
  },

  removeMember: async (namespaceId: string, membershipId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.namespaces.removeMember(namespaceId, membershipId));
  },

  updateMemberRole: async (namespaceId: string, membershipId: string, data: UpdateMemberRoleRequest): Promise<UpdateMemberRoleResponse> => {
    const response = await apiClient.put<UpdateMemberRoleResponse>(API_ENDPOINTS.namespaces.updateMemberRole(namespaceId, membershipId), data);
    return response.data;
  },
};

// ============ Surveys API ============
export const surveysApi = {
  list: async (namespaceId: string, params?: SurveyListParams): Promise<SurveysResponse> => {
    const response = await apiClient.get<SurveysResponse>(API_ENDPOINTS.surveys.list, {
      params: { namespaceId, ...params },
    });
    return response.data;
  },

  getById: async (id: string): Promise<Survey> => {
    const response = await apiClient.get<Survey>(API_ENDPOINTS.surveys.byId(id));
    return response.data;
  },

  create: async (namespaceId: string, data: CreateSurveyRequest): Promise<Survey> => {
    const response = await apiClient.post<Survey>(API_ENDPOINTS.surveys.list, {
      namespaceId,
      ...data,
    });
    return response.data;
  },

  update: async (id: string, data: UpdateSurveyRequest): Promise<Survey> => {
    const response = await apiClient.put<Survey>(API_ENDPOINTS.surveys.byId(id), {
      ...data,
      surveyId: id,
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.surveys.byId(id));
  },

  publish: async (id: string): Promise<Survey> => {
    const response = await apiClient.post<Survey>(API_ENDPOINTS.surveys.publish(id));
    return response.data;
  },

  close: async (id: string): Promise<Survey> => {
    const response = await apiClient.post<Survey>(API_ENDPOINTS.surveys.close(id));
    return response.data;
  },

  duplicate: async (id: string, newTitle?: string): Promise<Survey> => {
    const response = await apiClient.post<Survey>(API_ENDPOINTS.surveys.duplicate(id), newTitle ? { newTitle } : undefined);
    return response.data;
  },
};

// ============ Survey Translations API ============
import type {
  SurveyTranslationsResponse,
  SurveyTranslationDto,
  BulkUpdateSurveyTranslationsRequest,
  UpdateSurveyTranslationRequest,
  BulkTranslationResultDto,
} from '@/types';

export const translationsApi = {
  /**
   * Get all translations for a survey (including question translations)
   */
  getAll: async (surveyId: string): Promise<SurveyTranslationsResponse> => {
    const response = await apiClient.get<SurveyTranslationsResponse>(API_ENDPOINTS.translations.survey(surveyId));
    return response.data;
  },

  /**
   * Bulk update all translations for a survey
   */
  bulkUpdate: async (surveyId: string, data: BulkUpdateSurveyTranslationsRequest): Promise<BulkTranslationResultDto> => {
    const response = await apiClient.put<BulkTranslationResultDto>(API_ENDPOINTS.translations.survey(surveyId), data);
    return response.data;
  },

  /**
   * Update a single translation for a survey
   */
  updateByLanguage: async (surveyId: string, languageCode: string, data: UpdateSurveyTranslationRequest): Promise<SurveyTranslationDto> => {
    const response = await apiClient.put<SurveyTranslationDto>(API_ENDPOINTS.translations.surveyByLang(surveyId, languageCode), data);
    return response.data;
  },

  /**
   * Add a new translation for a survey
   */
  add: async (surveyId: string, data: SurveyTranslationDto): Promise<SurveyTranslationDto> => {
    const response = await apiClient.post<SurveyTranslationDto>(API_ENDPOINTS.translations.survey(surveyId), data);
    return response.data;
  },

  /**
   * Delete a translation for a survey
   */
  delete: async (surveyId: string, languageCode: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.translations.surveyByLang(surveyId, languageCode));
  },
};

// ============ Questions API ============
export const questionsApi = {
  list: async (surveyId: string): Promise<Question[]> => {
    const response = await apiClient.get<Question[]>(API_ENDPOINTS.surveys.questions(surveyId));
    return response.data;
  },

  getById: async (surveyId: string, questionId: string): Promise<Question> => {
    const response = await apiClient.get<Question>(API_ENDPOINTS.surveys.questionById(surveyId, questionId));
    return response.data;
  },

  create: async (surveyId: string, data: CreateQuestionRequest): Promise<Question> => {
    const response = await apiClient.post<Question>(API_ENDPOINTS.surveys.questions(surveyId), data);
    return response.data;
  },

  update: async (surveyId: string, questionId: string, data: UpdateQuestionRequest): Promise<Question> => {
    const response = await apiClient.put<Question>(API_ENDPOINTS.surveys.questionById(surveyId, questionId), data);
    return response.data;
  },

  delete: async (surveyId: string, questionId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.surveys.questionById(surveyId, questionId));
  },

  reorder: async (surveyId: string, questionIds: string[]): Promise<void> => {
    await apiClient.put(`${API_ENDPOINTS.surveys.questions(surveyId)}/reorder`, { questionIds });
  },

  /**
   * Batch sync questions - handles create, update, delete, and reorder in a single atomic operation.
   * This is more efficient than making multiple individual API calls.
   */
  batchSync: async (surveyId: string, data: BatchSyncQuestionsRequest): Promise<BatchSyncQuestionsResult> => {
    const response = await apiClient.post<BatchSyncQuestionsResult>(API_ENDPOINTS.surveys.questionsSync(surveyId), data);
    return response.data;
  },
};

// ============ Question Logic API ============

// Transform frontend CreateLogicRequest to backend format
const transformLogicRequest = (data: CreateLogicRequest): Record<string, unknown> => ({
  sourceQuestionId: data.sourceQuestionId,
  operator: data.operator,
  conditionValue: data.conditionValue || '',
  action: data.action,
  targetQuestionId: data.targetQuestionId,
  priority: data.priority ?? 0,
});

export const logicApi = {
  list: async (surveyId: string, questionId: string): Promise<QuestionLogic[]> => {
    const response = await apiClient.get<QuestionLogic[]>(API_ENDPOINTS.surveys.questionLogic(surveyId, questionId));
    return response.data;
  },

  create: async (surveyId: string, questionId: string, data: CreateLogicRequest): Promise<QuestionLogic> => {
    const response = await apiClient.post<{ rule: QuestionLogic }>(
      API_ENDPOINTS.surveys.questionLogic(surveyId, questionId),
      transformLogicRequest(data)
    );
    return response.data.rule;
  },

  update: async (surveyId: string, questionId: string, logicId: string, data: Partial<CreateLogicRequest>): Promise<QuestionLogic> => {
    const response = await apiClient.put<{ rule: QuestionLogic }>(
      `${API_ENDPOINTS.surveys.questionLogic(surveyId, questionId)}/${logicId}`,
      transformLogicRequest(data as CreateLogicRequest)
    );
    return response.data.rule;
  },

  delete: async (surveyId: string, questionId: string, logicId: string): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.surveys.questionLogic(surveyId, questionId)}/${logicId}`);
  },

  getLogicMap: async (surveyId: string): Promise<LogicMapResponse> => {
    const response = await apiClient.get<LogicMapResponse>(API_ENDPOINTS.surveys.logicMap(surveyId));
    return response.data;
  },

  reorder: async (surveyId: string, questionId: string, logicIds: string[]): Promise<void> => {
    await apiClient.put(API_ENDPOINTS.surveys.questionLogicReorder(surveyId, questionId), { logicIds });
  },

  /**
   * Evaluate logic on the server for validation, preview, or analytics
   * @param surveyId - Survey ID
   * @param answers - Array of {questionId, value} pairs
   * @param currentQuestionId - Optional current question for next-question calculation
   */
  evaluateLogic: async (
    surveyId: string,
    answers: { questionId: string; value: string }[],
    currentQuestionId?: string
  ): Promise<{
    visibleQuestionIds: string[];
    hiddenQuestionIds: string[];
    nextQuestionId?: string;
    shouldEndSurvey: boolean;
  }> => {
    const response = await apiClient.post(API_ENDPOINTS.surveys.evaluateLogic(surveyId), {
      currentQuestionId,
      answers,
    });
    return response.data;
  },
};

// ============ Survey Links API ============

export const linksApi = {
  list: async (surveyId: string): Promise<SurveyLink[]> => {
    const response = await apiClient.get<SurveyLink[]>(API_ENDPOINTS.surveys.links(surveyId));
    return response.data ?? [];
  },

  getById: async (surveyId: string, linkId: string): Promise<SurveyLink> => {
    const response = await apiClient.get<SurveyLink>(API_ENDPOINTS.surveys.linkById(surveyId, linkId));
    return response.data;
  },

  create: async (surveyId: string, data: CreateLinkRequest): Promise<SurveyLink> => {
    const response = await apiClient.post<SurveyLink>(API_ENDPOINTS.surveys.links(surveyId), data);
    return response.data;
  },

  update: async (surveyId: string, linkId: string, data: UpdateLinkRequest): Promise<SurveyLink> => {
    const response = await apiClient.put<SurveyLink>(API_ENDPOINTS.surveys.linkById(surveyId, linkId), data);
    return response.data;
  },

  deactivate: async (surveyId: string, linkId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.surveys.linkById(surveyId, linkId));
  },

  getAnalytics: async (surveyId: string, linkId: string, startDate?: string, endDate?: string): Promise<LinkAnalyticsResponse> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString();
    const url = `${API_ENDPOINTS.surveys.linkAnalytics(surveyId, linkId)}${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get<LinkAnalyticsResponse>(url);
    return response.data;
  },

  generateBulkLinks: async (surveyId: string, data: BulkLinkGenerationRequest): Promise<BulkLinkGenerationResponse> => {
    const response = await apiClient.post<BulkLinkGenerationResponse>(API_ENDPOINTS.surveys.linksBulk(surveyId), data);
    return response.data;
  },
};

// ============ Distributions API ============
export const distributionsApi = {
  list: async (surveyId: string): Promise<EmailDistribution[]> => {
    // Backend returns IReadOnlyList<EmailDistributionSummaryDto> directly
    const response = await apiClient.get<EmailDistribution[]>(API_ENDPOINTS.surveys.distributions(surveyId));
    return response.data ?? [];
  },

  getById: async (surveyId: string, distId: string): Promise<EmailDistribution> => {
    // Backend returns EmailDistributionDto directly
    const response = await apiClient.get<EmailDistribution>(API_ENDPOINTS.surveys.distributionById(surveyId, distId));
    return response.data;
  },

  create: async (surveyId: string, data: CreateDistributionRequest): Promise<EmailDistribution> => {
    // Backend returns EmailDistributionDto directly
    const response = await apiClient.post<EmailDistribution>(API_ENDPOINTS.surveys.distributions(surveyId), data);
    return response.data;
  },

  schedule: async (surveyId: string, distId: string, scheduledAt: string): Promise<EmailDistribution> => {
    // Backend returns EmailDistributionDto directly
    const response = await apiClient.post<EmailDistribution>(`${API_ENDPOINTS.surveys.distributionById(surveyId, distId)}/schedule`, {
      scheduledAt,
    });
    return response.data;
  },

  sendNow: async (surveyId: string, distId: string): Promise<EmailDistribution> => {
    // Backend returns EmailDistributionDto directly
    const response = await apiClient.post<EmailDistribution>(`${API_ENDPOINTS.surveys.distributionById(surveyId, distId)}/send`);
    return response.data;
  },

  cancel: async (surveyId: string, distId: string): Promise<void> => {
    // Backend uses POST /cancel for canceling scheduled distribution (returns 204)
    await apiClient.post(`${API_ENDPOINTS.surveys.distributionById(surveyId, distId)}/cancel`);
  },

  delete: async (surveyId: string, distId: string): Promise<void> => {
    // Backend uses DELETE for permanently deleting distribution
    await apiClient.delete(API_ENDPOINTS.surveys.distributionById(surveyId, distId));
  },

  getStats: async (surveyId: string, distId: string): Promise<DistributionStatsResponse> => {
    const response = await apiClient.get<DistributionStatsResponse>(`${API_ENDPOINTS.surveys.distributionById(surveyId, distId)}/stats`);
    return response.data;
  },

  getRecipients: async (
    surveyId: string,
    distId: string,
    params?: { pageNumber?: number; pageSize?: number; status?: RecipientStatus }
  ): Promise<{ items: import('@/types').DistributionRecipient[]; totalCount: number; pageNumber: number; pageSize: number }> => {
    const response = await apiClient.get<{
      items: import('@/types').DistributionRecipient[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_ENDPOINTS.surveys.distributionById(surveyId, distId)}/recipients`, { params });
    return response.data;
  },
};

// ============ Themes API ============

import type { ThemeColors, ThemeTypography, ThemeLayoutSettings, ThemeBranding, ThemeButton } from '@/types';

// Issue 15: ThemePreviewResponse matching backend ThemePreviewDto
export interface ThemePreviewResponse {
  theme: SurveyTheme;
  generatedCss: string; // Backend uses generatedCss, not css
  // Note: previewHtml is frontend-only, not returned by backend
}

export interface ThemeCssResponse {
  css: string;
}

export interface ThemesListResponse {
  items: SurveyTheme[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Helper to normalize theme list response (backend returns array directly)
function normalizeThemesResponse(data: SurveyTheme[] | ThemesListResponse): ThemesListResponse {
  if (Array.isArray(data)) {
    return {
      items: data,
      totalCount: data.length,
      pageNumber: 1,
      pageSize: data.length,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }
  return data;
}

// Issue 16: CreateThemeRequest matching backend CreateThemeDto (nested structure)
export interface CreateThemeRequest {
  name: string;
  description?: string;
  isPublic?: boolean;
  /** Language code for the initial translation */
  languageCode?: string;
  colors?: Partial<ThemeColors>;
  typography?: Partial<ThemeTypography>;
  layout?: Partial<ThemeLayoutSettings>;
  branding?: Partial<ThemeBranding>;
  button?: Partial<ThemeButton>;
  customCss?: string;
}

// Issue 17: DuplicateThemeRequest matching backend
export interface DuplicateThemeRequest {
  newName: string;
}

export type UpdateThemeRequest = Partial<CreateThemeRequest>;

export const themesApi = {
  list: async (params?: { pageNumber?: number; pageSize?: number; searchTerm?: string }): Promise<ThemesListResponse> => {
    const response = await apiClient.get<SurveyTheme[] | ThemesListResponse>(API_ENDPOINTS.themes.list, { params });
    return normalizeThemesResponse(response.data);
  },

  listPublic: async (): Promise<ThemesListResponse> => {
    const response = await apiClient.get<SurveyTheme[] | ThemesListResponse>(API_ENDPOINTS.themes.public);
    return normalizeThemesResponse(response.data);
  },

  getById: async (id: string): Promise<SurveyTheme> => {
    const response = await apiClient.get<SurveyTheme>(API_ENDPOINTS.themes.byId(id));
    return response.data;
  },

  getPreview: async (id: string): Promise<ThemePreviewResponse> => {
    const response = await apiClient.get<ThemePreviewResponse>(API_ENDPOINTS.themes.preview(id));
    return response.data;
  },

  getCss: async (id: string): Promise<ThemeCssResponse> => {
    const response = await apiClient.get<ThemeCssResponse>(API_ENDPOINTS.themes.css(id));
    return response.data;
  },

  create: async (data: CreateThemeRequest): Promise<SurveyTheme> => {
    const response = await apiClient.post<SurveyTheme>(API_ENDPOINTS.themes.list, data);
    return response.data;
  },

  update: async (id: string, data: UpdateThemeRequest): Promise<SurveyTheme> => {
    const response = await apiClient.put<SurveyTheme>(API_ENDPOINTS.themes.byId(id), data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.themes.byId(id));
  },

  // Issue 17: Fixed to send DuplicateThemeRequest body
  duplicate: async (id: string, newName?: string): Promise<SurveyTheme> => {
    const body: DuplicateThemeRequest | undefined = newName ? { newName } : undefined;
    const response = await apiClient.post<SurveyTheme>(API_ENDPOINTS.themes.duplicate(id), body);
    return response.data;
  },

  setDefault: async (id: string): Promise<void> => {
    // Backend returns 204 No Content
    await apiClient.post(API_ENDPOINTS.themes.setDefault(id));
  },

  applyToSurvey: async (surveyId: string, data: { themeId?: string; presetThemeId?: string; themeCustomizations?: string }): Promise<void> => {
    // Backend uses PUT /api/surveys/{id}/theme
    await apiClient.put(API_ENDPOINTS.themes.applyToSurvey(surveyId), data);
  },
};

// ============ Templates API ============
export const templatesApi = {
  list: async (params?: {
    namespaceId?: string;
    category?: string;
    searchTerm?: string; // Backend expects searchTerm parameter
    isPublic?: boolean;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<SurveyTemplatesResponse> => {
    const response = await apiClient.get<SurveyTemplatesResponse>(API_ENDPOINTS.templates.list, {
      params: {
        ...params,
        pageSize: params?.pageSize ?? 50, // Default to larger page size for templates
      },
    });
    return response.data;
  },

  getById: async (id: string): Promise<SurveyTemplate> => {
    // Backend returns SurveyTemplateDto directly
    const response = await apiClient.get<SurveyTemplate>(API_ENDPOINTS.templates.byId(id));
    return response.data;
  },

  create: async (
    namespaceId: string,
    data: { name: string; description?: string; category: string; isPublic?: boolean; languageCode: string; surveyData?: Record<string, unknown> }
  ): Promise<SurveyTemplate> => {
    // Backend returns SurveyTemplateDto directly
    const response = await apiClient.post<SurveyTemplate>(API_ENDPOINTS.templates.list, {
      namespaceId,
      ...data,
    });
    return response.data;
  },

  createFromSurvey: async (
    namespaceId: string,
    data: { surveyId: string; name: string; description?: string; category: string; isPublic?: boolean; languageCode?: string }
  ): Promise<SurveyTemplate> => {
    // Backend returns SurveyTemplateDto directly
    const response = await apiClient.post<SurveyTemplate>(API_ENDPOINTS.templates.fromSurvey, {
      namespaceId,
      ...data,
    });
    return response.data;
  },

  update: async (
    id: string,
    data: { name?: string; description?: string; category?: string; isPublic?: boolean; languageCode?: string; surveyData?: Record<string, unknown> }
  ): Promise<SurveyTemplate> => {
    // Backend returns SurveyTemplateDto directly
    const response = await apiClient.put<SurveyTemplate>(API_ENDPOINTS.templates.byId(id), data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.templates.byId(id));
  },

  createSurveyFromTemplate: async (
    templateId: string,
    namespaceId: string,
    data: { title: string; description?: string; languageCode: string }
  ): Promise<Survey> => {
    // Backend returns SurveyDto directly
    const response = await apiClient.post<Survey>(API_ENDPOINTS.templates.createSurvey(templateId), {
      namespaceId,
      ...data,
    });
    return response.data;
  },
};

// ============ Responses API ============
import type {
  ResponsesListParams,
  SurveyResponsesResponse,
  ExportResponsesRequest,
  ExportPreviewResponse,
  SurveyResponse as SurveyResponseType,
} from '@/types';

export const responsesApi = {
  /**
   * List responses for a survey (paginated)
   * Backend: GET /api/responses?surveyId=...
   */
  list: async (surveyId: string, params?: ResponsesListParams): Promise<SurveyResponsesResponse> => {
    const response = await apiClient.get<SurveyResponsesResponse>(API_ENDPOINTS.responses.list, {
      params: { ...params, surveyId },
    });
    return response.data;
  },

  /**
   * Get a single response by ID
   * Backend: GET /api/responses/{responseId}
   */
  getById: async (_surveyId: string, responseId: string): Promise<SurveyResponseType> => {
    const response = await apiClient.get<SurveyResponseType>(API_ENDPOINTS.responses.byId(responseId));
    return response.data;
  },

  /**
   * Delete a single response
   * Backend: DELETE /api/responses/{responseId}
   */
  delete: async (_surveyId: string, responseId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.responses.byId(responseId));
  },

  /**
   * Delete multiple responses in bulk
   * Note: This endpoint may not exist on the backend - keep for now
   */
  deleteBulk: async (surveyId: string, responseIds: string[]): Promise<void> => {
    await apiClient.post(`/api/responses/bulk-delete`, {
      surveyId,
      responseIds,
    });
  },

  /**
   * Export responses in specified format
   * Backend: POST /api/surveys/{surveyId}/export
   */
  export: async (surveyId: string, options: ExportResponsesRequest): Promise<Blob> => {
    const response = await apiClient.post(API_ENDPOINTS.responses.export(surveyId), options, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Get export preview with available columns
   * Backend: GET /api/surveys/{surveyId}/export/preview
   */
  getExportPreview: async (surveyId: string): Promise<ExportPreviewResponse> => {
    const response = await apiClient.get<ExportPreviewResponse>(API_ENDPOINTS.responses.exportPreview(surveyId));
    return response.data;
  },
};

// ============ Public Survey API ============
// Note: These endpoints don't require authentication
import type { PublicSurvey, SubmitResponseRequest, SubmitResponseResult } from '@/types/public-survey';

export const publicSurveyApi = {
  /**
   * Get a public survey by share token
   * No authentication required
   */
  getSurvey: async (shareToken: string): Promise<PublicSurvey> => {
    const response = await axios.get<PublicSurvey>(`${getApiBaseUrl()}${API_ENDPOINTS.publicSurvey.get(shareToken)}`);
    return response.data;
  },

  /**
   * Submit a survey response
   * No authentication required (anonymous submissions allowed)
   */
  submitResponse: async (data: SubmitResponseRequest): Promise<SubmitResponseResult> => {
    const response = await axios.post<SubmitResponseResult>(`${getApiBaseUrl()}${API_ENDPOINTS.publicSurvey.submit}`, data);
    return response.data;
  },
};

// ============ Email Templates API ============
export const emailTemplatesApi = {
  /**
   * List all email templates for the namespace
   * Backend returns: EmailTemplateSummary[] (array directly, not wrapped)
   */
  list: async (params?: { pageNumber?: number; pageSize?: number; searchTerm?: string; type?: string }): Promise<EmailTemplateSummary[]> => {
    const response = await apiClient.get<EmailTemplateSummary[]>(API_ENDPOINTS.emailTemplates.list, {
      params,
    });
    return response.data;
  },

  /**
   * Get a single email template by ID
   * Backend returns: EmailTemplate directly
   */
  getById: async (id: string): Promise<EmailTemplate> => {
    const response = await apiClient.get<EmailTemplate>(API_ENDPOINTS.emailTemplates.byId(id));
    return response.data;
  },

  /**
   * Create a new email template
   * Backend returns: EmailTemplate directly
   */
  create: async (data: CreateEmailTemplateRequest): Promise<EmailTemplate> => {
    const response = await apiClient.post<EmailTemplate>(API_ENDPOINTS.emailTemplates.list, data);
    return response.data;
  },

  /**
   * Update an existing email template
   * Backend returns: EmailTemplate directly
   */
  update: async (id: string, data: UpdateEmailTemplateRequest): Promise<EmailTemplate> => {
    const response = await apiClient.put<EmailTemplate>(API_ENDPOINTS.emailTemplates.byId(id), data);
    return response.data;
  },

  /**
   * Delete an email template
   * Backend returns: 204 No Content
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.emailTemplates.byId(id));
  },

  /**
   * Get available placeholders for email templates
   * Backend returns: string[]
   */
  getPlaceholders: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>(API_ENDPOINTS.emailTemplates.placeholders);
    return response.data;
  },

  /**
   * Set a template as default (via update with isDefault: true)
   * Backend automatically unsets the previous default for the same type
   */
  setDefault: async (id: string): Promise<EmailTemplate> => {
    const response = await apiClient.put<EmailTemplate>(API_ENDPOINTS.emailTemplates.byId(id), {
      isDefault: true,
    });
    return response.data;
  },

  /**
   * Duplicate a template (creates a copy with all content and translations)
   * Backend returns: EmailTemplate (the new duplicate)
   */
  duplicate: async (id: string, newName?: string): Promise<EmailTemplate> => {
    const response = await apiClient.post<EmailTemplate>(API_ENDPOINTS.emailTemplates.duplicate(id), {
      newName,
    });
    return response.data;
  },
};

// ============ Recurring Surveys API ============
import type {
  RecurringSurvey,
  RecurringRun,
  UpcomingRun,
  CreateRecurringSurveyRequest,
  UpdateRecurringSurveyRequest,
  RecurringSurveysResponse,
  RecurringRunsResponse,
  RecurringRunsParams,
} from '@/types';

export interface RecurringSurveysListParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  isActive?: boolean;
}

export const recurringSurveysApi = {
  /**
   * List all recurring surveys for the current namespace
   */
  list: async (params?: RecurringSurveysListParams): Promise<RecurringSurveysResponse> => {
    const response = await apiClient.get<RecurringSurveysResponse>(API_ENDPOINTS.recurringSurveys.list, {
      params,
    });
    return response.data;
  },

  /**
   * Get upcoming runs across all recurring surveys
   */
  getUpcoming: async (count?: number): Promise<UpcomingRun[]> => {
    const response = await apiClient.get<UpcomingRun[]>(API_ENDPOINTS.recurringSurveys.upcoming, {
      params: { count },
    });
    // Backend returns the array directly, not wrapped in { upcomingRuns: [...] }
    return response.data ?? [];
  },

  /**
   * Get a single recurring survey by ID
   */
  getById: async (id: string): Promise<RecurringSurvey> => {
    // Backend returns RecurringSurveyDto directly
    const response = await apiClient.get<RecurringSurvey>(API_ENDPOINTS.recurringSurveys.byId(id));
    return response.data;
  },

  /**
   * Create a new recurring survey
   */
  create: async (data: CreateRecurringSurveyRequest): Promise<RecurringSurvey> => {
    // Backend returns RecurringSurveyDto directly
    const response = await apiClient.post<RecurringSurvey>(API_ENDPOINTS.recurringSurveys.list, data);
    return response.data;
  },

  /**
   * Update an existing recurring survey
   */
  update: async (id: string, data: UpdateRecurringSurveyRequest): Promise<RecurringSurvey> => {
    // Backend returns RecurringSurveyDto directly
    const response = await apiClient.put<RecurringSurvey>(API_ENDPOINTS.recurringSurveys.byId(id), data);
    return response.data;
  },

  /**
   * Delete a recurring survey
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.recurringSurveys.byId(id));
  },

  /**
   * Pause a recurring survey
   */
  pause: async (id: string): Promise<RecurringSurvey> => {
    // Backend returns RecurringSurveyDto directly
    const response = await apiClient.post<RecurringSurvey>(API_ENDPOINTS.recurringSurveys.pause(id));
    return response.data;
  },

  /**
   * Resume a paused recurring survey
   */
  resume: async (id: string): Promise<RecurringSurvey> => {
    // Backend returns RecurringSurveyDto directly
    const response = await apiClient.post<RecurringSurvey>(API_ENDPOINTS.recurringSurveys.resume(id));
    return response.data;
  },

  /**
   * Trigger an immediate run
   */
  trigger: async (id: string): Promise<RecurringRun> => {
    // Backend returns RecurringSurveyRunDto directly
    const response = await apiClient.post<RecurringRun>(API_ENDPOINTS.recurringSurveys.trigger(id));
    return response.data;
  },

  /**
   * Get run history for a recurring survey
   */
  getRuns: async (id: string, params?: RecurringRunsParams): Promise<RecurringRunsResponse> => {
    const response = await apiClient.get<RecurringRunsResponse>(API_ENDPOINTS.recurringSurveys.runs(id), {
      params,
    });
    return response.data;
  },
};

// ============ Analytics API ============
export const analyticsApi = {
  /**
   * Get survey analytics summary
   */
  getSurveyAnalytics: async (surveyId: string): Promise<SurveyAnalytics> => {
    const response = await apiClient.get<SurveyAnalytics>(API_ENDPOINTS.analytics.survey(surveyId));
    return response.data;
  },

  /**
   * Get NPS summary for a survey
   */
  getSurveyNps: async (surveyId: string): Promise<SurveyNpsSummary> => {
    const response = await apiClient.get<SurveyNpsSummary>(API_ENDPOINTS.analytics.nps(surveyId));
    return response.data;
  },

  /**
   * Get NPS trend over time
   */
  getNpsTrend: async (surveyId: string, params?: NpsTrendParams): Promise<NpsTrend> => {
    const response = await apiClient.get<NpsTrend>(API_ENDPOINTS.analytics.npsTrend(surveyId), {
      params,
    });
    return response.data;
  },

  /**
   * Get NPS for a specific question
   */
  getQuestionNps: async (surveyId: string, questionId: string): Promise<NpsScore> => {
    const response = await apiClient.get<NpsScore>(API_ENDPOINTS.analytics.questionNps(surveyId, questionId));
    return response.data;
  },

  /**
   * Export analytics data
   */
  exportAnalytics: async (surveyId: string, format: ExportFormat): Promise<Blob> => {
    const response = await apiClient.get(API_ENDPOINTS.analytics.export(surveyId), {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },
};

// ============ Files API ============

export interface FileUploadResponse {
  fileId: string;
  fileName: string;
  url: string;
  contentType: string;
  size: number;
  category?: string;
}

export interface BulkFileUploadResponse {
  results: FileUploadResult[];
  successCount: number;
  failureCount: number;
}

export interface FileUploadResult {
  fileName: string;
  success: boolean;
  fileId?: string;
  url?: string;
  size?: number;
  error?: string;
}

export interface FileInfo {
  id: string;
  fileName: string;
  contentType: string;
  size: number;
  createdAt: string;
  url: string;
}

export const filesApi = {
  /**
   * Upload a single image file
   */
  uploadImage: async (file: File, category?: 'logo' | 'background' | 'question' | 'avatar'): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const params = category ? { category } : {};

    const response = await apiClient.post<FileUploadResponse>(API_ENDPOINTS.files.uploadImage, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params,
    });

    // Prepend API base URL to the file URL if it's a relative path
    const data = response.data;
    if (data.url && data.url.startsWith('/')) {
      data.url = `${getApiBaseUrl()}${data.url}`;
    }

    return data;
  },

  /**
   * Upload multiple image files at once
   */
  uploadImages: async (files: File[], category?: string): Promise<BulkFileUploadResponse> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const params = category ? { category } : {};

    const response = await apiClient.post<BulkFileUploadResponse>(API_ENDPOINTS.files.uploadImagesBulk, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params,
    });

    // Prepend API base URL to file URLs if they're relative paths
    const data = response.data;
    data.results = data.results.map((result) => {
      if (result.url && result.url.startsWith('/')) {
        return { ...result, url: `${getApiBaseUrl()}${result.url}` };
      }
      return result;
    });

    return data;
  },

  /**
   * Get file information
   */
  getFileInfo: async (fileId: string): Promise<FileInfo> => {
    const response = await apiClient.get<FileInfo>(API_ENDPOINTS.files.byId(fileId));
    const data = response.data;

    // Prepend API base URL to the file URL if it's a relative path
    if (data.url && data.url.startsWith('/')) {
      data.url = `${getApiBaseUrl()}${data.url}`;
    }

    return data;
  },

  /**
   * Delete a file
   */
  deleteFile: async (fileId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.files.byId(fileId));
  },

  /**
   * Get the download URL for a file
   */
  getDownloadUrl: (fileId: string): string => {
    return `${getApiBaseUrl()}${API_ENDPOINTS.files.download(fileId)}`;
  },
};
