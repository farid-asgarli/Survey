// Centralized Animation & Timing Configuration
// Animation durations, debounce timings, and transition values

// ============ Animation Durations (Tailwind) ============

/**
 * Semantic animation duration classes
 * Maps purpose to Tailwind duration classes
 */
export const ANIMATION_DURATIONS = {
  /** Micro-interactions (hover states, focus rings) */
  instant: 'duration-75',
  /** Quick transitions (button states, toggles) */
  fast: 'duration-150',
  /** Standard transitions (most UI elements) */
  normal: 'duration-200',
  /** Smooth transitions (panels, drawers) */
  smooth: 'duration-300',
  /** Emphasized transitions (page transitions, modals) */
  slow: 'duration-500',
} as const;

/**
 * Animation duration values in milliseconds
 * For use with setTimeout, transitions, etc.
 */
export const ANIMATION_DURATION_MS = {
  instant: 75,
  fast: 150,
  normal: 200,
  smooth: 300,
  slow: 500,
} as const;

// ============ Timing Constants (ms) ============

/**
 * Debounce timing constants
 */
export const DEBOUNCE_TIMING = {
  /** Fast debounce for search inputs */
  search: 300,
  /** Standard debounce for form inputs */
  input: 400,
  /** Slower debounce for expensive operations */
  expensive: 500,
} as const;

/**
 * Timeout durations for UI feedback
 */
export const FEEDBACK_TIMING = {
  /** Duration to show "copied" feedback */
  copyFeedback: 2000,
  /** Duration to show toast notifications */
  toast: 3000,
  /** Duration for success messages */
  successMessage: 2000,
  /** Delay before focusing an input after animation */
  focusDelay: 100,
} as const;

/**
 * Auto-save intervals
 */
export const AUTO_SAVE_TIMING = {
  /** Quick auto-save for critical data */
  quick: 10000, // 10 seconds
  /** Standard auto-save interval */
  normal: 30000, // 30 seconds
  /** Relaxed auto-save for less critical data */
  relaxed: 60000, // 1 minute
} as const;

// ============ Transition Classes ============

/**
 * Common transition combinations
 */
export const TRANSITIONS = {
  /** All properties, normal speed */
  all: 'transition-all duration-200',
  /** Colors only, fast */
  colors: 'transition-colors duration-150',
  /** Transform only, smooth */
  transform: 'transition-transform duration-300',
  /** Opacity only, fast */
  opacity: 'transition-opacity duration-150',
  /** Combined for interactive elements */
  interactive: 'transition-all duration-200 ease-out',
} as const;

// ============ Helper Functions ============

/**
 * Get debounced function timing
 */
export function getDebounceMs(type: keyof typeof DEBOUNCE_TIMING = 'input'): number {
  return DEBOUNCE_TIMING[type];
}

/**
 * Get animation duration in ms
 */
export function getAnimationMs(type: keyof typeof ANIMATION_DURATION_MS = 'normal'): number {
  return ANIMATION_DURATION_MS[type];
}
