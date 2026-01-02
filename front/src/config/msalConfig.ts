import { LogLevel, PublicClientApplication } from '@azure/msal-browser';
import type { Configuration } from '@azure/msal-browser';
import type { AzureAdConfig } from '@/types';

// Store for Azure AD configuration
let azureAdConfig: AzureAdConfig = { enabled: false };

/**
 * Set the Azure AD configuration (called after fetching from backend)
 */
export const setAzureAdConfig = (config: AzureAdConfig): void => {
  azureAdConfig = config;
};

/**
 * Get the current Azure AD configuration
 */
export const getAzureAdConfig = (): AzureAdConfig => azureAdConfig;

/**
 * Check if Azure AD authentication is enabled
 */
export const isAzureAdEnabled = (): boolean => azureAdConfig.enabled && !!azureAdConfig.clientId;

/**
 * Create MSAL configuration from Azure AD config
 */
export const createMsalConfig = (config: AzureAdConfig): Configuration => ({
  auth: {
    clientId: config.clientId || '',
    authority: config.authority || 'https://login.microsoftonline.com/common',
    redirectUri: config.redirectUri || window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error('[MSAL]', message);
            break;
          case LogLevel.Warning:
            console.warn('[MSAL]', message);
            break;
          case LogLevel.Info:
            if (import.meta.env.DEV) {
              console.info('[MSAL]', message);
            }
            break;
          case LogLevel.Verbose:
            if (import.meta.env.DEV) {
              console.debug('[MSAL]', message);
            }
            break;
        }
      },
      logLevel: import.meta.env.DEV ? LogLevel.Info : LogLevel.Warning,
    },
  },
});

/**
 * Default login request scopes
 */
export const loginRequest = {
  scopes: ['openid', 'profile', 'email'],
};

// Singleton MSAL instance
let msalInstance: PublicClientApplication | null = null;

/**
 * Get the current MSAL instance (if initialized)
 */
export const getMsalInstance = (): PublicClientApplication | null => msalInstance;

/**
 * Initialize MSAL with the provided configuration
 * Returns the instance if successful, null otherwise
 */
export const initializeMsal = async (config: AzureAdConfig): Promise<PublicClientApplication | null> => {
  if (!config.enabled || !config.clientId) {
    console.info('[MSAL] Azure AD authentication is not enabled');
    return null;
  }

  try {
    msalInstance = new PublicClientApplication(createMsalConfig(config));
    await msalInstance.initialize();
    console.info('[MSAL] MSAL initialized successfully');
    return msalInstance;
  } catch (error) {
    console.error('[MSAL] Failed to initialize MSAL:', error);
    msalInstance = null;
    return null;
  }
};

/**
 * Clear the MSAL instance (for cleanup/logout)
 */
export const clearMsalInstance = (): void => {
  msalInstance = null;
};
