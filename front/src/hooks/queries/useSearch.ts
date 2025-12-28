// React Query hook for global search across surveys, templates, and responses

import { useQuery } from '@tanstack/react-query';
import { surveysApi, templatesApi, themesApi } from '@/services';
import { useNamespaceStore } from '@/stores';
import type { SearchResult, SearchResultType } from '@/stores/searchStore';

// Query key for global search
export const searchKeys = {
  all: ['search'] as const,
  global: (namespaceId: string, query: string) => [...searchKeys.all, 'global', namespaceId, query] as const,
};

interface SearchParams {
  query: string;
  types?: SearchResultType[];
  limit?: number;
}

interface UseGlobalSearchOptions {
  enabled?: boolean;
}

/**
 * Hook to perform global search across multiple entity types
 */
export function useGlobalSearch(params: SearchParams, options: UseGlobalSearchOptions = {}) {
  const { activeNamespace } = useNamespaceStore();
  const namespaceId = activeNamespace?.id;
  const { query, types = ['survey', 'template', 'theme'], limit = 10 } = params;
  const { enabled = true } = options;

  return useQuery({
    queryKey: searchKeys.global(namespaceId || '', query),
    queryFn: async (): Promise<SearchResult[]> => {
      if (!namespaceId || !query.trim()) return [];

      const results: SearchResult[] = [];
      const searchTerm = query.toLowerCase().trim();
      const limitPerType = Math.ceil(limit / types.length);

      // Search in parallel
      const promises: Promise<void>[] = [];

      // Search surveys
      if (types.includes('survey')) {
        promises.push(
          (async () => {
            try {
              const response = await surveysApi.list(namespaceId, {
                search: searchTerm,
                pageNumber: 1,
                pageSize: 50, // Fetch more for client-side filtering
              });
              // Client-side filtering in case backend doesn't support search
              const filtered = response.items.filter(
                (survey) => survey.title.toLowerCase().includes(searchTerm) || survey.description?.toLowerCase().includes(searchTerm)
              );
              filtered.slice(0, limitPerType).forEach((survey) => {
                results.push({
                  id: survey.id,
                  type: 'survey',
                  title: survey.title,
                  description: survey.description,
                  status: String(survey.status),
                  url: `/surveys/${survey.id}/edit`,
                  timestamp: survey.updatedAt,
                });
              });
            } catch {
              // Silently fail for individual search types
            }
          })()
        );
      }

      // Search templates
      if (types.includes('template')) {
        promises.push(
          (async () => {
            try {
              const response = await templatesApi.list({
                namespaceId,
                search: searchTerm,
                pageNumber: 1,
                pageSize: 50, // Fetch more for client-side filtering
              });
              // Client-side filtering in case backend doesn't support search
              const filtered = response.items.filter(
                (template) => template.name.toLowerCase().includes(searchTerm) || template.description?.toLowerCase().includes(searchTerm)
              );
              filtered.slice(0, limitPerType).forEach((template) => {
                results.push({
                  id: template.id,
                  type: 'template',
                  title: template.name,
                  description: template.description,
                  url: `/templates/${template.id}`,
                  timestamp: template.updatedAt,
                });
              });
            } catch {
              // Silently fail for individual search types
            }
          })()
        );
      }

      // Search themes
      if (types.includes('theme')) {
        promises.push(
          (async () => {
            try {
              const response = await themesApi.list({ searchTerm: namespaceId });
              const themes = response.items || [];
              const filtered = themes.filter((theme: { name: string }) => theme.name.toLowerCase().includes(searchTerm));
              filtered.slice(0, limitPerType).forEach((theme: { id: string; name: string; updatedAt?: string }) => {
                results.push({
                  id: theme.id,
                  type: 'theme',
                  title: theme.name,
                  url: `/themes/${theme.id}`,
                  timestamp: theme.updatedAt,
                });
              });
            } catch {
              // Silently fail for individual search types
            }
          })()
        );
      }

      await Promise.all(promises);

      // Sort by relevance (exact matches first, then by timestamp)
      return results
        .sort((a, b) => {
          const aExact = a.title.toLowerCase() === searchTerm;
          const bExact = b.title.toLowerCase() === searchTerm;
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;

          const aStarts = a.title.toLowerCase().startsWith(searchTerm);
          const bStarts = b.title.toLowerCase().startsWith(searchTerm);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;

          // Sort by timestamp (most recent first)
          return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
        })
        .slice(0, limit);
    },
    enabled: enabled && !!namespaceId && query.trim().length >= 2,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 60 * 1000, // 1 minute
  });
}
