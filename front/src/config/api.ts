// API Configuration for Survey App backend

export interface ApiConfig {
  baseUrl: string;
  environment: 'dev' | 'prod';
}

// Determine if we're in production (served from the same origin as the API)
const isProduction = import.meta.env.PROD;

// In production, use relative URLs (same origin); in development, use configured URL
const getDefaultBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // In production, use empty string for same-origin requests
  if (isProduction) {
    return '';
  }
  // In development, default to localhost:5000
  return 'http://localhost:5000';
};

// Default configuration - can be overridden via environment variables
const config: ApiConfig = {
  baseUrl: getDefaultBaseUrl(),
  environment: (import.meta.env.VITE_ENVIRONMENT as 'dev' | 'prod') || (isProduction ? 'prod' : 'dev'),
};

export function getApiConfig(): ApiConfig {
  return config;
}

export function getApiBaseUrl(): string {
  return config.baseUrl;
}

export function setApiBaseUrl(url: string): void {
  config.baseUrl = url;
}

export function setEnvironment(env: 'dev' | 'prod'): void {
  config.environment = env;
}

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    refresh: '/api/auth/refresh',
    logout: '/api/auth/logout',
    forgotPassword: '/api/auth/forgot-password',
    resetPassword: '/api/auth/reset-password',
  },
  // Public survey endpoints (no auth required)
  publicSurvey: {
    get: (shareToken: string) => `/api/surveys/public/${shareToken}`,
    submit: '/api/responses',
  },
  // User endpoints
  users: {
    me: '/api/users/me',
    settings: '/api/users/settings',
    changePassword: '/api/users/me/password',
    avatar: '/api/users/me/avatar',
  },
  // Namespace endpoints
  namespaces: {
    list: '/api/namespaces',
    byId: (id: string) => `/api/namespaces/${id}`,
    bySlug: (slug: string) => `/api/namespaces/by-slug/${slug}`,
    members: (id: string) => `/api/namespaces/${id}/members`,
    removeMember: (namespaceId: string, membershipId: string) => `/api/namespaces/${namespaceId}/members/${membershipId}`,
    updateMemberRole: (namespaceId: string, membershipId: string) => `/api/namespaces/${namespaceId}/members/${membershipId}`,
  },
  // Survey endpoints
  surveys: {
    list: '/api/surveys',
    byId: (id: string) => `/api/surveys/${id}`,
    publish: (id: string) => `/api/surveys/${id}/publish`,
    close: (id: string) => `/api/surveys/${id}/close`,
    duplicate: (id: string) => `/api/surveys/${id}/duplicate`,
    questions: (surveyId: string) => `/api/surveys/${surveyId}/questions`,
    questionsSync: (surveyId: string) => `/api/surveys/${surveyId}/questions/sync`,
    questionById: (surveyId: string, questionId: string) => `/api/surveys/${surveyId}/questions/${questionId}`,
    questionLogic: (surveyId: string, questionId: string) => `/api/surveys/${surveyId}/questions/${questionId}/logic`,
    questionLogicReorder: (surveyId: string, questionId: string) => `/api/surveys/${surveyId}/questions/${questionId}/logic/reorder`,
    logicMap: (surveyId: string) => `/api/surveys/${surveyId}/logic-map`,
    evaluateLogic: (surveyId: string) => `/api/surveys/${surveyId}/evaluate-logic`,
    links: (surveyId: string) => `/api/surveys/${surveyId}/links`,
    linkById: (surveyId: string, linkId: string) => `/api/surveys/${surveyId}/links/${linkId}`,
    linkAnalytics: (surveyId: string, linkId: string) => `/api/surveys/${surveyId}/links/${linkId}/analytics`,
    linksBulk: (surveyId: string) => `/api/surveys/${surveyId}/links/bulk`,
    distributions: (surveyId: string) => `/api/surveys/${surveyId}/distributions`,
    distributionById: (surveyId: string, distId: string) => `/api/surveys/${surveyId}/distributions/${distId}`,
    distributionRecipients: (surveyId: string, distId: string) => `/api/surveys/${surveyId}/distributions/${distId}/recipients`,
  },
  // Response endpoints (backend uses /api/responses with surveyId as query param)
  responses: {
    list: '/api/responses',
    byId: (responseId: string) => `/api/responses/${responseId}`,
    submit: '/api/responses',
    // Export endpoints are under surveys controller
    export: (surveyId: string) => `/api/surveys/${surveyId}/export`,
    exportPreview: (surveyId: string) => `/api/surveys/${surveyId}/export/preview`,
  },
  // Template endpoints
  templates: {
    list: '/api/templates',
    byId: (id: string) => `/api/templates/${id}`,
    fromSurvey: '/api/templates/from-survey',
    createSurvey: (id: string) => `/api/templates/${id}/create-survey`,
  },
  // Theme endpoints
  themes: {
    list: '/api/themes',
    public: '/api/themes/public',
    byId: (id: string) => `/api/themes/${id}`,
    preview: (id: string) => `/api/themes/${id}/preview`,
    css: (id: string) => `/api/themes/${id}/css`,
    duplicate: (id: string) => `/api/themes/${id}/duplicate`,
    setDefault: (id: string) => `/api/themes/${id}/set-default`,
    applyToSurvey: (surveyId: string) => `/api/surveys/${surveyId}/theme`,
  },
  // Email template endpoints
  emailTemplates: {
    list: '/api/email-templates',
    byId: (id: string) => `/api/email-templates/${id}`,
    placeholders: '/api/email-templates/placeholders',
    duplicate: (id: string) => `/api/email-templates/${id}/duplicate`,
  },
  // Analytics endpoints
  analytics: {
    survey: (surveyId: string) => `/api/surveys/${surveyId}/analytics`,
    nps: (surveyId: string) => `/api/surveys/${surveyId}/nps`,
    npsTrend: (surveyId: string) => `/api/surveys/${surveyId}/nps/trend`,
    questionNps: (surveyId: string, questionId: string) => `/api/surveys/${surveyId}/questions/${questionId}/nps`,
    export: (surveyId: string) => `/api/surveys/${surveyId}/analytics/export`,
  },
  // File upload endpoints
  files: {
    uploadImage: '/api/files/images',
    uploadImagesBulk: '/api/files/images/bulk',
    byId: (fileId: string) => `/api/files/${fileId}`,
    download: (fileId: string) => `/api/files/${fileId}/download`,
  },
  // Recurring surveys endpoints
  recurringSurveys: {
    list: '/api/recurring-surveys',
    upcoming: '/api/recurring-surveys/upcoming',
    byId: (id: string) => `/api/recurring-surveys/${id}`,
    pause: (id: string) => `/api/recurring-surveys/${id}/pause`,
    resume: (id: string) => `/api/recurring-surveys/${id}/resume`,
    trigger: (id: string) => `/api/recurring-surveys/${id}/trigger`,
    runs: (id: string) => `/api/recurring-surveys/${id}/runs`,
  },
  // Translation management endpoints
  translations: {
    survey: (surveyId: string) => `/api/surveys/${surveyId}/translations`,
    surveyByLang: (surveyId: string, languageCode: string) => `/api/surveys/${surveyId}/translations/${languageCode}`,
  },
} as const;
