// React Query hooks for User Preferences operations

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { preferencesApi } from '@/services';
import { usePreferencesStore, useAuthStore, defaultDashboard, defaultSurveyBuilder } from '@/stores';
import type { UserPreferences, UpdateUserPreferencesRequest } from '@/types';
import { createExtendedQueryKeys, STALE_TIMES } from './queryUtils';

// Query keys - preferences only has a current key (no list/detail pattern)
export const preferencesKeys = createExtendedQueryKeys('preferences', (base) => ({
  current: () => [...base.all, 'current'] as const,
}));

/**
 * Hook to fetch current user preferences
 * Automatically syncs with local store and associates with current user
 */
export function useUserPreferences() {
  const setPreferences = usePreferencesStore((s) => s.setPreferences);
  const setLoading = usePreferencesStore((s) => s.setLoading);
  const currentUserId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: preferencesKeys.current(),
    queryFn: async () => {
      setLoading(true);
      try {
        const preferences = await preferencesApi.getPreferences();
        // Ensure dashboard and surveyBuilder exist with defaults
        const normalizedPreferences: UserPreferences = {
          ...preferences,
          dashboard: preferences.dashboard || defaultDashboard,
          surveyBuilder: preferences.surveyBuilder || defaultSurveyBuilder,
        };
        // Pass currentUserId to associate these preferences with the user
        setPreferences(normalizedPreferences, currentUserId);
        return normalizedPreferences;
      } finally {
        setLoading(false);
      }
    },
    staleTime: STALE_TIMES.LONG,
    gcTime: STALE_TIMES.STATIC,
    // Only fetch if user is authenticated
    enabled: !!currentUserId,
  });
}

/**
 * Hook to update user preferences
 * Optimistically updates local store and syncs with backend
 */
export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  const setPreferences = usePreferencesStore((s) => s.setPreferences);
  const setSaving = usePreferencesStore((s) => s.setSaving);
  const currentPreferences = usePreferencesStore((s) => s.preferences);

  return useMutation({
    mutationFn: async (data: UpdateUserPreferencesRequest) => {
      setSaving(true);
      return preferencesApi.updatePreferences(data);
    },
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: preferencesKeys.current() });

      // Snapshot the previous value
      const previousPreferences = queryClient.getQueryData<UserPreferences>(preferencesKeys.current());

      // Optimistically update the local store
      const optimisticPreferences: UserPreferences = {
        ...currentPreferences,
        ...(newData.themeMode && { themeMode: newData.themeMode }),
        ...(newData.colorPalette && { colorPalette: newData.colorPalette }),
        accessibility: {
          ...currentPreferences.accessibility,
          ...(newData.accessibility || {}),
        },
        regional: {
          ...currentPreferences.regional,
          ...(newData.regional || {}),
        },
        notifications: {
          ...currentPreferences.notifications,
          ...(newData.notifications || {}),
        },
        dashboard: {
          ...currentPreferences.dashboard,
          ...(newData.dashboard || {}),
        },
        surveyBuilder: {
          ...currentPreferences.surveyBuilder,
          ...(newData.surveyBuilder || {}),
        },
        onboarding: {
          ...currentPreferences.onboarding,
          ...(newData.onboarding || {}),
        },
      };

      setPreferences(optimisticPreferences);
      queryClient.setQueryData(preferencesKeys.current(), optimisticPreferences);

      return { previousPreferences };
    },
    onError: (err, _newData, context) => {
      // Revert to previous state on error
      if (context?.previousPreferences) {
        setPreferences(context.previousPreferences);
        queryClient.setQueryData(preferencesKeys.current(), context.previousPreferences);
      }
      // Log the actual error for debugging
      console.error('Failed to save preferences:', err);
      // Note: The axios interceptor already shows an error toast,
      // so we don't need to show another one here
    },
    onSuccess: (data) => {
      // Update with server response
      const normalizedData: UserPreferences = {
        ...data,
        dashboard: data.dashboard || defaultDashboard,
        surveyBuilder: data.surveyBuilder || defaultSurveyBuilder,
      };
      setPreferences(normalizedData);
      queryClient.setQueryData(preferencesKeys.current(), normalizedData);
    },
    onSettled: () => {
      setSaving(false);
    },
  });
}

/**
 * Hook that returns a callback to sync preferences after login.
 * Returns an async function that can be called imperatively.
 *
 * @example
 * const syncPreferences = useSyncPreferencesOnLogin();
 * // After successful login:
 * await syncPreferences(userId);
 */
export function useSyncPreferencesOnLogin() {
  const queryClient = useQueryClient();
  const setPreferences = usePreferencesStore((s) => s.setPreferences);

  return async (userId: string) => {
    try {
      const preferences = await preferencesApi.getPreferences();
      const normalizedPreferences: UserPreferences = {
        ...preferences,
        dashboard: preferences.dashboard || defaultDashboard,
        surveyBuilder: preferences.surveyBuilder || defaultSurveyBuilder,
      };
      // Pass userId to associate preferences with the current user
      setPreferences(normalizedPreferences, userId);
      queryClient.setQueryData(preferencesKeys.current(), normalizedPreferences);
    } catch (error) {
      // If fetching fails, keep local preferences
      console.warn('Failed to sync preferences from server:', error);
    }
  };
}

/**
 * Convenience hook to update a single preference value.
 * Provides stable method references via useMemo.
 */
export function useUpdateSinglePreference() {
  const updatePreferences = useUpdatePreferences();
  const { mutate, isPending } = updatePreferences;

  const methods = useMemo(
    () => ({
      updateThemeMode: (themeMode: UserPreferences['themeMode']) => mutate({ themeMode }),
      updateColorPalette: (colorPalette: UserPreferences['colorPalette']) => mutate({ colorPalette }),
      updateAccessibility: (accessibility: Partial<UserPreferences['accessibility']>) => mutate({ accessibility }),
      updateRegional: (regional: Partial<UserPreferences['regional']>) => mutate({ regional }),
      updateNotifications: (notifications: Partial<UserPreferences['notifications']>) => mutate({ notifications }),
      updateDashboard: (dashboard: Partial<UserPreferences['dashboard']>) => mutate({ dashboard }),
      updateSurveyBuilder: (surveyBuilder: Partial<UserPreferences['surveyBuilder']>) => mutate({ surveyBuilder }),
    }),
    [mutate]
  );

  return {
    ...methods,
    isPending,
  };
}
