// @survey/ui - Shared UI components for the survey platform
// This package will contain shared components between admin and public-survey apps
// Phase 2 will extract QuestionRenderers, theme components, and other shared UI

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { PublicSurveyTheme } from "@survey/types";

// ============ Utility Functions ============

/**
 * Combines class names with Tailwind CSS class merging support.
 * Use this for combining conditional classes and avoiding Tailwind conflicts.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ============ Theme Utilities ============

/**
 * Generates CSS custom properties from a theme object
 */
export function generateThemeCSSVariables(theme: PublicSurveyTheme): Record<string, string> {
  const variables: Record<string, string> = {};

  // Primary colors
  if (theme.primaryColor) {
    variables["--md-sys-color-primary"] = theme.primaryColor;
  }
  if (theme.onPrimaryColor) {
    variables["--md-sys-color-on-primary"] = theme.onPrimaryColor;
  }
  if (theme.primaryContainerColor) {
    variables["--md-sys-color-primary-container"] = theme.primaryContainerColor;
  }
  if (theme.onPrimaryContainerColor) {
    variables["--md-sys-color-on-primary-container"] = theme.onPrimaryContainerColor;
  }

  // Secondary colors
  if (theme.secondaryColor) {
    variables["--md-sys-color-secondary"] = theme.secondaryColor;
  }
  if (theme.onSecondaryColor) {
    variables["--md-sys-color-on-secondary"] = theme.onSecondaryColor;
  }
  if (theme.secondaryContainerColor) {
    variables["--md-sys-color-secondary-container"] = theme.secondaryContainerColor;
  }
  if (theme.onSecondaryContainerColor) {
    variables["--md-sys-color-on-secondary-container"] = theme.onSecondaryContainerColor;
  }

  // Surface colors
  if (theme.surfaceColor) {
    variables["--md-sys-color-surface"] = theme.surfaceColor;
  }
  if (theme.surfaceContainerLowestColor) {
    variables["--md-sys-color-surface-container-lowest"] = theme.surfaceContainerLowestColor;
  }
  if (theme.surfaceContainerLowColor) {
    variables["--md-sys-color-surface-container-low"] = theme.surfaceContainerLowColor;
  }
  if (theme.surfaceContainerColor) {
    variables["--md-sys-color-surface-container"] = theme.surfaceContainerColor;
  }
  if (theme.surfaceContainerHighColor) {
    variables["--md-sys-color-surface-container-high"] = theme.surfaceContainerHighColor;
  }
  if (theme.surfaceContainerHighestColor) {
    variables["--md-sys-color-surface-container-highest"] = theme.surfaceContainerHighestColor;
  }
  if (theme.onSurfaceColor) {
    variables["--md-sys-color-on-surface"] = theme.onSurfaceColor;
  }
  if (theme.onSurfaceVariantColor) {
    variables["--md-sys-color-on-surface-variant"] = theme.onSurfaceVariantColor;
  }

  // Outline colors
  if (theme.outlineColor) {
    variables["--md-sys-color-outline"] = theme.outlineColor;
  }
  if (theme.outlineVariantColor) {
    variables["--md-sys-color-outline-variant"] = theme.outlineVariantColor;
  }

  // Legacy colors
  if (theme.backgroundColor) {
    variables["--md-sys-color-background"] = theme.backgroundColor;
  }
  if (theme.textColor) {
    variables["--md-sys-color-on-background"] = theme.textColor;
  }

  // Typography
  if (theme.fontFamily) {
    variables["--md-sys-typescale-body-font"] = theme.fontFamily;
  }
  if (theme.headingFontFamily) {
    variables["--md-sys-typescale-headline-font"] = theme.headingFontFamily;
    variables["--md-sys-typescale-title-font"] = theme.headingFontFamily;
  }
  if (theme.baseFontSize) {
    variables["--md-sys-typescale-body-size"] = `${theme.baseFontSize}px`;
  }

  return variables;
}

/**
 * Applies theme CSS variables to an element
 */
export function applyThemeToElement(element: HTMLElement, theme: PublicSurveyTheme): void {
  const variables = generateThemeCSSVariables(theme);

  for (const [property, value] of Object.entries(variables)) {
    element.style.setProperty(property, value);
  }
}

/**
 * Gets button border-radius based on button style
 */
export function getButtonBorderRadius(buttonStyle?: number): string {
  switch (buttonStyle) {
    case 0: // Rounded
      return "8px";
    case 1: // Square
      return "0px";
    case 2: // Pill
      return "9999px";
    default:
      return "8px";
  }
}

// ============ Utility Classes ============

// cn() is already exported above with proper clsx + tailwind-merge support

// ============ Re-exports ============

export type { PublicSurveyTheme } from "@survey/types";
export type { ClassValue } from "clsx";
