import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, getAccessToken, useTokenExpirationWarning, usePreferencesStore } from '@/stores';
import { authApi, usersApi, preferencesApi } from '@/services';
import type { LoginRequest, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest, LoginResponse, RegisterResponse, User } from '@/types';
import { defaultDashboard, defaultSurveyBuilder } from '@/stores/preferencesStore';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Authentication state and error types
 */
export interface AuthError {
  message: string;
  code?: string;
  field?: string;
}

export interface AuthState {
  isLoggingIn: boolean;
  isRegistering: boolean;
  isLoggingOut: boolean;
  isRefreshingToken: boolean;
  isRefreshingUser: boolean;
  error: AuthError | null;
}

/**
 * Return type for the useAuth hook
 */
export interface UseAuthReturn {
  // User state
  user: User | null;
  tokens: { accessToken: string; refreshToken: string; expiresAt: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Operation states
  authState: AuthState;

  // Auth actions
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  register: (data: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  forgotPassword: (data: ForgotPasswordRequest) => Promise<void>;
  resetPassword: (data: ResetPasswordRequest) => Promise<void>;

  // User management
  refreshUser: () => Promise<User | null>;

  // Token management
  refreshToken: () => Promise<boolean>;
  getAccessToken: () => string | null;
  checkTokenExpiration: () => { isExpired: boolean; isExpiringSoon: boolean; expiresIn: number };

  // Token status
  tokenExpiringSoon: boolean;
  tokenExpiresIn: number;

  // Error management
  clearError: () => void;
}

/**
 * Custom hook for authentication management.
 *
 * Provides comprehensive auth functionality including:
 * - User login/registration/logout
 * - Password reset flow
 * - Token management and auto-refresh
 * - User data refresh
 * - Loading and error states for all operations
 *
 * @example
 * ```tsx
 * function LoginPage() {
 *   const { login, authState, clearError } = useAuth();
 *
 *   const handleSubmit = async (credentials: LoginRequest) => {
 *     try {
 *       await login(credentials);
 *       // Navigate handled internally
 *     } catch (error) {
 *       // Error is captured in authState.error
 *     }
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {authState.error && <Alert>{authState.error.message}</Alert>}
 *       {authState.isLoggingIn && <Spinner />}
 *       // ... form fields
 *     </form>
 *   );
 * }
 * ```
 *
 * @returns {UseAuthReturn} Authentication state and methods
 */
export function useAuth(): UseAuthReturn {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, tokens, isAuthenticated, isLoading, login: setAuth, logout: clearAuth, updateUser, setTokens, checkTokenExpiration } = useAuthStore();
  const setPreferences = usePreferencesStore((s) => s.setPreferences);
  const clearPreferencesForLogout = usePreferencesStore((s) => s.clearForLogout);
  const storedUserId = usePreferencesStore((s) => s.userId);

  const { showWarning: tokenExpiringSoon, expiresIn: tokenExpiresIn } = useTokenExpirationWarning();

  // Operation-specific loading and error states
  const [authState, setAuthState] = useState<AuthState>({
    isLoggingIn: false,
    isRegistering: false,
    isLoggingOut: false,
    isRefreshingToken: false,
    isRefreshingUser: false,
    error: null,
  });

  // Track mounted state to prevent state updates after unmount
  const isMountedRef = useRef(true);
  // Guard against concurrent token refresh attempts
  const isRefreshingRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Safely update auth state only if component is still mounted
   */
  const safeSetAuthState = useCallback((updates: Partial<AuthState>) => {
    if (isMountedRef.current) {
      setAuthState((prev) => ({ ...prev, ...updates }));
    }
  }, []);

  /**
   * Extract error message from various error types
   */
  const extractError = useCallback((error: unknown): AuthError => {
    if (error instanceof Error) {
      return { message: error.message };
    }
    if (typeof error === 'object' && error !== null) {
      const err = error as Record<string, unknown>;
      if ('response' in err && typeof err.response === 'object' && err.response !== null) {
        const response = err.response as Record<string, unknown>;
        if ('data' in response && typeof response.data === 'object' && response.data !== null) {
          const data = response.data as Record<string, unknown>;
          // Handle ProblemDetails format
          if ('detail' in data && typeof data.detail === 'string') {
            return { message: data.detail, code: data.type as string | undefined };
          }
          if ('title' in data && typeof data.title === 'string') {
            return { message: data.title, code: data.type as string | undefined };
          }
        }
      }
      if ('message' in err && typeof err.message === 'string') {
        return { message: err.message };
      }
    }
    return { message: 'An unexpected error occurred' };
  }, []);

  /**
   * Clear the current error state
   */
  const clearError = useCallback(() => {
    safeSetAuthState({ error: null });
  }, [safeSetAuthState]);

  /**
   * Helper to sync preferences from server after login.
   * Uses AbortSignal for cancellation support.
   * @param userId - The ID of the user whose preferences to sync
   * @param signal - Optional AbortSignal for cancellation
   */
  const syncPreferencesFromServer = useCallback(
    async (userId: string, signal?: AbortSignal) => {
      try {
        // Check if aborted before making request
        if (signal?.aborted) return;

        const preferences = await preferencesApi.getPreferences();

        // Check if aborted after request
        if (signal?.aborted) return;

        // Ensure dashboard and surveyBuilder exist with defaults
        const normalizedPreferences = {
          ...preferences,
          dashboard: preferences.dashboard || defaultDashboard,
          surveyBuilder: preferences.surveyBuilder || defaultSurveyBuilder,
        };
        // Pass userId to associate preferences with the current user
        setPreferences(normalizedPreferences, userId);
      } catch (error) {
        // Only log if not aborted
        if (!signal?.aborted) {
          console.warn('[Auth] Failed to sync preferences from server:', error);
        }
      }
    },
    [setPreferences]
  );

  /**
   * Log in with email and password
   */
  const login = useCallback(
    async (credentials: LoginRequest): Promise<LoginResponse> => {
      const abortController = new AbortController();

      safeSetAuthState({ isLoggingIn: true, error: null });

      try {
        const response = await authApi.login(credentials);

        if (!isMountedRef.current) {
          abortController.abort();
          throw new Error('Component unmounted');
        }

        // If logging in as a different user, clear old preferences first
        if (storedUserId && storedUserId !== response.user.id) {
          clearPreferencesForLogout();
        }

        setAuth(response.user, response.tokens);

        // Sync preferences in background (non-blocking) - pass userId
        syncPreferencesFromServer(response.user.id, abortController.signal);

        safeSetAuthState({ isLoggingIn: false });
        return response;
      } catch (error) {
        const authError = extractError(error);
        safeSetAuthState({ isLoggingIn: false, error: authError });
        throw error;
      }
    },
    [setAuth, syncPreferencesFromServer, safeSetAuthState, extractError, storedUserId, clearPreferencesForLogout]
  );

  /**
   * Register a new user account
   */
  const register = useCallback(
    async (data: RegisterRequest): Promise<RegisterResponse> => {
      const abortController = new AbortController();

      safeSetAuthState({ isRegistering: true, error: null });

      try {
        const response = await authApi.register(data);

        if (!isMountedRef.current) {
          abortController.abort();
          throw new Error('Component unmounted');
        }

        // Clear any old user's preferences before setting new auth
        if (storedUserId && storedUserId !== response.user.id) {
          clearPreferencesForLogout();
        }

        setAuth(response.user, response.tokens);

        // Sync preferences in background (non-blocking) - pass userId
        syncPreferencesFromServer(response.user.id, abortController.signal);

        safeSetAuthState({ isRegistering: false });
        return response;
      } catch (error) {
        const authError = extractError(error);
        safeSetAuthState({ isRegistering: false, error: authError });
        throw error;
      }
    },
    [setAuth, syncPreferencesFromServer, safeSetAuthState, extractError, storedUserId, clearPreferencesForLogout]
  );

  /**
   * Log out the current user and navigate to login page.
   * Revokes the refresh token on the server before clearing local state.
   */
  const logout = useCallback(async () => {
    safeSetAuthState({ isLoggingOut: true, error: null });

    // Revoke token on server (fails silently if server is unavailable)
    await authApi.logout();

    // Clear local auth state
    clearAuth();

    // Clear user preferences to prevent leaking to next user
    clearPreferencesForLogout();

    // Clear all query cache to prevent data leakage between users
    queryClient.clear();

    safeSetAuthState({ isLoggingOut: false });
    navigate('/login');
  }, [clearAuth, clearPreferencesForLogout, queryClient, navigate, safeSetAuthState]);

  /**
   * Request a password reset email
   */
  const forgotPassword = useCallback(
    async (data: ForgotPasswordRequest): Promise<void> => {
      safeSetAuthState({ error: null });
      try {
        await authApi.forgotPassword(data);
      } catch (error) {
        const authError = extractError(error);
        safeSetAuthState({ error: authError });
        throw error;
      }
    },
    [safeSetAuthState, extractError]
  );

  /**
   * Reset password with token from email
   */
  const resetPassword = useCallback(
    async (data: ResetPasswordRequest): Promise<void> => {
      safeSetAuthState({ error: null });
      try {
        await authApi.resetPassword(data);
      } catch (error) {
        const authError = extractError(error);
        safeSetAuthState({ error: authError });
        throw error;
      }
    },
    [safeSetAuthState, extractError]
  );

  /**
   * Refresh the access token using the refresh token.
   * Prevents concurrent refresh attempts.
   */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    // Prevent concurrent refresh attempts
    if (isRefreshingRef.current) {
      console.log('[Auth] Token refresh already in progress, skipping...');
      return false;
    }

    // Get fresh tokens from store to avoid stale closure
    const currentTokens = useAuthStore.getState().tokens;
    const currentRefreshToken = currentTokens?.refreshToken;
    const currentAccessToken = currentTokens?.accessToken;

    if (!currentRefreshToken || !currentAccessToken) {
      clearAuth();
      return false;
    }

    isRefreshingRef.current = true;
    safeSetAuthState({ isRefreshingToken: true, error: null });

    try {
      const response = await authApi.refreshToken(currentRefreshToken, currentAccessToken);

      if (!isMountedRef.current) {
        return false;
      }

      setTokens(response.tokens);
      safeSetAuthState({ isRefreshingToken: false });
      console.log('[Auth] Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('[Auth] Token refresh failed:', error);
      safeSetAuthState({ isRefreshingToken: false });
      // Refresh failed, logout
      clearAuth();
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  }, [setTokens, clearAuth, safeSetAuthState]);

  /**
   * Refresh the current user's data from the server
   */
  const refreshUser = useCallback(async (): Promise<User | null> => {
    if (!isAuthenticated) return null;

    safeSetAuthState({ isRefreshingUser: true, error: null });

    try {
      const userData = await usersApi.getCurrentUser();

      if (!isMountedRef.current) {
        return null;
      }

      updateUser(userData);
      safeSetAuthState({ isRefreshingUser: false });
      return userData;
    } catch (error) {
      console.error('[Auth] User refresh failed:', error);
      safeSetAuthState({ isRefreshingUser: false });
      // If refresh fails, logout
      clearAuth();
      return null;
    }
  }, [isAuthenticated, updateUser, clearAuth, safeSetAuthState]);

  // Auto-refresh token when it's about to expire
  useEffect(() => {
    // Only trigger if authenticated and token is expiring soon
    if (!tokenExpiringSoon || !isAuthenticated) {
      return;
    }

    // Prevent triggering if already refreshing
    if (isRefreshingRef.current) {
      return;
    }

    console.log('[Auth] Token expiring soon, attempting refresh...');
    refreshToken();
  }, [tokenExpiringSoon, isAuthenticated, refreshToken]);

  return {
    // User state
    user,
    tokens,
    isAuthenticated,
    isLoading,

    // Operation states
    authState,

    // Auth actions
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,

    // User management
    refreshUser,

    // Token management
    refreshToken,
    getAccessToken,
    checkTokenExpiration,

    // Token status
    tokenExpiringSoon,
    tokenExpiresIn,

    // Error management
    clearError,
  };
}
