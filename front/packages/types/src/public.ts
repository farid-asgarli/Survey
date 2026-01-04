// Types for public survey (respondent-facing)
// Shared between admin and public-survey apps

import type { QuestionType, NpsQuestionType, RatingStyle, YesNoStyle } from './enums.js';

// ============ Question Option ============

export interface QuestionOption {
  id: string;
  text: string;
  order: number;
  imageUrl?: string;
}

// ============ Public Survey Settings ============

export interface PublicSurveySettings {
  minValue?: number;
  maxValue?: number;
  minLabel?: string;
  maxLabel?: string;
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  /** Options with stable IDs for choice questions */
  options?: QuestionOption[];
  matrixRows?: string[];
  matrixColumns?: string[];
  allowedFileTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
  maxSelections?: number;
  allowOther?: boolean;
  otherLabel?: string;
  randomizeOptions?: boolean;
  validationPattern?: string;
  validationMessage?: string;
  validationPreset?: string;
  ratingStyle?: RatingStyle;
  yesNoStyle?: YesNoStyle;
}

// ============ Public Question ============

export interface PublicQuestion {
  id: string;
  text: string;
  type: QuestionType;
  order: number;
  isRequired: boolean;
  description?: string;
  settings?: PublicSurveySettings;
  isNpsQuestion?: boolean;
  npsType?: NpsQuestionType;
}

// ============ Public Survey Theme ============

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

  // Typography
  fontFamily?: string;
  headingFontFamily?: string;
  baseFontSize?: number;

  // Button styling
  buttonStyle?: number;
  buttonTextColor?: string;

  // Branding
  logoUrl?: string;
  logoSize?: number;
  showLogoBackground?: boolean;
  logoBackgroundColor?: string;
  brandingTitle?: string;
  brandingSubtitle?: string;
  showPoweredBy?: boolean;

  // Layout
  backgroundImageUrl?: string;
  backgroundPosition?: string;
  showProgressBar?: boolean;
  progressBarStyle?: number;
}

// ============ Public Survey ============

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

/** Request to submit/complete a survey response */
export interface SubmitResponseRequest {
  /** The response ID to complete */
  responseId?: string;
  /** The survey ID (legacy flow - for backward compatibility) */
  surveyId?: string;
  /** Link token for tracking (only used in legacy flow) */
  linkToken?: string;
  answers: SubmitAnswerRequest[];
  metadata?: Record<string, string>;
}

/** Result of submitting a survey response */
export interface SubmitResponseResult {
  id: string;
  surveyId: string;
  isComplete: boolean;
  startedAt: string;
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

export type PublicSurveyViewMode = 'welcome' | 'password' | 'questions' | 'thank-you' | 'error';

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

// ============ Link Access Types ============

/** Result from GET /api/s/{token} - validates link before accessing survey */
export interface LinkByTokenResult {
  linkId: string;
  surveyId: string;
  surveyTitle: string;
  isValid: boolean;
  invalidReason?: string;
  requiresPassword: boolean;
}

/** Request body for POST /api/s/{token}/access */
export interface LinkAccessRequest {
  password?: string;
}

/** Result from POST /api/s/{token}/access - records click and provides survey access */
export interface LinkAccessResult {
  surveyId: string;
  surveyAccessToken: string;
  clickId: string;
  prefillData?: Record<string, string>;
}
