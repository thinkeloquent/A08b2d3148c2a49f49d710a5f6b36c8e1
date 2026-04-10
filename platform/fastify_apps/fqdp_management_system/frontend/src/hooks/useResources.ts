/**
 * React Query hooks for Resource operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import type {
  Resource,
  CreateResourceDTO,
  UpdateResourceDTO,
  PaginatedResponse,
  ListQueryParams,
} from '@/types';
import { resourcesAPI } from '@/services/api';

/**
 * Query key factory for resources
 */
export const resourceKeys = {
  all: ['resources'] as const,
  lists: () => [...resourceKeys.all, 'list'] as const,
  list: (params?: ListQueryParams) => [...resourceKeys.lists(), params] as const,
  details: () => [...resourceKeys.all, 'detail'] as const,
  detail: (id: string) => [...resourceKeys.details(), id] as const,
};

/**
 * Fetch all resources with optional filters
 */
export function useResources(
  params?: ListQueryParams
): UseQueryResult<PaginatedResponse<Resource>> {
  return useQuery({
    queryKey: resourceKeys.list(params),
    queryFn: () => resourcesAPI.getAll(),
  });
}

/**
 * Fetch single resource by ID
 */
export function useResource(id: string): UseQueryResult<Resource> {
  return useQuery({
    queryKey: resourceKeys.detail(id),
    queryFn: async () => {
      const response = await resourcesAPI.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Create new resource
 */
export function useCreateResource(): UseMutationResult<Resource, Error, CreateResourceDTO> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateResourceDTO) => {
      const response = await resourcesAPI.create(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all resource lists to refetch with new data
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
      // Also invalidate project queries since resource count changed
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

/**
 * Update existing resource
 */
export function useUpdateResource(): UseMutationResult<
  Resource,
  Error,
  { id: string; updates: UpdateResourceDTO }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateResourceDTO }) => {
      const response = await resourcesAPI.update(id, updates);
      return response.data;
    },
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: resourceKeys.detail(id) });

      // Snapshot previous value
      const previousResource = queryClient.getQueryData<Resource>(resourceKeys.detail(id));

      // Optimistically update
      if (previousResource) {
        queryClient.setQueryData<Resource>(resourceKeys.detail(id), {
          ...previousResource,
          ...updates,
        });
      }

      return { previousResource };
    },
    onError: (_error, { id }, context) => {
      // Rollback on error
      if (context?.previousResource) {
        queryClient.setQueryData(resourceKeys.detail(id), context.previousResource);
      }
    },
    onSettled: (_data, _error, { id }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: resourceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
    },
  });
}

/**
 * Delete resource
 */
export function useDeleteResource(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resourcesAPI.delete(id),
    onSuccess: () => {
      // Invalidate resource lists
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
      // Also invalidate project queries since resource count changed
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
