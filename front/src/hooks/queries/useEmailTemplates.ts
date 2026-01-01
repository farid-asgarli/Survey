// React Query hooks for Email Template operations

import { useQuery } from '@tanstack/react-query';
import { emailTemplatesApi } from '@/services';
import { useNamespaceStore } from '@/stores';
import type { CreateEmailTemplateRequest, UpdateEmailTemplateRequest, EmailTemplateListParams, DuplicateEmailTemplateRequest } from '@/types';
import { createExtendedQueryKeys, useInvalidatingMutation, useUpdatingMutation, STALE_TIMES, GC_TIMES } from './queryUtils';

// Query keys - email templates have a custom placeholders key
export const emailTemplateKeys = createExtendedQueryKeys('emailTemplates', (base) => ({
  placeholders: () => [...base.all, 'placeholders'] as const,
}));

/**
 * Hook to fetch all email templates for the current namespace
 * Returns PaginatedResponse<EmailTemplateSummary> for list views
 */
export function useEmailTemplates(params?: EmailTemplateListParams) {
  const { activeNamespace } = useNamespaceStore();
  const namespaceId = activeNamespace?.id;

  return useQuery({
    queryKey: emailTemplateKeys.list(namespaceId, params),
    queryFn: () => emailTemplatesApi.list(params),
    enabled: !!namespaceId,
    staleTime: STALE_TIMES.LONG,
    gcTime: GC_TIMES.DEFAULT,
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
    staleTime: STALE_TIMES.LONG,
    gcTime: GC_TIMES.LONG,
  });
}

/**
 * Hook to fetch available email template placeholders
 * Static data that rarely changes
 */
export function useEmailTemplatePlaceholders() {
  return useQuery({
    queryKey: emailTemplateKeys.placeholders(),
    queryFn: () => emailTemplatesApi.getPlaceholders(),
    staleTime: STALE_TIMES.STATIC,
    gcTime: GC_TIMES.STATIC,
  });
}

/**
 * Hook to create a new email template
 */
export function useCreateEmailTemplate() {
  return useInvalidatingMutation(emailTemplateKeys, (data: CreateEmailTemplateRequest) => emailTemplatesApi.create(data));
}

/**
 * Hook to update an email template
 * Updates the detail cache immediately and invalidates lists
 */
export function useUpdateEmailTemplate() {
  return useUpdatingMutation(
    emailTemplateKeys,
    ({ id, data }: { id: string; data: UpdateEmailTemplateRequest }) => emailTemplatesApi.update(id, data),
    ({ id }) => id
  );
}

/**
 * Hook to delete an email template
 * Removes from detail cache and invalidates lists
 */
export function useDeleteEmailTemplate() {
  return useInvalidatingMutation(emailTemplateKeys, (id: string) => emailTemplatesApi.delete(id), { removeDetail: (id) => id });
}

/**
 * Hook to set a template as default
 * Updates detail cache and invalidates lists (since another template may have lost default status)
 */
export function useSetDefaultEmailTemplate() {
  return useUpdatingMutation(
    emailTemplateKeys,
    (id: string) => emailTemplatesApi.setDefault(id),
    (id) => id
  );
}

/**
 * Hook to duplicate an email template
 * Uses dedicated backend endpoint for atomic operation with full translation support
 */
export function useDuplicateEmailTemplate() {
  return useInvalidatingMutation(emailTemplateKeys, ({ id, request }: { id: string; request?: DuplicateEmailTemplateRequest }) =>
    emailTemplatesApi.duplicate(id, request)
  );
}
