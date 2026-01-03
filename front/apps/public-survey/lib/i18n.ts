/**
 * Internationalization utilities for the public survey app
 *
 * Provides server-side and client-side language detection,
 * translations, and locale management.
 *
 * Translations are stored in JSON files under /locales for:
 * - Easy editing by non-developers
 * - Integration with translation management tools (Crowdin, Lokalise, etc.)
 * - Industry-standard format
 * - Clean separation of concerns
 */

import type { QuestionLabels } from '@survey/ui';
import { config, type SupportedLanguage } from './config';
import { locales, type Translations } from '@/locales';

// ============ Language Detection ============

/**
 * Detects language from Accept-Language header
 */
export function detectLanguageFromHeaders(acceptLanguage: string | null): SupportedLanguage {
  if (!acceptLanguage) return config.defaultLanguage as SupportedLanguage;

  // Parse Accept-Language header (e.g., "en-US,en;q=0.9,az;q=0.8")
  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [code, priority] = lang.trim().split(';q=');
      return {
        code: code.split('-')[0].toLowerCase(), // Get primary language code
        priority: priority ? parseFloat(priority) : 1,
      };
    })
    .sort((a, b) => b.priority - a.priority);

  // Find first supported language
  for (const { code } of languages) {
    if (config.supportedLanguages.includes(code as SupportedLanguage)) {
      return code as SupportedLanguage;
    }
  }

  return config.defaultLanguage as SupportedLanguage;
}

/**
 * Gets language from various sources with priority
 * 1. URL query parameter (lang=xx)
 * 2. Survey's available languages (first matching)
 * 3. Accept-Language header
 * 4. Default language
 */
export function resolveLanguage(queryLang?: string | null, acceptLanguage?: string | null, availableLanguages?: string[]): SupportedLanguage {
  // Check query parameter first
  if (queryLang && config.supportedLanguages.includes(queryLang as SupportedLanguage)) {
    // Also check if available in survey (if provided)
    if (!availableLanguages || availableLanguages.includes(queryLang)) {
      return queryLang as SupportedLanguage;
    }
  }

  // Detect from headers
  const detectedLang = detectLanguageFromHeaders(acceptLanguage ?? null);

  // Check if detected language is available in survey
  if (availableLanguages && !availableLanguages.includes(detectedLang)) {
    // Fall back to first available language or default
    return (availableLanguages[0] as SupportedLanguage) || config.defaultLanguage;
  }

  return detectedLang;
}

// ============ Translation Key Types ============

/**
 * Flatten nested object keys into dot notation
 * e.g., { survey: { start: "..." } } => "survey.start"
 */
type FlattenKeys<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T]: K extends string ? (T[K] extends object ? FlattenKeys<T[K], `${Prefix}${K}.`> : `${Prefix}${K}`) : never;
    }[keyof T]
  : never;

export type TranslationKey = FlattenKeys<Translations>;

// ============ Translation Functions ============

/**
 * Gets a nested value from an object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // Return key if path not found
    }
  }

  return typeof current === 'string' ? current : path;
}

/**
 * Gets a translation with optional interpolation
 */
export function t(key: TranslationKey, lang: SupportedLanguage = 'en', params?: Record<string, string | number>): string {
  const translations = locales[lang] || locales.en;
  let text = getNestedValue(translations as unknown as Record<string, unknown>, key);

  // Fall back to English if key not found in target language
  if (text === key && lang !== 'en') {
    text = getNestedValue(locales.en as unknown as Record<string, unknown>, key);
  }

  // Interpolate parameters
  if (params) {
    for (const [param, value] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), String(value));
    }
  }

  return text;
}

/**
 * Creates a translator function bound to a specific language
 */
export function createTranslator(lang: SupportedLanguage) {
  return (key: TranslationKey, params?: Record<string, string | number>) => t(key, lang, params);
}

/**
 * Gets question labels for the QuestionRenderer component
 */
export function getQuestionLabels(lang: SupportedLanguage): QuestionLabels {
  return {
    // Common labels
    placeholder: t('question.typePlaceholder', lang),
    other: t('validation.required', lang),
    pleaseSpecify: t('question.otherPlaceholder', lang),
    // File upload
    dropFilesHere: t('question.fileDrop', lang),
    maxFilesText: t('question.fileSelected', lang, { count: 0 }),
    allowedTypesPrefix: '',
    // Ranking
    dragToReorder: t('question.rankingInstruction', lang),
    // Yes/No
    yes: t('question.yes', lang),
    no: t('question.no', lang),
    // Validation
    invalidEmail: t('validation.invalidEmail', lang),
    invalidPhone: t('validation.invalidPhone', lang),
    invalidUrl: t('validation.invalidUrl', lang),
    required: t('validation.required', lang),
  };
}

export type { SupportedLanguage };
