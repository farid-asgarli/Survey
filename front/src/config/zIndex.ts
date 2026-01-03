// Centralized Z-Index Configuration
// Semantic z-index values for layering UI elements

// ============ Z-Index Scale ============

/**
 * Semantic z-index values
 * Use these instead of magic numbers like z-10, z-50, etc.
 */
export const Z_INDEX = {
  /** Below normal content (backgrounds, decorative elements) */
  below: -10,
  /** Base level for content */
  base: 0,
  /** Elevated content (cards, raised elements) */
  raised: 10,
  /** Sticky headers, fixed navigation elements */
  sticky: 20,
  /** Dropdown menus, popovers */
  dropdown: 30,
  /** Overlay backdrops */
  overlay: 40,
  /** Modal dialogs, drawers */
  modal: 50,
  /** Toast notifications */
  toast: 60,
  /** Tooltips (always on top) */
  tooltip: 70,
  /** Maximum - for critical UI elements */
  max: 9999,
} as const;

/**
 * Tailwind z-index classes
 * Maps semantic names to Tailwind classes
 */
export const Z_INDEX_CLASSES = {
  below: '-z-10',
  base: 'z-0',
  raised: 'z-10',
  sticky: 'z-20',
  dropdown: 'z-30',
  overlay: 'z-40',
  modal: 'z-50',
  toast: 'z-60',
  tooltip: 'z-70',
  max: 'z-[9999]',
} as const;

// ============ Common Z-Index Patterns ============

/**
 * Pre-defined z-index combinations for common patterns
 */
export const Z_PATTERNS = {
  /** Background decorative elements */
  backgroundDecoration: Z_INDEX_CLASSES.below,
  /** Page content overlay indicators */
  contentOverlay: Z_INDEX_CLASSES.raised,
  /** Sticky table headers */
  stickyHeader: Z_INDEX_CLASSES.sticky,
  /** Floating action buttons */
  floatingAction: Z_INDEX_CLASSES.sticky,
  /** Dropdown/Select menus */
  selectMenu: Z_INDEX_CLASSES.dropdown,
  /** Dialog backdrop */
  dialogBackdrop: Z_INDEX_CLASSES.overlay,
  /** Dialog content */
  dialogContent: Z_INDEX_CLASSES.modal,
  /** Fullscreen mode */
  fullscreen: Z_INDEX_CLASSES.modal,
  /** Global search overlay */
  globalSearch: Z_INDEX_CLASSES.modal,
} as const;

// ============ Helper Functions ============

/**
 * Get z-index value by semantic name
 */
export function getZIndex(level: keyof typeof Z_INDEX): number {
  return Z_INDEX[level];
}

/**
 * Get z-index Tailwind class by semantic name
 */
export function getZIndexClass(level: keyof typeof Z_INDEX_CLASSES): string {
  return Z_INDEX_CLASSES[level];
}
