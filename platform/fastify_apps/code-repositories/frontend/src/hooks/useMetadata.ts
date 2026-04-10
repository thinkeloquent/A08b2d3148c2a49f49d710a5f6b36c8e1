/**
 * Metadata Hooks
 * React Query hooks for metadata CRUD operations
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { metadataApi } from '../services/api';
import type {
  ListMetadataResponse,
  GetMetadataResponse,
  CreateMetadataRequest,
  UpdateMetadataRequest,
  DeleteResponse,
} from '../types/api';
import type { ApiError } from '../types/errors';
import { repositoryKeys } from './useRepositories';

/**
 * Query key factory for type-safe cache keys
 */
export const metadataKeys = {
  all: ['metadata'] as const,
  lists: () => [...metadataKeys.all, 'list'] as const,
  listByRepo: (repoId: string) => [...metadataKeys.lists(), repoId] as const,
  details: () => [...metadataKeys.all, 'detail'] as const,
  detail: (id: number) => [...metadataKeys.details(), id] as const,
};

/**
 * Hook to fetch metadata for a repository
 */
export function useMetadata(
  repoId: string,
  options?: Omit<
    UseQueryOptions<ListMetadataResponse, ApiError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: metadataKeys.listByRepo(repoId),
    queryFn: () => metadataApi.listByRepo(repoId),
    enabled: !!repoId,
    ...options,
  });
}

/**
 * Hook to fetch a single metadata by ID
 */
export function useMetadataItem(
  id: number,
  options?: Omit<
    UseQueryOptions<GetMetadataResponse, ApiError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: metadataKeys.detail(id),
    queryFn: () => metadataApi.getById(id),
    enabled: id > 0,
    ...options,
  });
}

/**
 * Hook to create new metadata for a repository
 */
export function useCreateMetadata(
  options?: Omit<
    UseMutationOptions<
      GetMetadataResponse,
      ApiError,
      { repoId: string; data: CreateMetadataRequest }
    >,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ repoId, data }: { repoId: string; data: CreateMetadataRequest }) =>
      metadataApi.create(repoId, data),
    onSuccess: (_, { repoId }) => {
      // Invalidate metadata list for the repository
      queryClient.invalidateQueries({
        queryKey: metadataKeys.listByRepo(repoId),
      });
      // Also invalidate the repository detail since it includes metadata
      queryClient.invalidateQueries({
        queryKey: repositoryKeys.detail(repoId),
      });
    },
    ...options,
  });
}

/**
 * Hook to update existing metadata
 */
export function useUpdateMetadata(
  options?: Omit<
    UseMutationOptions<
      GetMetadataResponse,
      ApiError,
      { id: number; data: UpdateMetadataRequest; repoId?: string }
    >,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateMetadataRequest;
      repoId?: string;
    }) => metadataApi.update(id, data),
    onSuccess: (response, { id, repoId }) => {
      // Update the specific metadata in cache
      queryClient.setQueryData(metadataKeys.detail(id), response);
      // Invalidate list if we know the repo
      if (repoId) {
        queryClient.invalidateQueries({
          queryKey: metadataKeys.listByRepo(repoId),
        });
        queryClient.invalidateQueries({
          queryKey: repositoryKeys.detail(repoId),
        });
      }
    },
    ...options,
  });
}

/**
 * Hook to delete metadata
 */
export function useDeleteMetadata(
  options?: Omit<
    UseMutationOptions<DeleteResponse, ApiError, { id: number; repoId?: string }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number; repoId?: string }) =>
      metadataApi.delete(id),
    onSuccess: (_, { id, repoId }) => {
      // Remove the deleted metadata from cache
      queryClient.removeQueries({ queryKey: metadataKeys.detail(id) });
      // Invalidate list if we know the repo
      if (repoId) {
        queryClient.invalidateQueries({
          queryKey: metadataKeys.listByRepo(repoId),
        });
        queryClient.invalidateQueries({
          queryKey: repositoryKeys.detail(repoId),
        });
      }
    },
    ...options,
  });
}
