/**
 * Survey Store - Complete state management for public survey experience
 *
 * Features:
 * - Multi-step navigation with validation
 * - Conditional logic evaluation
 * - Progress auto-save and restoration
 * - Both one-by-one and all-at-once display modes
 * - Proper error handling and loading states
 * - Internationalization support
 */

import { create } from 'zustand';
import { QuestionType } from '@survey/types';
import type { PublicSurvey, PublicQuestion, AnswerValue, PublicSurveyViewMode, SubmitAnswerRequest, QuestionOption } from '@survey/types';
import { validateAnswer } from '@survey/validation';
import { startSurveyResponse, submitSurveyResponse } from '@survey/api-client';
import { getVisibleQuestions, shouldEndSurvey, type QuestionWithLogic } from '@/lib/logic-evaluator';
import { loadProgress, clearProgress, createAutoSaver, type AutoSaver } from '@/lib/progress-persistence';
import type { SupportedLanguage } from '@/lib/i18n';

// ============ Types ============

export type SurveyDisplayMode = 'one-by-one' | 'all-at-once';

interface SurveyState {
  // Configuration
  apiBaseUrl: string;
  shareToken: string | null;
  language: SupportedLanguage;

  // Survey data
  survey: PublicSurvey | null;
  responseId: string | null;
  responseStartedAt: string | null;

  // UI state
  viewMode: PublicSurveyViewMode;
  displayMode: SurveyDisplayMode;
  currentQuestionIndex: number;
  showResumeDialog: boolean;

  // Answer state
  answers: Record<string, AnswerValue>;
  errors: Record<string, string>;

  // Computed state
  visibleQuestions: PublicQuestion[];
  progress: number;
  canGoNext: boolean;
  canGoPrevious: boolean;

  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  hasRestoredProgress: boolean;

  // Auto-save
  autoSaver: AutoSaver | null;
}

interface SurveyActions {
  // Initialization
  setApiBaseUrl: (url: string) => void;
  setShareToken: (token: string) => void;
  setSurvey: (survey: PublicSurvey) => void;
  initialize: (survey: PublicSurvey, shareToken: string, apiBaseUrl: string, language?: SupportedLanguage) => void;

  // Display mode
  setDisplayMode: (mode: SurveyDisplayMode) => void;

  // Answer management
  setAnswer: (questionId: string, value: AnswerValue) => void;
  clearAnswer: (questionId: string) => void;

  // Validation
  validateQuestion: (questionId: string) => { isValid: boolean; errorMessage?: string };
  validateCurrentQuestion: () => { isValid: boolean; errorMessage?: string };
  validateAllQuestions: () => boolean;
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

  // API operations
  startResponse: () => Promise<void>;
  submitResponse: () => Promise<void>;

  // Progress restoration
  hasSavedProgress: () => boolean;
  restoreProgress: () => boolean;
  clearSavedProgress: () => void;
  resumeSurvey: () => void;
  startFresh: () => void;
  dismissResumeDialog: () => void;

  // Internal
  updateVisibleQuestions: () => void;
  updateProgress: () => void;
  reset: () => void;
}

// ============ Initial State ============

const initialState: SurveyState = {
  apiBaseUrl: '',
  shareToken: null,
  language: 'en',
  survey: null,
  responseId: null,
  responseStartedAt: null,
  viewMode: 'welcome',
  displayMode: 'one-by-one',
  currentQuestionIndex: 0,
  showResumeDialog: false,
  answers: {},
  errors: {},
  visibleQuestions: [],
  progress: 0,
  canGoNext: true,
  canGoPrevious: false,
  isLoading: false,
  isSubmitting: false,
  error: null,
  hasRestoredProgress: false,
  autoSaver: null,
};

// ============ Helpers ============

function computeVisibleQuestions(questions: PublicQuestion[], answers: Record<string, AnswerValue>): PublicQuestion[] {
  // Cast to QuestionWithLogic for logic evaluation
  const questionsWithLogic = questions as QuestionWithLogic[];
  return getVisibleQuestions(questionsWithLogic, answers);
}

function isChoiceQuestion(type: QuestionType): boolean {
  const choiceTypes: QuestionType[] = [
    QuestionType.SingleChoice,
    QuestionType.MultipleChoice,
    QuestionType.Dropdown,
    QuestionType.Checkbox,
    QuestionType.Ranking,
    QuestionType.YesNo,
  ];
  return choiceTypes.includes(type);
}

/**
 * Format answer value for submission to backend
 */
