/**
 * Environment Configuration
 *
 * Centralized configuration for the public survey app.
 * All environment variables should be accessed through this module.
 */

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

// Supported languages as a constant array for type safety
export const SUPPORTED_LANGUAGES = ['en', 'az', 'ru'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const config = {
  // API base URL - will be set via environment variable in production
  apiBaseUrl: getEnvVar('NEXT_PUBLIC_API_URL', 'http://localhost:5001'),

  // Default language for surveys
  defaultLanguage: getEnvVar('NEXT_PUBLIC_DEFAULT_LANGUAGE', 'en') as SupportedLanguage,

  // Supported languages
  supportedLanguages: SUPPORTED_LANGUAGES,

  // Feature flags
  features: {
    // Enable progress auto-save
    autoSave: true,
    // Enable dark mode support
    darkMode: true,
    // Enable progress bar
    progressBar: true,
  },

  // Cache configuration (in seconds)
  cache: {
    // How long to cache survey data on SSR
    surveyRevalidate: 60,
    // How long to cache OG images
    ogImageRevalidate: 300,
  },

  // Progress persistence
  persistence: {
    // How long to keep saved progress (in days)
    expiryDays: 7,
    // Debounce time for auto-save (in ms)
    debounceMs: 1000,
  },
} as const;

export type Config = typeof config;
