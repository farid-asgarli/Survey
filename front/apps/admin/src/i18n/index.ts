import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import az from './locales/az.json';
import ru from './locales/ru.json';

import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE_CODE,
  UI_LANGUAGES,
  DEFAULT_UI_LANGUAGE,
  getLanguageInfo as getLanguageInfoFromConfig,
  type LanguageInfo,
  type UILanguageCode,
} from '@/config/languages';

// Re-export UI languages for backward compatibility
export const LANGUAGES = UI_LANGUAGES;

export type LanguageCode = UILanguageCode;

export const DEFAULT_LANGUAGE: LanguageCode = DEFAULT_UI_LANGUAGE;

// Re-export centralized language config for survey languages
export { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE_CODE, UI_LANGUAGES, type LanguageInfo, type UILanguageCode };
export const getSurveyLanguageInfo = getLanguageInfoFromConfig;

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      az: { translation: az },
      ru: { translation: ru },
    },
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: UI_LANGUAGES.map((lang) => lang.code),

    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'survey_language',
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // React specific options
    react: {
      useSuspense: false, // Set to false to avoid issues with lazy loading
    },
  });

// Helper function to change language
export const changeLanguage = (lang: LanguageCode) => {
  i18n.changeLanguage(lang);
  localStorage.setItem('survey_language', lang);
  // Update HTML lang attribute for accessibility
  document.documentElement.lang = lang;
};

// Helper to get current language
export const getCurrentLanguage = (): LanguageCode => {
  return (i18n.language as LanguageCode) || DEFAULT_LANGUAGE;
};

// Helper to get language info by code
export const getLanguageInfo = (code: LanguageCode) => {
  return LANGUAGES.find((lang) => lang.code === code);
};

// Expose i18n to window for class components that can't use hooks
declare global {
  interface Window {
    __i18n?: typeof i18n;
  }
}
window.__i18n = i18n;

export default i18n;
