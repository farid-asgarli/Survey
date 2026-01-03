import { useState, useMemo, useCallback } from 'react';
import type { ViewMode, ActiveFilter } from '@/components/ui';
import type { FilterConfig } from '@/types/list-page';
import { useDebounce } from './useDebounce';

// Re-export for backwards compatibility
export type { FilterConfig } from '@/types/list-page';

/**
 * Pagination state for list pages.
 */
export interface PaginationState {
  /** Current page (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
}

/**
 * Options for the useListPage hook.
 */
export interface UseListPageOptions<TFilters extends Record<string, unknown>> {
  /** Initial view mode */
  initialViewMode?: ViewMode;
  /** Initial search query */
  initialSearch?: string;
  /** Filter configurations */
  filterConfigs?: FilterConfig<unknown>[];
  /** Initial filter values */
  initialFilters?: Partial<TFilters>;
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
 * Return type for the useListPage hook.
 */
export interface UseListPageReturn<TFilters extends Record<string, unknown>> {
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

  // Helper to build query params from current state
  buildQueryParams: () => Record<string, unknown>;
}

/**
 * A custom hook that encapsulates common list page logic including:
 * - View mode toggling (grid/list)
 * - Search query management
 * - Filter state management
 * - Active filters tracking for display
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
 *   clearAllFilters
 * } = useListPage<MyFilters>({
 *   initialViewMode: 'grid',
 *   initialFilters: { status: 'all', category: 'all' },
 *   filterConfigs: [
 *     { key: 'status', defaultValue: 'all', label: 'Status' },
 *     { key: 'category', defaultValue: 'all', label: 'Category' },
 *   ],
 * });
 * ```
 */
export function useListPage<TFilters extends Record<string, unknown>>(options: UseListPageOptions<TFilters> = {}): UseListPageReturn<TFilters> {
  const {
    initialViewMode = 'grid',
    initialSearch = '',
    filterConfigs = [],
    initialFilters = {} as Partial<TFilters>,
    searchDebounceMs = 300,
    initialPage = 1,
    initialPageSize = 10,
    enablePagination = false,
  } = options;

  // Memoize filterConfigs - use structural key as cache invalidation hint
  // but still include filterConfigs for Compiler compliance
  const filterConfigsKey = filterConfigs.map((c) => c.key).join(',');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableFilterConfigs = useMemo(() => filterConfigs, [filterConfigsKey, filterConfigs]);

  // Memoize initial filters - use structural key as cache invalidation hint
  const initialFiltersKey = Object.keys(initialFilters).sort().join(',');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableInitialFilters = useMemo(() => initialFilters, [initialFiltersKey, initialFilters]);

  // Build initial filters from configs and initial values
  const defaultFilters = useMemo(() => {
    const defaults = {} as TFilters;
    stableFilterConfigs.forEach((config) => {
      (defaults as Record<string, unknown>)[config.key] = config.defaultValue;
    });
    return { ...defaults, ...stableInitialFilters } as TFilters;
  }, [stableFilterConfigs, stableInitialFilters]);

  // State
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [filters, setFiltersState] = useState<TFilters>(defaultFilters);
  const [pagination, setPagination] = useState<PaginationState>({
    page: initialPage,
    pageSize: initialPageSize,
  });

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, searchDebounceMs);
  const isSearchPending = searchQuery !== debouncedSearchQuery;

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Set single filter
  const setFilter = useCallback(<K extends keyof TFilters>(key: K, value: TFilters[K]) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Set multiple filters
  const setFilters = useCallback((newFilters: Partial<TFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Clear all filters to defaults
  const clearFilters = useCallback(() => {
    setFiltersState(defaultFilters);
  }, [defaultFilters]);

  // Clear everything (filters + search)
  const clearAllFilters = useCallback(() => {
    setFiltersState(defaultFilters);
    setSearchQuery('');
    // Reset pagination when clearing all filters
    if (enablePagination) {
      setPagination((prev) => ({ page: initialPage, pageSize: prev.pageSize }));
    }
  }, [defaultFilters, enablePagination, initialPage]);

  // Pagination handlers
  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page: Math.max(1, page) }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination({ page: 1, pageSize: Math.max(1, pageSize) });
  }, []);

  const resetPagination = useCallback(() => {
    setPagination({ page: initialPage, pageSize: initialPageSize });
  }, [initialPage, initialPageSize]);

  // Track a "version" of filters/search to reset pagination when they change
  // This is React 19 Compiler compliant - no setState in effect
  const filterSearchVersion = useMemo(() => JSON.stringify({ search: debouncedSearchQuery, filters }), [debouncedSearchQuery, filters]);

  // Store previous version to detect changes and reset page
  const [lastFilterSearchVersion, setLastFilterSearchVersion] = useState(filterSearchVersion);

  // If filter/search changed and we're not on page 1, reset page
  // This runs synchronously during render which is the React 19 pattern
  if (enablePagination && filterSearchVersion !== lastFilterSearchVersion) {
    setLastFilterSearchVersion(filterSearchVersion);
    if (pagination.page !== 1) {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  }

  // Build active filters for display
  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const active: ActiveFilter[] = [];

    // Add search as a filter if present
    if (searchQuery.trim()) {
      active.push({
        key: 'search',
        label: 'Search',
        value: `"${searchQuery}"`,
        onRemove: clearSearch,
      });
    }

    // Add configured filters that are active
    stableFilterConfigs.forEach((config) => {
      const currentValue = filters[config.key as keyof TFilters];
      const isActive = config.isActive ? config.isActive(currentValue) : currentValue !== config.defaultValue;

      if (isActive) {
        const displayValue = config.formatValue ? config.formatValue(currentValue) : String(currentValue);

        active.push({
          key: config.key,
          label: config.label,
          value: displayValue,
          onRemove: () => setFilter(config.key as keyof TFilters, config.defaultValue as TFilters[keyof TFilters]),
        });
      }
    });

    return active;
  }, [searchQuery, filters, stableFilterConfigs, clearSearch, setFilter]);

  // Check if any filters are active
  const hasActiveFilters = activeFilters.length > 0;

  // Build query params from current state
  const buildQueryParams = useCallback((): Record<string, unknown> => {
    const params: Record<string, unknown> = {};

    // Use debounced search for query params (actual API calls)
    if (debouncedSearchQuery.trim()) {
      params.search = debouncedSearchQuery;
    }

    Object.entries(filters).forEach(([key, value]) => {
      const config = stableFilterConfigs.find((c) => c.key === key);
      const isActive = config?.isActive ? config.isActive(value) : value !== config?.defaultValue;

      if (isActive && value !== 'all' && value !== undefined && value !== null) {
        params[key] = value;
      }
    });

    // Include pagination params if enabled
    if (enablePagination) {
      params.page = pagination.page;
      params.pageSize = pagination.pageSize;
    }

    return params;
  }, [debouncedSearchQuery, filters, stableFilterConfigs, enablePagination, pagination]);

  return {
    viewMode,
    setViewMode,
    searchQuery,
    debouncedSearchQuery,
    isSearchPending,
    setSearchQuery,
    clearSearch,
    filters,
    setFilter,
    setFilters,
    clearFilters,
    clearAllFilters,
    pagination,
    setPage,
    setPageSize,
    resetPagination,
    activeFilters,
    hasActiveFilters,
    buildQueryParams,
  };
}
