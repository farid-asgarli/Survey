// API Service for Survey App backend communication

import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { getApiBaseUrl, API_ENDPOINTS } from '@/config/api';
import { getAccessToken, useAuthStore, getActiveNamespaceId } from '@/stores';
import { toast } from '@/components/ui';
import { getErrorMessage, isProblemDetails } from '@/utils';
import { getCurrentLanguage } from '@/i18n';
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UploadAvatarResponse,
  MessageResponse,
  UserProfile,
  CreateNamespaceRequest,
  InviteMemberRequest,
  InviteMemberResponse,
  CreateSurveyRequest,
  UpdateSurveyRequest,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  BatchSyncQuestionsRequest,
  BatchSyncQuestionsResult,
  CreateLogicRequest,
  UpdateLogicRequest,
  EvaluateLogicRequest,
  EvaluateLogicResponse,
  CreateLinkRequest,
  UpdateLinkRequest,
  CreateDistributionRequest,
  CreateEmailTemplateRequest,
  UpdateEmailTemplateRequest,
  LoginResponse,
  RegisterResponse,
  RefreshTokenResponse,
  MembersPaginatedResponse,
  SurveysResponse,
  SurveyListParams,
  LogicMapResponse,
  LinkAnalyticsResponse,
  BulkLinkGenerationRequest,
  BulkLinkGenerationResponse,
  DistributionsResponse,
  DistributionStatsResponse,
  DistributionRecipientsResponse,
  SurveyTemplatesResponse,
  SurveyAnalytics,
  SurveyNpsSummary,
  NpsTrend,
  NpsTrendParams,
  NpsScore,
  User,
  Namespace,
  NamespaceMembership,
  Survey,
  Question,
  QuestionLogic,
  SurveyLink,
  EmailDistribution,
  EmailTemplate,
  SurveyTheme,
  SurveyThemeSummary,
  SurveyTemplate,
  ExportFormat,
  RecipientStatus,
  UpdateMemberRoleRequest,
  UpdateMemberRoleResponse,
  PaginationParams,
  SurveyLinksResponse,
  LinkByTokenResult,
  LinkAccessRequest,
  RecordLinkClickResult,
  AzureAdConfig,
  AzureAdLoginRequest,
  AzureAdLinkRequest,
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
            const response = await axios.post<{ token: string; refreshToken: string; expiresAt: string }>(`${getApiBaseUrl()}${API_ENDPOINTS.auth.refresh}`, {
              token: tokens.accessToken,
              refreshToken: tokens.refreshToken,
            });

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

/**
 * Raw API response types (as returned by backend).
 * Backend now returns complete user data.
 */
interface RawAuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    emailConfirmed: boolean;
    avatarUrl: string | null;
    profilePictureUrl: string | null;
    lastLoginAt: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string | null;
  };
}

/**
 * Transform raw auth response to expected format.
 * Backend now returns complete user data, so minimal transformation is needed.
 */
const transformAuthResponse = (raw: RawAuthResponse): LoginResponse => ({
  user: {
    id: raw.user.id,
    email: raw.user.email,
    firstName: raw.user.firstName,
    lastName: raw.user.lastName,
    fullName: raw.user.fullName,
    emailConfirmed: raw.user.emailConfirmed,
    avatarUrl: raw.user.avatarUrl ?? undefined,
    profilePictureUrl: raw.user.profilePictureUrl ?? undefined,
    lastLoginAt: raw.user.lastLoginAt ?? undefined,
    isActive: raw.user.isActive,
    createdAt: raw.user.createdAt,
    updatedAt: raw.user.updatedAt ?? undefined,
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

  /**
   * Logout and revoke the refresh token on the server.
   * This should be called before clearing local auth state.
   * Fails silently if the request fails (user will still be logged out locally).
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post(
        API_ENDPOINTS.auth.logout,
        {},
        {
          headers: {
            'X-Suppress-Toast': 'true', // Don't show success toast for logout
          },
        }
      );
    } catch {
      // Fail silently - user will still be logged out locally
      console.warn('[Auth] Failed to revoke token on server');
    }
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.auth.forgotPassword, data);
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.auth.resetPassword, data);
  },

  // Azure AD SSO methods

  /**
   * Get Azure AD configuration for MSAL initialization.
   * Returns whether SSO is enabled and necessary config values.
   */
  getAzureAdConfig: async (): Promise<AzureAdConfig> => {
    try {
      const response = await apiClient.get<AzureAdConfig>(API_ENDPOINTS.auth.azureAdConfig, {
        headers: {
          'X-Suppress-Toast': 'true',
        },
      });
      return response.data;
    } catch {
      // Return disabled config if endpoint fails
      return { enabled: false };
    }
  },

  /**
   * Authenticate with Azure AD ID token.
   * Creates or links user account automatically.
   */
  azureAdLogin: async (data: AzureAdLoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<RawAuthResponse>(API_ENDPOINTS.auth.azureAdLogin, data, {
      headers: {
        'X-Suppress-Toast': 'true',
      },
    });
    return transformAuthResponse(response.data);
  },

  /**
   * Link Azure AD account to current authenticated user.
   * Enables SSO for users who registered with email/password.
   */
  linkAzureAd: async (data: AzureAdLinkRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<RawAuthResponse>(API_ENDPOINTS.auth.azureAdLink, data);
    return transformAuthResponse(response.data);
  },

  /**
   * Unlink Azure AD account from current user.
   * Requires user to have a password set.
   */
  unlinkAzureAd: async (): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.auth.azureAdUnlink);
  },
};

