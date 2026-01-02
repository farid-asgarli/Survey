// React Query hooks for Survey Themes operations

import { useQuery } from '@tanstack/react-query';
import { themesApi, type CreateThemeRequest, type UpdateThemeRequest, type DuplicateThemeRequest } from '@/services';
import { useNamespaceStore } from '@/stores';
import { createExtendedQueryKeys, useInvalidatingMutation, useUpdatingMutation, STALE_TIMES } from './queryUtils';

// Re-export types for consumers
export type { CreateThemeRequest, UpdateThemeRequest, DuplicateThemeRequest, ThemePreviewResponse } from '@/services';

// Query keys - using the utility with custom keys for preview/css
export const themeKeys = createExtendedQueryKeys('themes', (base) => ({
  publicList: () => [...base.all, 'public'] as const,
  preview: (id: string) => [...base.all, 'preview', id] as const,
  css: (id: string) => [...base.all, 'css', id] as const,
}));

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
    staleTime: STALE_TIMES.LONG,
  });
}

/**
 * Hook to fetch public themes (available to all users)
 */
export function usePublicThemes() {
  return useQuery({
    queryKey: themeKeys.publicList(),
    queryFn: () => themesApi.listPublic(),
    staleTime: STALE_TIMES.VERY_LONG,
    retry: false,
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
    staleTime: STALE_TIMES.LONG,
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
    staleTime: STALE_TIMES.LONG,
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
    staleTime: STALE_TIMES.LONG,
  });
}

/**
 * Hook to create a new theme
 */
export function useCreateTheme() {
  return useInvalidatingMutation(themeKeys, (data: CreateThemeRequest) => themesApi.create(data));
}

/**
 * Hook to update a theme
 */
export function useUpdateTheme() {
  return useUpdatingMutation(
    themeKeys,
    ({ id, data }: { id: string; data: UpdateThemeRequest }) => themesApi.update(id, data),
    ({ id }) => id,
    {
      // Also invalidate preview and CSS caches when theme is updated
      getAdditionalInvalidations: ({ id }) => [[...themeKeys.preview(id)], [...themeKeys.css(id)]],
    }
  );
}

/**
 * Hook to delete a theme
 */
export function useDeleteTheme() {
  return useInvalidatingMutation(themeKeys, (id: string) => themesApi.delete(id), { removeDetail: (id) => id });
}

/**
 * Hook to duplicate a theme
 */
export function useDuplicateTheme() {
  return useInvalidatingMutation(themeKeys, ({ id, request }: { id: string; request?: DuplicateThemeRequest }) => themesApi.duplicate(id, request));
}

/**
 * Hook to set a theme as the default for the namespace
 */
export function useSetDefaultTheme() {
  return useInvalidatingMutation(themeKeys, (id: string) => themesApi.setDefault(id));
}

/**
 * Hook to apply a theme to a survey
 */
export function useApplyThemeToSurvey() {
  return useInvalidatingMutation(
    themeKeys,
    (data: { surveyId: string; themeId?: string; presetThemeId?: string; themeCustomizations?: string }) =>
      themesApi.applyToSurvey(data.surveyId, {
        themeId: data.themeId,
        presetThemeId: data.presetThemeId,
        themeCustomizations: data.themeCustomizations,
      }),
    {
      // Invalidate survey detail to reflect theme change
      additionalInvalidations: [], // Will be handled via surveyKeys in component
    }
  );
}

/**
 * Alias for useThemes - returns list of themes for the current namespace
 * Used in settings and other components that need a theme dropdown
 */
export const useThemesList = useThemes;
