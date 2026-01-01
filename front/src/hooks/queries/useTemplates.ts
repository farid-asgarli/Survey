// React Query hooks for Survey Template operations

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templatesApi } from '@/services';
import { useNamespaceStore } from '@/stores';
import { surveyKeys } from './useSurveys';
import type { CreateTemplateRequest, CreateTemplateFromSurveyRequest, UpdateTemplateRequest, CreateSurveyFromTemplateRequest } from '@/types';
import { createQueryKeys, STALE_TIMES } from './queryUtils';

// Query keys
export const templateKeys = createQueryKeys('templates');

export interface TemplateFilters {
  category?: string | 'all';
  search?: string;
  isPublic?: boolean;
  visibility?: 'all' | 'public' | 'private';
}

/**
 * Hook to fetch templates list.
 * Maps frontend filters to backend GetTemplatesQuery parameters.
 */
export function useTemplatesList(filters?: TemplateFilters) {
  const { activeNamespace } = useNamespaceStore();

  // Build API params matching backend GetTemplatesQuery
  const params: Record<string, string | boolean | undefined> = {};

  if (filters?.category && filters.category !== 'all') {
    params.category = filters.category;
  }
  if (filters?.search) {
    params.searchTerm = filters.search;
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
      return response.items ?? [];
    },
    enabled: !!activeNamespace?.id,
    staleTime: STALE_TIMES.LONG,
  });
}

/**
 * Hook to fetch a single template by ID.
 * Returns SurveyTemplateDto with full questions array.
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
 * Hook to create a new template.
 * Maps to backend CreateTemplateCommand.
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTemplateRequest) => templatesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: templateKeys.lists(),
      });
    },
  });
}

/**
 * Hook to create a template from an existing survey.
 * Maps to backend CreateTemplateFromSurveyCommand.
 */
export function useCreateTemplateFromSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTemplateFromSurveyRequest) => templatesApi.createFromSurvey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: templateKeys.lists(),
      });
    },
  });
}

/**
 * Hook to update a template.
 * Maps to backend UpdateTemplateCommand.
 */
export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateRequest }) => templatesApi.update(id, data),
    onSuccess: (updatedTemplate, { id }) => {
      queryClient.setQueryData(templateKeys.detail(id), updatedTemplate);
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}

/**
 * Hook to delete a template.
 * Maps to backend DeleteTemplateCommand.
 */
export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => templatesApi.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: templateKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}

/**
 * Hook to create a survey from a template.
 * Maps to backend CreateSurveyFromTemplateCommand.
 */
export function useCreateSurveyFromTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: CreateSurveyFromTemplateRequest }) =>
      templatesApi.createSurveyFromTemplate(templateId, data),
    onSuccess: (newSurvey) => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      return newSurvey;
    },
  });
}