function formatAnswerForSubmission(value: AnswerValue, questionType: QuestionType, options?: QuestionOption[]): SubmitAnswerRequest | null {
  if (value === null || value === undefined) {
    return null;
  }

  // Choice questions - convert to selectedOptionIds
  if (isChoiceQuestion(questionType) && options) {
    if (typeof value === 'string') {
      // Handle "Other" pattern
      if (value.startsWith('__other__:')) {
        const otherText = value.substring('__other__:'.length);
        return { questionId: '', text: otherText };
      }

      // Find option by ID or text
      const option = options.find((o) => o.id === value) || options.find((o) => o.text === value);
      if (option) {
        return { questionId: '', selectedOptionIds: [option.id] };
      }

      return { questionId: '', selectedOptionIds: [value] };
    }

    if (Array.isArray(value)) {
      const selectedIds: string[] = [];
      let otherText: string | undefined;

      for (const item of value) {
        if (typeof item === 'string') {
          if (item.startsWith('__other__:')) {
            otherText = item.substring('__other__:'.length);
          } else {
            const option = options.find((o) => o.id === item) || options.find((o) => o.text === item);
            if (option) {
              selectedIds.push(option.id);
            } else {
              selectedIds.push(item);
            }
          }
        }
      }

      if (selectedIds.length === 0 && !otherText) {
        return null;
      }

      return {
        questionId: '',
        selectedOptionIds: selectedIds.length > 0 ? selectedIds : undefined,
        text: otherText,
      };
    }
  }

  // Text-based questions
  if (typeof value === 'string') {
    return value ? { questionId: '', text: value } : null;
  }

  if (typeof value === 'number') {
    return { questionId: '', text: value.toString() };
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    if (value[0] instanceof File) {
      // File upload handled separately
      return null;
    }
    // Array of strings (ranking, etc.)
    if (value.every((v) => typeof v === 'string')) {
      return { questionId: '', selectedOptionIds: value as string[] };
    }
    return { questionId: '', text: JSON.stringify(value) };
  }

  if (typeof value === 'object') {
    // Matrix answers
    return { questionId: '', text: JSON.stringify(value) };
  }

  return null;
}

// ============ Store ============

