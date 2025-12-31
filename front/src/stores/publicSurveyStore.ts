// Public Survey Store - Manages state for public survey respondent experience

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { PublicSurvey, PublicQuestion, AnswerValue, PublicSurveyViewMode, ValidationResult } from '@/types/public-survey';
import { evaluateQuestionVisibility, shouldEndSurvey, type LogicRule } from '@/utils/logicEvaluator';
import { loadProgress, clearProgress, createAutoSaver, type AutoSaver } from '@/utils/autoSave';
import { QuestionType } from '@/types';

// Display mode for questions
export type SurveyDisplayMode = 'one-by-one' | 'all-at-once';

interface PublicSurveyState {
  // Survey data
  survey: PublicSurvey | null;
  shareToken: string | null;

  // Answers
  answers: Record<string, AnswerValue>;

  // Validation errors
  errors: Record<string, string>;

  // Navigation state
  currentQuestionIndex: number;
  viewMode: PublicSurveyViewMode;
  displayMode: SurveyDisplayMode;

  // UI state
  isSubmitting: boolean;
  isLoading: boolean;
  error: string | null;
  hasRestoredProgress: boolean;

  // Computed
  progress: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  visibleQuestions: PublicQuestion[];

  // Auto-save instance
  autoSaver: AutoSaver | null;
}

interface PublicSurveyActions {
  // Initialization
  setSurvey: (survey: PublicSurvey) => void;
  setShareToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Display mode
  setDisplayMode: (mode: SurveyDisplayMode) => void;

  // Answer management
  setAnswer: (questionId: string, value: AnswerValue) => void;
  clearAnswer: (questionId: string) => void;

  // Validation
  validateQuestion: (questionId: string) => ValidationResult;
  validateCurrentQuestion: () => ValidationResult;
  validateAll: () => boolean;
  setValidationError: (questionId: string, error: string | null) => void;
  clearErrors: () => void;

  // Navigation
  goToQuestion: (index: number) => void;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;

  // View mode
  setViewMode: (mode: PublicSurveyViewMode) => void;
  startSurvey: () => void;
  completeSurvey: () => void;

  // Submission
  setSubmitting: (submitting: boolean) => void;

  // Progress restoration
  restoreProgress: () => boolean;
  clearSavedProgress: () => void;

  // Conditional logic
  updateVisibleQuestions: () => void;

  // Reset
  reset: () => void;

  // Internal
  updateProgress: () => void;
}

const initialState: PublicSurveyState = {
  survey: null,
  shareToken: null,
  answers: {},
  errors: {},
  currentQuestionIndex: 0,
  viewMode: 'welcome',
  displayMode: 'one-by-one',
  isSubmitting: false,
  isLoading: true,
  error: null,
  hasRestoredProgress: false,
  progress: 0,
  canGoNext: true,
  canGoPrevious: false,
  visibleQuestions: [],
  autoSaver: null,
};

// Validation helpers
function validateRequired(value: AnswerValue, question: PublicQuestion): ValidationResult {
  if (!question.isRequired) {
    return { isValid: true };
  }

  if (value === null || value === undefined) {
    return { isValid: false, errorMessage: 'validation.questionRequired' };
  }

  if (typeof value === 'string' && value.trim() === '') {
    return { isValid: false, errorMessage: 'validation.questionRequired' };
  }

  if (Array.isArray(value) && value.length === 0) {
    return { isValid: false, errorMessage: 'validation.selectAtLeastOne' };
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    // Matrix answers - check if all rows are answered
    const matrixRows = question.settings?.matrixRows || [];
    const answeredRows = Object.keys(value as Record<string, string>);
    if (answeredRows.length < matrixRows.length) {
      return { isValid: false, errorMessage: 'validation.answerAllRows' };
    }
  }

  return { isValid: true };
}

