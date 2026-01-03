import { useState, useCallback, useEffect } from 'react';
import type { AccountInfo, AuthenticationResult } from '@azure/msal-browser';
import { InteractionStatus } from '@azure/msal-browser';
import { useMsal, useIsAuthenticated as useMsalAuthenticated } from '@azure/msal-react';
import { getAzureAdConfig, loginRequest, isAzureAdEnabled } from '@/config/msalConfig';
import { authApi } from '@/services';
import { useAuthStore } from '@/stores';
import { toast } from '@/components/ui';
import { getErrorMessage } from '@/utils';
import type { LoginResponse } from '@/types';

export interface UseAzureAuthReturn {
  /** Whether Azure AD authentication is enabled */
  isAzureAdEnabled: boolean;
  /** Whether a login operation is in progress */
  isLoading: boolean;
  /** Current error message, if any */
  error: string | null;
  /** Initiate Azure AD login (popup flow) */
  loginWithAzureAd: () => Promise<LoginResponse | null>;
  /** Handle Azure AD redirect callback */
  handleAzureAdCallback: () => Promise<LoginResponse | null>;
  /** Get the current Azure AD account (if any) */
  getAzureAdAccount: () => AccountInfo | null;
  /** Whether user is authenticated with Azure AD */
  isMsalAuthenticated: boolean;
  /** Clear error state */
  clearError: () => void;
}

/**
 * Hook for Azure AD authentication.
 * Handles login flow and token exchange with the backend.
 */
export function useAzureAuth(): UseAzureAuthReturn {
  const { instance, accounts, inProgress } = useMsal();
  const isMsalAuthenticated = useMsalAuthenticated();
  const { login: setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = getAzureAdConfig();
  const azureAdEnabled = isAzureAdEnabled();

  /**
   * Exchange Azure AD tokens with our backend for app JWT
   */
  const handleAuthResponse = useCallback(
    async (response: AuthenticationResult): Promise<LoginResponse> => {
      if (!response.idToken) {
        throw new Error('No ID token received from Azure AD');
      }

      // Send the token to our backend to get our own JWT
      const authResponse = await authApi.azureAdLogin({
        idToken: response.idToken,
        accessToken: response.accessToken || undefined,
      });

      // Store our JWT and user data
      setAuth(authResponse.user, authResponse.tokens);
      return authResponse;
    },
    [setAuth]
  );

  /**
   * Initiate Azure AD login using popup flow
   */
  const loginWithAzureAd = useCallback(async (): Promise<LoginResponse | null> => {
    if (!azureAdEnabled || inProgress !== InteractionStatus.None) {
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use popup for login
      const response = await instance.loginPopup({
        ...loginRequest,
        scopes: config.scopes || loginRequest.scopes,
      });

      const authResult = await handleAuthResponse(response);
      toast.success('Welcome!', { description: `Signed in as ${authResult.user.email}` });
      return authResult;
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Azure AD login failed');
      setError(errorMessage);
      toast.error('Login failed', { description: errorMessage });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [instance, azureAdEnabled, inProgress, config.scopes, handleAuthResponse]);

  /**
   * Handle Azure AD redirect callback (for redirect flow)
   */
  const handleAzureAdCallback = useCallback(async (): Promise<LoginResponse | null> => {
    if (inProgress !== InteractionStatus.None) {
      return null;
    }

    try {
      const response = await instance.handleRedirectPromise();
      if (response) {
        const authResult = await handleAuthResponse(response);
        toast.success('Welcome!', { description: `Signed in as ${authResult.user.email}` });
        return authResult;
      }
      return null;
    } catch (err: unknown) {
      console.error('[AzureAuth] Callback error:', err);
      setError(getErrorMessage(err, 'Azure AD authentication failed'));
      return null;
    }
  }, [instance, inProgress, handleAuthResponse]);

  /**
   * Get the current Azure AD account
   */
  const getAzureAdAccount = useCallback((): AccountInfo | null => {
    return accounts[0] || null;
  }, [accounts]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isAzureAdEnabled: azureAdEnabled,
    isLoading: isLoading || inProgress !== InteractionStatus.None,
    error,
    loginWithAzureAd,
    handleAzureAdCallback,
    getAzureAdAccount,
    isMsalAuthenticated,
    clearError,
  };
}

/**
 * Standalone hook for checking if Azure AD is enabled (without MSAL context).
 * Use this in components that don't have access to MsalProvider.
 */
export function useAzureAdEnabled(): boolean {
  const [enabled, setEnabled] = useState(isAzureAdEnabled());

  useEffect(() => {
    // Re-check when config might have been loaded
    const checkEnabled = () => setEnabled(isAzureAdEnabled());
    checkEnabled();
    // Poll a few times in case config is still loading
    const timeouts = [100, 500, 1000].map((ms) => setTimeout(checkEnabled, ms));
    return () => timeouts.forEach(clearTimeout);
  }, []);

  return enabled;
}
