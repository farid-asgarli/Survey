// Types for public survey (respondent-facing)

import type { QuestionType } from './models';

// ============ Public Survey Types ============

export interface PublicSurveySettings {
  minValue?: number;
  maxValue?: number;
  minLabel?: string;
  maxLabel?: string;
  placeholder?: string;
  maxLength?: number;
  options?: string[];
  matrixRows?: string[];
  matrixColumns?: string[];
  allowedFileTypes?: string[];
  maxFileSize?: number;
  allowOther?: boolean;
  validationPattern?: string;
  validationMessage?: string;
  validationPreset?: string;
  ratingStyle?: number;
  yesNoStyle?: number;
}

export interface PublicQuestion {
  id: string;
  text: string;
  type: QuestionType;
  order: number;
  isRequired: boolean;
  description?: string;
  settings?: PublicSurveySettings;
  isNpsQuestion?: boolean;
  npsType?: string;
}

export interface PublicSurvey {
  id: string;
  title: string;
  description?: string;
  welcomeMessage?: string;
  thankYouMessage?: string;
  isAnonymous: boolean;
  allowAnonymousResponses?: boolean;
  questions: PublicQuestion[];
  theme?: PublicSurveyTheme;
  /** The language of the returned content (based on request) */
  language: string;
  /** List of available language codes for this survey */
  availableLanguages: string[];
}

export interface PublicSurveyTheme {
  // Primary
  primaryColor: string;
  onPrimaryColor?: string;
  primaryContainerColor?: string;
  onPrimaryContainerColor?: string;

  // Secondary
  secondaryColor: string;
  onSecondaryColor?: string;
  secondaryContainerColor?: string;
  onSecondaryContainerColor?: string;

  // Surface
  surfaceColor?: string;
  surfaceContainerLowestColor?: string;
  surfaceContainerLowColor?: string;
  surfaceContainerColor?: string;
  surfaceContainerHighColor?: string;
  surfaceContainerHighestColor?: string;
  onSurfaceColor?: string;
  onSurfaceVariantColor?: string;

  // Outline
  outlineColor?: string;
  outlineVariantColor?: string;

  // Legacy
  backgroundColor?: string;
  textColor?: string;

  // Other
  fontFamily?: string;
  logoUrl?: string;
  logoSize?: number;
  showLogoBackground?: boolean;
  logoBackgroundColor?: string;
  brandingTitle?: string;
  brandingSubtitle?: string;
  backgroundImageUrl?: string;
  backgroundPosition?: string;
}

// ============ Response Submission Types ============

export interface SubmitAnswerRequest {
  questionId: string;
  answerValue: string;
}

// SubmitResponseRequest for public survey submissions
export interface SubmitResponseRequest {
  surveyId: string;
  answers: SubmitAnswerRequest[];
  metadata?: Record<string, string>;
}

export interface SubmitResponseResult {
  id: string;
  surveyId: string;
  isComplete: boolean;
  submittedAt?: string;
}

// ============ Answer Value Types ============

export type AnswerValue = string | string[] | number | Record<string, string> | File[] | null;

export interface QuestionAnswer {
  questionId: string;
  value: AnswerValue;
  isValid: boolean;
  errorMessage?: string;
}

// ============ Survey State Types ============

export type PublicSurveyViewMode = 'welcome' | 'questions' | 'thank-you' | 'error';

export interface PublicSurveyState {
  survey: PublicSurvey | null;
  answers: Record<string, AnswerValue>;
  errors: Record<string, string>;
  currentQuestionIndex: number;
  viewMode: PublicSurveyViewMode;
  isSubmitting: boolean;
  isLoading: boolean;
  error: string | null;
}

// ============ Validation Types ============

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export type QuestionValidator = (value: AnswerValue, question: PublicQuestion) => ValidationResult;
