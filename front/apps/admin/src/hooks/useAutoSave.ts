import { useEffect, useRef, useCallback, useSyncExternalStore } from 'react';

/**
 * Options for the useAutoSave hook
 */
export interface UseAutoSaveOptions {
  /** Whether autosave is currently paused (e.g., dialog open) */
  isPaused?: boolean;
  /** Whether the data is dirty/has unsaved changes */
  isDirty?: boolean;
  /** Delay in milliseconds before triggering save (0 = disabled) */
  delay?: number;
  /** Whether the hook is enabled at all */
  enabled?: boolean;
  /** Optional callback when save fails */
  onError?: (error: unknown) => void;
}

/**
 * Return type for useAutoSave hook
 */
export interface UseAutoSaveReturn {
  /** Manually trigger a save immediately */
  saveNow: () => void;
  /** Cancel any pending autosave */
  cancel: () => void;
  /** Whether a save is currently pending */
  isPending: boolean;
}

/**
 * A hook that automatically triggers a save function after a delay when data changes.
 * Useful for auto-saving forms, editors, or any dirty state.
 *
 * Features:
 * - Debounced saving (resets timer on each change)
 * - Can be paused (e.g., when a dialog is open)
 * - Can be disabled entirely (delay = 0)
 * - Provides manual save and cancel functions
 *
 * @example
 * ```tsx
 * // Basic usage
 * useAutoSave(handleSave, { isDirty, delay: 5000 });
 *
 * // With pause control
 * useAutoSave(handleSave, {
 *   isDirty,
 *   delay: 5000,
 *   isPaused: isDialogOpen || isSaving
 * });
 *
 * // With manual controls and error handling
 * const { saveNow, cancel, isPending } = useAutoSave(handleSave, {
 *   isDirty,
 *   delay: 5000,
 *   onError: (err) => toast.error('Save failed')
 * });
 * ```
 */
export function useAutoSave(onSave: () => void | Promise<void>, options: UseAutoSaveOptions = {}): UseAutoSaveReturn {
  const { isPaused = false, isDirty = true, delay = 5000, enabled = true, onError } = options;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPendingRef = useRef(false);
  const listenersRef = useRef(new Set<() => void>());
  const onSaveRef = useRef(onSave);
  const onErrorRef = useRef(onError);

  // Keep refs updated to avoid stale closures
  useEffect(() => {
    onSaveRef.current = onSave;
    onErrorRef.current = onError;
  }, [onSave, onError]);

  // Notify subscribers of pending state changes
  const notifyListeners = useCallback(() => {
    listenersRef.current.forEach((listener) => listener());
  }, []);

  // Subscribe function for useSyncExternalStore
  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => listenersRef.current.delete(listener);
  }, []);

  // Snapshot function for useSyncExternalStore
  const getSnapshot = useCallback(() => isPendingRef.current, []);

  // Use useSyncExternalStore for reactive isPending without setState in effects
  const isPending = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // Update pending state helper
  const setIsPending = useCallback(
    (value: boolean) => {
      if (isPendingRef.current !== value) {
        isPendingRef.current = value;
        notifyListeners();
      }
    },
    [notifyListeners]
  );

  // Clear timer helper
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPending(false);
  }, [setIsPending]);

  // Execute save with error handling
  const executeSave = useCallback(async () => {
    try {
      await onSaveRef.current();
    } catch (error) {
      onErrorRef.current?.(error);
    }
  }, []);

  // Manual save
  const saveNow = useCallback(() => {
    clearTimer();
    executeSave();
  }, [clearTimer, executeSave]);

  // Cancel pending save
  const cancel = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  // Auto-save effect
  useEffect(() => {
    // Don't autosave if disabled, paused, not dirty, or delay is 0
    if (!enabled || isPaused || !isDirty || delay === 0) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setIsPending(false);
      return;
    }

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new timer
    setIsPending(true);
    timerRef.current = setTimeout(() => {
      setIsPending(false);
      executeSave();
    }, delay);

    // Cleanup on dependency change or unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, isPaused, isDirty, delay, setIsPending, executeSave]);

  return {
    saveNow,
    cancel,
    isPending,
  };
}

/**
 * Simplified autosave hook for common editor patterns.
 * Wraps useAutoSave with entity-awareness.
 *
 * @example
 * ```tsx
 * useEditorAutoSave(survey, isDirty, handleSave, 5000, { isPaused: isDialogOpen });
 * ```
 */
export function useEditorAutoSave<T>(
  entity: T | null | undefined,
  isDirty: boolean,
  onSave: () => void | Promise<void>,
  delay: number,
  options: Pick<UseAutoSaveOptions, 'isPaused' | 'onError'> = {}
): UseAutoSaveReturn {
  return useAutoSave(onSave, {
    isDirty,
    delay,
    enabled: !!entity,
    isPaused: options.isPaused,
    onError: options.onError,
  });
}
