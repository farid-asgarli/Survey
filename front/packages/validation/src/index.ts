// @survey/validation - Shared validation schemas and utilities
// This package contains Zod schemas for public survey validation

import { z } from "zod";
import {
  QuestionType,
  type PublicQuestion,
  type AnswerValue,
  type ValidationResult,
} from "@survey/types";

// Re-export presets module
export * from "./presets.js";

// ============ Answer Validation Schemas ============

export const textAnswerSchema = z.string().min(1, "This field is required");

export const emailAnswerSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

export const phoneAnswerSchema = z
  .string()
  .min(1, "Phone number is required")
  .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, "Please enter a valid phone number");

export const urlAnswerSchema = z.string().min(1, "URL is required").url("Please enter a valid URL");

export const numberAnswerSchema = z
  .number()
  .or(z.string().transform((val) => parseFloat(val)))
  .refine((val) => !isNaN(val), "Please enter a valid number");

// ============ Question Validators ============

/**
 * Validates a single-choice question answer
 */
export function validateSingleChoice(
  value: AnswerValue,
  question: PublicQuestion
): ValidationResult {
  if (question.isRequired && (!value || value === "")) {
    return { isValid: false, errorMessage: "Please select an option" };
  }
  return { isValid: true };
}

/**
 * Validates a multiple-choice question answer
 */
export function validateMultipleChoice(
  value: AnswerValue,
  question: PublicQuestion
): ValidationResult {
  const selectedIds = Array.isArray(value) ? value : [];

  if (question.isRequired && selectedIds.length === 0) {
    return { isValid: false, errorMessage: "Please select at least one option" };
  }

  const maxSelections = question.settings?.maxSelections;
  if (maxSelections && selectedIds.length > maxSelections) {
    return {
      isValid: false,
      errorMessage: `Please select at most ${maxSelections} options`,
    };
  }

  return { isValid: true };
}

/**
 * Validates a text question answer
 */
export function validateText(value: AnswerValue, question: PublicQuestion): ValidationResult {
  const textValue = typeof value === "string" ? value : "";

  if (question.isRequired && textValue.trim() === "") {
    return { isValid: false, errorMessage: "This field is required" };
  }

  const minLength = question.settings?.minLength;
  const maxLength = question.settings?.maxLength;

  if (minLength && textValue.length < minLength) {
    return {
      isValid: false,
      errorMessage: `Please enter at least ${minLength} characters`,
    };
  }

  if (maxLength && textValue.length > maxLength) {
    return {
      isValid: false,
      errorMessage: `Please enter at most ${maxLength} characters`,
    };
  }

  // Custom validation pattern
  const pattern = question.settings?.validationPattern;
  if (pattern && textValue) {
    try {
      const regex = new RegExp(pattern);
      if (!regex.test(textValue)) {
        return {
          isValid: false,
          errorMessage: question.settings?.validationMessage || "Invalid format",
        };
      }
    } catch {
      // Invalid regex, skip validation
    }
  }

  return { isValid: true };
}

/**
 * Validates an email question answer
 */
export function validateEmail(value: AnswerValue, question: PublicQuestion): ValidationResult {
  const textValue = typeof value === "string" ? value : "";

  if (question.isRequired && textValue.trim() === "") {
    return { isValid: false, errorMessage: "Email is required" };
  }

  if (textValue) {
    const result = emailAnswerSchema.safeParse(textValue);
    if (!result.success) {
      return {
        isValid: false,
        errorMessage: "Please enter a valid email address",
      };
    }
  }

  return { isValid: true };
}

/**
 * Validates a phone question answer
 */
export function validatePhone(value: AnswerValue, question: PublicQuestion): ValidationResult {
  const textValue = typeof value === "string" ? value : "";

  if (question.isRequired && textValue.trim() === "") {
    return { isValid: false, errorMessage: "Phone number is required" };
  }

  if (textValue) {
    const result = phoneAnswerSchema.safeParse(textValue);
    if (!result.success) {
      return {
        isValid: false,
        errorMessage: "Please enter a valid phone number",
      };
    }
  }

  return { isValid: true };
}

/**
 * Validates a URL question answer
 */
export function validateUrl(value: AnswerValue, question: PublicQuestion): ValidationResult {
  const textValue = typeof value === "string" ? value : "";

  if (question.isRequired && textValue.trim() === "") {
    return { isValid: false, errorMessage: "URL is required" };
  }

  if (textValue) {
    const result = urlAnswerSchema.safeParse(textValue);
    if (!result.success) {
      return { isValid: false, errorMessage: "Please enter a valid URL" };
    }
  }

  return { isValid: true };
}

/**
 * Validates a number question answer
 */
