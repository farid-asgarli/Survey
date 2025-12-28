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
  enabled = true,
  rootMargin = '200px',
  threshold = 0.1,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage && enabled) {
        onLoadMore();
      }
    },
    [hasNextPage, isFetchingNextPage, enabled, onLoadMore]
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
