import { useMemo } from 'react';

/**
 * Configuration for a filter field in useFilteredList.
 */
export interface FilterFieldConfig<TItem, TValue> {
  /** The key identifying this filter */
  key: string;
  /** Function to extract the filterable value from an item */
  getValue: (item: TItem) => TValue;
  /** Function to check if item matches the filter value */
  matches: (itemValue: TValue, filterValue: TValue) => boolean;
  /** The "all" or default value that means no filtering */
  defaultValue?: TValue;
}

/**
 * Configuration for text search in useFilteredList.
 */
export interface SearchConfig<TItem> {
  /** Fields to search in */
  fields: Array<keyof TItem | ((item: TItem) => string | undefined)>;
  /** Whether to match case-sensitively (default: false) */
  caseSensitive?: boolean;
}

/**
 * Configuration for sorting in useFilteredList.
 */
export interface SortConfig<TItem> {
  /** Sort key */
  key: string;
  /** Sort function */
  compare: (a: TItem, b: TItem) => number;
}

/**
 * Options for the useFilteredList hook.
 */
export interface UseFilteredListOptions<TItem, TFilters extends Record<string, unknown>> {
  /** The items to filter */
  items: TItem[];
  /** Current filter values */
  filters?: TFilters;
  /** Filter field configurations */
  filterConfigs?: FilterFieldConfig<TItem, unknown>[];
  /** Search query */
  searchQuery?: string;
  /** Search configuration */
  searchConfig?: SearchConfig<TItem>;
  /** Sort configuration */
  sortConfig?: SortConfig<TItem>;
  /** Custom sort comparator */
  customSort?: (a: TItem, b: TItem) => number;
}

/**
 * Return type for the useFilteredList hook.
 */
export interface UseFilteredListReturn<TItem> {
  /** Filtered (and optionally sorted) items */
  filteredItems: TItem[];
  /** Total count before filtering */
  totalCount: number;
  /** Filtered count */
  filteredCount: number;
  /** Whether any filters are active */
  hasActiveFilters: boolean;
}

/**
 * A hook that handles client-side filtering, searching, and sorting of lists.
 * Useful when you have small-to-medium datasets that don't need server-side pagination.
 *
 * @example
 * ```tsx
 * const { filteredItems, hasActiveFilters } = useFilteredList({
 *   items: templates,
 *   filters: { category: 'feedback', visibility: 'public' },
 *   filterConfigs: [
 *     {
 *       key: 'category',
 *       getValue: (t) => t.category,
 *       matches: (itemVal, filterVal) => filterVal === 'all' || itemVal === filterVal,
 *       defaultValue: 'all',
 *     },
 *     {
 *       key: 'visibility',
 *       getValue: (t) => t.isPublic,
 *       matches: (isPublic, filter) =>
 *         filter === 'all' ||
 *         (filter === 'public' && isPublic) ||
 *         (filter === 'private' && !isPublic),
 *       defaultValue: 'all',
 *     },
 *   ],
 *   searchQuery: 'feedback',
 *   searchConfig: {
 *     fields: ['name', 'description'],
 *   },
 *   customSort: (a, b) => b.createdAt.localeCompare(a.createdAt),
 * });
 * ```
 */
