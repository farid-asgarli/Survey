/**
 * Query Utilities - Reduces boilerplate for React Query hooks
 *
 * Provides:
 * 1. Query key factories with consistent patterns
 * 2. Mutation helpers for common cache invalidation patterns
 * 3. Stale time constants for consistency
 *
 * @example
 * ```ts
 * // Create query keys
 * const themeKeys = createQueryKeys('themes');
 *
 * // Use in queries
 * useQuery({
 *   queryKey: themeKeys.list(namespaceId),
 *   queryFn: () => themesApi.list(),
 *   staleTime: STALE_TIMES.LONG,
 * });
 *
 * // With custom keys
 * const themeKeys = createExtendedQueryKeys('themes', (base) => ({
 *   preview: (id: string) => [...base.all, 'preview', id] as const,
 *   css: (id: string) => [...base.all, 'css', id] as const,
 * }));
 *
 * // Use mutation helpers for common patterns
 * const deleteTheme = useInvalidatingMutation(
 *   themeKeys,
 *   (id: string) => themesApi.delete(id)
 * );
 * ```
 */

import { useQueryClient, useMutation, type UseMutationOptions } from '@tanstack/react-query';

// ============================================================================
// Constants
// ============================================================================

/** Standard stale times for different query types */
export const STALE_TIMES = {
  /** For frequently changing data like stats, analytics (1 min) */
  SHORT: 1 * 60 * 1000,
  /** For list data that changes moderately (2 min) */
  MEDIUM: 2 * 60 * 1000,
  /** For detail data that changes less often (5 min) */
  LONG: 5 * 60 * 1000,
  /** For static/reference data (10 min) */
  VERY_LONG: 10 * 60 * 1000,
  /** For data that almost never changes (30 min) */
  STATIC: 30 * 60 * 1000,
} as const;

/** Garbage collection times - how long to keep unused data in cache */
export const GC_TIMES = {
  /** Short-lived data (5 min after becoming unused) */
  SHORT: 5 * 60 * 1000,
  /** Default gc time (10 min) */
  DEFAULT: 10 * 60 * 1000,
  /** Long-lived data (30 min) */
  LONG: 30 * 60 * 1000,
  /** Very long-lived / static data (1 hour) */
  STATIC: 60 * 60 * 1000,
} as const;

/**
 * Backend API error response type (RFC 7807 Problem Details)
 * Use this to type errors in mutation onError callbacks
 */
export interface ApiProblemDetails {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}

// ============================================================================
// Types
// ============================================================================

/**
 * Standard query key factory structure for any entity
 */
export interface EntityQueryKeys {
  /** Root key for all queries of this entity type */
  all: readonly string[];
  /** Key factory for list queries */
  lists: () => readonly string[];
  /** Key factory for a specific list (with filters/scope) */
  list: (...args: unknown[]) => readonly unknown[];
  /** Key factory for detail queries */
  details: () => readonly string[];
  /** Key factory for a specific detail query */
  detail: (id: string) => readonly unknown[];
}

// ============================================================================
// Query Key Factory
// ============================================================================

/**
 * Creates a standard query key factory for an entity.
 *
 * The generated keys follow React Query best practices:
 * - `all`: Matches all queries for this entity (useful for broad invalidation)
 * - `lists()`: Matches all list queries
 * - `list(scope, filters?)`: Specific list with optional scope/filters
 * - `details()`: Matches all detail queries
 * - `detail(id)`: Specific entity by ID
 *
 * @example
 * ```ts
 * const surveyKeys = createQueryKeys('surveys');
 *
 * // Use in queries
 * queryKey: surveyKeys.list(namespaceId, { status: 'active' })
 * queryKey: surveyKeys.detail(surveyId)
 *
 * // Invalidate all survey lists
 * queryClient.invalidateQueries({ queryKey: surveyKeys.lists() });
 *
 * // Invalidate everything for surveys
 * queryClient.invalidateQueries({ queryKey: surveyKeys.all });
 * ```
 */
