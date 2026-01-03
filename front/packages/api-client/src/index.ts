// @survey/api-client - Shared API utilities for the survey platform
// This package contains API client utilities for public survey

import type { PublicSurvey, StartResponseRequest, StartResponseResult, SubmitResponseRequest, SubmitResponseResult } from '@survey/types';

// ============ API Configuration ============

export interface ApiClientConfig {
  baseUrl: string;
  getLanguage?: () => string;
  onError?: (error: ApiError) => void;
}

export interface ApiError {
  status: number;
  message: string;
  details?: Record<string, unknown>;
}

// ============ Fetch Utilities ============

/**
 * Creates headers for API requests
 */
export function createHeaders(language?: string, additionalHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (language) {
    headers['Accept-Language'] = language;
  }

  return { ...headers, ...additionalHeaders };
}

/**
 * Handles API response errors
 */
export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    let details: Record<string, unknown> | undefined;

    try {
      const errorData = await response.json();
      // Handle ProblemDetails format from .NET
      if (errorData.title) {
        errorMessage = errorData.title;
        details = errorData.errors || errorData;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      errorMessage = response.statusText || errorMessage;
    }

    const error: ApiError = {
      status: response.status,
      message: errorMessage,
      details,
    };

    throw error;
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// ============ Public Survey API ============

/**
 * Fetches a public survey by share token
 */
export async function fetchPublicSurvey(baseUrl: string, shareToken: string, language?: string): Promise<PublicSurvey> {
  const response = await fetch(`${baseUrl}/api/surveys/public/${shareToken}`, {
    method: 'GET',
    headers: createHeaders(language),
  });

  return handleResponse<PublicSurvey>(response);
}

/**
 * Starts a new survey response (creates draft)
 */
export async function startSurveyResponse(baseUrl: string, request: StartResponseRequest, language?: string): Promise<StartResponseResult> {
  const response = await fetch(`${baseUrl}/api/responses/start`, {
    method: 'POST',
    headers: createHeaders(language),
    body: JSON.stringify(request),
  });

  return handleResponse<StartResponseResult>(response);
}

/**
 * Submits a completed survey response
 */
export async function submitSurveyResponse(baseUrl: string, request: SubmitResponseRequest, language?: string): Promise<SubmitResponseResult> {
  const response = await fetch(`${baseUrl}/api/responses`, {
    method: 'POST',
    headers: createHeaders(language),
    body: JSON.stringify(request),
  });

  return handleResponse<SubmitResponseResult>(response);
}

// ============ Server-side API (for Next.js SSR) ============

// Next.js extends RequestInit with additional options
interface NextFetchRequestConfig {
  revalidate?: number | false;
  tags?: string[];
}

interface NextRequestInit extends RequestInit {
  next?: NextFetchRequestConfig;
}

/**
 * Server-side fetch for public survey (with caching hints)
 * Designed for use in Next.js server components
 */
export async function fetchPublicSurveySSR(
  baseUrl: string,
  shareToken: string,
  language?: string,
  options?: {
    cache?: RequestCache;
    revalidate?: number;
  }
): Promise<PublicSurvey> {
  const fetchOptions: NextRequestInit = {
    method: 'GET',
    headers: createHeaders(language),
  };

  // Next.js caching options
  if (options?.cache) {
    fetchOptions.cache = options.cache;
  }

  if (options?.revalidate !== undefined) {
    fetchOptions.next = { revalidate: options.revalidate };
  }

  const response = await fetch(`${baseUrl}/api/surveys/public/${shareToken}`, fetchOptions as RequestInit);

  return handleResponse<PublicSurvey>(response);
}

// ============ Type Re-exports ============

export type {
  PublicSurvey,
  PublicQuestion,
  PublicSurveyTheme,
  PublicSurveySettings,
  StartResponseRequest,
  StartResponseResult,
  SubmitAnswerRequest,
  SubmitResponseRequest,
  SubmitResponseResult,
  AnswerValue,
  QuestionAnswer,
  PublicSurveyViewMode,
  PublicSurveyState,
  ValidationResult,
} from '@survey/types';
