import { useEffect, useState, type ReactNode } from 'react';
import { MsalProvider } from '@azure/msal-react';
import type { PublicClientApplication } from '@azure/msal-browser';
import { authApi } from '@/services';
import { initializeMsal, setAzureAdConfig } from '@/config/msalConfig';
import { PageTransitionLoader } from '@/components/ui';

interface AzureAdProviderProps {
  children: ReactNode;
}

/**
 * Azure AD MSAL Provider.
 * Fetches Azure AD configuration from backend and initializes MSAL.
 * Wraps children with MsalProvider if Azure AD is enabled.
 */
export function AzureAdProvider({ children }: AzureAdProviderProps) {
  const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAzureAd = async () => {
      try {
        // Fetch Azure AD configuration from backend
        const config = await authApi.getAzureAdConfig();
        setAzureAdConfig(config);

        if (config.enabled && config.clientId) {
          // Initialize MSAL with the configuration
          const instance = await initializeMsal(config);
          setMsalInstance(instance);
        }
      } catch (error) {
        // Azure AD not configured or backend unavailable
        console.info('[AzureAd] Azure AD not configured:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initAzureAd();
  }, []);

  // Show loading while initializing
  if (!isInitialized) {
    return <PageTransitionLoader />;
  }

  // Wrap with MsalProvider if Azure AD is enabled
  if (msalInstance) {
    return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
  }

  // Azure AD not enabled, render children directly
  return <>{children}</>;
}
