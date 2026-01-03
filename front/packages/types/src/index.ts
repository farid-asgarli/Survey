// @survey/types - Shared TypeScript types for the survey platform
// This package contains types shared between admin and public-survey apps

// Re-export all enums
export * from "./enums.js";

// Re-export all public survey types (including QuestionOption, AnswerValue, etc.)
export * from "./public.js";

// Explicit type re-exports for better IDE support
export type {
  // Question types
  QuestionOption,
  PublicSurveySettings,
  PublicQuestion,
  // Theme types
  PublicSurveyTheme,
  // Survey types
  PublicSurvey,
  // Request/Response types
  StartResponseRequest,
  StartResponseResult,
  SubmitAnswerRequest,
  SubmitResponseRequest,
  SubmitResponseResult,
  // Answer types
  AnswerValue,
  QuestionAnswer,
  // State types
  PublicSurveyViewMode,
  PublicSurveyState,
  // Validation types
  ValidationResult,
  QuestionValidator,
} from "./public.js";
