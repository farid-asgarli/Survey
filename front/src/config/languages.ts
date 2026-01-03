/**
 * Centralized language configuration for the application.
 * This is the single source of truth for all supported languages.
 *
 * Note: This list should match the backend's supported languages in:
 * SurveyApp.Domain/ValueObjects/LanguageCode.cs
 */

export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

/**
 * All supported survey languages with their metadata.
 * Keep in sync with backend SupportedLanguages in LanguageCode.cs
 */
export const SUPPORTED_LANGUAGES: readonly LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', flag: '🇸🇮' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti', flag: '🇪🇪' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', flag: '🇱🇻' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', flag: '🇱🇹' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски', flag: '🇷🇸' },
  { code: 'ca', name: 'Catalan', nativeName: 'Català', flag: '🏴' },
  { code: 'eu', name: 'Basque', nativeName: 'Euskara', flag: '🏴' },
  { code: 'gl', name: 'Galician', nativeName: 'Galego', flag: '🏴' },
] as const;

/**
 * UI-supported languages - the subset of languages that have translation files
 * for the application interface. Keep in sync with i18n/locales/*.json files.
 */
export const UI_LANGUAGES: readonly LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
] as const;

/**
 * UI language codes type
 */
export type UILanguageCode = (typeof UI_LANGUAGES)[number]['code'];

/**
 * Default UI language code
 */
export const DEFAULT_UI_LANGUAGE: UILanguageCode = 'en';

/**
 * Map of language codes to their info for O(1) lookup
 */
export const LANGUAGE_INFO_MAP: Record<string, LanguageInfo> = Object.fromEntries(SUPPORTED_LANGUAGES.map((lang) => [lang.code, lang]));

/**
 * Array of just language codes
 */
export const SUPPORTED_LANGUAGE_CODES: readonly string[] = SUPPORTED_LANGUAGES.map((lang) => lang.code);

/**
 * Default language code
 */
export const DEFAULT_LANGUAGE_CODE = 'en';

/**
 * Get language info by code with fallback
 */
export function getLanguageInfo(code: string): LanguageInfo {
  return (
    LANGUAGE_INFO_MAP[code] || {
      code,
      name: code.toUpperCase(),
      nativeName: code.toUpperCase(),
      flag: '🌐',
    }
  );
}

/**
 * Check if a language code is supported
 */
export function isLanguageSupported(code: string): boolean {
  return code in LANGUAGE_INFO_MAP;
}

/**
 * Type for supported language codes
 */
export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];
