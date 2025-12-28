import type { Survey } from '@/types';
import { useEffect, useRef } from 'react';

export function useAutosave(isDirty: boolean, survey: Survey | null, onSave: () => void, delay: number) {
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isDirty || !survey) return;

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
  }, [isDirty, survey, onSave, delay]);
}