export function createQueryKeys(entityName: string): EntityQueryKeys {
  const all = [entityName] as const;

  return {
    all,
    lists: () => [...all, 'list'] as const,
    list: (...args: unknown[]) => [...all, 'list', ...args] as const,
    details: () => [...all, 'detail'] as const,
    detail: (id: string) => [...all, 'detail', id] as const,
  };
}

/**
 * Creates query keys with additional custom keys for special queries.
 *
 * Use this when you need keys beyond the standard CRUD pattern,
 * like `preview`, `stats`, `analytics`, etc.
 *
 * @example
 * ```ts
 * const themeKeys = createExtendedQueryKeys('themes', (base) => ({
 *   preview: (id: string) => [...base.all, 'preview', id] as const,
 *   css: (id: string) => [...base.all, 'css', id] as const,
 *   publicList: () => [...base.all, 'public'] as const,
 * }));
 *
 * // Now you can use:
 * themeKeys.list(namespaceId)     // Standard list
 * themeKeys.detail(id)            // Standard detail
 * themeKeys.preview(id)           // Custom: preview data
 * themeKeys.css(id)               // Custom: CSS data
 * themeKeys.publicList()          // Custom: public themes
 * ```
 */
export function createExtendedQueryKeys<TCustomKeys extends Record<string, (...args: never[]) => readonly unknown[]>>(
  entityName: string,
  customKeys: (base: EntityQueryKeys) => TCustomKeys
): EntityQueryKeys & TCustomKeys {
  const baseKeys = createQueryKeys(entityName);
  return {
    ...baseKeys,
    ...customKeys(baseKeys),
  };
}

// ============================================================================
// Mutation Helpers
// ============================================================================

/**
 * Standard mutation callback options extracted for reuse
 */
type MutationCallbacks<TData, TError, TVariables, TContext> = Pick<
  UseMutationOptions<TData, TError, TVariables, TContext>,
  'onError' | 'onMutate' | 'onSettled' | 'retry' | 'retryDelay' | 'meta' | 'throwOnError'
>;

/**
 * Options for useInvalidatingMutation
 * Extends standard React Query mutation options for full customization
 */
export interface InvalidatingMutationOptions<TData = unknown, TError = Error, TVariables = void, TContext = unknown>
  extends Partial<MutationCallbacks<TData, TError, TVariables, TContext>> {
  /** Invalidate a specific detail query after mutation */
  invalidateDetail?: string | ((variables: TVariables) => string);
  /** Additional query keys to invalidate */
  additionalInvalidations?: readonly unknown[][];
  /** Also remove queries (for delete operations) */
  removeDetail?: string | ((variables: TVariables) => string);
}

/**
 * Creates a mutation that automatically invalidates list queries on success.
 *
 * This is the most common pattern - after a create/update/delete,
 * you usually want to refetch the list.
 *
 * @example
 * ```ts
 * // Simple: Just invalidate lists after delete
 * const deleteTheme = useInvalidatingMutation(
 *   themeKeys,
 *   (id: string) => themesApi.delete(id)
 * );
 *
 * // With detail invalidation
 * const updateTheme = useInvalidatingMutation(
 *   themeKeys,
 *   ({ id, data }) => themesApi.update(id, data),
 *   { invalidateDetail: ({ id }) => id }
 * );
 *
 * // With removal (for deletes)
 * const deleteTheme = useInvalidatingMutation(
 *   themeKeys,
 *   (id: string) => themesApi.delete(id),
 *   { removeDetail: (id) => id }
 * );
 * ```
 */