function validateQuestionType(value: AnswerValue, question: PublicQuestion): ValidationResult {
  if (value === null || value === undefined) {
    return { isValid: true }; // Skip type validation if no value
  }

  const settings = question.settings || {};

  switch (question.type) {
    case QuestionType.Text:
    case QuestionType.LongText:
    case QuestionType.ShortText: {
      if (typeof value === 'string' && settings.maxLength && value.length > settings.maxLength) {
        return { isValid: false, errorMessage: settings.validationMessage || 'validation.maxCharacters' };
      }
      break;
    }
    case QuestionType.Email: {
      if (typeof value === 'string') {
        if (settings.maxLength && value.length > settings.maxLength) {
          return { isValid: false, errorMessage: settings.validationMessage || 'validation.maxCharacters' };
        }
        // Validate email format
        const emailPattern = settings.validationPattern || '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$';
        if (!new RegExp(emailPattern).test(value)) {
          return { isValid: false, errorMessage: settings.validationMessage || 'validation.email' };
        }
      }
      break;
    }
    case QuestionType.Phone: {
      if (typeof value === 'string') {
        if (settings.maxLength && value.length > settings.maxLength) {
          return { isValid: false, errorMessage: settings.validationMessage || 'validation.maxCharacters' };
        }
        // Validate phone format using preset or custom pattern
        if (settings.validationPattern || settings.validationPreset) {
          const pattern = settings.validationPattern || getPhonePatternFromPreset(settings.validationPreset);
          if (pattern && !new RegExp(pattern).test(value)) {
            return { isValid: false, errorMessage: settings.validationMessage || 'validation.phone' };
          }
        }
      }
      break;
    }
    case QuestionType.Url: {
      if (typeof value === 'string') {
        if (settings.maxLength && value.length > settings.maxLength) {
          return { isValid: false, errorMessage: settings.validationMessage || 'validation.maxCharacters' };
        }
        // Validate URL format
        const urlPattern = settings.validationPattern || '^(https?:\\/\\/)?([\\w\\-]+\\.)+[\\w\\-]+(\\/[\\w\\-.,@?^=%&:/~+#]*)?$';
        if (!new RegExp(urlPattern).test(value)) {
          return { isValid: false, errorMessage: settings.validationMessage || 'validation.url' };
        }
      }
      break;
    }
    case QuestionType.Number: {
      if (typeof value === 'string') {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          return { isValid: false, errorMessage: 'validation.number' };
        }
        if (settings.minValue !== undefined && numValue < settings.minValue) {
          return { isValid: false, errorMessage: 'validation.minValue' };
        }
        if (settings.maxValue !== undefined && numValue > settings.maxValue) {
          return { isValid: false, errorMessage: 'validation.maxValue' };
        }
      }
      break;
    }
    case QuestionType.Rating:
    case QuestionType.Scale:
    case QuestionType.NPS: {
      const numValue = typeof value === 'string' ? parseFloat(value) : (value as number);
      const min = settings.minValue ?? 1;
      const max = settings.maxValue ?? 5;
      if (numValue < min || numValue > max) {
        return { isValid: false, errorMessage: 'validation.valueBetween' };
      }
      break;
    }
    case QuestionType.MultipleChoice:
    case QuestionType.Checkbox: {
      // Validation for multiple choice can be added here
      break;
    }
  }

  return { isValid: true };
}

// Helper to get phone pattern from preset ID
function getPhonePatternFromPreset(presetId?: string): string | null {
  if (!presetId) return null;

  const presets: Record<string, string> = {
    'phone-international': '^\\+?[1-9]\\d{1,14}$',
    'phone-us': '^\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$',
    'phone-uk': '^(\\+44|0)\\d{10,11}$',
    'phone-eu': '^\\+?[0-9\\s-]{8,20}$',
    'phone-digits-only': '^[0-9]{7,15}$',
    'phone-flexible': '^[+]?[(]?[0-9]{1,4}[)]?[-\\s./0-9]*$',
  };

  return presets[presetId] || null;
}

// Helper to get visible questions based on conditional logic
function computeVisibleQuestions(questions: PublicQuestion[], answers: Record<string, AnswerValue>): PublicQuestion[] {
  const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
  const visible: PublicQuestion[] = [];

  // Build questions with logic once
  const questionsWithLogic = questions.map((q) => ({
    id: q.id,
    order: q.order,
    logicRules: (q as PublicQuestion & { logicRules?: LogicRule[] }).logicRules,
  }));

  for (const question of sortedQuestions) {
    const result = evaluateQuestionVisibility(question.id, questionsWithLogic, answers);

    if (result.visible) {
      visible.push(question);
    }

    // Check for end survey condition
    if (result.endSurvey) {
      break;
    }
  }

  return visible;
}

