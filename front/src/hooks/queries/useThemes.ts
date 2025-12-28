// React Query hooks for Survey Themes operations

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { themesApi, type CreateThemeRequest, type UpdateThemeRequest } from '@/services';
import { useNamespaceStore } from '@/stores';

// Re-export types for consumers
export type { CreateThemeRequest, UpdateThemeRequest, ThemePreviewResponse, ThemeCssResponse } from '@/services';

// Query keys
export const themeKeys = {
  all: ['themes'] as const,
  lists: () => [...themeKeys.all, 'list'] as const,
  list: (namespaceId: string) => [...themeKeys.lists(), namespaceId] as const,
  publicList: () => [...themeKeys.all, 'public'] as const,
  details: () => [...themeKeys.all, 'detail'] as const,
  detail: (id: string) => [...themeKeys.details(), id] as const,
  preview: (id: string) => [...themeKeys.all, 'preview', id] as const,
  css: (id: string) => [...themeKeys.all, 'css', id] as const,
};

/**
 * Hook to fetch themes list for current namespace
 */
export function useThemes() {
  const { activeNamespace } = useNamespaceStore();
  const namespaceId = activeNamespace?.id;

  return useQuery({
    queryKey: themeKeys.list(namespaceId || ''),
    queryFn: () => themesApi.list(),
    enabled: !!namespaceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch public themes (available to all users)
 */
export function usePublicThemes() {
  return useQuery({
    queryKey: themeKeys.publicList(),
    queryFn: () => themesApi.listPublic(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Don't retry if endpoint doesn't exist
  });
}

/**
 * Hook to fetch a single theme by ID
 */
export function useThemeDetail(id: string | undefined) {
  return useQuery({
    queryKey: themeKeys.detail(id!),
    queryFn: () => themesApi.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch theme preview with CSS
 */
export function useThemePreview(id: string | undefined) {
  return useQuery({
    queryKey: themeKeys.preview(id!),
    queryFn: () => themesApi.getPreview(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch generated CSS for a theme
 */
export function useThemeCss(id: string | undefined) {
  return useQuery({
    queryKey: themeKeys.css(id!),
    queryFn: () => themesApi.getCss(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to create a new theme
 */
export function useCreateTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateThemeRequest) => themesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: themeKeys.lists() });
    },
  });
}

/**
 * Hook to update a theme
 */
export function useUpdateTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateThemeRequest }) => themesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: themeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: themeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: themeKeys.preview(id) });
      queryClient.invalidateQueries({ queryKey: themeKeys.css(id) });
    },
  });
}

/**
 * Hook to delete a theme
 */
export function useDeleteTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => themesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: themeKeys.lists() });
    },
  });
}

/**
 * Hook to duplicate a theme
 */
export function useDuplicateTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => themesApi.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: themeKeys.lists() });
    },
  });
}

/**
 * Hook to set a theme as the default for the namespace
 */
export function useSetDefaultTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => themesApi.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: themeKeys.lists() });
    },
  });
}

/**
 * Hook to apply a theme to a survey
 */
export function useApplyThemeToSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { surveyId: string; themeId?: string; presetThemeId?: string; themeCustomizations?: string }) =>
      themesApi.applyToSurvey(data.surveyId, {
        themeId: data.themeId,
        presetThemeId: data.presetThemeId,
        themeCustomizations: data.themeCustomizations,
      }),
    onSuccess: (_, { surveyId }) => {
      // Invalidate survey queries to reflect theme change
      queryClient.invalidateQueries({ queryKey: ['surveys', 'detail', surveyId] });
    },
  });
}

/**
 * Alias for useThemes - returns list of themes for the current namespace
 * Used in settings and other components that need a theme dropdown
 */
export const useThemesList = useThemes;
