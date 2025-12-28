import { useCallback } from 'react';
import { useNavigate, type NavigateOptions, type To } from 'react-router-dom';

/**
 * A wrapper around useNavigate that enables View Transitions by default.
 * Uses the native View Transitions API for subtle page transitions.
 */
export function useViewTransitionNavigate() {
  const navigate = useNavigate();

  const navigateWithTransition = useCallback(
    (to: To, options?: NavigateOptions) => {
      // Check if View Transitions API is supported
      if (document.startViewTransition) {
        document.startViewTransition(() => {
          navigate(to, options);
        });
      } else {
        // Fallback for browsers without View Transitions support
        navigate(to, options);
      }
    },
    [navigate]
  );

  return navigateWithTransition;
}
