/**
 * React Query hooks for Workspace operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import type {
  Workspace,
  CreateWorkspaceDTO,
  UpdateWorkspaceDTO,
  PaginatedResponse,
  ListQueryParams,
} from '@/types';
import { workspacesAPI } from '@/services/api';

/**
 * Query key factory for workspaces
 */
export const workspaceKeys = {
  all: ['workspaces'] as const,
  lists: () => [...workspaceKeys.all, 'list'] as const,
  list: (params?: ListQueryParams) => [...workspaceKeys.lists(), params] as const,
  details: () => [...workspaceKeys.all, 'detail'] as const,
  detail: (id: string) => [...workspaceKeys.details(), id] as const,
};

/**
 * Fetch all workspaces with optional filters
 */
export function useWorkspaces(
  params?: ListQueryParams
): UseQueryResult<PaginatedResponse<Workspace>> {
  return useQuery({
    queryKey: workspaceKeys.list(params),
    queryFn: () => workspacesAPI.getAll(),
  });
}

/**
 * Fetch single workspace by ID
 */
export function useWorkspace(id: string): UseQueryResult<Workspace> {
  return useQuery({
    queryKey: workspaceKeys.detail(id),
    queryFn: async () => {
      const response = await workspacesAPI.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Create new workspace
 */
export function useCreateWorkspace(): UseMutationResult<Workspace, Error, CreateWorkspaceDTO> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWorkspaceDTO) => {
      const response = await workspacesAPI.create(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all workspace lists to refetch with new data
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
      // Also invalidate organization queries since workspace count changed
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}

/**
 * Update existing workspace
 */
export function useUpdateWorkspace(): UseMutationResult<
  Workspace,
  Error,
  { id: string; updates: UpdateWorkspaceDTO }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateWorkspaceDTO }) => {
      const response = await workspacesAPI.update(id, updates);
      return response.data;
    },
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: workspaceKeys.detail(id) });

      // Snapshot previous value
      const previousWorkspace = queryClient.getQueryData<Workspace>(workspaceKeys.detail(id));

      // Optimistically update
      if (previousWorkspace) {
        queryClient.setQueryData<Workspace>(workspaceKeys.detail(id), {
          ...previousWorkspace,
          ...updates,
        });
      }

      return { previousWorkspace };
    },
    onError: (_error, { id }, context) => {
      // Rollback on error
      if (context?.previousWorkspace) {
        queryClient.setQueryData(workspaceKeys.detail(id), context.previousWorkspace);
      }
    },
    onSettled: (_data, _error, { id }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
    },
  });
}

/**
 * Delete workspace
 */
export function useDeleteWorkspace(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workspacesAPI.delete(id),
    onSuccess: () => {
      // Invalidate workspace lists
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
      // Also invalidate organization queries since workspace count changed
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}