// ============ Users API ============
export const usersApi = {
  getCurrentUser: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>(API_ENDPOINTS.users.me);
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await apiClient.put<User>(API_ENDPOINTS.users.me, data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>(API_ENDPOINTS.users.changePassword, data);
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<UploadAvatarResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<UploadAvatarResponse>(API_ENDPOINTS.users.avatar, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteAvatar: async (): Promise<MessageResponse> => {
    const response = await apiClient.delete<MessageResponse>(API_ENDPOINTS.users.avatar);
    return response.data;
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
    const response = await apiClient.get<Namespace>(API_ENDPOINTS.namespaces.byId(id));
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Namespace> => {
    const response = await apiClient.get<Namespace>(API_ENDPOINTS.namespaces.bySlug(slug));
    return response.data;
  },

  create: async (data: CreateNamespaceRequest): Promise<Namespace> => {
    const response = await apiClient.post<Namespace>(API_ENDPOINTS.namespaces.list, data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateNamespaceRequest>): Promise<Namespace> => {
    const response = await apiClient.put<Namespace>(API_ENDPOINTS.namespaces.byId(id), data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.namespaces.byId(id));
  },

  /** Get paginated members for a namespace */
  getMembers: async (id: string, params?: PaginationParams): Promise<MembersPaginatedResponse> => {
    const response = await apiClient.get<MembersPaginatedResponse>(API_ENDPOINTS.namespaces.members(id), { params });
    return response.data;
  },

  /** Get all members for a namespace (non-paginated, fetches all) */
  getAllMembers: async (id: string): Promise<NamespaceMembership[]> => {
    const response = await apiClient.get<MembersPaginatedResponse>(API_ENDPOINTS.namespaces.members(id), {
      params: { pageSize: 1000 },
    });
    return response.data.items;
  },

  inviteMember: async (id: string, data: InviteMemberRequest): Promise<InviteMemberResponse> => {
    const response = await apiClient.post<InviteMemberResponse>(API_ENDPOINTS.namespaces.members(id), data);
    return response.data;
  },

  removeMember: async (namespaceId: string, membershipId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.namespaces.removeMember(namespaceId, membershipId));
  },

  updateMemberRole: async (namespaceId: string, membershipId: string, role: UpdateMemberRoleRequest['role']): Promise<UpdateMemberRoleResponse> => {
    const response = await apiClient.put<UpdateMemberRoleResponse>(API_ENDPOINTS.namespaces.updateMemberRole(namespaceId, membershipId), { role });
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
   * Uses PUT for idempotent add/update operation
   */
  add: async (surveyId: string, data: SurveyTranslationDto): Promise<SurveyTranslationDto> => {
    const response = await apiClient.put<SurveyTranslationDto>(API_ENDPOINTS.translations.surveyByLang(surveyId, data.languageCode), data);
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
const transformCreateLogicRequest = (data: CreateLogicRequest): Record<string, unknown> => ({
  sourceQuestionId: data.sourceQuestionId,
  operator: data.operator,
  conditionValue: data.conditionValue ?? '',
  action: data.action,
  targetQuestionId: data.targetQuestionId,
  priority: data.priority,
});

// Transform frontend UpdateLogicRequest to backend format
const transformUpdateLogicRequest = (data: UpdateLogicRequest): Record<string, unknown> => ({
  sourceQuestionId: data.sourceQuestionId,
  operator: data.operator,
  conditionValue: data.conditionValue ?? '',
  action: data.action,
  targetQuestionId: data.targetQuestionId,
  priority: data.priority,
});

export const logicApi = {
  list: async (surveyId: string, questionId: string): Promise<QuestionLogic[]> => {
    const response = await apiClient.get<QuestionLogic[]>(API_ENDPOINTS.surveys.questionLogic(surveyId, questionId));
    return response.data;
  },

  create: async (surveyId: string, questionId: string, data: CreateLogicRequest): Promise<QuestionLogic> => {
    const response = await apiClient.post<QuestionLogic>(API_ENDPOINTS.surveys.questionLogic(surveyId, questionId), transformCreateLogicRequest(data));
    return response.data;
  },

  update: async (surveyId: string, questionId: string, logicId: string, data: UpdateLogicRequest): Promise<QuestionLogic> => {
    const response = await apiClient.put<QuestionLogic>(
      `${API_ENDPOINTS.surveys.questionLogic(surveyId, questionId)}/${logicId}`,
      transformUpdateLogicRequest(data)
    );
    return response.data;
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
   * Evaluate logic on the server for validation, preview, or analytics.
   * @param surveyId - Survey ID
   * @param request - Evaluation request with answers and optional current question
   */
  evaluateLogic: async (surveyId: string, request: EvaluateLogicRequest): Promise<EvaluateLogicResponse> => {
    const response = await apiClient.post<EvaluateLogicResponse>(API_ENDPOINTS.surveys.evaluateLogic(surveyId), request);
    return response.data;
  },
};

// ============ Survey Links API ============

export const linksApi = {
  /**
   * Get all links for a survey with pagination.
   * Backend returns PagedResponse<SurveyLinkDto>
   */
  list: async (surveyId: string, params?: { pageNumber?: number; pageSize?: number; isActive?: boolean }): Promise<SurveyLinksResponse> => {
    const response = await apiClient.get<SurveyLinksResponse>(API_ENDPOINTS.surveys.links(surveyId), { params });
    return response.data;
  },

  /**
   * Get a survey link by ID.
   * Backend returns SurveyLinkDetailsDto which extends SurveyLinkDto
   */
  getById: async (surveyId: string, linkId: string): Promise<SurveyLink> => {
    const response = await apiClient.get<SurveyLink>(API_ENDPOINTS.surveys.linkById(surveyId, linkId));
    return response.data;
  },

  /**
   * Create a new survey link.
   * Backend accepts CreateSurveyLinkCommand, returns SurveyLinkDto
   */
  create: async (surveyId: string, data: CreateLinkRequest): Promise<SurveyLink> => {
    const response = await apiClient.post<SurveyLink>(API_ENDPOINTS.surveys.links(surveyId), data);
    return response.data;
  },

  /**
   * Update a survey link.
   * Backend accepts UpdateSurveyLinkCommand, returns SurveyLinkDto
   */
  update: async (surveyId: string, linkId: string, data: UpdateLinkRequest): Promise<SurveyLink> => {
    const response = await apiClient.put<SurveyLink>(API_ENDPOINTS.surveys.linkById(surveyId, linkId), data);
    return response.data;
  },

  /**
   * Deactivate a survey link.
   * Backend returns 204 No Content
   */
  deactivate: async (surveyId: string, linkId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.surveys.linkById(surveyId, linkId));
  },

  /**
   * Get analytics for a survey link.
   * Backend returns LinkAnalyticsDto
   */
  getAnalytics: async (surveyId: string, linkId: string, startDate?: string, endDate?: string): Promise<LinkAnalyticsResponse> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString();
    const url = `${API_ENDPOINTS.surveys.linkAnalytics(surveyId, linkId)}${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get<LinkAnalyticsResponse>(url);
    return response.data;
  },

  /**
   * Generate multiple unique links at once.
   * Backend accepts GenerateBulkLinksCommand, returns BulkLinkGenerationResultDto
   */
  generateBulkLinks: async (surveyId: string, data: BulkLinkGenerationRequest): Promise<BulkLinkGenerationResponse> => {
    const response = await apiClient.post<BulkLinkGenerationResponse>(API_ENDPOINTS.surveys.linksBulk(surveyId), data);
    return response.data;
  },
};

// ============ Short Links API (Public Survey Access) ============

export const shortLinksApi = {
  /**
   * Get link information by token (for pre-validation before accessing survey).
   * This is an anonymous endpoint - no auth required.
   * Backend returns LinkByTokenResult
   */
  getByToken: async (token: string): Promise<LinkByTokenResult> => {
    const response = await apiClient.get<LinkByTokenResult>(API_ENDPOINTS.shortLinks.byToken(token));
    return response.data;
  },

  /**
   * Access a survey via short link (records click and provides survey access token).
   * This is an anonymous endpoint - no auth required.
   * Backend accepts LinkAccessRequest (optional password), returns RecordLinkClickResult
   */
  access: async (token: string, request?: LinkAccessRequest): Promise<RecordLinkClickResult> => {
    const response = await apiClient.post<RecordLinkClickResult>(API_ENDPOINTS.shortLinks.access(token), request ?? {});
    return response.data;
  },
};

// ============ Distributions API ============
export const distributionsApi = {
  list: async (surveyId: string, params?: { pageNumber?: number; pageSize?: number }): Promise<DistributionsResponse> => {
    // Backend returns PagedResponse<EmailDistributionSummaryDto>
    const response = await apiClient.get<DistributionsResponse>(API_ENDPOINTS.surveys.distributions(surveyId), { params });
    return response.data;
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
  ): Promise<DistributionRecipientsResponse> => {
    // Backend returns PagedResponse<EmailRecipientDto>
    const response = await apiClient.get<DistributionRecipientsResponse>(`${API_ENDPOINTS.surveys.distributionById(surveyId, distId)}/recipients`, { params });
    return response.data;
  },
};

// ============ Themes API ============

import type { ThemeColors, ThemeTypography, ThemeLayoutDto, ThemeBranding, ThemeButton } from '@/types';

// ThemePreviewResponse matching backend ThemePreviewDto
export interface ThemePreviewResponse {
  theme: SurveyTheme;
  generatedCss: string;
}

// Paginated response for theme summaries (list view)
export interface ThemesListResponse {
  items: SurveyThemeSummary[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// CreateThemeRequest matching backend CreateThemeCommand
export interface CreateThemeRequest {
  name: string;
  description?: string;
  isPublic?: boolean;
  /** Language code for the initial translation */
  languageCode?: string;
  colors?: Partial<ThemeColors>;
  typography?: Partial<ThemeTypography>;
  layout?: Partial<ThemeLayoutDto>;
  branding?: Partial<ThemeBranding>;
  button?: Partial<ThemeButton>;
  customCss?: string;
}

// UpdateThemeRequest matching backend UpdateThemeCommand
// All nested objects are required when updating
export interface UpdateThemeRequest {
  name: string;
  description?: string;
  isPublic: boolean;
  /** Language code for the translation to update */
  languageCode?: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  layout: ThemeLayoutDto;
  branding: ThemeBranding;
  button: ThemeButton;
  customCss?: string;
}

// DuplicateThemeRequest matching backend DuplicateThemeCommand
export interface DuplicateThemeRequest {
  newName?: string;
  languageCode?: string;
}

export const themesApi = {
  list: async (params?: { pageNumber?: number; pageSize?: number; searchTerm?: string }): Promise<ThemesListResponse> => {
    const response = await apiClient.get<ThemesListResponse>(API_ENDPOINTS.themes.list, { params });
    return response.data;
  },

  listPublic: async (params?: { pageNumber?: number; pageSize?: number; searchTerm?: string }): Promise<ThemesListResponse> => {
    const response = await apiClient.get<ThemesListResponse>(API_ENDPOINTS.themes.public, { params });
    return response.data;
  },

  getById: async (id: string): Promise<SurveyTheme> => {
    const response = await apiClient.get<SurveyTheme>(API_ENDPOINTS.themes.byId(id));
    return response.data;
  },

  getPreview: async (id: string): Promise<ThemePreviewResponse> => {
    const response = await apiClient.get<ThemePreviewResponse>(API_ENDPOINTS.themes.preview(id));
    return response.data;
  },

  /**
   * Get generated CSS for a theme.
   * Backend returns raw CSS text with content-type: text/css
   */
  getCss: async (id: string): Promise<string> => {
    const response = await apiClient.get<string>(API_ENDPOINTS.themes.css(id), {
      responseType: 'text',
      headers: { Accept: 'text/css' },
    });
    return response.data;
  },

  create: async (data: CreateThemeRequest): Promise<SurveyTheme> => {
    const response = await apiClient.post<SurveyTheme>(API_ENDPOINTS.themes.list, data);
    return response.data;
  },

  /**
   * Update a theme.
   * Backend requires themeId in the request body.
   */
  update: async (id: string, data: UpdateThemeRequest): Promise<SurveyTheme> => {
    const response = await apiClient.put<SurveyTheme>(API_ENDPOINTS.themes.byId(id), {
      ...data,
      themeId: id,
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.themes.byId(id));
  },

  duplicate: async (id: string, request?: DuplicateThemeRequest): Promise<SurveyTheme> => {
    const response = await apiClient.post<SurveyTheme>(API_ENDPOINTS.themes.duplicate(id), request);
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
import type { CreateTemplateRequest, CreateTemplateFromSurveyRequest, UpdateTemplateRequest, CreateSurveyFromTemplateRequest } from '@/types';

export const templatesApi = {
  /**
   * List templates with pagination and filtering.
   * Backend: GET /api/templates with query params from GetTemplatesQuery
   * Returns PagedResponse<SurveyTemplateSummaryDto> (summary without questions array)
   */
  list: async (params?: {
    category?: string;
    searchTerm?: string;
    isPublic?: boolean;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<SurveyTemplatesResponse> => {
    const response = await apiClient.get<SurveyTemplatesResponse>(API_ENDPOINTS.templates.list, {
      params: {
        ...params,
        pageSize: params?.pageSize ?? 50,
      },
    });
    return response.data;
  },

  /**
   * Get a single template by ID with full details including questions.
   * Backend: GET /api/templates/{id} returns SurveyTemplateDto (full details)
   */
  getById: async (id: string): Promise<SurveyTemplate> => {
    const response = await apiClient.get<SurveyTemplate>(API_ENDPOINTS.templates.byId(id));
    return response.data;
  },

  /**
   * Create a new template.
   * Backend: POST /api/templates with CreateTemplateCommand
   * Returns SurveyTemplateDto
   */
  create: async (data: CreateTemplateRequest): Promise<SurveyTemplate> => {
    const response = await apiClient.post<SurveyTemplate>(API_ENDPOINTS.templates.list, data);
    return response.data;
  },

  /**
   * Create a template from an existing survey.
   * Backend: POST /api/templates/from-survey with CreateTemplateFromSurveyCommand
   * Returns SurveyTemplateDto
   */
  createFromSurvey: async (data: CreateTemplateFromSurveyRequest): Promise<SurveyTemplate> => {
    const response = await apiClient.post<SurveyTemplate>(API_ENDPOINTS.templates.fromSurvey, data);
    return response.data;
  },

  /**
   * Update an existing template.
   * Backend: PUT /api/templates/{id} with UpdateTemplateCommand
   * Returns SurveyTemplateDto
   */
  update: async (id: string, data: UpdateTemplateRequest): Promise<SurveyTemplate> => {
    const response = await apiClient.put<SurveyTemplate>(API_ENDPOINTS.templates.byId(id), {
      templateId: id,
      ...data,
    });
    return response.data;
  },

  /**
   * Delete a template.
   * Backend: DELETE /api/templates/{id}
   * Returns 204 No Content
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.templates.byId(id));
  },

  /**
   * Create a survey from a template.
   * Backend: POST /api/templates/{id}/create-survey with CreateSurveyFromTemplateCommand
   * Returns SurveyDto
   */
  createSurveyFromTemplate: async (templateId: string, data: CreateSurveyFromTemplateRequest): Promise<Survey> => {
    const response = await apiClient.post<Survey>(API_ENDPOINTS.templates.createSurvey(templateId), {
      templateId,
      ...data,
    });
    return response.data;
  },
};

// ============ Responses API ============
import type { ResponsesListParams, SurveyResponsesResponse, ExportResponsesRequest, ExportPreviewResponse, BulkDeleteResponsesResult } from '@/types';
import type { SurveyResponse } from '@/types/models';

export const responsesApi = {
  /**
   * List responses for a survey (paginated)
   * Backend: GET /api/responses?surveyId=...
   * Returns ResponseListItem[] (summary without answers)
   */
  list: async (surveyId: string, params?: ResponsesListParams): Promise<SurveyResponsesResponse> => {
    const response = await apiClient.get<SurveyResponsesResponse>(API_ENDPOINTS.responses.list, {
      params: { ...params, surveyId },
    });
    return response.data;
  },

  /**
   * Get a single response by ID (full detail with answers)
   * Backend: GET /api/responses/{responseId}
   */
  getById: async (_surveyId: string, responseId: string): Promise<SurveyResponse> => {
    const response = await apiClient.get<SurveyResponse>(API_ENDPOINTS.responses.byId(responseId));
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
   * Backend: POST /api/responses/bulk-delete
   * Returns BulkDeleteResponsesResult with deletedCount, failedIds, isComplete
   */
  deleteBulk: async (surveyId: string, responseIds: string[]): Promise<BulkDeleteResponsesResult> => {
    const response = await apiClient.post<BulkDeleteResponsesResult>(`/api/responses/bulk-delete`, {
      surveyId,
      responseIds,
    });
    return response.data;
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
import type { PublicSurvey, StartResponseRequest, StartResponseResult, SubmitResponseRequest, SubmitResponseResult } from '@/types/public-survey';

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
   * Start a survey response (creates a draft)
   * Call this when a respondent begins taking a survey.
   * Returns a responseId to use when submitting.
   */
  startResponse: async (data: StartResponseRequest): Promise<StartResponseResult> => {
    const response = await axios.post<StartResponseResult>(`${getApiBaseUrl()}${API_ENDPOINTS.publicSurvey.start}`, data);
    return response.data;
  },

  /**
   * Submit/complete a survey response
   * Can use responseId (new flow) or surveyId (legacy flow)
   */
  submitResponse: async (data: SubmitResponseRequest): Promise<SubmitResponseResult> => {
    const response = await axios.post<SubmitResponseResult>(`${getApiBaseUrl()}${API_ENDPOINTS.publicSurvey.submit}`, data);
    return response.data;
  },

  /**
   * Submit/complete a survey response by ID
   * Alternative endpoint for the new flow
   */
  submitResponseById: async (
    responseId: string,
    data: { answers: SubmitResponseRequest['answers']; metadata?: SubmitResponseRequest['metadata'] }
  ): Promise<SubmitResponseResult> => {
    const response = await axios.post<SubmitResponseResult>(`${getApiBaseUrl()}${API_ENDPOINTS.publicSurvey.submitById(responseId)}`, data);
    return response.data;
  },
};

// ============ Email Templates API ============
import type { EmailTemplatesResponse, EmailTemplateListParams, DuplicateEmailTemplateRequest } from '@/types/api';

export const emailTemplatesApi = {
  /**
   * List all email templates for the namespace
   * Backend returns: PagedResponse<EmailTemplateSummary>
   */
  list: async (params?: EmailTemplateListParams): Promise<EmailTemplatesResponse> => {
    const response = await apiClient.get<EmailTemplatesResponse>(API_ENDPOINTS.emailTemplates.list, {
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
  duplicate: async (id: string, request?: DuplicateEmailTemplateRequest): Promise<EmailTemplate> => {
    const response = await apiClient.post<EmailTemplate>(API_ENDPOINTS.emailTemplates.duplicate(id), request ?? {});
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
  update: async (id: string, data: Omit<UpdateRecurringSurveyRequest, 'id'>): Promise<RecurringSurvey> => {
    // Backend requires id in body as well as URL
    const response = await apiClient.put<RecurringSurvey>(API_ENDPOINTS.recurringSurveys.byId(id), { ...data, id });
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

  /**
   * Get a specific run by ID
   */
  getRunById: async (id: string, runId: string): Promise<RecurringRun> => {
    const response = await apiClient.get<RecurringRun>(API_ENDPOINTS.recurringSurveys.runById(id, runId));
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
