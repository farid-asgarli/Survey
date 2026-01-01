// React Query hooks for Namespace operations

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { namespacesApi } from '@/services';
import { useNamespaceStore, useAuthStore } from '@/stores';
import type { Namespace, CreateNamespaceRequest, InviteMemberRequest, MemberRole, PaginationParams, InviteMemberResponse } from '@/types';
import { createExtendedQueryKeys, STALE_TIMES } from './queryUtils';

// Query keys - namespaces have bySlug and members custom keys
export const namespaceKeys = createExtendedQueryKeys('namespaces', (base) => ({
  bySlug: (slug: string) => [...base.all, 'slug', slug] as const,
  members: (namespaceId: string) => [...base.all, namespaceId, 'members'] as const,
}));

/**
 * Hook to fetch all namespaces for the current user
 */
export function useNamespacesList() {
  const { isAuthenticated } = useAuthStore();
  const { setNamespaces } = useNamespaceStore();

  return useQuery({
    queryKey: namespaceKeys.lists(),
    queryFn: async () => {
      const namespaces = await namespacesApi.list();
      setNamespaces(namespaces);
      return namespaces;
    },
    enabled: isAuthenticated,
    staleTime: STALE_TIMES.LONG,
  });
}

/**
 * Hook to fetch a single namespace by ID
 */
export function useNamespaceDetail(id: string | undefined) {
  return useQuery({
    queryKey: namespaceKeys.detail(id!),
    queryFn: () => namespacesApi.getById(id!),
    enabled: !!id,
    staleTime: STALE_TIMES.LONG,
  });
}

/**
 * Hook to fetch a namespace by slug
 */
export function useNamespaceBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: namespaceKeys.bySlug(slug!),
    queryFn: () => namespacesApi.getBySlug(slug!),
    enabled: !!slug,
    staleTime: STALE_TIMES.LONG,
  });
}

/**
 * Hook to create a new namespace
 */
export function useCreateNamespace() {
  const queryClient = useQueryClient();
  const { addNamespace, setActiveNamespace } = useNamespaceStore();

  return useMutation({
    mutationFn: (data: CreateNamespaceRequest) => namespacesApi.create(data),
    onSuccess: (newNamespace: Namespace) => {
      // Add to store
      addNamespace(newNamespace);
      // Set as active
      setActiveNamespace(newNamespace);
      // Invalidate list cache
      queryClient.invalidateQueries({ queryKey: namespaceKeys.lists() });
    },
  });
}

/**
 * Hook to update a namespace
 */
export function useUpdateNamespace() {
  const queryClient = useQueryClient();
  const { updateNamespace } = useNamespaceStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateNamespaceRequest> }) => namespacesApi.update(id, data),
    onSuccess: (updatedNamespace: Namespace, { id }) => {
      // Update store
      updateNamespace(id, updatedNamespace);
      // Update cache
      queryClient.setQueryData(namespaceKeys.detail(id), updatedNamespace);
      queryClient.invalidateQueries({ queryKey: namespaceKeys.lists() });
    },
  });
}

/**
 * Hook to delete a namespace
 */
export function useDeleteNamespace() {
  const queryClient = useQueryClient();
  const { removeNamespace } = useNamespaceStore();

  return useMutation({
    mutationFn: (id: string) => namespacesApi.delete(id),
    onSuccess: (_, id) => {
      // Remove from store
      removeNamespace(id);
      // Invalidate caches
      queryClient.removeQueries({ queryKey: namespaceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: namespaceKeys.lists() });
    },
  });
}

/**
 * Hook to fetch namespace members with pagination
 */
export function useNamespaceMembers(namespaceId: string | undefined, params?: PaginationParams) {
  return useQuery({
    queryKey: [...namespaceKeys.members(namespaceId!), params],
    queryFn: () => namespacesApi.getMembers(namespaceId!, params),
    enabled: !!namespaceId,
    staleTime: STALE_TIMES.MEDIUM,
  });
}

/**
 * Hook to fetch all namespace members (non-paginated)
 */
export function useAllNamespaceMembers(namespaceId: string | undefined) {
  return useQuery({
    queryKey: [...namespaceKeys.members(namespaceId!), 'all'],
    queryFn: () => namespacesApi.getAllMembers(namespaceId!),
    enabled: !!namespaceId,
    staleTime: STALE_TIMES.MEDIUM,
  });
}

/**
 * Hook to invite a member to a namespace
 */
export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ namespaceId, data }: { namespaceId: string; data: InviteMemberRequest }): Promise<InviteMemberResponse> =>
      namespacesApi.inviteMember(namespaceId, data),
    onSuccess: (_, { namespaceId }) => {
      queryClient.invalidateQueries({ queryKey: namespaceKeys.members(namespaceId) });
    },
  });
}

/**
 * Hook to remove a member from a namespace
 */
export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ namespaceId, membershipId }: { namespaceId: string; membershipId: string }) => namespacesApi.removeMember(namespaceId, membershipId),
    onSuccess: (_, { namespaceId }) => {
      queryClient.invalidateQueries({ queryKey: namespaceKeys.members(namespaceId) });
    },
  });
}

/**
 * Hook to update a member's role in a namespace
 */
export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ namespaceId, membershipId, role }: { namespaceId: string; membershipId: string; role: MemberRole }) =>
      namespacesApi.updateMemberRole(namespaceId, membershipId, role),
    onSuccess: (_, { namespaceId }) => {
      queryClient.invalidateQueries({ queryKey: namespaceKeys.members(namespaceId) });
    },
  });
}