export const useSurveyStore = create<SurveyState & SurveyActions>((set, get) => ({
  ...initialState,

  // ============ Initialization ============

  setApiBaseUrl: (url) => set({ apiBaseUrl: url }),

  setShareToken: (token) => set({ shareToken: token }),

  setSurvey: (survey) => {
    const sortedQuestions = [...survey.questions].sort((a, b) => a.order - b.order);
    const visibleQuestions = computeVisibleQuestions(sortedQuestions, {});
    const hasWelcome = !!survey.welcomeMessage;

    set({
      survey: { ...survey, questions: sortedQuestions },
      visibleQuestions,
      viewMode: hasWelcome ? 'welcome' : 'questions',
      isLoading: false,
      error: null,
    });
  },

  initialize: (survey, shareToken, apiBaseUrl, language = 'en') => {
    const sortedQuestions = [...survey.questions].sort((a, b) => a.order - b.order);
    const visibleQuestions = computeVisibleQuestions(sortedQuestions, {});
    const hasWelcome = !!survey.welcomeMessage;

    // Create auto-saver
    const autoSaver = createAutoSaver(shareToken, survey.id);

    set({
      survey: { ...survey, questions: sortedQuestions },
      shareToken,
      apiBaseUrl,
      language,
      visibleQuestions,
      viewMode: hasWelcome ? 'welcome' : 'questions',
      isLoading: false,
      error: null,
      autoSaver,
    });
  },

  // ============ Display Mode ============

  setDisplayMode: (mode) => set({ displayMode: mode }),

  // ============ Answer Management ============

  setAnswer: (questionId, value) => {
    const { errors, survey, shareToken, currentQuestionIndex, autoSaver } = get();
    const newErrors = { ...errors };

    // Clear error when user provides an answer
    delete newErrors[questionId];

    set((state) => ({
      answers: { ...state.answers, [questionId]: value },
      errors: newErrors,
    }));

    // Validate on change
    const question = survey?.questions.find((q) => q.id === questionId);
    if (question) {
      const result = validateAnswer(value, question);
      if (!result.isValid && result.errorMessage) {
        set((state) => ({
          errors: { ...state.errors, [questionId]: result.errorMessage! },
        }));
      }
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

  // ============ Validation ============

  validateQuestion: (questionId) => {
    const { survey, answers } = get();
    const question = survey?.questions.find((q) => q.id === questionId);

    if (!question) {
      return { isValid: true };
    }

    const value = answers[questionId];
    return validateAnswer(value, question);
  },

  validateCurrentQuestion: () => {
    const { visibleQuestions, currentQuestionIndex, validateQuestion } = get();
    const currentQuestion = visibleQuestions[currentQuestionIndex];

    if (!currentQuestion) {
      return { isValid: true };
    }

    return validateQuestion(currentQuestion.id);
  },

  validateAllQuestions: () => {
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

  // ============ Navigation ============

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
        errors: {
          ...state.errors,
          [currentQuestion.id]: result.errorMessage || 'Invalid answer',
        },
      }));
      return;
    }

    // Check if we should end the survey based on logic
    const questionsWithLogic = (survey?.questions || []) as QuestionWithLogic[];
    if (shouldEndSurvey(questionsWithLogic, answers)) {
      get().submitResponse();
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

  // ============ View Mode ============

  setViewMode: (mode) => set({ viewMode: mode }),

  startSurvey: () => {
    const { hasSavedProgress } = get();

    // Check if there's saved progress - show dialog to ask user
    if (hasSavedProgress()) {
      set({ showResumeDialog: true });
      return;
    }

    // No saved progress - start fresh
    set({
      viewMode: 'questions',
      currentQuestionIndex: 0,
      canGoNext: true,
      canGoPrevious: false,
    });

    // Start the response on the server
    get().startResponse();
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

  // ============ API Operations ============

  startResponse: async () => {
    const { apiBaseUrl, survey } = get();
    if (!survey) return;

    set({ isLoading: true, error: null });

    try {
      const result = await startSurveyResponse(apiBaseUrl, {
        surveyId: survey.id,
      });

      set({
        responseId: result.responseId,
        responseStartedAt: result.startedAt,
        isLoading: false,
        viewMode: 'questions',
      });
    } catch (error) {
      // If start fails, continue anyway - submit will create response
      console.warn('Failed to start response:', error);
      set({
        isLoading: false,
        viewMode: 'questions',
      });
    }
  },

  submitResponse: async () => {
    const { apiBaseUrl, survey, responseId, answers, validateAllQuestions } = get();

    if (!survey) return;

    // Validate all questions before submitting
    if (!validateAllQuestions()) {
      return;
    }

    set({ isSubmitting: true, error: null });

    try {
      // Convert answers to API format
      const submitAnswers: SubmitAnswerRequest[] = [];

      for (const question of survey.questions) {
        const value = answers[question.id];
        const formatted = formatAnswerForSubmission(value, question.type, question.settings?.options);

        if (formatted) {
          submitAnswers.push({
            ...formatted,
            questionId: question.id,
          });
        }
      }

      await submitSurveyResponse(apiBaseUrl, {
        responseId: responseId || undefined,
        surveyId: survey.id,
        answers: submitAnswers,
      });

      get().completeSurvey();
      set({ isSubmitting: false });
    } catch (error) {
      set({
        isSubmitting: false,
        error: error instanceof Error ? error.message : 'Failed to submit response',
      });
    }
  },

  // ============ Progress Restoration ============

  hasSavedProgress: () => {
    const { shareToken, survey } = get();
    if (!shareToken || !survey) return false;

    const savedProgress = loadProgress(shareToken);
    return savedProgress !== null && savedProgress.surveyId === survey.id;
  },

  restoreProgress: () => {
    const { shareToken, survey } = get();

    if (!shareToken || !survey) return false;

    const savedProgress = loadProgress(shareToken);

    if (savedProgress && savedProgress.surveyId === survey.id) {
      const answers = savedProgress.answers;
      const visibleQuestions = computeVisibleQuestions(survey.questions, answers);

      // Ensure the saved index is valid
      const safeIndex = Math.min(savedProgress.currentQuestionIndex, visibleQuestions.length - 1);

      set({
        answers,
        currentQuestionIndex: Math.max(0, safeIndex),
        visibleQuestions,
        viewMode: 'questions',
        hasRestoredProgress: true,
        showResumeDialog: false,
        canGoNext: safeIndex < visibleQuestions.length - 1,
        canGoPrevious: safeIndex > 0,
        responseId: savedProgress.responseId || null,
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
    set({ hasRestoredProgress: false, showResumeDialog: false });
  },

  resumeSurvey: () => {
    const { restoreProgress, startResponse } = get();

    // Restore saved progress
    const restored = restoreProgress();

    if (restored) {
      // Start/continue the response on the server
      startResponse();
    } else {
      // Fallback if restore failed - start fresh
      set({
        viewMode: 'questions',
        currentQuestionIndex: 0,
        showResumeDialog: false,
        canGoNext: true,
        canGoPrevious: false,
      });
      startResponse();
    }
  },

  startFresh: () => {
    const { shareToken, startResponse } = get();

    // Clear saved progress
    if (shareToken) {
      clearProgress(shareToken);
    }

    // Start from the beginning
    set({
      answers: {},
      errors: {},
      currentQuestionIndex: 0,
      viewMode: 'questions',
      showResumeDialog: false,
      hasRestoredProgress: false,
      canGoNext: true,
      canGoPrevious: false,
    });

    // Update visible questions with empty answers
    get().updateVisibleQuestions();

    // Start the response on the server
    startResponse();
  },

  dismissResumeDialog: () => {
    set({ showResumeDialog: false });
  },

  // ============ Internal ============

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

    set({
      progress: Math.round((answeredCount / visibleQuestions.length) * 100),
    });
  },

  reset: () => {
    const { autoSaver } = get();
    if (autoSaver) {
      autoSaver.cancel();
    }
    set(initialState);
  },
}));
