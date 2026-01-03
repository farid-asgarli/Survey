import { useCallback } from 'react';
import { useNamespaceStore, getActiveNamespaceId } from '@/stores';
import { namespacesApi } from '@/services';
import type { CreateNamespaceRequest, InviteMemberRequest, PaginationParams } from '@/types';

export function useNamespace() {
  const {
    activeNamespace,
    namespaces,
    isLoading,
    setActiveNamespace,
    setNamespaces,
    switchNamespace,
    addNamespace,
    updateNamespace: updateNamespaceInStore,
    removeNamespace,
    setLoading,
  } = useNamespaceStore();

  // Fetch namespaces on mount
  const fetchNamespaces = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedNamespaces = await namespacesApi.list();
      setNamespaces(fetchedNamespaces);
      return fetchedNamespaces;
    } catch (error) {
      console.error('Failed to fetch namespaces:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setNamespaces, setLoading]);

  // Create a new namespace
  const createNamespace = useCallback(
    async (data: CreateNamespaceRequest) => {
      const newNamespace = await namespacesApi.create(data);
      addNamespace(newNamespace);
      return newNamespace;
    },
    [addNamespace]
  );

  // Update namespace
  const updateNamespace = useCallback(
    async (id: string, data: Partial<CreateNamespaceRequest>) => {
      const updated = await namespacesApi.update(id, data);
      updateNamespaceInStore(id, updated);
      return updated;
    },
    [updateNamespaceInStore]
  );

  // Delete namespace
  const deleteNamespace = useCallback(
    async (id: string) => {
      await namespacesApi.delete(id);
      removeNamespace(id);
    },
    [removeNamespace]
  );

  // Get namespace members (paginated)
  const getMembers = useCallback(
    async (namespaceId?: string, params?: PaginationParams) => {
      const id = namespaceId || activeNamespace?.id;
      if (!id) throw new Error('No namespace selected');
      return namespacesApi.getMembers(id, params);
    },
    [activeNamespace]
  );

  // Get all namespace members (non-paginated)
  const getAllMembers = useCallback(
    async (namespaceId?: string) => {
      const id = namespaceId || activeNamespace?.id;
      if (!id) throw new Error('No namespace selected');
      return namespacesApi.getAllMembers(id);
    },
    [activeNamespace]
  );

  // Invite member
  const inviteMember = useCallback(
    async (data: InviteMemberRequest, namespaceId?: string) => {
      const id = namespaceId || activeNamespace?.id;
      if (!id) throw new Error('No namespace selected');
      return namespacesApi.inviteMember(id, data);
    },
    [activeNamespace]
  );

  // Remove member
  const removeMember = useCallback(
    async (membershipId: string, namespaceId?: string) => {
      const id = namespaceId || activeNamespace?.id;
      if (!id) throw new Error('No namespace selected');
      await namespacesApi.removeMember(id, membershipId);
    },
    [activeNamespace]
  );

  return {
    activeNamespace,
    namespaces,
    isLoading,
    fetchNamespaces,
    createNamespace,
    updateNamespace,
    deleteNamespace,
    switchNamespace,
    setActiveNamespace,
    getMembers,
    getAllMembers,
    inviteMember,
    removeMember,
    getActiveNamespaceId,
  };
}
