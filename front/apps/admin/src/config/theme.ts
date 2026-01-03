/**
 * Centralized theme configuration
 * Single source of truth for color palettes and theme modes
 */
import type { ColorPalette, ThemeMode } from '@/stores/themeStore';
import { Sun, Moon, Monitor } from 'lucide-react';

/**
 * Color palette definition
 */
export interface PaletteConfig {
  /** Unique identifier matching ColorPalette type */
  id: ColorPalette;
  /** Translation key for the palette name */
  labelKey: string;
  /** Preview colors: [primary, light/container, dark] */
  colors: [string, string, string];
}

/**
 * Theme mode definition
 */
export interface ThemeModeConfig {
  /** Unique identifier matching ThemeMode type */
  id: ThemeMode;
  /** Translation key for the mode name */
  labelKey: string;
  /** Icon component */
  icon: typeof Sun;
  /** Translation key for the description */
  descKey: string;
}

/**
 * All available color palettes
 * Colors represent: [primary, light variant, dark variant]
 */
export const COLOR_PALETTES: readonly PaletteConfig[] = [
  { id: 'purple', labelKey: 'theme.palette.lavender', colors: ['#7c5cff', '#ede8ff', '#2a1065'] },
  { id: 'blue', labelKey: 'theme.palette.ocean', colors: ['#1976d2', '#d1e4ff', '#001d36'] },
  { id: 'green', labelKey: 'theme.palette.forest', colors: ['#2e7d32', '#d8f5dc', '#002106'] },
  { id: 'orange', labelKey: 'theme.palette.sunset', colors: ['#e65100', '#ffe4cc', '#2d1400'] },
  { id: 'pink', labelKey: 'theme.palette.rose', colors: ['#c2185b', '#ffd6e7', '#3e0018'] },
  { id: 'teal', labelKey: 'theme.palette.aqua', colors: ['#00796b', '#d0f4ef', '#002019'] },
  { id: 'amber', labelKey: 'theme.palette.amber', colors: ['#f59e0b', '#fef3c7', '#451a03'] },
  { id: 'indigo', labelKey: 'theme.palette.indigo', colors: ['#4f46e5', '#e0e7ff', '#1e1b4b'] },
  { id: 'coral', labelKey: 'theme.palette.coral', colors: ['#f97316', '#fff1e6', '#7c2d12'] },
  { id: 'midnight', labelKey: 'theme.palette.midnight', colors: ['#1e3a5f', '#e0f2fe', '#0c1929'] },
  { id: 'monochrome', labelKey: 'theme.palette.monochrome', colors: ['#191919', '#f5f5f5', '#0a0a0a'] },
  { id: 'slate', labelKey: 'theme.palette.slate', colors: ['#475569', '#f1f5f9', '#0f172a'] },
] as const;

/**
 * All available theme modes
 */
export const THEME_MODES: readonly ThemeModeConfig[] = [
  { id: 'light', labelKey: 'theme.mode.light', icon: Sun, descKey: 'theme.mode.lightDesc' },
  { id: 'dark', labelKey: 'theme.mode.dark', icon: Moon, descKey: 'theme.mode.darkDesc' },
  { id: 'system', labelKey: 'theme.mode.system', icon: Monitor, descKey: 'theme.mode.systemDesc' },
] as const;

/**
 * Default theme values
 */
export const DEFAULT_PALETTE: ColorPalette = 'purple';
export const DEFAULT_THEME_MODE: ThemeMode = 'system';

/**
 * Get palette config by ID
 */
export function getPaletteById(id: ColorPalette): PaletteConfig | undefined {
  return COLOR_PALETTES.find((p) => p.id === id);
}

/**
 * Get theme mode config by ID
 */
export function getThemeModeById(id: ThemeMode): ThemeModeConfig | undefined {
  return THEME_MODES.find((m) => m.id === id);
}

/**
 * Get all palette IDs
 */
export function getAllPaletteIds(): ColorPalette[] {
  return COLOR_PALETTES.map((p) => p.id);
}

/**
 * Get all theme mode IDs
 */
export function getAllThemeModeIds(): ThemeMode[] {
  return THEME_MODES.map((m) => m.id);
}
