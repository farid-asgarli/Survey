// Types for public survey (respondent-facing)

import type { QuestionType, QuestionOption } from './models';

// ============ Public Survey Types ============

export interface PublicSurveySettings {
  minValue?: number;
  maxValue?: number;
  minLabel?: string;
  maxLabel?: string;
  placeholder?: string;
  maxLength?: number;
  /** Options with stable IDs for choice questions */
  options?: QuestionOption[];
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

/** Request to start a survey response (creates a draft) */
export interface StartResponseRequest {
  surveyId: string;
  /** Optional: Link token if accessed via a tracked link */
  linkToken?: string;
  respondentEmail?: string;
  respondentName?: string;
}

/** Result of starting a survey response */
export interface StartResponseResult {
  responseId: string;
  surveyId: string;
  startedAt: string;
}

export interface SubmitAnswerRequest {
  questionId: string;
  /** Selected option IDs for choice questions */
  selectedOptionIds?: string[];
  /** Text value for text questions or "Other" input */
  text?: string;
}

/** Request to submit/complete a survey response (new flow with responseId) */
export interface SubmitResponseRequest {
  /** The response ID to complete (new flow - preferred) */
  responseId?: string;
  /** The survey ID (legacy flow - for backward compatibility) */
  surveyId?: string;
  /** Link token for tracking (only used in legacy flow) */
  linkToken?: string;
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
