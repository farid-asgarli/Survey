/**
 * Progress Persistence - Auto-save and restore survey progress
 *
 * Uses localStorage to persist partial responses across sessions.
 * This allows users to resume surveys if they accidentally close the tab.
 */

import type { AnswerValue } from '@survey/types';

// ============ Types ============

export interface SavedProgress {
  surveyId: string;
  shareToken: string;
  answers: Record<string, AnswerValue>;
  currentQuestionIndex: number;
  savedAt: number;
  responseId?: string;
}

export interface AutoSaver {
  save: (answers: Record<string, AnswerValue>, currentIndex: number) => void;
  cancel: () => void;
}

// ============ Constants ============

const STORAGE_KEY_PREFIX = 'survey_progress_';
const PROGRESS_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const DEBOUNCE_MS = 1000; // 1 second debounce for auto-save

// ============ Storage Helpers ============

function getStorageKey(shareToken: string): string {
  return `${STORAGE_KEY_PREFIX}${shareToken}`;
}

/**
 * Safely parse JSON, returning null on error
 */
function safeJsonParse<T>(json: string | null): T | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/**
 * Check if localStorage is available
 */
function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// ============ Public API ============

/**
 * Saves survey progress to localStorage
 */
export function saveProgress(
  shareToken: string,
  surveyId: string,
  answers: Record<string, AnswerValue>,
  currentQuestionIndex: number,
  responseId?: string
): void {
  if (!isStorageAvailable()) return;

  const progress: SavedProgress = {
    surveyId,
    shareToken,
    answers,
    currentQuestionIndex,
    savedAt: Date.now(),
    responseId,
  };

  try {
    localStorage.setItem(getStorageKey(shareToken), JSON.stringify(progress));
  } catch (e) {
    // Storage might be full, try to clear old entries
    cleanupOldProgress();
    try {
      localStorage.setItem(getStorageKey(shareToken), JSON.stringify(progress));
    } catch {
      // Still failed, ignore
      console.warn('Failed to save survey progress:', e);
    }
  }
}

/**
 * Loads saved progress from localStorage
 */
export function loadProgress(shareToken: string): SavedProgress | null {
  if (!isStorageAvailable()) return null;

  const stored = localStorage.getItem(getStorageKey(shareToken));
  const progress = safeJsonParse<SavedProgress>(stored);

  if (!progress) return null;

  // Check if progress has expired
  if (Date.now() - progress.savedAt > PROGRESS_EXPIRY_MS) {
    clearProgress(shareToken);
    return null;
  }

  return progress;
}

/**
 * Clears saved progress for a survey
 */
export function clearProgress(shareToken: string): void {
  if (!isStorageAvailable()) return;
  localStorage.removeItem(getStorageKey(shareToken));
}

/**
 * Cleans up old/expired progress entries
 */
export function cleanupOldProgress(): void {
  if (!isStorageAvailable()) return;

  const now = Date.now();
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_KEY_PREFIX)) {
      const stored = localStorage.getItem(key);
      const progress = safeJsonParse<SavedProgress>(stored);
      if (progress && now - progress.savedAt > PROGRESS_EXPIRY_MS) {
        keysToRemove.push(key);
      }
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

/**
 * Creates a debounced auto-saver for continuous saves
 */
export function createAutoSaver(shareToken: string, surveyId: string, responseId?: string): AutoSaver {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const save = (answers: Record<string, AnswerValue>, currentIndex: number): void => {
    // Clear any pending save
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Debounce the save
    timeoutId = setTimeout(() => {
      saveProgress(shareToken, surveyId, answers, currentIndex, responseId);
    }, DEBOUNCE_MS);
  };

  const cancel = (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return { save, cancel };
}

/**
 * Gets all saved progress entries (for debugging/admin)
 */
export function getAllSavedProgress(): SavedProgress[] {
  if (!isStorageAvailable()) return [];

  const entries: SavedProgress[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_KEY_PREFIX)) {
      const stored = localStorage.getItem(key);
      const progress = safeJsonParse<SavedProgress>(stored);
      if (progress) {
        entries.push(progress);
      }
    }
  }

  return entries;
}
