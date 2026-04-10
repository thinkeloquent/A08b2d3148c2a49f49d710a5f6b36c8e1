/**
 * React Query hooks for Project operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import type {
  Project,
  CreateProjectDTO,
  UpdateProjectDTO,
  PaginatedResponse,
  ListQueryParams,
} from '@/types';
import { projectsAPI } from '@/services/api';

/**
 * Query key factory for projects
 */
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (params?: ListQueryParams) => [...projectKeys.lists(), params] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

/**
 * Fetch all projects with optional filters
 */
export function useProjects(
  params?: ListQueryParams
): UseQueryResult<PaginatedResponse<Project>> {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => projectsAPI.getAll(),
  });
}

/**
 * Fetch single project by ID
 */
export function useProject(id: string): UseQueryResult<Project> {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: async () => {
      const response = await projectsAPI.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Create new project
 */
export function useCreateProject(): UseMutationResult<Project, Error, CreateProjectDTO> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProjectDTO) => {
      const response = await projectsAPI.create(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all project lists to refetch with new data
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      // Also invalidate application queries since project count changed
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

/**
 * Update existing project
 */
export function useUpdateProject(): UseMutationResult<
  Project,
  Error,
  { id: string; updates: UpdateProjectDTO }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateProjectDTO }) => {
      const response = await projectsAPI.update(id, updates);
      return response.data;
    },
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(id) });

      // Snapshot previous value
      const previousProject = queryClient.getQueryData<Project>(projectKeys.detail(id));

      // Optimistically update
      if (previousProject) {
        queryClient.setQueryData<Project>(projectKeys.detail(id), {
          ...previousProject,
          ...updates,
        });
      }

      return { previousProject };
    },
    onError: (_error, { id }, context) => {
      // Rollback on error
      if (context?.previousProject) {
        queryClient.setQueryData(projectKeys.detail(id), context.previousProject);
      }
    },
    onSettled: (_data, _error, { id }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/**
 * Delete project
 */
export function useDeleteProject(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectsAPI.delete(id),
    onSuccess: () => {
      // Invalidate project lists
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      // Also invalidate application queries since project count changed
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}
