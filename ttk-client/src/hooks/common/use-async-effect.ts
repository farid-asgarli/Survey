import { DependencyList, useEffect, useRef, useState, useMemo } from "react";

// // TODO Hook is not stable in production. Update ASAP.

/**
 * Custom React hook that behaves like useEffect, but allows effect function to be asynchronous.
 *
 * @param mountCallback - Asynchronous effect function.
 * @param unmountCallback - Asynchronous cleanup function.
 * @param deps - If present, effect will only activate if the values in the list change.
 *
 * @example
 * useAsyncEffect(async () => {
 *   const data = await fetchSomething();
 *   console.log(data);
 *
 *   return async () => {
 *     await cleanupSomething();
 *   };
 * }, []);
 */
function useAsyncEffect(mountCallback: () => Promise<any>, unmountCallback: () => Promise<any>, deps: DependencyList): UseAsyncEffectResult;
function useAsyncEffect(mountCallback: () => Promise<any>, deps: DependencyList): UseAsyncEffectResult;
function useAsyncEffect(mountCallback: () => Promise<any>, unmountCallback: (() => Promise<any>) | DependencyList, deps?: DependencyList) {
  const hasDestroy = typeof unmountCallback === "function";
  const dependencyList = !hasDestroy ? unmountCallback : deps;

  const isMounted = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(undefined);
  const [result, setResult] = useState<any>();

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    let mountSucceeded = false;

    (async () => {
      await Promise.resolve(); // wait for the initial cleanup in Strict mode - avoids double mutation
      if (!isMounted.current || ignore) {
        return;
      }
      setIsLoading(true);
      try {
        const result = await mountCallback();
        mountSucceeded = true;
        if (isMounted.current && !ignore) {
          setError(undefined);
          setResult(result);
          setIsLoading(false);
        } else {
          // Component was unmounted before the mount callback returned, cancel it
          hasDestroy && unmountCallback();
        }
      } catch (error) {
        if (!isMounted.current) return;
        setError(error);
        setIsLoading(false);
      }
    })();

    return () => {
      ignore = true;
      if (mountSucceeded && hasDestroy) {
        unmountCallback()
          .then(() => {
            if (!isMounted.current) return;
            setResult(undefined);
          })
          .catch((error: unknown) => {
            if (!isMounted.current) return;
            setError(error);
          });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencyList);

  return useMemo(() => ({ result, error, isLoading }), [result, error, isLoading]);
}

export interface UseAsyncEffectResult {
  result: any;
  error: any;
  isLoading: boolean;
}

export default useAsyncEffect;
