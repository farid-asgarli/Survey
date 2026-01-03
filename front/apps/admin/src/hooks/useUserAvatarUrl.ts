import { useMemo } from 'react';
import { useAuthStore } from '@/stores';
import { getAvatarUrl } from '@/components/features/profile/AvatarSelector';
import { useAzureAdPhoto } from './useAzureAdPhoto';

export interface UseUserAvatarReturn {
  /** The resolved avatar URL to display (selected avatar OR Azure AD photo) */
  avatarUrl: string | undefined;
  /** The Azure AD photo URL (if available) - useful for avatar selection UI */
  azureAdPhotoUrl: string | null;
  /** Whether Azure AD photo is available for this user */
  isAzureAdAvailable: boolean;
  /** Whether the avatar is currently loading (Azure AD photo fetch in progress) */
  isLoading: boolean;
}

/**
 * Centralized hook for user avatar resolution.
 *
 * Priority:
 * 1. Selected 3D avatar from collection (stored as avatarId)
 * 2. Azure AD profile photo (if signed in with Azure AD)
 * 3. undefined (caller should show fallback initials)
 *
 * This hook is ALWAYS safe to call - it handles all conditional logic internally
 * and never violates React's Rules of Hooks.
 */
export function useUserAvatar(): UseUserAvatarReturn {
  const { user } = useAuthStore();

  // Always call the hook - it handles Azure AD disabled state internally
  const azureAdPhoto = useAzureAdPhoto();

  const avatarUrl = useMemo(() => {
    // First priority: selected 3D avatar
    const storedAvatarUrl = getAvatarUrl(user?.avatarId);
    if (storedAvatarUrl) {
      return storedAvatarUrl;
    }

    // Second priority: Azure AD photo
    if (azureAdPhoto.photoUrl) {
      return azureAdPhoto.photoUrl;
    }

    // No avatar available
    return undefined;
  }, [user?.avatarId, azureAdPhoto.photoUrl]);

  return {
    avatarUrl,
    azureAdPhotoUrl: azureAdPhoto.photoUrl,
    isAzureAdAvailable: azureAdPhoto.isAvailable,
    isLoading: azureAdPhoto.isLoading,
  };
}

/**
 * Simple hook that returns just the avatar URL.
 * For components that only need the URL and don't need Azure AD details.
 *
 * @deprecated Prefer using `useUserAvatar()` for more complete information.
 */
export function useUserAvatarUrl(): string | undefined {
  const { avatarUrl } = useUserAvatar();
  return avatarUrl;
}
