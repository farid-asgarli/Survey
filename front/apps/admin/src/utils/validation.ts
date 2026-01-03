// Validation utilities - Re-exports from @survey/validation with admin-specific extensions
//
// This file provides a unified validation API for the admin app.
// Core validation logic comes from @survey/validation (shared with public-survey).
// Admin-specific utilities (like i18n-aware validation) are added here.

// ============ Re-export core validation from shared package ============
export {
  // Answer validators
  validateAnswer,
  validateAllAnswers,
  validateSingleChoice,
  validateMultipleChoice,
  validateText,
  validateEmail,
  validatePhone,
  validateUrl,
  validateNumber,
  validateRating,
  validateScale,
  validateYesNo,
  validateDate,
  validateMatrix,
  validateRanking,
  // Zod schemas (for form validation)
  textAnswerSchema,
  emailAnswerSchema,
  phoneAnswerSchema,
  urlAnswerSchema,
  numberAnswerSchema,
} from '@survey/validation';

// ============ Re-export presets from shared package ============
export {
  // Preset collections
  PHONE_PRESETS,
  EMAIL_PRESET,
  URL_PRESETS,
  NUMBER_PRESETS,
  OTHER_PRESETS,
  ALL_PRESETS,
  // Utility functions
  getPresetById,
  validateWithPreset,
  validatePattern,
  validateQuestionValue,
  getPresetsForQuestionType,
  type ValidationPreset,
  type QuestionValidationSettings,
  type PatternValidationResult,
} from '@survey/validation';

// ============ Re-export types ============
export type { ValidationResult } from '@survey/types';
