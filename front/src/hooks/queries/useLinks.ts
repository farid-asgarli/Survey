// React Query hooks for Survey Links operations

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { linksApi } from '@/services';
import type { CreateLinkRequest, UpdateLinkRequest, SurveyLink, BulkLinkGenerationRequest, LinkAnalyticsResponse, SurveyLinksResponse } from '@/types';
import { createExtendedQueryKeys, STALE_TIMES } from './queryUtils';

// Query keys - links have custom detail key (surveyId + linkId) and analytics
export const linkKeys = createExtendedQueryKeys('links', (base) => ({
  // Override detail to include surveyId
  detail: (surveyId: string, linkId: string) => [...base.details(), surveyId, linkId] as const,
  analytics: (surveyId: string, linkId: string, startDate?: string, endDate?: string) =>
    [...base.all, 'analytics', surveyId, linkId, { startDate, endDate }] as const,
}));

/**
 * Hook to fetch all links for a survey (paginated).
 * Backend returns PagedResponse<SurveyLinkDto>
 */
export function useSurveyLinks(surveyId: string | undefined, params?: { pageNumber?: number; pageSize?: number; isActive?: boolean }) {
  return useQuery({
    queryKey: linkKeys.list(surveyId!),
    queryFn: () => linksApi.list(surveyId!, params),
    enabled: !!surveyId,
    staleTime: STALE_TIMES.MEDIUM,
    // Extract items array for backward compatibility in select
    select: (data: SurveyLinksResponse) => data,
  });
}

/**
 * Hook to fetch a single link by ID.
 * Backend returns SurveyLinkDetailsDto
 */
export function useLinkDetail(surveyId: string | undefined, linkId: string | undefined) {
  return useQuery({
    queryKey: linkKeys.detail(surveyId!, linkId!),
    queryFn: () => linksApi.getById(surveyId!, linkId!),
    enabled: !!surveyId && !!linkId,
    staleTime: STALE_TIMES.LONG,
  });
}

/**
 * Hook to fetch link analytics.
 * Backend returns LinkAnalyticsDto
 */
export function useLinkAnalytics(surveyId: string | undefined, linkId: string | undefined, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: linkKeys.analytics(surveyId!, linkId!, startDate, endDate),
    queryFn: () => linksApi.getAnalytics(surveyId!, linkId!, startDate, endDate),
    enabled: !!surveyId && !!linkId,
    staleTime: STALE_TIMES.SHORT,
  });
}

/**
 * Hook to create a new link.
 * Backend accepts CreateSurveyLinkCommand, returns SurveyLinkDto
 */
export function useCreateLink(surveyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLinkRequest) => linksApi.create(surveyId, data),
    onSuccess: (newLink) => {
      // Update paginated cache with new link
      queryClient.setQueryData<SurveyLinksResponse>(linkKeys.list(surveyId), (old) => {
        if (!old) return { items: [newLink], totalCount: 1, pageNumber: 1, pageSize: 10, totalPages: 1, hasNextPage: false, hasPreviousPage: false };
        return {
          ...old,
          items: [...old.items, newLink],
          totalCount: old.totalCount + 1,
        };
      });
      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: linkKeys.list(surveyId) });
    },
  });
}

/**
 * Hook to update a link.
 * Backend accepts UpdateSurveyLinkCommand, returns SurveyLinkDto
 */
export function useUpdateLink(surveyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ linkId, data }: { linkId: string; data: UpdateLinkRequest }) => linksApi.update(surveyId, linkId, data),
    onSuccess: (updatedLink, { linkId }) => {
      // Update detail cache
      queryClient.setQueryData(linkKeys.detail(surveyId, linkId), updatedLink);
      // Update list cache
      queryClient.setQueryData<SurveyLinksResponse>(linkKeys.list(surveyId), (old) => {
        if (!old) return { items: [updatedLink], totalCount: 1, pageNumber: 1, pageSize: 10, totalPages: 1, hasNextPage: false, hasPreviousPage: false };
        return {
          ...old,
          items: old.items.map((link) => (link.id === linkId ? updatedLink : link)),
        };
      });
    },
  });
}

/**
 * Hook to deactivate a link.
 * Backend returns 204 No Content
 */
export function useDeactivateLink(surveyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (linkId: string) => linksApi.deactivate(surveyId, linkId),
    onSuccess: (_, linkId) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: linkKeys.detail(surveyId, linkId) });
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: linkKeys.list(surveyId) });
    },
  });
}

/**
 * Hook to generate bulk links.
 * Backend accepts GenerateBulkLinksCommand, returns BulkLinkGenerationResultDto
 */
export function useGenerateBulkLinks(surveyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkLinkGenerationRequest) => linksApi.generateBulkLinks(surveyId, data),
    onSuccess: (result) => {
      // Add new links to paginated cache
      queryClient.setQueryData<SurveyLinksResponse>(linkKeys.list(surveyId), (old) => {
        if (!old)
          return {
            items: result.links,
            totalCount: result.generatedCount,
            pageNumber: 1,
            pageSize: 10,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          };
        return {
          ...old,
          items: [...old.items, ...result.links],
          totalCount: old.totalCount + result.generatedCount,
        };
      });
      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: linkKeys.list(surveyId) });
    },
  });
}

// Re-export types for convenience
export type { SurveyLink, CreateLinkRequest, UpdateLinkRequest, BulkLinkGenerationRequest, LinkAnalyticsResponse, SurveyLinksResponse };
