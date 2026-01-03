/**
 * Shared types for list page hooks (useListPage, useFilteredList, useListPageState)
 *
 * This file centralizes type definitions to avoid duplication across hooks.
 */

// ============ UI Filter Config (for display/ActiveFiltersBar) ============

/**
 * Configuration for a filter's UI representation in list pages.
 * Used to generate active filter chips and manage filter state.
 */
export interface FilterConfig<TValue = unknown> {
  /** Unique key identifying this filter */
  key: string;
  /** Default/initial value for this filter */
  defaultValue: TValue;
  /** Display label for the filter chip */
  label: string;
  /** Function to format the value for display (e.g., "Status: Active") */
  formatValue?: (value: TValue) => string;
  /** Function to determine if the filter is "active" (not at default). Defaults to !== defaultValue */
  isActive?: (value: TValue) => boolean;
}

// ============ Data Filter Config (for client-side filtering) ============

/**
 * Configuration for a filter field used in client-side filtering.
 * Defines how to extract and match values from items.
 */
export interface FilterFieldConfig<TItem, TValue = unknown> {
  /** Unique key identifying this filter (should match FilterConfig.key) */
  key: string;
  /** Function to extract the filterable value from an item */
  getValue: (item: TItem) => TValue;
  /** Function to check if item matches the filter value */
  matches: (itemValue: TValue, filterValue: TValue) => boolean;
  /** The "all" or default value that means no filtering */
  defaultValue?: TValue;
}

/**
 * Extended filter configuration that combines UI and data filtering configs.
 * Used when you need both UI representation AND client-side filtering.
 */
export interface ExtendedFilterConfig<TItem, TValue = unknown> extends FilterConfig<TValue> {
  /** Function to extract the filterable value from an item (for client-side filtering) */
  getValue?: (item: TItem) => unknown;
  /** Function to check if item matches the filter value (for client-side filtering) */
  matches?: (itemValue: unknown, filterValue: TValue) => boolean;
}

// ============ Search Config ============

/**
 * Configuration for text search functionality.
 */
export interface SearchConfig<TItem> {
  /** Fields to search in - can be property keys or getter functions */
  fields: Array<keyof TItem | ((item: TItem) => string | undefined)>;
  /** Whether to match case-sensitively (default: false) */
  caseSensitive?: boolean;
}

// ============ Sort Config ============

/**
 * Configuration for sorting.
 */
export interface SortConfig<TItem> {
  /** Sort key identifier */
  key: string;
  /** Comparison function */
  compare: (a: TItem, b: TItem) => number;
}

// ============ Common Filter Types ============

/**
 * Base type for filter state objects.
 */
export type FilterState = Record<string, unknown>;

/**
 * Common filter value types.
 */
export type FilterValue = string | number | boolean | string[] | null | undefined;
