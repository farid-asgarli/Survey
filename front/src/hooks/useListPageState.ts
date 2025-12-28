import { useMemo } from 'react';
import type { ViewMode } from '@/components/ui/ViewModeToggle';
import type { ActiveFilter } from '@/components/ui/ActiveFiltersBar';
import { useListPage, type FilterConfig } from './useListPage';
import { useFilteredList, type FilterFieldConfig, type SearchConfig } from './useFilteredList';

/**
 * Extended filter configuration that combines useListPage and useFilteredList configs.
 */
export interface ExtendedFilterConfig<TItem, TFilterValue = unknown> extends FilterConfig<TFilterValue> {
  /** Function to extract the filterable value from an item (for client-side filtering) */
  getValue?: (item: TItem) => unknown;
  /** Function to check if item matches the filter value (for client-side filtering) */
  matches?: (itemValue: unknown, filterValue: TFilterValue) => boolean;
}

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
}

/**
 * Return type for the useListPageState hook.
 */
export interface UseListPageStateReturn<TItem, TFilters extends Record<string, unknown>> {
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
  const { initialViewMode = 'grid', initialSearch = '', initialFilters, filterConfigs, items = [], searchConfig, customSort } = options;

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
  const { filteredItems, totalCount, filteredCount, hasActiveFilters } = useFilteredList<TItem, TFilters>({
    items,
    filters: listPage.filters,
    filterConfigs: filterFieldConfigs,
    searchQuery: listPage.searchQuery,
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
    setSearchQuery: listPage.setSearchQuery,
    clearSearch: listPage.clearSearch,

    // Filters
    filters: listPage.filters,
    setFilter: listPage.setFilter,
    setFilters: listPage.setFilters,
    clearFilters: listPage.clearFilters,
    clearAllFilters: listPage.clearAllFilters,

    // Active filters
    activeFilters: listPage.activeFilters,
    hasActiveFilters: listPage.hasActiveFilters || hasActiveFilters,

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
