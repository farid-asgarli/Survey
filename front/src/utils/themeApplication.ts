// Theme Application for Public Surveys

import type { PublicSurveyTheme } from '@/types/public-survey';

/**
 * Applies a survey theme to the document
 * This creates CSS custom properties that override the default M3 colors
 */
export function applySurveyTheme(theme: PublicSurveyTheme | undefined): void {
  if (!theme) return;

  const root = document.documentElement;

  // Primary colors
  if (theme.primaryColor) {
    root.style.setProperty('--color-primary', theme.primaryColor);
  }
  if (theme.onPrimaryColor) {
    root.style.setProperty('--color-on-primary', theme.onPrimaryColor);
  }
  if (theme.primaryContainerColor) {
    root.style.setProperty('--color-primary-container', theme.primaryContainerColor);
  }
  if (theme.onPrimaryContainerColor) {
    root.style.setProperty('--color-on-primary-container', theme.onPrimaryContainerColor);
  }

  // Secondary colors
  if (theme.secondaryColor) {
    root.style.setProperty('--color-secondary', theme.secondaryColor);
  }
  if (theme.onSecondaryColor) {
    root.style.setProperty('--color-on-secondary', theme.onSecondaryColor);
  }
  if (theme.secondaryContainerColor) {
    root.style.setProperty('--color-secondary-container', theme.secondaryContainerColor);
  }
  if (theme.onSecondaryContainerColor) {
    root.style.setProperty('--color-on-secondary-container', theme.onSecondaryContainerColor);
  }

  // Surface colors
  if (theme.surfaceColor) {
    root.style.setProperty('--color-surface', theme.surfaceColor);
    root.style.setProperty('--color-background', theme.surfaceColor);
  }
  if (theme.surfaceContainerLowestColor) {
    root.style.setProperty('--color-surface-container-lowest', theme.surfaceContainerLowestColor);
  }
  if (theme.surfaceContainerLowColor) {
    root.style.setProperty('--color-surface-container-low', theme.surfaceContainerLowColor);
  }
  if (theme.surfaceContainerColor) {
    root.style.setProperty('--color-surface-container', theme.surfaceContainerColor);
  }
  if (theme.surfaceContainerHighColor) {
    root.style.setProperty('--color-surface-container-high', theme.surfaceContainerHighColor);
  }
  if (theme.surfaceContainerHighestColor) {
    root.style.setProperty('--color-surface-container-highest', theme.surfaceContainerHighestColor);
  }
  if (theme.onSurfaceColor) {
    root.style.setProperty('--color-on-surface', theme.onSurfaceColor);
    root.style.setProperty('--color-on-background', theme.onSurfaceColor);
  }
  if (theme.onSurfaceVariantColor) {
    root.style.setProperty('--color-on-surface-variant', theme.onSurfaceVariantColor);
  }

  // Outline colors
  if (theme.outlineColor) {
    root.style.setProperty('--color-outline', theme.outlineColor);
  }
  if (theme.outlineVariantColor) {
    root.style.setProperty('--color-outline-variant', theme.outlineVariantColor);
  }

  // Font family
  if (theme.fontFamily) {
    root.style.setProperty('--font-sans', theme.fontFamily);
    document.body.style.fontFamily = theme.fontFamily;
  }
}

/**
 * Removes applied survey theme and resets to defaults
 */
export function clearSurveyTheme(): void {
  const root = document.documentElement;

  // Remove custom properties
  const properties = [
    '--color-primary',
    '--color-on-primary',
    '--color-primary-container',
    '--color-on-primary-container',
    '--color-secondary',
    '--color-on-secondary',
    '--color-secondary-container',
    '--color-on-secondary-container',
    '--color-surface',
    '--color-background',
    '--color-on-background',
    '--color-surface-container',
    '--color-surface-container-low',
    '--color-surface-container-high',
    '--color-surface-container-highest',
    '--color-surface-container-lowest',
    '--color-surface-dim',
    '--color-surface-bright',
    '--color-on-surface',
    '--color-on-surface-variant',
    '--color-outline',
    '--color-outline-variant',
    '--font-sans',
  ];

  properties.forEach((prop) => root.style.removeProperty(prop));
  document.body.style.fontFamily = '';
}

/**
 * Determines if a color is light or dark
 */
function isLightColor(color: string): boolean {
  const rgb = hexToRgb(color);
  if (!rgb) return true;

  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5;
}

/**
 * Gets a contrasting color (black or white) for a given background
 */
function getContrastColor(backgroundColor: string): string {
  return isLightColor(backgroundColor) ? '#1a1a1a' : '#ffffff';
}

/**
 * Converts hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Converts RGB to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
}

/**
 * Darkens a color by a percentage
 */
function darkenColor(color: string, amount: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  return rgbToHex(rgb.r * (1 - amount), rgb.g * (1 - amount), rgb.b * (1 - amount));
}

/**
 * Lightens a color by a percentage
 */