export function validateNumber(value: AnswerValue, question: PublicQuestion): ValidationResult {
  if (question.isRequired && (value === null || value === undefined || value === "")) {
    return { isValid: false, errorMessage: "This field is required" };
  }

  if (value !== null && value !== undefined && value !== "") {
    const numValue = typeof value === "number" ? value : parseFloat(String(value));

    if (isNaN(numValue)) {
      return { isValid: false, errorMessage: "Please enter a valid number" };
    }

    const minValue = question.settings?.minValue;
    const maxValue = question.settings?.maxValue;

    if (minValue !== undefined && numValue < minValue) {
      return {
        isValid: false,
        errorMessage: `Value must be at least ${minValue}`,
      };
    }

    if (maxValue !== undefined && numValue > maxValue) {
      return {
        isValid: false,
        errorMessage: `Value must be at most ${maxValue}`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Validates a rating question answer
 */
export function validateRating(value: AnswerValue, question: PublicQuestion): ValidationResult {
  if (question.isRequired && (value === null || value === undefined)) {
    return { isValid: false, errorMessage: "Please select a rating" };
  }
  return { isValid: true };
}

/**
 * Validates a scale/NPS question answer
 */
export function validateScale(value: AnswerValue, question: PublicQuestion): ValidationResult {
  if (question.isRequired && (value === null || value === undefined)) {
    return { isValid: false, errorMessage: "Please select a value" };
  }
  return { isValid: true };
}

/**
 * Validates a Yes/No question answer
 */
export function validateYesNo(value: AnswerValue, question: PublicQuestion): ValidationResult {
  if (question.isRequired && (value === null || value === undefined || value === "")) {
    return { isValid: false, errorMessage: "Please select an option" };
  }
  return { isValid: true };
}

/**
 * Validates a date question answer
 */
export function validateDate(value: AnswerValue, question: PublicQuestion): ValidationResult {
  if (question.isRequired && (!value || value === "")) {
    return { isValid: false, errorMessage: "Please select a date" };
  }
  return { isValid: true };
}

/**
 * Validates a matrix question answer
 */
export function validateMatrix(value: AnswerValue, question: PublicQuestion): ValidationResult {
  if (!question.isRequired) {
    return { isValid: true };
  }

  const matrixValue = value as Record<string, string> | null;
  const rows = question.settings?.matrixRows || [];

  if (!matrixValue || typeof matrixValue !== "object") {
    return { isValid: false, errorMessage: "Please answer all rows" };
  }

  const answeredRows = Object.keys(matrixValue).filter(
    (key) => matrixValue[key] !== undefined && matrixValue[key] !== ""
  );

  if (answeredRows.length < rows.length) {
    return { isValid: false, errorMessage: "Please answer all rows" };
  }

  return { isValid: true };
}

/**
 * Validates a ranking question answer
 */
export function validateRanking(value: AnswerValue, question: PublicQuestion): ValidationResult {
  const rankedItems = Array.isArray(value) ? value : [];
  const options = question.settings?.options || [];

  if (question.isRequired && rankedItems.length !== options.length) {
    return { isValid: false, errorMessage: "Please rank all options" };
  }

  return { isValid: true };
}

// ============ Main Validator ============

/**
 * Validates an answer based on question type
 */
export function validateAnswer(value: AnswerValue, question: PublicQuestion): ValidationResult {
  switch (question.type) {
    case QuestionType.SingleChoice:
    case QuestionType.Dropdown:
      return validateSingleChoice(value, question);

    case QuestionType.MultipleChoice:
    case QuestionType.Checkbox:
      return validateMultipleChoice(value, question);

    case QuestionType.Text:
    case QuestionType.ShortText:
    case QuestionType.LongText:
      return validateText(value, question);

    case QuestionType.Email:
      return validateEmail(value, question);

    case QuestionType.Phone:
      return validatePhone(value, question);

    case QuestionType.Url:
      return validateUrl(value, question);

    case QuestionType.Number:
      return validateNumber(value, question);

    case QuestionType.Rating:
      return validateRating(value, question);

    case QuestionType.Scale:
    case QuestionType.NPS:
      return validateScale(value, question);

    case QuestionType.YesNo:
      return validateYesNo(value, question);

    case QuestionType.Date:
    case QuestionType.DateTime:
      return validateDate(value, question);

    case QuestionType.Matrix:
      return validateMatrix(value, question);

    case QuestionType.Ranking:
      return validateRanking(value, question);

    case QuestionType.FileUpload:
      // File upload validation is handled separately
      return { isValid: true };

    default:
      return { isValid: true };
  }
}

/**
 * Validates all answers for a survey
 */
export function validateAllAnswers(
  answers: Record<string, AnswerValue>,
  questions: PublicQuestion[]
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const question of questions) {
    const value = answers[question.id];
    const result = validateAnswer(value, question);

    if (!result.isValid && result.errorMessage) {
      errors[question.id] = result.errorMessage;
    }
  }

  return errors;
}
