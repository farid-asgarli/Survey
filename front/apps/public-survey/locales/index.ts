/**
 * Locale exports - Import JSON files and re-export as typed objects
 *
 * This approach:
 * 1. Keeps translations in JSON (easy to edit, standard format)
 * 2. Provides type safety via TypeScript
 * 3. Bundles translations at build time (no runtime loading needed)
 */

import en from './en.json';
import az from './az.json';
import ru from './ru.json';

export const locales = { en, az, ru } as const;

export type LocaleKey = keyof typeof locales;

// Derive the translation structure type from the English locale
export type Translations = typeof en;

export { en, az, ru };
