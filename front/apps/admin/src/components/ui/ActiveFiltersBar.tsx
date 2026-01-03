import { cn } from '@/lib/utils';
import { Chip, Button } from '@survey/ui-primitives';

/**
 * Represents a single active filter.
 */
export interface ActiveFilter {
  /** Unique key for the filter */
  key: string;
  /** Display label for the filter */
  label: string;
  /** Optional value to display after the label (e.g., "Status: Draft") */
  value?: string;
  /** Callback to remove this filter */
  onRemove: () => void;
}

/**
 * Props for the ActiveFiltersBar component.
 */
interface ActiveFiltersBarProps {
  /** Array of active filters to display */
  filters: ActiveFilter[];
  /** Callback to clear all filters */
  onClearAll?: () => void;
  /** Label shown before filters (default: "Filters:") */
  label?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the component when no filters are active (default: false) */
  showWhenEmpty?: boolean;
}

/**
 * A component that displays active filters as chips with the ability to remove
 * individual filters or clear all filters at once.
 *
 * @example
 * ```tsx
 * const filters: ActiveFilter[] = [
 *   { key: 'status', label: 'Status', value: 'Draft', onRemove: () => setStatus('all') },
 *   { key: 'search', label: 'Search', value: '"test"', onRemove: () => setSearch('') },
 * ];
 *
 * <ActiveFiltersBar
 *   filters={filters}
 *   onClearAll={() => { setStatus('all'); setSearch(''); }}
 * />
 * ```
 */
export function ActiveFiltersBar({ filters, onClearAll, label = 'Filters:', className, showWhenEmpty = false }: ActiveFiltersBarProps) {
  // Don't render if no filters and showWhenEmpty is false
  if (filters.length === 0 && !showWhenEmpty) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {filters.length > 0 && (
        <>
          <span className="text-xs text-on-surface-variant">{label}</span>
          {filters.map((filter) => (
            <Chip key={filter.key} size="sm" variant="filter-selected" onRemove={filter.onRemove}>
              {filter.value ? `${filter.label}: ${filter.value}` : filter.label}
            </Chip>
          ))}
          {onClearAll && filters.length > 1 && (
            <Button variant="text" size="sm" onClick={onClearAll} className="text-xs text-primary hover:underline h-auto py-0 px-1">
              Clear all
            </Button>
          )}
        </>
      )}
    </div>
  );
}
