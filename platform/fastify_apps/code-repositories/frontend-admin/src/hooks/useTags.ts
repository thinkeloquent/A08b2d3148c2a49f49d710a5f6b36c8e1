/**
 * Tag Hooks
 * React Query hooks for tag CRUD operations
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { tagApi } from '../services/api';
import type {
  ListTagsResponse,
  GetTagResponse,
  TagRequest,
  DeleteResponse,
} from '../types/api';
import type { ApiError } from '../types/errors';

/**
 * Query key factory for type-safe cache keys
 */
export const tagKeys = {
  all: ['tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
  list: () => tagKeys.lists(),
  details: () => [...tagKeys.all, 'detail'] as const,
  detail: (id: number) => [...tagKeys.details(), id] as const,
};

/**
 * Hook to fetch all tags
 */
export function useTags(
  options?: Omit<UseQueryOptions<ListTagsResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: tagKeys.list(),
    queryFn: () => tagApi.list(),
    ...options,
  });
}

/**
 * Hook to fetch a single tag by ID
 */
export function useTag(
  id: number,
  options?: Omit<UseQueryOptions<GetTagResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: tagKeys.detail(id),
    queryFn: () => tagApi.getById(id),
    enabled: id > 0,
    ...options,
  });
}

/**
 * Hook to create a new tag
 */
export function useCreateTag(
  options?: Omit<
    UseMutationOptions<GetTagResponse, ApiError, TagRequest>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TagRequest) => tagApi.create(data),
    onSuccess: () => {
      // Invalidate tag list to refetch with new data
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to update an existing tag
 */
export function useUpdateTag(
  options?: Omit<
    UseMutationOptions<GetTagResponse, ApiError, { id: number; data: TagRequest }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TagRequest }) =>
      tagApi.update(id, data),
    onSuccess: (response, { id }) => {
      // Update the specific tag in cache
      queryClient.setQueryData(tagKeys.detail(id), response);
      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to delete a tag
 */
export function useDeleteTag(
  options?: Omit<UseMutationOptions<DeleteResponse, ApiError, number>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => tagApi.delete(id),
    onSuccess: (_, id) => {
      // Remove the deleted tag from cache
      queryClient.removeQueries({ queryKey: tagKeys.detail(id) });
      // Invalidate lists to reflect deletion
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
    },
    ...options,
  });
}
