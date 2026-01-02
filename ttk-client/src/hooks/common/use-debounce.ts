import { useEffect, useRef, useState } from 'react';

export function useDebounce<T>(value: T, delay: number, callback?: (debouncedValue: T) => void): T {
  const [mounted, setMounted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    clearFormFieldUpdateTimeout();
    timeoutRef.current = setTimeout(() => callback?.(value), delay);
    return () => clearFormFieldUpdateTimeout();
  }, [value]);

  function clearFormFieldUpdateTimeout() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  return value;
}