export function useInvalidatingMutation<TData, TVariables, TError = Error, TContext = unknown>(
  keys: EntityQueryKeys,
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: InvalidatingMutationOptions<TData, TError, TVariables, TContext>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    retry: options?.retry,
    retryDelay: options?.retryDelay,
    meta: options?.meta,
    throwOnError: options?.throwOnError,
    onMutate: options?.onMutate,
    onError: options?.onError,
    onSuccess: (_, variables) => {
      // Invalidate list queries (most common need)
      queryClient.invalidateQueries({ queryKey: keys.lists() });

      // Handle detail invalidation
      if (options?.invalidateDetail) {
        const detailId = typeof options.invalidateDetail === 'function' ? options.invalidateDetail(variables) : options.invalidateDetail;
        queryClient.invalidateQueries({ queryKey: keys.detail(detailId) });
      }

      // Handle detail removal (for deletes)
      if (options?.removeDetail) {
        const detailId = typeof options.removeDetail === 'function' ? options.removeDetail(variables) : options.removeDetail;
        queryClient.removeQueries({ queryKey: keys.detail(detailId) });
      }

      // Additional invalidations
      options?.additionalInvalidations?.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });
    },
    onSettled: options?.onSettled,
  });
}

/**
 * Creates a mutation that updates detail cache and invalidates lists.
 *
 * Use this for update operations where you want to immediately
 * update the cached detail data without refetching.
 *
 * @example
 * ```ts
 * const updateTheme = useUpdatingMutation(
 *   themeKeys,
 *   ({ id, data }) => themesApi.update(id, data),
 *   ({ id }) => id,
 *   {
 *     // Static invalidations
 *     additionalInvalidations: [someKeys.list()],
 *     // Dynamic invalidations based on variables
 *     getAdditionalInvalidations: ({ id }) => [
 *       themeKeys.preview(id),
 *       themeKeys.css(id),
 *     ],
 *   }
 * );
 * ```
 */
/**
 * Options for useUpdatingMutation
 */
export interface UpdatingMutationOptions<TEntity, TVariables, TError = Error, TContext = unknown>
  extends Partial<MutationCallbacks<TEntity, TError, TVariables, TContext>> {
  /** Static query keys to invalidate */
  additionalInvalidations?: readonly unknown[][];
  /** Dynamic query keys based on mutation variables */
  getAdditionalInvalidations?: (variables: TVariables) => readonly unknown[][];
}

export function useUpdatingMutation<TEntity, TVariables, TError = Error, TContext = unknown>(
  keys: EntityQueryKeys,
  mutationFn: (variables: TVariables) => Promise<TEntity>,
  getId: (variables: TVariables) => string,
  options?: UpdatingMutationOptions<TEntity, TVariables, TError, TContext>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    retry: options?.retry,
    retryDelay: options?.retryDelay,
    meta: options?.meta,
    throwOnError: options?.throwOnError,
    onMutate: options?.onMutate,
    onError: options?.onError,
    onSuccess: (updatedEntity, variables) => {
      const id = getId(variables);

      // Update the detail cache with new data
      queryClient.setQueryData(keys.detail(id), updatedEntity);

      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: keys.lists() });

      // Static additional invalidations
      options?.additionalInvalidations?.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });

      // Dynamic additional invalidations
      if (options?.getAdditionalInvalidations) {
        options.getAdditionalInvalidations(variables).forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
    },
    onSettled: options?.onSettled,
  });
}

/**
 * Creates a mutation with optimistic updates.
 *
 * The cache is updated immediately before the mutation completes,
 * and rolled back if the mutation fails.
 *
 * @example
 * ```ts
 * const toggleFavorite = useOptimisticMutation(
 *   surveyKeys,
 *   ({ id, isFavorite }) => surveysApi.setFavorite(id, isFavorite),
 *   {
 *     getId: ({ id }) => id,
 *     updateCache: (old, { isFavorite }) =>
 *       old ? { ...old, isFavorite } : old,
 *   }
 * );
 * ```
 */
/**
 * Options for useOptimisticMutation
 */
