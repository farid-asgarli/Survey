// React Query hooks for Survey Categories operations

import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/services';
import { useNamespaceStore } from '@/stores';
import { createQueryKeys, useInvalidatingMutation, useUpdatingMutation, STALE_TIMES } from './queryUtils';
import type { CategoryOption, CreateCategoryRequest, UpdateCategoryRequest } from '@/types';

// Re-export types for consumers
export type { CategoriesListResponse } from '@/services';
export type { CreateCategoryRequest, UpdateCategoryRequest, ReorderCategoriesRequest } from '@/types';

// Query keys
export const categoryKeys = createQueryKeys('categories');

// Additional keys for options endpoint
export const categoryOptionsKeys = {
  all: ['categoryOptions'] as const,
  list: () => [...categoryOptionsKeys.all, 'list'] as const,
};

/**
 * Hook to fetch categories list for current namespace
 */
export function useCategories(params?: { includeInactive?: boolean }) {
  const { activeNamespace } = useNamespaceStore();
  const namespaceId = activeNamespace?.id;

  return useQuery({
    queryKey: categoryKeys.list(namespaceId || ''),
    queryFn: () => categoriesApi.list(params),
    enabled: !!namespaceId,
    staleTime: STALE_TIMES.LONG,
  });
}

/**
 * Hook to fetch category options for dropdowns
 */
export function useCategoryOptions() {
  const { activeNamespace } = useNamespaceStore();
  const namespaceId = activeNamespace?.id;

  return useQuery({
    queryKey: [...categoryOptionsKeys.list(), namespaceId],
    queryFn: () => categoriesApi.getOptions(),
    enabled: !!namespaceId,
    staleTime: STALE_TIMES.LONG,
    select: (data: CategoryOption[]) => data,
  });
}

/**
 * Hook to fetch a single category by ID
 */
export function useCategoryDetail(id: string | undefined) {
  return useQuery({
    queryKey: categoryKeys.detail(id!),
    queryFn: () => categoriesApi.getById(id!),
    enabled: !!id,
    staleTime: STALE_TIMES.LONG,
  });
}

/**
 * Hook to create a new category
 */
export function useCreateCategory() {
  return useInvalidatingMutation(categoryKeys, (data: CreateCategoryRequest) => categoriesApi.create(data), {
    additionalInvalidations: [[...categoryOptionsKeys.all]],
  });
}

/**
 * Hook to update a category
 */
export function useUpdateCategory() {
  return useUpdatingMutation(
    categoryKeys,
    ({ id, data }: { id: string; data: UpdateCategoryRequest }) => categoriesApi.update(id, data),
    ({ id }) => id,
    {
      getAdditionalInvalidations: () => [[...categoryOptionsKeys.all]],
    }
  );
}

/**
 * Hook to delete a category
 */
export function useDeleteCategory() {
  return useInvalidatingMutation(categoryKeys, (id: string) => categoriesApi.delete(id), {
    removeDetail: (id) => id,
    additionalInvalidations: [[...categoryOptionsKeys.all]],
  });
}

/**
 * Hook to set a category as the default for the namespace
 */
export function useSetDefaultCategory() {
  return useInvalidatingMutation(categoryKeys, (id: string) => categoriesApi.setDefault(id), {
    additionalInvalidations: [[...categoryOptionsKeys.all]],
  });
}

/**
 * Hook to reorder categories
 */
export function useReorderCategories() {
  return useInvalidatingMutation(categoryKeys, (categoryIds: string[]) => categoriesApi.reorder({ categoryIds }), {
    additionalInvalidations: [[...categoryOptionsKeys.all]],
  });
}

/**
 * Alias for useCategories - returns list of categories for the current namespace
 * Used in settings and other components that need a category dropdown
 */
export const useCategoriesList = useCategories;
