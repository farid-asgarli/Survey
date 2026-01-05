// React Query hook for User Search (autocomplete)

import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/services';
import { createExtendedQueryKeys, STALE_TIMES } from './queryUtils';

// Query keys
export const userSearchKeys = createExtendedQueryKeys('userSearch', (base) => ({
  search: (query: string, excludeFromNamespaceId?: string) => [...base.all, 'search', query, excludeFromNamespaceId] as const,
}));

/**
 * Hook to search for users by name or email.
 * Used for autocomplete when inviting members to a workspace.
 *
 * @param query - Search query (min 2 characters to trigger search)
 * @param excludeFromNamespaceId - Optional: exclude users already in this namespace
 * @param enabled - Whether the query is enabled
 */
export function useUserSearch(query: string, excludeFromNamespaceId?: string, enabled = true) {
  const trimmedQuery = query.trim();
  const shouldSearch = trimmedQuery.length >= 2;

  return useQuery({
    queryKey: userSearchKeys.search(trimmedQuery, excludeFromNamespaceId),
    queryFn: () => usersApi.searchUsers(trimmedQuery, excludeFromNamespaceId, 10),
    enabled: enabled && shouldSearch,
    staleTime: STALE_TIMES.standard, // Cache for a bit to reduce API calls
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    placeholderData: [], // Start with empty array
  });
}
