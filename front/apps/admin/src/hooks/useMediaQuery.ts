import { useState, useEffect, useCallback } from 'react';

/**
 * Hook that tracks whether a media query matches
 *
 * @example
 * const isDesktop = useMediaQuery('(min-width: 1024px)');
 * const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
 * const isReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
 */
export function useMediaQuery(query: string): boolean {
  const getMatches = useCallback((query: string): boolean => {
    // Prevents SSR issues
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  }, []);

  const [matches, setMatches] = useState<boolean>(() => getMatches(query));

  useEffect(() => {
    const matchMedia = window.matchMedia(query);

    // Triggered at the first client-side load and if query changes
    const handleChange = () => {
      setMatches(matchMedia.matches);
    };

    // Set initial value
    handleChange();

    // Use modern addEventListener if available
    if (matchMedia.addEventListener) {
      matchMedia.addEventListener('change', handleChange);
      return () => matchMedia.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      matchMedia.addListener(handleChange);
      return () => matchMedia.removeListener(handleChange);
    }
  }, [query]);

  return matches;
}

/**
 * Predefined breakpoint hooks following Tailwind CSS defaults
 */
export function useIsMobile(): boolean {
  return !useMediaQuery('(min-width: 640px)');
}

export function useIsTablet(): boolean {
  const isAboveMobile = useMediaQuery('(min-width: 640px)');
  const isBelowDesktop = !useMediaQuery('(min-width: 1024px)');
  return isAboveMobile && isBelowDesktop;
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

export function useIsLargeDesktop(): boolean {
  return useMediaQuery('(min-width: 1280px)');
}

/**
 * Accessibility preference hooks
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}
