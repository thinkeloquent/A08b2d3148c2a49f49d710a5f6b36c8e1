/**
 * React Query hooks for Application operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import type {
  Application,
  CreateApplicationDTO,
  UpdateApplicationDTO,
  PaginatedResponse,
  ListQueryParams,
} from '@/types';
import { applicationsAPI } from '@/services/api';

/**
 * Query key factory for applications
 */
export const applicationKeys = {
  all: ['applications'] as const,
  lists: () => [...applicationKeys.all, 'list'] as const,
  list: (params?: ListQueryParams) => [...applicationKeys.lists(), params] as const,
  details: () => [...applicationKeys.all, 'detail'] as const,
  detail: (id: string) => [...applicationKeys.details(), id] as const,
};

/**
 * Fetch all applications with optional filters
 */
export function useApplications(
  params?: ListQueryParams
): UseQueryResult<PaginatedResponse<Application>> {
  return useQuery({
    queryKey: applicationKeys.list(params),
    queryFn: () => applicationsAPI.getAll(),
  });
}

/**
 * Fetch single application by ID
 */
export function useApplication(id: string): UseQueryResult<Application> {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: async () => {
      const response = await applicationsAPI.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Create new application
 */
export function useCreateApplication(): UseMutationResult<Application, Error, CreateApplicationDTO> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateApplicationDTO) => {
      const response = await applicationsAPI.create(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all application lists to refetch with new data
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      // Also invalidate team queries since application count changed
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

/**
 * Update existing application
 */
export function useUpdateApplication(): UseMutationResult<
  Application,
  Error,
  { id: string; updates: UpdateApplicationDTO }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateApplicationDTO }) => {
      const response = await applicationsAPI.update(id, updates);
      return response.data;
    },
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: applicationKeys.detail(id) });

      // Snapshot previous value
      const previousApplication = queryClient.getQueryData<Application>(applicationKeys.detail(id));

      // Optimistically update
      if (previousApplication) {
        queryClient.setQueryData<Application>(applicationKeys.detail(id), {
          ...previousApplication,
          ...updates,
        });
      }

      return { previousApplication };
    },
    onError: (_error, { id }, context) => {
      // Rollback on error
      if (context?.previousApplication) {
        queryClient.setQueryData(applicationKeys.detail(id), context.previousApplication);
      }
    },
    onSettled: (_data, _error, { id }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}

/**
 * Delete application
 */
export function useDeleteApplication(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => applicationsAPI.delete(id),
    onSuccess: () => {
      // Invalidate application lists
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      // Also invalidate team queries since application count changed
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}
