/**
 * LLM Defaults Hooks
 * React Query hooks for LLM defaults operations
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { llmDefaultsApi } from '../services/api';
import type {
  LLMDefault,
  LLMDefaultCategory,
  CreateLLMDefaultRequest,
  UpdateLLMDefaultRequest,
} from '../types/llm-default';
import type { ApiError } from '../types/errors';

/**
 * Query key factory for type-safe cache keys
 */
export const llmDefaultKeys = {
  all: ['llm-defaults'] as const,
  lists: () => [...llmDefaultKeys.all, 'list'] as const,
  list: (category?: LLMDefaultCategory) =>
    category
      ? ([...llmDefaultKeys.lists(), { category }] as const)
      : ([...llmDefaultKeys.lists()] as const),
  categories: () => [...llmDefaultKeys.all, 'category'] as const,
  category: (category: LLMDefaultCategory) =>
    [...llmDefaultKeys.categories(), category] as const,
  details: () => [...llmDefaultKeys.all, 'detail'] as const,
  detail: (id: string) => [...llmDefaultKeys.details(), id] as const,
};

/**
 * Hook to fetch all LLM defaults with optional category filter
 */
export function useLLMDefaults(
  category?: LLMDefaultCategory,
  options?: Omit<
    UseQueryOptions<LLMDefault[], ApiError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: llmDefaultKeys.list(category),
    queryFn: () => llmDefaultsApi.list(category),
    ...options,
  });
}

/**
 * Hook to fetch LLM defaults by category
 */
export function useLLMDefaultsByCategory(
  category: LLMDefaultCategory,
  options?: Omit<
    UseQueryOptions<LLMDefault[], ApiError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: llmDefaultKeys.category(category),
    queryFn: () => llmDefaultsApi.getByCategory(category),
    enabled: !!category,
    ...options,
  });
}

/**
 * Hook to fetch a single LLM default by ID
 */
export function useLLMDefault(
  id: string,
  options?: Omit<
    UseQueryOptions<LLMDefault, ApiError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: llmDefaultKeys.detail(id),
    queryFn: () => llmDefaultsApi.getById(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to create a new LLM default
 */
export function useCreateLLMDefault(
  options?: Omit<
    UseMutationOptions<LLMDefault, ApiError, CreateLLMDefaultRequest>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLLMDefaultRequest) => llmDefaultsApi.create(data),
    onSuccess: (response) => {
      // Invalidate all LLM default lists
      queryClient.invalidateQueries({ queryKey: llmDefaultKeys.lists() });
      // Invalidate the specific category
      queryClient.invalidateQueries({
        queryKey: llmDefaultKeys.category(response.category),
      });
    },
    ...options,
  });
}

/**
 * Hook to update an existing LLM default
 */
export function useUpdateLLMDefault(
  options?: Omit<
    UseMutationOptions<
      LLMDefault,
      ApiError,
      { id: string; data: UpdateLLMDefaultRequest }
    >,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLLMDefaultRequest }) =>
      llmDefaultsApi.update(id, data),
    onSuccess: (response, { id }) => {
      // Update the specific item in cache
      queryClient.setQueryData(llmDefaultKeys.detail(id), response);
      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: llmDefaultKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: llmDefaultKeys.category(response.category),
      });
    },
    ...options,
  });
}

/**
 * Hook to delete an LLM default
 */
export function useDeleteLLMDefault(
  options?: Omit<
    UseMutationOptions<void, ApiError, { id: string; category: LLMDefaultCategory }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; category: LLMDefaultCategory }) =>
      llmDefaultsApi.delete(id),
    onSuccess: (_, { id, category }) => {
      // Remove the deleted item from cache
      queryClient.removeQueries({ queryKey: llmDefaultKeys.detail(id) });
      // Invalidate lists to reflect deletion
      queryClient.invalidateQueries({ queryKey: llmDefaultKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: llmDefaultKeys.category(category),
      });
    },
    ...options,
  });
}
