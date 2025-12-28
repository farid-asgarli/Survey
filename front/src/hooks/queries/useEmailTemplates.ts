// React Query hooks for Email Template operations

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailTemplatesApi } from '@/services';
import { useNamespaceStore } from '@/stores';
import type { CreateEmailTemplateRequest, UpdateEmailTemplateRequest } from '@/types';

// Query keys
export const emailTemplateKeys = {
  all: ['emailTemplates'] as const,
  lists: () => [...emailTemplateKeys.all, 'list'] as const,
  list: (namespaceId?: string, filters?: Record<string, unknown>) => [...emailTemplateKeys.lists(), namespaceId, filters] as const,
  details: () => [...emailTemplateKeys.all, 'detail'] as const,
  detail: (id: string) => [...emailTemplateKeys.details(), id] as const,
  placeholders: () => [...emailTemplateKeys.all, 'placeholders'] as const,
};

/**
 * Hook to fetch all email templates for the current namespace
 * Returns EmailTemplateSummary[] for list views
 */
export function useEmailTemplates(params?: { pageNumber?: number; pageSize?: number; searchTerm?: string; type?: string }) {
  const { activeNamespace } = useNamespaceStore();
  const namespaceId = activeNamespace?.id;

  return useQuery({
    queryKey: emailTemplateKeys.list(namespaceId, params),
    queryFn: () => emailTemplatesApi.list(params),
    enabled: !!namespaceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single email template by ID
 * Returns full EmailTemplate with htmlBody
 */
export function useEmailTemplate(id: string | undefined) {
  return useQuery({
    queryKey: emailTemplateKeys.detail(id!),
    queryFn: () => emailTemplatesApi.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch available email template placeholders
 */
export function useEmailTemplatePlaceholders() {
  return useQuery({
    queryKey: emailTemplateKeys.placeholders(),
    queryFn: () => emailTemplatesApi.getPlaceholders(),
    staleTime: 30 * 60 * 1000, // 30 minutes - placeholders don't change often
  });
}

/**
 * Hook to create a new email template
 */
export function useCreateEmailTemplate() {
  const queryClient = useQueryClient();
  const { activeNamespace } = useNamespaceStore();

  return useMutation({
    mutationFn: (data: CreateEmailTemplateRequest) => {
      if (!activeNamespace?.id) {
        throw new Error('No active namespace');
      }
      return emailTemplatesApi.create(data);
    },
    onSuccess: () => {
      // Invalidate list to refetch with new template
      queryClient.invalidateQueries({ queryKey: emailTemplateKeys.lists() });
    },
  });
}

/**
 * Hook to update an email template
 */
export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmailTemplateRequest }) => emailTemplatesApi.update(id, data),
    onSuccess: (updatedTemplate, { id }) => {
      // Update detail cache
      queryClient.setQueryData(emailTemplateKeys.detail(id), updatedTemplate);
      // Invalidate list since summary data might have changed
      queryClient.invalidateQueries({ queryKey: emailTemplateKeys.lists() });
    },
  });
}

/**
 * Hook to delete an email template
 */
export function useDeleteEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => emailTemplatesApi.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: emailTemplateKeys.detail(deletedId) });
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: emailTemplateKeys.lists() });
    },
  });
}

/**
 * Hook to set a template as default
 */
export function useSetDefaultEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => emailTemplatesApi.setDefault(id),
    onSuccess: (updatedTemplate) => {
      // Update detail cache
      queryClient.setQueryData(emailTemplateKeys.detail(updatedTemplate.id), updatedTemplate);
      // Invalidate list to refetch with updated defaults
      queryClient.invalidateQueries({ queryKey: emailTemplateKeys.lists() });
    },
  });
}

/**
 * Hook to duplicate an email template
 */
export function useDuplicateEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => emailTemplatesApi.duplicate(id, name),
    onSuccess: () => {
      // Invalidate list to show the new template
      queryClient.invalidateQueries({ queryKey: emailTemplateKeys.lists() });
    },
  });
}
