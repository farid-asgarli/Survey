import { useMemo } from 'react';
import type { ViewMode, ActiveFilter } from '@/components/ui';
import type { ExtendedFilterConfig, FilterConfig, FilterFieldConfig, SearchConfig } from '@/types/list-page';
import { useListPage, type PaginationState } from './useListPage';
import { useFilteredList } from './useFilteredList';

// Re-export for backwards compatibility
export type { ExtendedFilterConfig } from '@/types/list-page';
export type { PaginationState } from './useListPage';

/**
 * Options for the useListPageState hook.
 */
export interface UseListPageStateOptions<TItem, TFilters extends Record<string, unknown>> {
  /** Initial view mode */
  initialViewMode?: ViewMode;
  /** Initial search query */
  initialSearch?: string;
  /** Initial filter values */
  initialFilters: TFilters;
  /** Extended filter configurations */
  filterConfigs: ExtendedFilterConfig<TItem, unknown>[];
  /** Items to filter (optional, for client-side filtering) */
  items?: TItem[];
  /** Search configuration for client-side filtering */
  searchConfig?: SearchConfig<TItem>;
  /** Custom sort function */
  customSort?: (a: TItem, b: TItem) => number;
  /** Debounce delay for search query in milliseconds (default: 300ms, set to 0 to disable) */
  searchDebounceMs?: number;
  /** Initial page number (1-indexed, default: 1) */
  initialPage?: number;
  /** Initial page size (default: 10) */
  initialPageSize?: number;
  /** Whether to enable pagination (default: false) */
  enablePagination?: boolean;
}

/**
 * Return type for the useListPageState hook.
 */
export interface UseListPageStateReturn<TItem, TFilters extends Record<string, unknown>> {
  // View mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Search
  /** The immediate search query (for input display) */
  searchQuery: string;
  /** The debounced search query (for filtering/API calls) */
  debouncedSearchQuery: string;
  /** Whether search is pending debounce */
  isSearchPending: boolean;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;

  // Filters
  filters: TFilters;
  setFilter: <K extends keyof TFilters>(key: K, value: TFilters[K]) => void;
  setFilters: (filters: Partial<TFilters>) => void;
  clearFilters: () => void;
  clearAllFilters: () => void;

  // Pagination
  pagination: PaginationState;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetPagination: () => void;

  // Active filters for display
  activeFilters: ActiveFilter[];
  hasActiveFilters: boolean;

  // Client-side filtered items (if items were provided)
  filteredItems: TItem[];
  totalCount: number;
  filteredCount: number;

  // Helper to build query params from current state
  buildQueryParams: () => Record<string, unknown>;

  // Empty state helpers
  emptyStateProps: {
    hasActiveFilters: boolean;
    onClearFilters: () => void;
  };
}

/**
 * A comprehensive hook that combines useListPage and useFilteredList for
 * managing all common list page state including view mode, search, filters,
 * and client-side filtering.
 *
 * This hook reduces boilerplate by combining multiple concerns into one.
 *
 * @example
 * ```tsx
 * type MyFilters = { status: 'all' | 'active' | 'inactive'; category: string };
 *
 * const {
 *   viewMode, setViewMode,
 *   searchQuery, setSearchQuery,
 *   filters, setFilter,
 *   activeFilters, hasActiveFilters,
 *   filteredItems,
 *   emptyStateProps,
 * } = useListPageState<MyItem, MyFilters>({
 *   initialFilters: { status: 'all', category: 'all' },
 *   filterConfigs: [
 *     {
 *       key: 'status',
 *       defaultValue: 'all',
 *       label: 'Status',
 *       getValue: (item) => item.isActive ? 'active' : 'inactive',
 *       matches: (value, filter) => filter === 'all' || value === filter,
 *     },
 *   ],
 *   items: myItems,
 *   searchConfig: { fields: ['name', 'description'] },
 * });
 * ```
 */
export function useListPageState<TItem, TFilters extends Record<string, unknown>>(
  options: UseListPageStateOptions<TItem, TFilters>
): UseListPageStateReturn<TItem, TFilters> {
  const {
    initialViewMode = 'grid',
    initialSearch = '',
    initialFilters,
    filterConfigs,
    items = [],
    searchConfig,
    customSort,
    searchDebounceMs = 300,
    initialPage = 1,
    initialPageSize = 10,
    enablePagination = false,
  } = options;

  // Convert extended configs to base FilterConfig for useListPage
  const listPageFilterConfigs: FilterConfig<unknown>[] = filterConfigs.map((config) => ({
    key: config.key,
    defaultValue: config.defaultValue,
    label: config.label,
    formatValue: config.formatValue,
    isActive: config.isActive,
  }));

  // Use the base list page hook
  const listPage = useListPage<TFilters>({
    initialViewMode,
    initialSearch,
    initialFilters,
    filterConfigs: listPageFilterConfigs,
    searchDebounceMs,
    initialPage,
    initialPageSize,
    enablePagination,
  });

  // Convert extended configs to FilterFieldConfig for useFilteredList
  const filterFieldConfigs: FilterFieldConfig<TItem, unknown>[] = filterConfigs
    .filter((config) => config.getValue && config.matches)
    .map((config) => ({
      key: config.key,
      getValue: config.getValue!,
      matches: config.matches!,
      defaultValue: config.defaultValue,
    }));

  // Use the filtered list hook for client-side filtering
  // Note: We use listPage.hasActiveFilters instead of useFilteredList's hasActiveFilters
  // since listPage already handles the complete filter state including search
  // Use debounced search query for filtering to avoid expensive re-computations during typing
  const { filteredItems, totalCount, filteredCount } = useFilteredList<TItem, TFilters>({
    items,
    filters: listPage.filters,
    filterConfigs: filterFieldConfigs,
    searchQuery: listPage.debouncedSearchQuery,
    searchConfig,
    customSort,
  });

  // Empty state props helper
  const emptyStateProps = useMemo(
    () => ({
      hasActiveFilters: listPage.hasActiveFilters,
      onClearFilters: listPage.clearAllFilters,
    }),
    [listPage.hasActiveFilters, listPage.clearAllFilters]
  );

  return {
    // View mode
    viewMode: listPage.viewMode,
    setViewMode: listPage.setViewMode,

    // Search
    searchQuery: listPage.searchQuery,
    debouncedSearchQuery: listPage.debouncedSearchQuery,
    isSearchPending: listPage.isSearchPending,
    setSearchQuery: listPage.setSearchQuery,
    clearSearch: listPage.clearSearch,

    // Filters
    filters: listPage.filters,
    setFilter: listPage.setFilter,
    setFilters: listPage.setFilters,
    clearFilters: listPage.clearFilters,
    clearAllFilters: listPage.clearAllFilters,

    // Pagination
    pagination: listPage.pagination,
    setPage: listPage.setPage,
    setPageSize: listPage.setPageSize,
    resetPagination: listPage.resetPagination,

    // Active filters
    activeFilters: listPage.activeFilters,
    // Use listPage.hasActiveFilters as primary source since it includes search
    // The useFilteredList hasActiveFilters is for data filtering which is redundant here
    hasActiveFilters: listPage.hasActiveFilters,

    // Filtered items
    filteredItems,
    totalCount,
    filteredCount,

    // Build query params
    buildQueryParams: listPage.buildQueryParams,

    // Empty state helpers
    emptyStateProps,
  };
}
