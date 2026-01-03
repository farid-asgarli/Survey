import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * A hook that returns a debounced version of the provided value.
 * The debounced value will only update after the specified delay has passed
 * without any new values being set.
 *
 * @param value - The value to debounce
 * @param delay - The debounce delay in milliseconds (default: 300ms)
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * const [searchInput, setSearchInput] = useState('');
 * const debouncedSearch = useDebounce(searchInput, 300);
 *
 * // debouncedSearch will only update 300ms after the user stops typing
 * useEffect(() => {
 *   performSearch(debouncedSearch);
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the timeout to update the debounced value
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if value changes before delay completes
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * A hook that returns a debounced callback function.
 * The callback will only be executed after the specified delay has passed
 * without any new calls being made.
 *
 * @param callback - The callback function to debounce
 * @param delay - The debounce delay in milliseconds (default: 300ms)
 * @returns A debounced version of the callback
 *
 * @example
 * ```tsx
 * const debouncedSearch = useDebouncedCallback(
 *   (query: string) => performSearch(query),
 *   300
 * );
 *
 * // Call this on every keystroke - it will only execute 300ms after typing stops
 * <input onChange={(e) => debouncedSearch(e.target.value)} />
 * ```
 */
export function useDebouncedCallback<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}

/**
 * Options for useDebounceState hook.
 */
export interface UseDebounceStateOptions<T> {
  /** Initial value */
  initialValue: T;
  /** Debounce delay in milliseconds (default: 300ms) */
  delay?: number;
}

/**
 * Return type for useDebounceState hook.
 */
export interface UseDebounceStateReturn<T> {
  /** The immediate (non-debounced) value */
  value: T;
  /** The debounced value */
  debouncedValue: T;
  /** Set the value (updates immediately, debouncedValue updates after delay) */
  setValue: (value: T) => void;
  /** Whether the debounced value is pending (value !== debouncedValue) */
  isPending: boolean;
  /** Flush the debounced value immediately */
  flush: () => void;
  /** Cancel pending debounce and reset to current debounced value */
  cancel: () => void;
}

/**
 * A hook that combines state management with debouncing.
 * Useful when you need both the immediate value (for display) and
 * the debounced value (for expensive operations like API calls).
 *
 * @example
 * ```tsx
 * const {
 *   value: searchInput,
 *   debouncedValue: debouncedSearch,
 *   setValue: setSearchInput,
 *   isPending,
 * } = useDebounceState({ initialValue: '', delay: 300 });
 *
 * // Show immediate value in input, use debounced for filtering
 * <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
 * {isPending && <Spinner />}
 * <Results query={debouncedSearch} />
 * ```
 */
export function useDebounceState<T>(options: UseDebounceStateOptions<T>): UseDebounceStateReturn<T> {
  const { initialValue, delay = 300 } = options;

  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track if we're pending
  const isPending = value !== debouncedValue;

  // Update debounced value after delay
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  // Flush immediately
  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setDebouncedValue(value);
  }, [value]);

  // Cancel and reset to current debounced value
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setValue(debouncedValue);
  }, [debouncedValue]);

  return {
    value,
    debouncedValue,
    setValue,
    isPending,
    flush,
    cancel,
  };
}
