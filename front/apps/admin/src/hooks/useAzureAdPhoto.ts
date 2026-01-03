import { useState, useEffect, useCallback, useRef } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { isAzureAdEnabled } from '@/config/msalConfig';
import { useAuthStore } from '@/stores';

const GRAPH_PHOTO_ENDPOINT = 'https://graph.microsoft.com/v1.0/me/photo/$value';
const GRAPH_SCOPES = ['User.Read'];

export interface UseAzureAdPhotoReturn {
  /** The Azure AD profile photo as a blob URL */
  photoUrl: string | null;
  /** Whether the photo is currently loading */
  isLoading: boolean;
  /** Error message if photo fetch failed */
  error: string | null;
  /** Whether Azure AD is enabled and user has matching MSAL account */
  isAvailable: boolean;
  /** Refresh the photo */
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch the current user's profile photo from Microsoft Graph.
 *
 * IMPORTANT: This hook is always safe to call regardless of whether Azure AD is enabled.
 * It will return null/empty values when Azure AD is not available.
 *
 * Only fetches when:
 * - Azure AD is enabled
 * - User is authenticated via Azure AD
 * - User's email matches an MSAL account
 */
export function useAzureAdPhoto(): UseAzureAdPhotoReturn {
  const { instance, accounts } = useMsal();
  const { user } = useAuthStore();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use ref to track previous URL for cleanup
  const previousUrlRef = useRef<string | null>(null);

  // Check if Azure AD is enabled
  const azureAdEnabled = isAzureAdEnabled();

  // Find the MSAL account that matches the current app user's email
  const matchingAccount = azureAdEnabled ? accounts.find((account) => account.username?.toLowerCase() === user?.email?.toLowerCase()) : undefined;

  // Whether Azure AD photo is available for this user
  const isAvailable = azureAdEnabled && !!matchingAccount;

  const fetchPhoto = useCallback(async () => {
    // Only attempt if Azure AD is enabled and user's email matches an MSAL account
    if (!azureAdEnabled || !matchingAccount) {
      setPhotoUrl(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get access token for Microsoft Graph
      const tokenResponse = await instance.acquireTokenSilent({
        scopes: GRAPH_SCOPES,
        account: matchingAccount,
      });

      // Fetch the photo from Microsoft Graph
      const response = await fetch(GRAPH_PHOTO_ENDPOINT, {
        headers: {
          Authorization: `Bearer ${tokenResponse.accessToken}`,
        },
      });

      if (!response.ok) {
        // 404 means user has no photo - not an error
        if (response.status === 404) {
          setPhotoUrl(null);
          return;
        }
        throw new Error(`Failed to fetch photo: ${response.status}`);
      }

      // Convert blob to URL
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Clean up old URL if exists
      if (previousUrlRef.current) {
        URL.revokeObjectURL(previousUrlRef.current);
      }
      previousUrlRef.current = url;

      setPhotoUrl(url);
    } catch (err) {
      // Handle token acquisition errors
      if (err instanceof InteractionRequiredAuthError) {
        // User needs to re-authenticate - try popup
        try {
          const tokenResponse = await instance.acquireTokenPopup({
            scopes: GRAPH_SCOPES,
            account: matchingAccount,
          });

          const response = await fetch(GRAPH_PHOTO_ENDPOINT, {
            headers: {
              Authorization: `Bearer ${tokenResponse.accessToken}`,
            },
          });

          if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            if (previousUrlRef.current) {
              URL.revokeObjectURL(previousUrlRef.current);
            }
            previousUrlRef.current = url;

            setPhotoUrl(url);
            return;
          }
        } catch {
          // Popup blocked or failed
          console.info('[AzureAdPhoto] Interactive auth required but failed');
        }
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch photo';
      setError(errorMessage);
      console.info('[AzureAdPhoto] Could not fetch photo:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [instance, matchingAccount, azureAdEnabled]);

  // Fetch photo on mount and when matching account changes
  useEffect(() => {
    if (isAvailable) {
      fetchPhoto();
    } else {
      setPhotoUrl(null);
    }

    // Cleanup blob URL on unmount
    return () => {
      if (previousUrlRef.current) {
        URL.revokeObjectURL(previousUrlRef.current);
        previousUrlRef.current = null;
      }
    };
  }, [matchingAccount?.username, isAvailable, fetchPhoto]);

  return {
    photoUrl,
    isLoading,
    error,
    isAvailable,
    refetch: fetchPhoto,
  };
}
