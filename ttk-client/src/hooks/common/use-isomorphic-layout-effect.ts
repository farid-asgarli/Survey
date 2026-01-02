import { useEffect, useLayoutEffect } from 'react';

/**
 * A custom hook designed to handle a common issue in server-side rendering (SSR) environments like Next.js, where window and other browser-specific objects are not available.
 */
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
