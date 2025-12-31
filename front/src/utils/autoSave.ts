// Auto-save utility for public survey responses

import { getCurrentISOTimestamp } from './dateFormatters';

// ============ Configuration ============
const STORAGE_PREFIX = 'survey_autosave_';
const AUTOSAVE_DEBOUNCE_MS = 1000;
const EXPIRY_DAYS = 7;
const SCHEMA_VERSION = 1;

// ============ Types ============
export interface AutoSaveData {
  version: number;
  surveyId: string;
  shareToken: string;
  answers: Record<string, unknown>;
  currentQuestionIndex: number;
  savedAt: string;
}

export interface AutoSaver {
  /** Save with debounce */
  save: (answers: Record<string, unknown>, currentQuestionIndex: number) => void;
  /** Save immediately without debounce */
  saveImmediate: (answers: Record<string, unknown>, currentQuestionIndex: number) => void;
  /** Cancel pending save and cleanup timer */
  cancel: () => void;
  /** Check if a save is pending */
  isPending: () => boolean;
}

// ============ Storage Helpers ============

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets the storage key for a survey
 */
function getStorageKey(shareToken: string): string {
  return `${STORAGE_PREFIX}${shareToken}`;
}

/**
 * Validates the schema version and structure of saved data
 */
function isValidAutoSaveData(data: unknown): data is AutoSaveData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.surveyId === 'string' &&
    typeof d.shareToken === 'string' &&
    typeof d.answers === 'object' &&
    d.answers !== null &&
    typeof d.currentQuestionIndex === 'number' &&
    typeof d.savedAt === 'string'
  );
}

// ============ Core Functions ============

/**
 * Saves survey progress to localStorage
 */
export function saveProgress(shareToken: string, surveyId: string, answers: Record<string, unknown>, currentQuestionIndex: number): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    const data: AutoSaveData = {
      version: SCHEMA_VERSION,
      surveyId,
      shareToken,
      answers,
      currentQuestionIndex,
      savedAt: getCurrentISOTimestamp(),
    };
    localStorage.setItem(getStorageKey(shareToken), JSON.stringify(data));
    return true;
  } catch (error) {
    // Handle QuotaExceededError - try to clear old data
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded, clearing old survey data');
      clearAllExpiredProgress();
      // Retry once after cleanup
      try {
        const data: AutoSaveData = {
          version: SCHEMA_VERSION,
          surveyId,
          shareToken,
          answers,
          currentQuestionIndex,
          savedAt: getCurrentISOTimestamp(),
        };
        localStorage.setItem(getStorageKey(shareToken), JSON.stringify(data));
        return true;
      } catch {
        console.warn('Failed to save survey progress after cleanup');
      }
    } else {
      console.warn('Failed to save survey progress:', error);
    }
    return false;
  }
}

/**
 * Loads saved survey progress from localStorage
 */
export function loadProgress(shareToken: string): AutoSaveData | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    const data = localStorage.getItem(getStorageKey(shareToken));
    if (!data) return null;

    const parsed: unknown = JSON.parse(data);

    // Validate data structure
    if (!isValidAutoSaveData(parsed)) {
      clearProgress(shareToken);
      return null;
    }

    // Validate the saved data belongs to this token
    if (parsed.shareToken !== shareToken) {
      return null;
    }

    // Check schema version - clear if outdated
    if (parsed.version !== SCHEMA_VERSION) {
      clearProgress(shareToken);
      return null;
    }

    // Check if the saved data is expired
    const savedAt = new Date(parsed.savedAt);
    const now = new Date();
    const daysDiff = (now.getTime() - savedAt.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff > EXPIRY_DAYS) {
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
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    localStorage.removeItem(getStorageKey(shareToken));
  } catch (error) {
    console.warn('Failed to clear survey progress:', error);
  }
}

/**
 * Clears all expired auto-save data from localStorage
 */
export function clearAllExpiredProgress(): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    const now = new Date();
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data) as { savedAt?: string; version?: number };
            const savedAt = parsed.savedAt ? new Date(parsed.savedAt) : null;

            // Remove if expired or wrong version
            if (!savedAt || parsed.version !== SCHEMA_VERSION || (now.getTime() - savedAt.getTime()) / (1000 * 60 * 60 * 24) > EXPIRY_DAYS) {
              keysToRemove.push(key);
            }
          }
        } catch {
          // Invalid data, mark for removal
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.warn('Failed to clear expired progress:', error);
  }
}

/**
 * Checks if there is saved progress for a survey
 */
export function hasProgress(shareToken: string): boolean {
  return loadProgress(shareToken) !== null;
}

/**
 * Creates a debounced auto-save function with proper cleanup
 */
export function createAutoSaver(shareToken: string, surveyId: string, debounceMs: number = AUTOSAVE_DEBOUNCE_MS): AutoSaver {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const clearTimer = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return {
    save: (answers: Record<string, unknown>, currentQuestionIndex: number) => {
      clearTimer();
      timeoutId = setTimeout(() => {
        saveProgress(shareToken, surveyId, answers, currentQuestionIndex);
        timeoutId = null;
      }, debounceMs);
    },

    saveImmediate: (answers: Record<string, unknown>, currentQuestionIndex: number) => {
      clearTimer();
      saveProgress(shareToken, surveyId, answers, currentQuestionIndex);
    },

    cancel: clearTimer,

    isPending: () => timeoutId !== null,
  };
}
