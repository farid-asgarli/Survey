// Auto-save utility for public survey responses

import { getCurrentISOTimestamp } from './dateFormatters';

const STORAGE_PREFIX = 'survey_autosave_';
const AUTOSAVE_DEBOUNCE_MS = 1000;

interface AutoSaveData {
  surveyId: string;
  shareToken: string;
  answers: Record<string, unknown>;
  currentQuestionIndex: number;
  savedAt: string;
}

/**
 * Gets the storage key for a survey
 */
function getStorageKey(shareToken: string): string {
  return `${STORAGE_PREFIX}${shareToken}`;
}

/**
 * Saves survey progress to localStorage
 */
export function saveProgress(shareToken: string, surveyId: string, answers: Record<string, unknown>, currentQuestionIndex: number): void {
  try {
    const data: AutoSaveData = {
      surveyId,
      shareToken,
      answers,
      currentQuestionIndex,
      savedAt: getCurrentISOTimestamp(),
    };
    localStorage.setItem(getStorageKey(shareToken), JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save survey progress:', error);
  }
}

/**
 * Loads saved survey progress from localStorage
 */
export function loadProgress(shareToken: string): AutoSaveData | null {
  try {
    const data = localStorage.getItem(getStorageKey(shareToken));
    if (!data) return null;

    const parsed: AutoSaveData = JSON.parse(data);

    // Validate the saved data
    if (parsed.shareToken !== shareToken) {
      return null;
    }

    // Check if the saved data is older than 7 days
    const savedAt = new Date(parsed.savedAt);
    const now = new Date();
    const daysDiff = (now.getTime() - savedAt.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff > 7) {
      clearProgress(shareToken);
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn('Failed to load survey progress:', error);
    return null;
  }
}

/**
 * Clears saved survey progress
 */
export function clearProgress(shareToken: string): void {
  try {
    localStorage.removeItem(getStorageKey(shareToken));
  } catch (error) {
    console.warn('Failed to clear survey progress:', error);
  }
}

/**
 * Checks if there is saved progress for a survey
 */
export function hasProgress(shareToken: string): boolean {
  return loadProgress(shareToken) !== null;
}

/**
 * Creates a debounced auto-save function
 */
export function createAutoSaver(shareToken: string, surveyId: string, debounceMs: number = AUTOSAVE_DEBOUNCE_MS) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return {
    save: (answers: Record<string, unknown>, currentQuestionIndex: number) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        saveProgress(shareToken, surveyId, answers, currentQuestionIndex);
      }, debounceMs);
    },

    saveImmediate: (answers: Record<string, unknown>, currentQuestionIndex: number) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      saveProgress(shareToken, surveyId, answers, currentQuestionIndex);
    },

    cancel: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    },
  };
}