export function useFilteredList<TItem, TFilters extends Record<string, unknown> = Record<string, unknown>>(
  options: UseFilteredListOptions<TItem, TFilters>
): UseFilteredListReturn<TItem> {
  const { items, filters = {} as TFilters, filterConfigs = [], searchQuery = '', searchConfig, customSort } = options;

  // Determine if any filters are active
  const hasActiveFilters = useMemo(() => {
    // Check if search query is active
    if (searchQuery.trim()) return true;

    // Check if any filter values differ from their defaults
    for (const config of filterConfigs) {
      const currentValue = filters[config.key as keyof TFilters];
      const defaultValue = config.defaultValue;

      if (currentValue !== undefined && currentValue !== defaultValue) {
        return true;
      }
    }

    return false;
  }, [filters, filterConfigs, searchQuery]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Apply filter configs
    for (const config of filterConfigs) {
      const filterValue = filters[config.key as keyof TFilters];

      // Skip if filter is at default value
      if (filterValue === undefined || filterValue === config.defaultValue) continue;

      result = result.filter((item) => {
        const itemValue = config.getValue(item);
        return config.matches(itemValue, filterValue);
      });
    }

    // Apply search
    if (searchQuery.trim() && searchConfig) {
      const query = searchConfig.caseSensitive ? searchQuery.trim() : searchQuery.trim().toLowerCase();

      result = result.filter((item) => {
        return searchConfig.fields.some((field) => {
          let value: string | undefined;

          if (typeof field === 'function') {
            value = field(item);
          } else {
            const fieldValue = item[field];
            value = typeof fieldValue === 'string' ? fieldValue : undefined;
          }

          if (!value) return false;

          const searchValue = searchConfig.caseSensitive ? value : value.toLowerCase();
          return searchValue.includes(query);
        });
      });
    }

    // Apply sorting
    if (customSort) {
      result.sort(customSort);
    }

    return result;
  }, [items, filters, filterConfigs, searchQuery, searchConfig, customSort]);

  return {
    filteredItems,
    totalCount: items.length,
    filteredCount: filteredItems.length,
    hasActiveFilters,
  };
}

/**
 * Common filter matchers for reuse.
 */
export const FilterMatchers = {
  /**
   * Matches if filter is 'all' or equals the item value.
   */
  equalOrAll: <T>(itemValue: T, filterValue: T | 'all'): boolean => {
    return filterValue === 'all' || itemValue === filterValue;
  },

  /**
   * Matches if filter is 'all' or boolean matches.
   */
  booleanFilter: (itemValue: boolean, filterValue: 'all' | 'true' | 'false'): boolean => {
    if (filterValue === 'all') return true;
    return filterValue === 'true' ? itemValue : !itemValue;
  },

  /**
   * Matches if item value is included in filter array.
   */
  includesAny: <T>(itemValue: T, filterValues: T[] | 'all'): boolean => {
    if (filterValues === 'all') return true;
    return filterValues.includes(itemValue);
  },

  /**
   * Matches dates within a range.
   */
  dateRange: (itemDate: string | Date, range: { from?: Date; to?: Date }): boolean => {
    const date = typeof itemDate === 'string' ? new Date(itemDate) : itemDate;

    if (range.from && date < range.from) return false;
    if (range.to && date > range.to) return false;

    return true;
  },
};

/**
 * Common sort comparators for reuse.
 */
export const SortComparators = {
  /**
   * Sort by date descending (newest first).
   */
  newestFirst: <T extends { createdAt: string }>(a: T, b: T): number => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  },

  /**
   * Sort by date ascending (oldest first).
   */
  oldestFirst: <T extends { createdAt: string }>(a: T, b: T): number => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  },

  /**
   * Sort by name alphabetically.
   */
  alphabetical: <T extends { name: string }>(a: T, b: T): number => {
    return a.name.localeCompare(b.name);
  },

  /**
   * Sort by updated date descending (most recently updated first).
   */
  recentlyUpdated: <T extends { updatedAt?: string }>(a: T, b: T): number => {
    const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return bTime - aTime;
  },

  /**
   * Sort with priority items first (e.g., default, featured).
   */
  priorityFirst: <T>(getPriority: (item: T) => boolean) => {
    return (a: T, b: T): number => {
      const aPriority = getPriority(a);
      const bPriority = getPriority(b);

      if (aPriority && !bPriority) return -1;
      if (!aPriority && bPriority) return 1;
      return 0;
    };
  },

  /**
   * Combine multiple sort comparators.
   */
  combine: <T>(...comparators: Array<(a: T, b: T) => number>) => {
    return (a: T, b: T): number => {
      for (const comparator of comparators) {
        const result = comparator(a, b);
        if (result !== 0) return result;
      }
      return 0;
    };
  },
};
