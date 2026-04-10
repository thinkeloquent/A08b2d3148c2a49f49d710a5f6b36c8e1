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

export const tagKeys = {
  all: ['tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
  list: () => tagKeys.lists(),
  details: () => [...tagKeys.all, 'detail'] as const,
  detail: (id: string) => [...tagKeys.details(), id] as const,
};

export function useTags(
  options?: Omit<UseQueryOptions<ListTagsResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: tagKeys.list(),
    queryFn: () => tagApi.list(),
    ...options,
  });
}

export function useTag(
  id: string,
  options?: Omit<UseQueryOptions<GetTagResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: tagKeys.detail(id),
    queryFn: () => tagApi.getById(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateTag(
  options?: Omit<UseMutationOptions<GetTagResponse, ApiError, TagRequest>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TagRequest) => tagApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
    },
    ...options,
  });
}

export function useUpdateTag(
  options?: Omit<
    UseMutationOptions<GetTagResponse, ApiError, { id: string; data: TagRequest }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TagRequest }) => tagApi.update(id, data),
    onSuccess: (response, { id }) => {
      queryClient.setQueryData(tagKeys.detail(id), response);
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
    },
    ...options,
  });
}

export function useDeleteTag(
  options?: Omit<UseMutationOptions<DeleteResponse, ApiError, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tagApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: tagKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
    },
    ...options,
  });
}