export interface OptimisticMutationOptions<TEntity, TVariables, TError = Error> {
  /** Extract the entity ID from mutation variables */
  getId: (variables: TVariables) => string;
  /** Update cache optimistically before mutation completes */
  updateCache: (old: TEntity | undefined, variables: TVariables) => TEntity | undefined;
  /** Whether to invalidate lists on success (default: true) */
  invalidateListsOnSuccess?: boolean;
  /** Called when mutation fails (after rollback) */
  onError?: (error: TError, variables: TVariables) => void;
  /** Additional mutation options */
  retry?: UseMutationOptions<TEntity, TError, TVariables>['retry'];
  meta?: UseMutationOptions<TEntity, TError, TVariables>['meta'];
  throwOnError?: UseMutationOptions<TEntity, TError, TVariables>['throwOnError'];
}

export function useOptimisticMutation<TEntity, TVariables, TError = Error>(
  keys: EntityQueryKeys,
  mutationFn: (variables: TVariables) => Promise<TEntity>,
  options: OptimisticMutationOptions<TEntity, TVariables, TError>
) {
  const queryClient = useQueryClient();
  const shouldInvalidateLists = options.invalidateListsOnSuccess ?? true;

  return useMutation({
    mutationFn,
    retry: options.retry,
    meta: options.meta,
    throwOnError: options.throwOnError,
    onMutate: async (variables) => {
      const id = options.getId(variables);
      const queryKey = keys.detail(id);

      // Cancel outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value for rollback
      const previousData = queryClient.getQueryData<TEntity>(queryKey);

      // Optimistically update the cache
      queryClient.setQueryData<TEntity | undefined>(queryKey, (old) => options.updateCache(old, variables));

      return { previousData, queryKey };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
      // Call user's onError callback after rollback
      options.onError?.(error, variables);
    },
    onSettled: (_, error) => {
      // Only invalidate lists if mutation succeeded and option is enabled
      if (!error && shouldInvalidateLists) {
        queryClient.invalidateQueries({ queryKey: keys.lists() });
      }
    },
  });
}

// ============================================================================
// Cache Manipulation Helpers
// ============================================================================

/**
 * Hook that returns cache manipulation functions for an entity.
 *
 * Use this when you need fine-grained control over the cache,
 * like adding a new item to a list without refetching.
 *
 * @example
 * ```ts
 * const { addToList, updateInList, removeFromList } = useCacheHelpers(surveyKeys);
 *
 * // After creating a survey, add it to the cached list
 * createSurvey.mutate(data, {
 *   onSuccess: (newSurvey) => {
 *     addToList(namespaceId, newSurvey);
 *   }
 * });
 * ```
 */
export function useCacheHelpers<TEntity extends { id: string }>(keys: EntityQueryKeys) {
  const queryClient = useQueryClient();

  return {
    /** Add an entity to a list cache */
    addToList: (listKey: unknown, entity: TEntity) => {
      queryClient.setQueryData<TEntity[]>(keys.list(listKey), (old) => {
        if (!old) return [entity];
        return [...old, entity];
      });
    },

    /** Update an entity in a list cache */
    updateInList: (listKey: unknown, entity: TEntity) => {
      queryClient.setQueryData<TEntity[]>(keys.list(listKey), (old) => {
        if (!old) return [entity];
        return old.map((item) => (item.id === entity.id ? entity : item));
      });
    },

    /** Remove an entity from a list cache */
    removeFromList: (listKey: unknown, entityId: string) => {
      queryClient.setQueryData<TEntity[]>(keys.list(listKey), (old) => {
        if (!old) return [];
        return old.filter((item) => item.id !== entityId);
      });
    },

    /** Set detail cache for an entity */
    setDetail: (id: string, entity: TEntity) => {
      queryClient.setQueryData(keys.detail(id), entity);
    },

    /** Invalidate all queries for this entity */
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
    },

    /** Invalidate all list queries */
    invalidateLists: () => {
      queryClient.invalidateQueries({ queryKey: keys.lists() });
    },

    /** Invalidate a specific detail query */
    invalidateDetail: (id: string) => {
      queryClient.invalidateQueries({ queryKey: keys.detail(id) });
    },
  };
}
