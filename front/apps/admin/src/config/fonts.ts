// Centralized Font Configuration
// Font families available in the theme editor (matches fonts loaded in index.css)

// ============ Types ============
export interface FontOption {
  name: string;
  value: string;
  category: 'Sans Serif' | 'Serif' | 'Display' | 'Monospace';
}

// ============ Font Options ============
// These fonts must be loaded in index.css or via Google Fonts
export const FONT_OPTIONS: FontOption[] = [
  // Sans Serif
  { name: 'Inter', value: 'Inter, sans-serif', category: 'Sans Serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif', category: 'Sans Serif' },
  { name: 'Lato', value: 'Lato, sans-serif', category: 'Sans Serif' },
  { name: 'DM Sans', value: '"DM Sans", sans-serif', category: 'Sans Serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif', category: 'Sans Serif' },
  { name: 'Open Sans', value: '"Open Sans", sans-serif', category: 'Sans Serif' },
  { name: 'Outfit', value: 'Outfit, sans-serif', category: 'Sans Serif' },
  { name: 'Plus Jakarta Sans', value: '"Plus Jakarta Sans", sans-serif', category: 'Sans Serif' },
  // Serif
  { name: 'Merriweather', value: 'Merriweather, serif', category: 'Serif' },
  { name: 'Playfair Display', value: '"Playfair Display", serif', category: 'Serif' },
];

// ============ Theme Editor Options ============

// Color presets for theme editor
export interface ColorPreset {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  { name: 'Violet', primary: '#6750a4', secondary: '#625b71', accent: '#eaddff', background: '#fef7ff', surface: '#ffffff', text: '#1d1b20' },
  { name: 'Ocean', primary: '#1976d2', secondary: '#455a64', accent: '#bbdefb', background: '#f5f9ff', surface: '#ffffff', text: '#1e293b' },
  { name: 'Forest', primary: '#2e7d32', secondary: '#558b2f', accent: '#c8e6c9', background: '#f1f8e9', surface: '#ffffff', text: '#1b5e20' },
  { name: 'Sunset', primary: '#f57c00', secondary: '#e64a19', accent: '#ffe0b2', background: '#fff3e0', surface: '#ffffff', text: '#4a2c00' },
  { name: 'Rose', primary: '#c2185b', secondary: '#7b1fa2', accent: '#f8bbd9', background: '#fce4ec', surface: '#ffffff', text: '#4a0e2b' },
  { name: 'Slate', primary: '#475569', secondary: '#64748b', accent: '#e2e8f0', background: '#f1f5f9', surface: '#ffffff', text: '#1e293b' },
  { name: 'Teal', primary: '#0d9488', secondary: '#0891b2', accent: '#99f6e4', background: '#f0fdfa', surface: '#ffffff', text: '#134e4a' },
  { name: 'Amber', primary: '#d97706', secondary: '#b45309', accent: '#fde68a', background: '#fffbeb', surface: '#ffffff', text: '#451a03' },
];

// Corner radius options
export interface CornerOption {
  name: string;
  value: string;
  preview: string;
}

export const CORNER_OPTIONS: CornerOption[] = [
  { name: 'Sharp', value: '0px', preview: 'rounded-none' },
  { name: 'Subtle', value: '4px', preview: 'rounded' },
  { name: 'Rounded', value: '12px', preview: 'rounded-xl' },
  { name: 'Smooth', value: '20px', preview: 'rounded-3xl' },
  { name: 'Pill', value: '9999px', preview: 'rounded-full' },
];

// Spacing options
export interface SpacingOption {
  name: string;
  value: string;
}

export const SPACING_OPTIONS: SpacingOption[] = [
  { name: 'Compact', value: 'compact' },
  { name: 'Normal', value: 'normal' },
  { name: 'Relaxed', value: 'relaxed' },
  { name: 'Spacious', value: 'spacious' },
];

// Container width options
export interface WidthOption {
  name: string;
  value: string;
  description: string;
}

export const WIDTH_OPTIONS: WidthOption[] = [
  { name: 'Narrow', value: '600px', description: 'Best for mobile' },
  { name: 'Medium', value: '800px', description: 'Balanced' },
  { name: 'Wide', value: '1000px', description: 'Desktop first' },
  { name: 'Full', value: '100%', description: 'Edge to edge' },
];

// ============ Helper Functions ============

/**
 * Get font options by category
 */
export function getFontsByCategory(category: FontOption['category']): FontOption[] {
  return FONT_OPTIONS.filter((font) => font.category === category);
}

/**
 * Get font option by value
 */
export function getFontByValue(value: string): FontOption | undefined {
  return FONT_OPTIONS.find((font) => font.value === value);
}

/**
 * Get default font
 */
export function getDefaultFont(): FontOption {
  return FONT_OPTIONS[0]; // Inter
}
