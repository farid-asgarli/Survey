import type { AxiosError } from 'axios';
import type { ProblemDetails } from '@/types';

/**
 * Type guard to check if a response is a ProblemDetails response
 */
export function isProblemDetails(data: unknown): data is ProblemDetails {
  return (
    typeof data === 'object' &&
    data !== null &&
    'title' in data &&
    'status' in data &&
    typeof (data as ProblemDetails).title === 'string' &&
    typeof (data as ProblemDetails).status === 'number'
  );
}

/**
 * Extracts a user-friendly error message from an API error response.
 * Handles both ProblemDetails (RFC 7807) and legacy error formats.
 *
 * @param error - The error from an API call (typically AxiosError)
 * @param fallbackMessage - Default message if no specific error can be extracted
 * @returns A user-friendly error message string
 */
export function getErrorMessage(error: unknown, fallbackMessage = 'An unexpected error occurred'): string {
  // Handle Axios errors
  if (isAxiosError(error)) {
    const data = error.response?.data;

    // Handle ProblemDetails format (RFC 7807)
    if (isProblemDetails(data)) {
      // If there's a detail field, use that for user-friendly message
      if (data.detail) {
        return data.detail;
      }
      // Fall back to title
      return data.title;
    }

    // Handle legacy error formats
    if (data && typeof data === 'object') {
      // Legacy format: { error: string }
      if ('error' in data && typeof data.error === 'string') {
        return data.error;
      }
      // Legacy format: { message: string }
      if ('message' in data && typeof data.message === 'string') {
        return data.message;
      }
      // Legacy format: { errors: string[] } (from auth endpoints)
      if ('errors' in data && Array.isArray(data.errors) && data.errors.length > 0) {
        return data.errors[0];
      }
    }

    // Use status text as last resort
    if (error.response?.statusText) {
      return error.response.statusText;
    }

    // Network or other Axios errors
    if (error.message) {
      return error.message;
    }
  }

  // Handle plain Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  return fallbackMessage;
}

/**
 * Extracts validation errors from a ProblemDetails response.
 * Returns a map of field names to error messages.
 *
 * @param error - The error from an API call
 * @returns Record of field names to array of error messages, or null if not a validation error
 */
export function getValidationErrors(error: unknown): Record<string, string[]> | null {
  if (!isAxiosError(error)) {
    return null;
  }

  const data = error.response?.data;

  // Handle ProblemDetails with validation errors
  if (isProblemDetails(data) && data.errors) {
    return data.errors;
  }

  // Handle legacy format: { validationErrors: Record<string, string[]> }
  if (data && typeof data === 'object' && 'validationErrors' in data && typeof data.validationErrors === 'object') {
    return data.validationErrors as Record<string, string[]>;
  }

  return null;
}

/**
 * Extracts all validation error messages as a flat array.
 * Useful for displaying all errors in a single list.
 *
 * @param error - The error from an API call
 * @returns Array of all validation error messages
 */
export function getAllValidationErrorMessages(error: unknown): string[] {
  const validationErrors = getValidationErrors(error);
  if (!validationErrors) {
    return [];
  }

  return Object.values(validationErrors).flat();
}

/**
 * Type guard to check if an error is an AxiosError
 */
function isAxiosError(error: unknown): error is AxiosError {
  return typeof error === 'object' && error !== null && 'isAxiosError' in error && (error as AxiosError).isAxiosError === true;
}

/**
 * Gets the HTTP status code from an error, if available.
 *
 * @param error - The error from an API call
 * @returns The HTTP status code or undefined
 */
export function getErrorStatus(error: unknown): number | undefined {
  if (isAxiosError(error)) {
    return error.response?.status;
  }
  return undefined;
}

/**
 * Checks if the error is a specific HTTP status code.
 *
 * @param error - The error from an API call
 * @param status - The status code to check for
 * @returns True if the error has the specified status code
 */
export function isErrorStatus(error: unknown, status: number): boolean {
  return getErrorStatus(error) === status;
}

/**
 * Checks if the error is a not found (404) error.
 */
export function isNotFoundError(error: unknown): boolean {
  return isErrorStatus(error, 404);
}

/**
 * Checks if the error is an unauthorized (401) error.
 */
export function isUnauthorizedError(error: unknown): boolean {
  return isErrorStatus(error, 401);
}

/**
 * Checks if the error is a forbidden (403) error.
 */
export function isForbiddenError(error: unknown): boolean {
  return isErrorStatus(error, 403);
}

/**
 * Checks if the error is a validation (400) error with validation errors.
 */
export function isValidationError(error: unknown): boolean {
  return isErrorStatus(error, 400) && getValidationErrors(error) !== null;
}
