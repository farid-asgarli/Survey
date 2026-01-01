import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  /**
   * Callback to fetch the next page
   */
  onLoadMore: () => void;
  /**
   * Whether there are more items to load
   */
  hasNextPage: boolean;
  /**
   * Whether a fetch is currently in progress
   */
  isFetchingNextPage: boolean;
  /**
   * Whether the query is loading initial data
   */
  isLoading?: boolean;
  /**
   * Whether the query is enabled
   */
  enabled?: boolean;
  /**
   * Root margin for intersection observer (default: '100px')
   */
  rootMargin?: string;
  /**
   * Threshold for intersection observer (default: 0.1)
   */
  threshold?: number;
  /**
   * Debounce time in ms to prevent rapid-fire calls (default: 100)
   */
  debounceMs?: number;
}

/**
 * Hook for implementing infinite scroll using Intersection Observer
 *
 * @example
 * ```tsx
 * const { sentinelRef } = useInfiniteScroll({
 *   onLoadMore: fetchNextPage,
 *   hasNextPage: !!hasNextPage,
 *   isFetchingNextPage,
 * });
 *
 * return (
 *   <div>
 *     {items.map(item => <Item key={item.id} {...item} />)}
 *     <div ref={sentinelRef} /> {/* Sentinel element *\/}
 *   </div>
 * );
 * ```
 */
export function useInfiniteScroll({
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
  isLoading = false,
  enabled = true,
  rootMargin = '200px',
  threshold = 0.1,
  debounceMs = 100,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastFetchTimeRef = useRef<number>(0);

  // Use refs to always have the latest values in the callback
  // This prevents stale closure issues with IntersectionObserver
  const stateRef = useRef({
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    enabled,
    onLoadMore,
  });

  // Update refs when values change
  useEffect(() => {
    stateRef.current = {
      hasNextPage,
      isFetchingNextPage,
      isLoading,
      enabled,
      onLoadMore,
    };
  }, [hasNextPage, isFetchingNextPage, isLoading, enabled, onLoadMore]);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      const state = stateRef.current;
      const now = Date.now();

      // Guard conditions to prevent infinite loops:
      // 1. Sentinel must be visible
      // 2. Must have more pages available
      // 3. Must not be currently fetching
      // 4. Must not be in initial loading state
      // 5. Must be enabled
      // 6. Debounce rapid calls
      const canFetch =
        entry.isIntersecting &&
        state.hasNextPage &&
        !state.isFetchingNextPage &&
        !state.isLoading &&
        state.enabled &&
        now - lastFetchTimeRef.current >= debounceMs;

      if (canFetch) {
        lastFetchTimeRef.current = now;
        state.onLoadMore();
      }
    },
    [debounceMs]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(handleIntersect, {
      rootMargin,
      threshold,
    });

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersect, rootMargin, threshold]);

  return { sentinelRef };
}

/**
 * A simpler version that just returns whether to show loading indicator
 */
export function useInfiniteScrollStatus(hasNextPage: boolean, isFetchingNextPage: boolean) {
  return {
    showLoadMore: hasNextPage && !isFetchingNextPage,
    showLoading: isFetchingNextPage,
    showEndMessage: !hasNextPage && !isFetchingNextPage,
  };
}
