// React Query hooks for User operations

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/services';
import { useAuthStore } from '@/stores';
import type { UpdateProfileRequest, ChangePasswordRequest, User, UserProfile } from '@/types';
import { createExtendedQueryKeys, STALE_TIMES } from './queryUtils';

// Query keys - user only has a current key (no list/detail pattern)
export const userKeys = createExtendedQueryKeys('user', (base) => ({
  current: () => [...base.all, 'current'] as const,
}));

/**
 * Hook to fetch current user profile
 *
 * Uses stale-while-revalidate pattern:
 * - Shows cached data immediately from localStorage (via authStore)
 * - Fetches fresh data in the background on mount and window focus
 * - This ensures fast initial load while keeping data up-to-date
 */
export function useCurrentUser() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: userKeys.current(),
    queryFn: usersApi.getCurrentUser,
    enabled: isAuthenticated,
    staleTime: STALE_TIMES.LONG,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to update user profile (name, email)
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => usersApi.updateProfile(data),
    onSuccess: (updatedUser: User) => {
      // Update the query cache
      queryClient.setQueryData(userKeys.current(), updatedUser);
      // Update the auth store
      updateUser(updatedUser);
    },
  });
}

/**
 * Hook to change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => usersApi.changePassword(data),
  });
}

/**
 * Hook to select an avatar from the predefined collection
 */
export function useSelectAvatar() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: (avatarId: string) => usersApi.selectAvatar(avatarId),
    onSuccess: (response) => {
      // Update the user with the new avatar ID
      const currentUser = queryClient.getQueryData<UserProfile>(userKeys.current());
      if (currentUser) {
        const updatedUser = { ...currentUser, avatarId: response.avatarId };
        queryClient.setQueryData(userKeys.current(), updatedUser);
        updateUser(updatedUser);
      }
    },
  });
}

/**
 * Hook to clear/remove avatar
 */
export function useClearAvatar() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: () => usersApi.clearAvatar(),
    onSuccess: () => {
      // Remove the avatar ID from the user
      const currentUser = queryClient.getQueryData<UserProfile>(userKeys.current());
      if (currentUser) {
        const updatedUser = { ...currentUser, avatarId: undefined };
        queryClient.setQueryData(userKeys.current(), updatedUser);
        updateUser(updatedUser);
      }
    },
  });
}
