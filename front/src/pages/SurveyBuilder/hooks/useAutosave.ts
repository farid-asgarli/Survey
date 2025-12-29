import type { Survey } from '@/types';
import { useEffect, useRef } from 'react';

interface UseAutosaveOptions {
  /** Whether autosave is paused (e.g., when unsaved changes dialog is open) */
  isPaused?: boolean;
}

export function useAutosave(isDirty: boolean, survey: Survey | null, onSave: () => void, delay: number, options: UseAutosaveOptions = {}) {
  const { isPaused = false } = options;
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Don't autosave if paused, not dirty, no survey, or delay is 0 (disabled)
    if (isPaused || !isDirty || !survey || delay === 0) {
      // Clear any existing timer when conditions change
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
      return;
    }

    // Clear existing timer
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    // Set new timer
    autosaveTimerRef.current = setTimeout(() => {
      onSave();
    }, delay);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [isDirty, survey, onSave, delay, isPaused]);
}
