import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Namespace } from '@/types';

interface NamespaceState {
  activeNamespace: Namespace | null;
  namespaces: Namespace[];
  isLoading: boolean;
  _hasHydrated: boolean;
}

interface NamespaceActions {
  setActiveNamespace: (namespace: Namespace | null) => void;
  setNamespaces: (namespaces: Namespace[]) => void;
  switchNamespace: (namespaceId: string) => void;
  addNamespace: (namespace: Namespace) => void;
  updateNamespace: (namespaceId: string, updates: Partial<Namespace>) => void;
  removeNamespace: (namespaceId: string) => void;
  setHasHydrated: (state: boolean) => void;
  setLoading: (loading: boolean) => void;
}

type NamespaceStore = NamespaceState & NamespaceActions;

export const useNamespaceStore = create<NamespaceStore>()(
  persist(
    (set, get) => ({
      // Initial state
      activeNamespace: null,
      namespaces: [],
      isLoading: true,
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state, isLoading: false });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setActiveNamespace: (namespace) => {
        set({ activeNamespace: namespace });
      },

      setNamespaces: (namespaces) => {
        const currentActive = get().activeNamespace;
        // If no active namespace or current active is not in the list, set the first one
        if (!currentActive || !namespaces.find((n) => n.id === currentActive.id)) {
          set({ namespaces, activeNamespace: namespaces[0] || null });
        } else {
          set({ namespaces });
        }
      },

      switchNamespace: (namespaceId) => {
        const namespace = get().namespaces.find((n) => n.id === namespaceId);
        if (namespace) {
          set({ activeNamespace: namespace });
        }
      },

      addNamespace: (namespace) => {
        set((state) => ({
          namespaces: [...state.namespaces, namespace],
        }));
      },

      updateNamespace: (namespaceId, updates) => {
        set((state) => ({
          namespaces: state.namespaces.map((n) => (n.id === namespaceId ? { ...n, ...updates } : n)),
          activeNamespace: state.activeNamespace?.id === namespaceId ? { ...state.activeNamespace, ...updates } : state.activeNamespace,
        }));
      },

      removeNamespace: (namespaceId) => {
        set((state) => {
          const newNamespaces = state.namespaces.filter((n) => n.id !== namespaceId);
          return {
            namespaces: newNamespaces,
            activeNamespace: state.activeNamespace?.id === namespaceId ? newNamespaces[0] || null : state.activeNamespace,
          };
        });
      },
    }),
    {
      name: 'survey-namespace',
      partialize: (state) => ({
        activeNamespace: state.activeNamespace,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);

// Selector hooks for better performance
export const useActiveNamespace = () => useNamespaceStore((s) => s.activeNamespace);
export const useNamespaces = () => useNamespaceStore((s) => s.namespaces);
export const useNamespaceLoading = () => useNamespaceStore((s) => s.isLoading);

// Utility to get active namespace ID for API calls
export const getActiveNamespaceId = (): string | null => {
  return useNamespaceStore.getState().activeNamespace?.id ?? null;
};
