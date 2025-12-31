// React Query hooks for User operations

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/services';
import { useAuthStore } from '@/stores';
import type { UpdateProfileRequest, ChangePasswordRequest, User } from '@/types';
import { createExtendedQueryKeys, STALE_TIMES } from './queryUtils';

// Query keys - user only has a current key (no list/detail pattern)
export const userKeys = createExtendedQueryKeys('user', (base) => ({
  current: () => [...base.all, 'current'] as const,
}));

/**
 * Hook to fetch current user profile
 */
export function useCurrentUser() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: userKeys.current(),
    queryFn: usersApi.getCurrentUser,
    enabled: isAuthenticated,
    staleTime: STALE_TIMES.LONG,
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
 * Hook to upload avatar
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: (file: File) => usersApi.uploadAvatar(file),
    onSuccess: (response) => {
      // Update the user with the new avatar URL
      const currentUser = queryClient.getQueryData<User>(userKeys.current());
      if (currentUser) {
        const updatedUser = { ...currentUser, avatarUrl: response.avatarUrl };
        queryClient.setQueryData(userKeys.current(), updatedUser);
        updateUser(updatedUser);
      }
    },
  });
}

/**
 * Hook to delete avatar
 */
export function useDeleteAvatar() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: () => usersApi.deleteAvatar(),
    onSuccess: () => {
      // Remove the avatar URL from the user
      const currentUser = queryClient.getQueryData<User>(userKeys.current());
      if (currentUser) {
        const updatedUser = { ...currentUser, avatarUrl: undefined };
        queryClient.setQueryData(userKeys.current(), updatedUser);
        updateUser(updatedUser);
      }
    },
  });
}
