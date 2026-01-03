// Centralized Accessibility Configuration
// Font size scales and accessibility-related options

import type { FontSizeScale } from '@/types';

// ============ Font Size Scale Configuration ============

/**
 * Font size scale mappings (in rem)
 * Used by preferencesStore and accessibility components
 */
export const FONT_SIZE_SCALES: Record<FontSizeScale, number> = {
  small: 0.875,
  medium: 1,
  large: 1.125,
  'extra-large': 1.25,
};

/**
 * Font size display options for settings UI
 */
export interface FontSizeOption {
  value: FontSizeScale;
  labelKey: string;
  preview: string;
}

export const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { value: 'small', labelKey: 'settings.accessibility.fontSizes.small', preview: '14px' },
  { value: 'medium', labelKey: 'settings.accessibility.fontSizes.medium', preview: '16px' },
  { value: 'large', labelKey: 'settings.accessibility.fontSizes.large', preview: '18px' },
  { value: 'extra-large', labelKey: 'settings.accessibility.fontSizes.extraLarge', preview: '20px' },
];

// ============ Helper Functions ============

/**
 * Get font size scale value (in rem) for a given scale key
 */
export function getFontSizeScale(scale: FontSizeScale): number {
  return FONT_SIZE_SCALES[scale];
}

/**
 * Get font size option by value
 */
export function getFontSizeOption(value: FontSizeScale): FontSizeOption | undefined {
  return FONT_SIZE_OPTIONS.find((option) => option.value === value);
}

/**
 * Get the actual pixel value for a font size scale (assuming 16px base)
 */
export function getFontSizeInPixels(scale: FontSizeScale, baseFontSize = 16): number {
  return FONT_SIZE_SCALES[scale] * baseFontSize;
}
