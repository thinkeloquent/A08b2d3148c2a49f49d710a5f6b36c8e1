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
import { figmaFileKeys } from './useFigmaFiles';

/**
 * Query key factory for type-safe cache keys
 */
export const metadataKeys = {
  all: ['metadata'] as const,
  lists: () => [...metadataKeys.all, 'list'] as const,
  listByFigmaFile: (figmaFileId: string) => [...metadataKeys.lists(), figmaFileId] as const,
  details: () => [...metadataKeys.all, 'detail'] as const,
  detail: (id: number) => [...metadataKeys.details(), id] as const,
};

/**
 * Hook to fetch metadata for a figma file
 */
export function useMetadata(
  figmaFileId: string,
  options?: Omit<
    UseQueryOptions<ListMetadataResponse, ApiError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: metadataKeys.listByFigmaFile(figmaFileId),
    queryFn: () => metadataApi.listByFigmaFile(figmaFileId),
    enabled: !!figmaFileId,
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
 * Hook to create new metadata for a figma file
 */
export function useCreateMetadata(
  options?: Omit<
    UseMutationOptions<
      GetMetadataResponse,
      ApiError,
      { figmaFileId: string; data: CreateMetadataRequest }
    >,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ figmaFileId, data }: { figmaFileId: string; data: CreateMetadataRequest }) =>
      metadataApi.create(figmaFileId, data),
    onSuccess: (_, { figmaFileId }) => {
      // Invalidate metadata list for the figma file
      queryClient.invalidateQueries({
        queryKey: metadataKeys.listByFigmaFile(figmaFileId),
      });
      // Also invalidate the figma file detail since it includes metadata
      queryClient.invalidateQueries({
        queryKey: figmaFileKeys.detail(figmaFileId),
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
      { id: number; data: UpdateMetadataRequest; figmaFileId?: string }
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
      figmaFileId?: string;
    }) => metadataApi.update(id, data),
    onSuccess: (response, { id, figmaFileId }) => {
      // Update the specific metadata in cache
      queryClient.setQueryData(metadataKeys.detail(id), response);
      // Invalidate list if we know the figma file
      if (figmaFileId) {
        queryClient.invalidateQueries({
          queryKey: metadataKeys.listByFigmaFile(figmaFileId),
        });
        queryClient.invalidateQueries({
          queryKey: figmaFileKeys.detail(figmaFileId),
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
    UseMutationOptions<DeleteResponse, ApiError, { id: number; figmaFileId?: string }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number; figmaFileId?: string }) =>
      metadataApi.delete(id),
    onSuccess: (_, { id, figmaFileId }) => {
      // Remove the deleted metadata from cache
      queryClient.removeQueries({ queryKey: metadataKeys.detail(id) });
      // Invalidate list if we know the figma file
      if (figmaFileId) {
        queryClient.invalidateQueries({
          queryKey: metadataKeys.listByFigmaFile(figmaFileId),
        });
        queryClient.invalidateQueries({
          queryKey: figmaFileKeys.detail(figmaFileId),
        });
      }
    },
    ...options,
  });
}
