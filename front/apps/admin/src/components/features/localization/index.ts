// Localization Components - Barrel Export

export { SurveyLanguageSwitcher, LANGUAGE_INFO } from './SurveyLanguageSwitcher';
export type { LanguageStatus } from './SurveyLanguageSwitcher';

// Re-export centralized language config for convenience
export {
  SUPPORTED_LANGUAGES,
  LANGUAGE_INFO_MAP,
  SUPPORTED_LANGUAGE_CODES,
  DEFAULT_LANGUAGE_CODE,
  getLanguageInfo,
  isLanguageSupported,
  type LanguageInfo,
  type SupportedLanguageCode,
} from '@/config/languages';

export { AddLanguageDialog } from './AddLanguageDialog';

export { TranslationEditor } from './TranslationEditor';
export type { TranslationField } from './TranslationEditor';

export { TranslationEditorDialog } from './TranslationEditorDialog';

// New Language Management Components
export { LanguageList } from './LanguageList';
export type { LanguageStats } from './LanguageList';

export { LanguagesTab } from './LanguagesTab';

export { QuestionTranslationsEditor } from './QuestionTranslationsEditor';
export type { QuestionWithSettings, QuestionTranslationUpdate } from './QuestionTranslationsEditor';
