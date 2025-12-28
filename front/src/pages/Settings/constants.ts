import type { ColorPalette, ThemeMode } from '@/stores/themeStore';
import { Sun, Moon, Monitor } from 'lucide-react';

// Color palette options with translation keys
export const COLOR_PALETTES: { id: ColorPalette; labelKey: string; colors: string[] }[] = [
  { id: 'purple', labelKey: 'settings.appearance.lavender', colors: ['#7c5cff', '#ede8ff', '#2a1065'] },
  { id: 'blue', labelKey: 'settings.appearance.ocean', colors: ['#1976d2', '#d1e4ff', '#001d36'] },
  { id: 'green', labelKey: 'settings.appearance.forest', colors: ['#2e7d32', '#d8f5dc', '#002106'] },
  { id: 'orange', labelKey: 'settings.appearance.sunset', colors: ['#e65100', '#ffe4cc', '#2d1400'] },
  { id: 'pink', labelKey: 'settings.appearance.rose', colors: ['#c2185b', '#ffd6e7', '#3e0018'] },
  { id: 'teal', labelKey: 'settings.appearance.aqua', colors: ['#00796b', '#d0f4ef', '#002019'] },
];

// Theme mode options with translation keys
export const THEME_MODES: { id: ThemeMode; labelKey: string; icon: typeof Sun; descKey: string }[] = [
  { id: 'light', labelKey: 'settings.appearance.lightMode', icon: Sun, descKey: 'settings.appearance.alwaysLight' },
  { id: 'dark', labelKey: 'settings.appearance.darkMode', icon: Moon, descKey: 'settings.appearance.alwaysDark' },
  { id: 'system', labelKey: 'settings.appearance.systemMode', icon: Monitor, descKey: 'settings.appearance.matchSystem' },
];
