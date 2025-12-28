import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import az from './locales/az.json';
import ru from './locales/ru.json';

// Language configuration
export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

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
    supportedLngs: LANGUAGES.map((lang) => lang.code),

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

export default i18n;
