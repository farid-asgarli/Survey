// Global search state and recent items management

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getCurrentISOTimestamp } from '@/utils';

// Types for search results
export type SearchResultType = 'survey' | 'template' | 'response' | 'theme' | 'distribution';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description?: string;
  status?: string;
  url: string;
  icon?: string;
  timestamp?: string;
}

export interface RecentItem {
  id: string;
  type: SearchResultType;
  title: string;
  url: string;
  visitedAt: string;
}

interface SearchState {
  // Search dialog state
  isSearchOpen: boolean;
  searchQuery: string;
  searchResults: SearchResult[];
  isSearching: boolean;
  selectedIndex: number;

  // Recent items (persisted)
  recentItems: RecentItem[];
  maxRecentItems: number;

  // Actions
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: SearchResult[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  setSelectedIndex: (index: number) => void;
  moveSelectionUp: () => void;
  moveSelectionDown: () => void;
  clearSearch: () => void;

  // Recent items actions
  addRecentItem: (item: Omit<RecentItem, 'visitedAt'>) => void;
  removeRecentItem: (id: string) => void;
  clearRecentItems: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      // Initial state
      isSearchOpen: false,
      searchQuery: '',
      searchResults: [],
      isSearching: false,
      selectedIndex: 0,
      recentItems: [],
      maxRecentItems: 10,

      // Search dialog actions
      openSearch: () => set({ isSearchOpen: true, selectedIndex: 0 }),
      closeSearch: () => set({ isSearchOpen: false, searchQuery: '', searchResults: [], selectedIndex: 0 }),
      toggleSearch: () => {
        const { isSearchOpen } = get();
        if (isSearchOpen) {
          set({ isSearchOpen: false, searchQuery: '', searchResults: [], selectedIndex: 0 });
        } else {
          set({ isSearchOpen: true, selectedIndex: 0 });
        }
      },
      setSearchQuery: (query) => set({ searchQuery: query, selectedIndex: 0 }),
      setSearchResults: (results) => set({ searchResults: results }),
      setIsSearching: (isSearching) => set({ isSearching }),
      setSelectedIndex: (index) => set({ selectedIndex: index }),

      moveSelectionUp: () => {
        const { selectedIndex, searchResults, recentItems, searchQuery } = get();
        const items = searchQuery ? searchResults : recentItems;
        const maxIndex = items.length - 1;
        set({ selectedIndex: selectedIndex > 0 ? selectedIndex - 1 : maxIndex });
      },

      moveSelectionDown: () => {
        const { selectedIndex, searchResults, recentItems, searchQuery } = get();
        const items = searchQuery ? searchResults : recentItems;
        const maxIndex = items.length - 1;
        set({ selectedIndex: selectedIndex < maxIndex ? selectedIndex + 1 : 0 });
      },

      clearSearch: () => set({ searchQuery: '', searchResults: [], selectedIndex: 0 }),

      // Recent items actions
      addRecentItem: (item) => {
        const { recentItems, maxRecentItems } = get();
        const newItem: RecentItem = {
          ...item,
          visitedAt: getCurrentISOTimestamp(),
        };

        // Remove existing item with same id to avoid duplicates
        const filteredItems = recentItems.filter((i) => i.id !== item.id);
        // Add new item at the beginning and limit to max
        const updatedItems = [newItem, ...filteredItems].slice(0, maxRecentItems);

        set({ recentItems: updatedItems });
      },

      removeRecentItem: (id) => {
        const { recentItems } = get();
        set({ recentItems: recentItems.filter((item) => item.id !== id) });
      },

      clearRecentItems: () => set({ recentItems: [] }),
    }),
    {
      name: 'survey-app-search',
      partialize: (state) => ({
        recentItems: state.recentItems,
      }),
    }
  )
);

// Selector hooks for better performance
export const useSearchOpen = () => useSearchStore((state) => state.isSearchOpen);
export const useSearchQuery = () => useSearchStore((state) => state.searchQuery);
export const useSearchResults = () => useSearchStore((state) => state.searchResults);
export const useRecentItems = () => useSearchStore((state) => state.recentItems);
