// React Query hooks for Survey Template operations

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templatesApi } from '@/services';
import { useNamespaceStore } from '@/stores';
import { surveyKeys } from './useSurveys';
import type { TemplateCategory } from '@/types';
import { createQueryKeys, STALE_TIMES } from './queryUtils';

// Query keys
export const templateKeys = createQueryKeys('templates');

export interface TemplateFilters {
  namespaceId?: string;
  category?: TemplateCategory | 'all';
  search?: string;
  isPublic?: boolean;
  visibility?: 'all' | 'public' | 'private';
}

/**
 * Hook to fetch templates list
 */
export function useTemplatesList(filters?: TemplateFilters) {
  const { activeNamespace } = useNamespaceStore();

  // Build API params
  const params: Record<string, string | boolean | undefined> = {
    namespaceId: activeNamespace?.id,
  };

  if (filters?.category && filters.category !== 'all') {
    params.category = filters.category;
  }
  if (filters?.search) {
    params.searchTerm = filters.search; // Map search filter to searchTerm API param
  }
  if (filters?.visibility === 'public') {
    params.isPublic = true;
  } else if (filters?.visibility === 'private') {
    params.isPublic = false;
  }

  return useQuery({
    queryKey: templateKeys.list(filters),
    queryFn: async () => {
      const response = await templatesApi.list(params);
      // Return items from paginated response, default to empty array
      return response.items ?? [];
    },
    enabled: !!activeNamespace?.id,
    staleTime: STALE_TIMES.LONG,
  });
}

/**
 * Hook to fetch a single template by ID
 */
export function useTemplateDetail(id: string | undefined) {
  return useQuery({
    queryKey: templateKeys.detail(id!),
    queryFn: () => templatesApi.getById(id!),
    enabled: !!id,
    staleTime: STALE_TIMES.VERY_LONG,
  });
}

/**
 * Hook to create a new template
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient();
  const { activeNamespace } = useNamespaceStore();

  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      category: TemplateCategory;
      isPublic?: boolean;
      languageCode: string;
      surveyData?: Record<string, unknown>;
    }) => templatesApi.create(activeNamespace!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: templateKeys.lists(),
      });
    },
  });
}

/**
 * Hook to create a template from an existing survey
 */
export function useCreateTemplateFromSurvey() {
  const queryClient = useQueryClient();
  const { activeNamespace } = useNamespaceStore();

  return useMutation({
    mutationFn: (data: {
      surveyId: string;
      name: string;
      description?: string;
      category: TemplateCategory;
      isPublic?: boolean;
      languageCode?: string;
    }) => templatesApi.createFromSurvey(activeNamespace!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: templateKeys.lists(),
      });
    },
  });
}

/**
 * Hook to update a template
 */
export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        name?: string;
        description?: string;
        category?: TemplateCategory;
        isPublic?: boolean;
        languageCode?: string;
        surveyData?: Record<string, unknown>;
      };
    }) => templatesApi.update(id, data),
    onSuccess: (updatedTemplate, { id }) => {
      // Update detail cache
      queryClient.setQueryData(templateKeys.detail(id), updatedTemplate);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}

/**
 * Hook to delete a template
 */
export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => templatesApi.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: templateKeys.detail(deletedId) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}

/**
 * Hook to create a survey from a template
 */
export function useCreateSurveyFromTemplate() {
  const queryClient = useQueryClient();
  const { activeNamespace } = useNamespaceStore();

  return useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: { title: string; description?: string; languageCode: string } }) =>
      templatesApi.createSurveyFromTemplate(templateId, activeNamespace!.id, data),
    onSuccess: (newSurvey) => {
      // Invalidate surveys list
      queryClient.invalidateQueries({ queryKey: surveyKeys.lists() });
      // Update template usage count in cache
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      return newSurvey;
    },
  });
}
