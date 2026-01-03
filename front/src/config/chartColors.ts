// Centralized Chart Colors Configuration
// Color palettes for charts and data visualization

// ============ Chart Color Palette ============

/**
 * Tailwind CSS classes for chart colors
 * Used in ChoiceChart, RatingChart, and other visualization components
 */
export const CHART_COLORS = ['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-info', 'bg-success', 'bg-warning', 'bg-error'] as const;

/**
 * CSS color values using CSS variables
 * Useful when Tailwind classes aren't applicable
 */
export const CHART_COLOR_VALUES = [
  'hsl(var(--color-primary))',
  'hsl(var(--color-secondary))',
  'hsl(var(--color-tertiary))',
  'hsl(var(--color-info))',
  'hsl(var(--color-success))',
  'hsl(var(--color-warning))',
  'hsl(var(--color-error))',
] as const;

/**
 * Extended palette for charts needing more colors
 */
export const CHART_COLORS_EXTENDED = [...CHART_COLORS, 'bg-primary/70', 'bg-secondary/70', 'bg-tertiary/70', 'bg-info/70', 'bg-success/70'] as const;

// ============ Rating Bar Colors ============

/**
 * Colors for rating distribution bars
 */
export const RATING_BAR_COLORS: Record<number, string> = {
  1: 'bg-error',
  2: 'bg-warning',
  3: 'bg-warning/70',
  4: 'bg-success/70',
  5: 'bg-success',
};

/**
 * Get rating bar color by value
 */
export function getRatingBarColor(rating: number): string {
  return RATING_BAR_COLORS[rating] || 'bg-primary';
}

// ============ Helper Functions ============

/**
 * Get chart color class by index (cycles through colors)
 */
export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

/**
 * Get chart color CSS value by index
 */
export function getChartColorValue(index: number): string {
  return CHART_COLOR_VALUES[index % CHART_COLOR_VALUES.length];
}

/**
 * Get chart color with opacity for primary color scheme
 * Used for pie/bar charts with single color gradient
 */
export function getPrimaryColorWithOpacity(index: number, minOpacity = 0.3): string {
  const opacity = Math.max(minOpacity, 1 - index * 0.15);
  return `hsl(var(--color-primary) / ${opacity})`;
}
