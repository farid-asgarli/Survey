import { useState, useMemo, useCallback } from 'react';
import type { ViewMode } from '@/components/ui/ViewModeToggle';
import type { ActiveFilter } from '@/components/ui/ActiveFiltersBar';

/**
 * Configuration for a filter field used in list pages.
 */
export interface FilterConfig<T> {
  /** The key identifying this filter */
  key: string;
  /** Default value for this filter */
  defaultValue: T;
  /** Display label for the filter chip */
  label: string;
  /** Function to get the display value for the chip (e.g., format the value) */
  formatValue?: (value: T) => string;
  /** Function to determine if the filter is "active" (not at default) */
  isActive?: (value: T) => boolean;
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
}

/**
 * Return type for the useListPage hook.
 */
export interface UseListPageReturn<TFilters extends Record<string, unknown>> {
  // View mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;

  // Filters
  filters: TFilters;
  setFilter: <K extends keyof TFilters>(key: K, value: TFilters[K]) => void;
  setFilters: (filters: Partial<TFilters>) => void;
  clearFilters: () => void;
  clearAllFilters: () => void;

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
export function useListPage<TFilters extends Record<string, unknown>>(
  options: UseListPageOptions<TFilters> = {}
): UseListPageReturn<TFilters> {
  const { initialViewMode = 'grid', initialSearch = '', filterConfigs = [], initialFilters = {} as Partial<TFilters> } = options;

  // Build initial filters from configs and initial values
  const defaultFilters = useMemo(() => {
    const defaults = {} as TFilters;
    filterConfigs.forEach((config) => {
      (defaults as Record<string, unknown>)[config.key] = config.defaultValue;
    });
    return { ...defaults, ...initialFilters } as TFilters;
  }, [filterConfigs, initialFilters]);

  // State
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [filters, setFiltersState] = useState<TFilters>(defaultFilters);

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
  }, [defaultFilters]);

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
    filterConfigs.forEach((config) => {
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
  }, [searchQuery, filters, filterConfigs, clearSearch, setFilter]);

  // Check if any filters are active
  const hasActiveFilters = activeFilters.length > 0;

  // Build query params from current state
  const buildQueryParams = useCallback((): Record<string, unknown> => {
    const params: Record<string, unknown> = {};

    if (searchQuery.trim()) {
      params.search = searchQuery;
    }

    Object.entries(filters).forEach(([key, value]) => {
      const config = filterConfigs.find((c) => c.key === key);
      const isActive = config?.isActive ? config.isActive(value) : value !== config?.defaultValue;

      if (isActive && value !== 'all' && value !== undefined && value !== null) {
        params[key] = value;
      }
    });

    return params;
  }, [searchQuery, filters, filterConfigs]);

  return {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    clearSearch,
    filters,
    setFilter,
    setFilters,
    clearFilters,
    clearAllFilters,
    activeFilters,
    hasActiveFilters,
    buildQueryParams,
  };
}