export const usePublicSurveyStore = create<PublicSurveyState & PublicSurveyActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Initialization
      setSurvey: (survey) => {
        const { shareToken } = get();
        const sortedQuestions = survey.questions.sort((a, b) => a.order - b.order);
        const visibleQuestions = computeVisibleQuestions(sortedQuestions, {});

        // Create auto-saver instance
        const autoSaver = shareToken && survey.id ? createAutoSaver(shareToken, survey.id) : null;

        set({
          survey,
          visibleQuestions,
          viewMode: survey.welcomeMessage ? 'welcome' : 'questions',
          isLoading: false,
          error: null,
          autoSaver,
        });
      },

      setShareToken: (token) => set({ shareToken: token }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error, isLoading: false, viewMode: 'error' }),

      // Display mode
      setDisplayMode: (mode) => set({ displayMode: mode }),

      // Answer management
      setAnswer: (questionId, value) => {
        const { errors, validateQuestion, survey, shareToken, currentQuestionIndex, autoSaver } = get();
        const newErrors = { ...errors };

        // Clear error when user starts typing
        delete newErrors[questionId];

        set((state) => ({
          answers: { ...state.answers, [questionId]: value },
          errors: newErrors,
        }));

        // Validate on change
        const result = validateQuestion(questionId);
        if (!result.isValid) {
          set((state) => ({
            errors: { ...state.errors, [questionId]: result.errorMessage || 'Invalid answer' },
          }));
        }

        // Update visible questions based on conditional logic
        get().updateVisibleQuestions();

        // Update progress
        get().updateProgress();

        // Auto-save progress
        if (autoSaver && survey && shareToken) {
          autoSaver.save(get().answers, currentQuestionIndex);
        }
      },

      clearAnswer: (questionId) => {
        set((state) => {
          const newAnswers = { ...state.answers };
          delete newAnswers[questionId];
          const newErrors = { ...state.errors };
          delete newErrors[questionId];
          return { answers: newAnswers, errors: newErrors };
        });
        get().updateProgress();
      },

      // Validation
      validateQuestion: (questionId) => {
        const { survey, answers } = get();
        const question = survey?.questions.find((q) => q.id === questionId);

        if (!question) {
          return { isValid: true };
        }

        const value = answers[questionId];

        // Required validation
        const requiredResult = validateRequired(value, question);
        if (!requiredResult.isValid) {
          return requiredResult;
        }

        // Type-specific validation
        return validateQuestionType(value, question);
      },

      validateCurrentQuestion: () => {
        const { visibleQuestions, currentQuestionIndex, validateQuestion } = get();
        const currentQuestion = visibleQuestions[currentQuestionIndex];

        if (!currentQuestion) {
          return { isValid: true };
        }

        return validateQuestion(currentQuestion.id);
      },

      validateAll: () => {
        const { visibleQuestions, validateQuestion } = get();
        const errors: Record<string, string> = {};
        let isValid = true;

        for (const question of visibleQuestions) {
          const result = validateQuestion(question.id);
          if (!result.isValid) {
            errors[question.id] = result.errorMessage || 'Invalid answer';
            isValid = false;
          }
        }

        set({ errors });
        return isValid;
      },

      setValidationError: (questionId, error) => {
        set((state) => {
          const newErrors = { ...state.errors };
          if (error) {
            newErrors[questionId] = error;
          } else {
            delete newErrors[questionId];
          }
          return { errors: newErrors };
        });
      },

      clearErrors: () => set({ errors: {} }),

      // Navigation
      goToQuestion: (index) => {
        const { visibleQuestions, autoSaver, answers, survey, shareToken } = get();
        if (index >= 0 && index < visibleQuestions.length) {
          set({
            currentQuestionIndex: index,
            canGoNext: index < visibleQuestions.length - 1,
            canGoPrevious: index > 0,
          });

          // Auto-save on navigation
          if (autoSaver && survey && shareToken) {
            autoSaver.save(answers, index);
          }
        }
      },

      goToNextQuestion: () => {
        const { currentQuestionIndex, visibleQuestions, validateCurrentQuestion, autoSaver, answers, survey, shareToken } = get();

        // Validate current question before moving
        const result = validateCurrentQuestion();
        if (!result.isValid) {
          const currentQuestion = visibleQuestions[currentQuestionIndex];
          set((state) => ({
            errors: { ...state.errors, [currentQuestion.id]: result.errorMessage || 'Invalid answer' },
          }));
          return;
        }

        // Check if we should end the survey based on logic
        const questionsWithLogic =
          survey?.questions.map((q) => ({
            id: q.id,
            order: q.order,
            logicRules: (q as PublicQuestion & { logicRules?: LogicRule[] }).logicRules,
          })) || [];

        if (shouldEndSurvey(questionsWithLogic, answers)) {
          set({ viewMode: 'thank-you' });
          return;
        }

        if (currentQuestionIndex < visibleQuestions.length - 1) {
          const newIndex = currentQuestionIndex + 1;
          set({
            currentQuestionIndex: newIndex,
            canGoNext: newIndex < visibleQuestions.length - 1,
            canGoPrevious: true,
          });

          // Auto-save on navigation
          if (autoSaver && survey && shareToken) {
            autoSaver.save(answers, newIndex);
          }
        }
      },

      goToPreviousQuestion: () => {
        const { currentQuestionIndex, autoSaver, answers, survey, shareToken } = get();
        if (currentQuestionIndex > 0) {
          const newIndex = currentQuestionIndex - 1;
          set({
            currentQuestionIndex: newIndex,
            canGoNext: true,
            canGoPrevious: newIndex > 0,
          });

          // Auto-save on navigation
          if (autoSaver && survey && shareToken) {
            autoSaver.save(answers, newIndex);
          }
        }
      },

      // View mode
      setViewMode: (mode) => set({ viewMode: mode }),

      startSurvey: () => {
        const { restoreProgress } = get();

        // Try to restore saved progress
        const restored = restoreProgress();

        if (!restored) {
          set({
            viewMode: 'questions',
            currentQuestionIndex: 0,
            canGoNext: true,
            canGoPrevious: false,
          });
        }
      },

      completeSurvey: () => {
        const { shareToken, autoSaver } = get();

        // Clear saved progress on completion
        if (shareToken) {
          clearProgress(shareToken);
        }

        // Cancel any pending auto-save
        if (autoSaver) {
          autoSaver.cancel();
        }

        set({ viewMode: 'thank-you' });
      },

      // Submission
      setSubmitting: (submitting) => set({ isSubmitting: submitting }),

      // Progress restoration
      restoreProgress: () => {
        const { shareToken, survey } = get();

        if (!shareToken || !survey) return false;

        const savedProgress = loadProgress(shareToken);

        if (savedProgress && savedProgress.surveyId === survey.id) {
          const answers = savedProgress.answers as Record<string, AnswerValue>;
          const visibleQuestions = computeVisibleQuestions(survey.questions, answers);

          // Ensure the saved index is valid for current visible questions
          const safeIndex = Math.min(savedProgress.currentQuestionIndex, visibleQuestions.length - 1);

          set({
            answers,
            currentQuestionIndex: Math.max(0, safeIndex),
            visibleQuestions,
            viewMode: 'questions',
            hasRestoredProgress: true,
            canGoNext: safeIndex < visibleQuestions.length - 1,
            canGoPrevious: safeIndex > 0,
          });

          // Update progress after restoring
          get().updateProgress();

          return true;
        }

        return false;
      },

      clearSavedProgress: () => {
        const { shareToken } = get();
        if (shareToken) {
          clearProgress(shareToken);
        }
        set({ hasRestoredProgress: false });
      },

      // Conditional logic
      updateVisibleQuestions: () => {
        const { survey, answers, currentQuestionIndex } = get();

        if (!survey) return;

        const newVisibleQuestions = computeVisibleQuestions(survey.questions, answers);

        // Adjust current index if needed
        let newIndex = currentQuestionIndex;
        if (newIndex >= newVisibleQuestions.length) {
          newIndex = Math.max(0, newVisibleQuestions.length - 1);
        }

        set({
          visibleQuestions: newVisibleQuestions,
          currentQuestionIndex: newIndex,
          canGoNext: newIndex < newVisibleQuestions.length - 1,
          canGoPrevious: newIndex > 0,
        });
      },

      // Reset
      reset: () => {
        const { autoSaver } = get();
        if (autoSaver) {
          autoSaver.cancel();
        }
        set(initialState);
      },

      // Internal: Update progress
      updateProgress: () => {
        const { visibleQuestions, answers } = get();
        if (visibleQuestions.length === 0) {
          set({ progress: 0 });
          return;
        }

        const answeredCount = visibleQuestions.filter((q) => {
          const value = answers[q.id];
          if (value === null || value === undefined) return false;
          if (typeof value === 'string' && value.trim() === '') return false;
          if (Array.isArray(value) && value.length === 0) return false;
          return true;
        }).length;

        set({ progress: Math.round((answeredCount / visibleQuestions.length) * 100) });
      },
    }),
    { name: 'public-survey-store' }
  )
);

// Helper function to format answer for submission
export function formatAnswerForSubmission(value: AnswerValue): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value || undefined;
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  if (Array.isArray(value)) {
    // For multiple choice or ranking
    if (value.length === 0) return undefined;
    if (value[0] instanceof File) {
      // File upload - handle separately
      return undefined;
    }
    return JSON.stringify(value);
  }

  if (typeof value === 'object') {
    // Matrix answers
    return JSON.stringify(value);
  }

  return undefined;
}