function lightenColor(color: string, amount: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  return rgbToHex(rgb.r + (255 - rgb.r) * amount, rgb.g + (255 - rgb.g) * amount, rgb.b + (255 - rgb.b) * amount);
}

/**
 * Blends a color with a background color based on opacity
 * This creates a solid color that looks like the foreground color with opacity on the background
 */
function blendColorWithBackground(foreground: string, background: string, opacity: number): string {
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);

  if (!fgRgb || !bgRgb) return foreground;

  // Alpha blend: result = foreground * opacity + background * (1 - opacity)
  const r = fgRgb.r * opacity + bgRgb.r * (1 - opacity);
  const g = fgRgb.g * opacity + bgRgb.g * (1 - opacity);
  const b = fgRgb.b * opacity + bgRgb.b * (1 - opacity);

  return rgbToHex(r, g, b);
}

/**
 * Creates a style object for inline theme application
 * Useful for isolated theme application without affecting the whole document
 */
export function createThemeStyles(theme: PublicSurveyTheme | undefined): React.CSSProperties {
  if (!theme) return {};

  const styles: React.CSSProperties = {};

  if (theme.fontFamily) {
    styles.fontFamily = theme.fontFamily;
  }

  if (theme.backgroundColor) {
    styles.backgroundColor = theme.backgroundColor;
  }

  if (theme.textColor) {
    styles.color = theme.textColor;
  }

  return styles;
}

/**
 * Gets comprehensive CSS variables for isolated theme application
 * Includes all Material 3 color tokens to prevent inheritance from parent
 */
export function getIsolatedThemeVariables(theme: PublicSurveyTheme | undefined): React.CSSProperties {
  if (!theme) return {};

  const vars: Record<string, string> = {};

  // Primary color
  if (theme.primaryColor) {
    vars['--color-primary'] = theme.primaryColor;
    vars['--color-on-primary'] = getContrastColor(theme.primaryColor);
    const isLight = theme.backgroundColor ? isLightColor(theme.backgroundColor) : true;
    vars['--color-primary-container'] = isLight ? lightenColor(theme.primaryColor, 0.85) : darkenColor(theme.primaryColor, 0.6);
    vars['--color-on-primary-container'] = theme.primaryColor;
  }

  // Secondary color
  if (theme.secondaryColor) {
    vars['--color-secondary'] = theme.secondaryColor;
    vars['--color-on-secondary'] = getContrastColor(theme.secondaryColor);
    const isLight = theme.backgroundColor ? isLightColor(theme.backgroundColor) : true;
    vars['--color-secondary-container'] = isLight ? lightenColor(theme.secondaryColor, 0.85) : darkenColor(theme.secondaryColor, 0.6);
    vars['--color-on-secondary-container'] = theme.secondaryColor;
  }

  // Surface and background colors
  if (theme.backgroundColor) {
    const isLight = isLightColor(theme.backgroundColor);
    vars['--color-surface'] = theme.backgroundColor;
    vars['--color-background'] = theme.backgroundColor;
    vars['--color-on-background'] = theme.textColor || getContrastColor(theme.backgroundColor);

    if (isLight) {
      vars['--color-surface-container-lowest'] = theme.backgroundColor;
      vars['--color-surface-container-low'] = darkenColor(theme.backgroundColor, 0.02);
      vars['--color-surface-container'] = darkenColor(theme.backgroundColor, 0.04);
      vars['--color-surface-container-high'] = darkenColor(theme.backgroundColor, 0.06);
      vars['--color-surface-container-highest'] = darkenColor(theme.backgroundColor, 0.08);
      vars['--color-surface-dim'] = darkenColor(theme.backgroundColor, 0.05);
      vars['--color-surface-bright'] = lightenColor(theme.backgroundColor, 0.03);
    } else {
      vars['--color-surface-container-lowest'] = theme.backgroundColor;
      vars['--color-surface-container-low'] = lightenColor(theme.backgroundColor, 0.04);
      vars['--color-surface-container'] = lightenColor(theme.backgroundColor, 0.08);
      vars['--color-surface-container-high'] = lightenColor(theme.backgroundColor, 0.12);
      vars['--color-surface-container-highest'] = lightenColor(theme.backgroundColor, 0.16);
      vars['--color-surface-dim'] = lightenColor(theme.backgroundColor, 0.05);
      vars['--color-surface-bright'] = lightenColor(theme.backgroundColor, 0.24);
    }
  }

  // Text colors
  if (theme.textColor) {
    vars['--color-on-surface'] = theme.textColor;
    vars['--color-on-surface-variant'] = blendColorWithBackground(theme.textColor, theme.backgroundColor || '#FFFFFF', 0.6);
  }

  // Outline colors (derived from text color)
  if (theme.textColor && theme.backgroundColor) {
    vars['--color-outline'] = blendColorWithBackground(theme.textColor, theme.backgroundColor, 0.3);
    vars['--color-outline-variant'] = blendColorWithBackground(theme.textColor, theme.backgroundColor, 0.15);
  }

  return vars as React.CSSProperties;
}
