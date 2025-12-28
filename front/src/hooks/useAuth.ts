import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, getAccessToken, useTokenExpirationWarning, usePreferencesStore } from '@/stores';
import { authApi, usersApi, preferencesApi } from '@/services';
import type { LoginRequest, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest } from '@/types';
import { defaultDashboard, defaultSurveyBuilder } from '@/stores/preferencesStore';

export function useAuth() {
  const navigate = useNavigate();
  const { user, tokens, isAuthenticated, isLoading, login: setAuth, logout: clearAuth, updateUser, setTokens, checkTokenExpiration } = useAuthStore();
  const setPreferences = usePreferencesStore((s) => s.setPreferences);

  const { showWarning: tokenExpiringSoon, expiresIn: tokenExpiresIn } = useTokenExpirationWarning();

  // Helper to sync preferences from server after login
  const syncPreferencesFromServer = useCallback(async () => {
    try {
      const preferences = await preferencesApi.getPreferences();
      // Ensure dashboard and surveyBuilder exist with defaults
      const normalizedPreferences = {
        ...preferences,
        dashboard: preferences.dashboard || defaultDashboard,
        surveyBuilder: preferences.surveyBuilder || defaultSurveyBuilder,
      };
      setPreferences(normalizedPreferences);
    } catch (error) {
      console.warn('Failed to sync preferences from server:', error);
    }
  }, [setPreferences]);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const response = await authApi.login(credentials);
      setAuth(response.user, response.tokens);
      // Sync preferences after successful login
      await syncPreferencesFromServer();
      return response;
    },
    [setAuth, syncPreferencesFromServer]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      const response = await authApi.register(data);
      setAuth(response.user, response.tokens);
      // Sync preferences after successful registration
      await syncPreferencesFromServer();
      return response;
    },
    [setAuth, syncPreferencesFromServer]
  );

  const logout = useCallback(() => {
    clearAuth();
    navigate('/login');
  }, [clearAuth, navigate]);

  const forgotPassword = useCallback(async (data: ForgotPasswordRequest) => {
    await authApi.forgotPassword(data);
  }, []);

  const resetPassword = useCallback(async (data: ResetPasswordRequest) => {
    await authApi.resetPassword(data);
  }, []);

  const refreshToken = useCallback(async () => {
    const currentRefreshToken = tokens?.refreshToken;
    const currentAccessToken = tokens?.accessToken;
    if (!currentRefreshToken || !currentAccessToken) {
      clearAuth();
      return false;
    }

    try {
      const response = await authApi.refreshToken(currentRefreshToken, currentAccessToken);
      setTokens(response.tokens);
      return true;
    } catch {
      // Refresh failed, logout
      clearAuth();
      return false;
    }
  }, [tokens, setTokens, clearAuth]);

  const refreshUser = useCallback(async () => {
    if (!isAuthenticated) return null;

    try {
      const user = await usersApi.getCurrentUser();
      updateUser(user);
      return user;
    } catch {
      // If refresh fails, logout
      clearAuth();
      return null;
    }
  }, [isAuthenticated, updateUser, clearAuth]);

  // Auto-refresh token when it's about to expire
  useEffect(() => {
    if (tokenExpiringSoon && isAuthenticated) {
      console.log('[Auth] Token expiring soon, attempting refresh...');
      refreshToken();
    }
  }, [tokenExpiringSoon, isAuthenticated, refreshToken]);

  return {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    refreshUser,
    refreshToken,
    getAccessToken,
    checkTokenExpiration,
    tokenExpiringSoon,
    tokenExpiresIn,
  };
}
