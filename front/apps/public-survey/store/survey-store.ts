import { create } from "zustand";
import type {
  PublicSurvey,
  PublicSurveyViewMode,
  AnswerValue,
} from "@survey/types";
import { validateAnswer } from "@survey/validation";
import {
  startSurveyResponse,
  submitSurveyResponse,
  type SubmitAnswerRequest,
} from "@survey/api-client";

interface SurveyState {
  // Configuration
  apiBaseUrl: string;
  shareToken: string | null;
  
  // Survey data
  survey: PublicSurvey | null;
  responseId: string | null;
  
  // UI state
  viewMode: PublicSurveyViewMode;
  currentQuestionIndex: number;
  
  // Answer state
  answers: Record<string, AnswerValue>;
  errors: Record<string, string>;
  
  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  
  // Actions
  setApiBaseUrl: (url: string) => void;
  setShareToken: (token: string) => void;
  setSurvey: (survey: PublicSurvey) => void;
  setViewMode: (mode: PublicSurveyViewMode) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setAnswer: (questionId: string, value: AnswerValue) => void;
  validateCurrentQuestion: () => boolean;
  validateAllQuestions: () => boolean;
  startResponse: () => Promise<void>;
  submitResponse: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  apiBaseUrl: "",
  shareToken: null,
  survey: null,
  responseId: null,
  viewMode: "welcome" as PublicSurveyViewMode,
  currentQuestionIndex: 0,
  answers: {},
  errors: {},
  isLoading: false,
  isSubmitting: false,
  error: null,
};

export const useSurveyStore = create<SurveyState>((set, get) => ({
  ...initialState,

  setApiBaseUrl: (url) => set({ apiBaseUrl: url }),

  setShareToken: (token) => set({ shareToken: token }),

  setSurvey: (survey) => set({ survey, viewMode: "welcome" }),

  setViewMode: (mode) => set({ viewMode: mode }),

  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),

  setAnswer: (questionId, value) => {
    const { answers, errors, survey } = get();
    const newAnswers = { ...answers, [questionId]: value };
    
    // Clear error when user provides an answer
    const newErrors = { ...errors };
    delete newErrors[questionId];
    
    // Validate the answer
    const question = survey?.questions.find((q) => q.id === questionId);
    if (question) {
      const result = validateAnswer(value, question);
      if (!result.isValid && result.errorMessage) {
        newErrors[questionId] = result.errorMessage;
      }
    }
    
    set({ answers: newAnswers, errors: newErrors });
  },

  validateCurrentQuestion: () => {
    const { survey, currentQuestionIndex, answers, errors } = get();
    if (!survey) return false;

    const question = survey.questions[currentQuestionIndex];
    if (!question) return true;

    const value = answers[question.id];
    const result = validateAnswer(value, question);

    if (!result.isValid && result.errorMessage) {
      set({ errors: { ...errors, [question.id]: result.errorMessage } });
      return false;
    }

    return true;
  },

  validateAllQuestions: () => {
    const { survey, answers } = get();
    if (!survey) return false;

    const newErrors: Record<string, string> = {};
    let isValid = true;

    for (const question of survey.questions) {
      const value = answers[question.id];
      const result = validateAnswer(value, question);

      if (!result.isValid && result.errorMessage) {
        newErrors[question.id] = result.errorMessage;
        isValid = false;
      }
    }

    set({ errors: newErrors });
    return isValid;
  },

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
        isLoading: false,
        viewMode: "questions",
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to start survey",
        viewMode: "error",
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
      const submitAnswers: SubmitAnswerRequest[] = survey.questions.map((question) => {
        const value = answers[question.id];
        
        // Handle different answer types
        if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
          return {
            questionId: question.id,
            selectedOptionIds: value as string[],
          };
        }
        
        if (typeof value === "string") {
          return {
            questionId: question.id,
            text: value,
          };
        }
        
        if (typeof value === "number") {
          return {
            questionId: question.id,
            text: String(value),
          };
        }
        
        return {
          questionId: question.id,
          text: value ? String(value) : undefined,
        };
      });

      await submitSurveyResponse(apiBaseUrl, {
        responseId: responseId || undefined,
        surveyId: survey.id,
        answers: submitAnswers,
      });

      set({
        isSubmitting: false,
        viewMode: "thank-you",
      });
    } catch (error) {
      set({
        isSubmitting: false,
        error: error instanceof Error ? error.message : "Failed to submit response",
      });
    }
  },

  reset: () => set(initialState),
}));
