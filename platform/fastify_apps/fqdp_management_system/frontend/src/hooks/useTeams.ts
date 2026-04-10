/**
 * React Query hooks for Team operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import type {
  Team,
  CreateTeamDTO,
  UpdateTeamDTO,
  PaginatedResponse,
  ListQueryParams,
} from '@/types';
import { teamsAPI } from '@/services/api';

/**
 * Query key factory for teams
 */
export const teamKeys = {
  all: ['teams'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  list: (params?: ListQueryParams) => [...teamKeys.lists(), params] as const,
  details: () => [...teamKeys.all, 'detail'] as const,
  detail: (id: string) => [...teamKeys.details(), id] as const,
};

/**
 * Fetch all teams with optional filters
 */
export function useTeams(
  params?: ListQueryParams
): UseQueryResult<PaginatedResponse<Team>> {
  return useQuery({
    queryKey: teamKeys.list(params),
    queryFn: () => teamsAPI.getAll(),
  });
}

/**
 * Fetch single team by ID
 */
export function useTeam(id: string): UseQueryResult<Team> {
  return useQuery({
    queryKey: teamKeys.detail(id),
    queryFn: async () => {
      const response = await teamsAPI.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Create new team
 */
export function useCreateTeam(): UseMutationResult<Team, Error, CreateTeamDTO> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTeamDTO) => {
      const response = await teamsAPI.create(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all team lists to refetch with new data
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      // Also invalidate workspace queries since team count changed
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

/**
 * Update existing team
 */
export function useUpdateTeam(): UseMutationResult<
  Team,
  Error,
  { id: string; updates: UpdateTeamDTO }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateTeamDTO }) => {
      const response = await teamsAPI.update(id, updates);
      return response.data;
    },
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: teamKeys.detail(id) });

      // Snapshot previous value
      const previousTeam = queryClient.getQueryData<Team>(teamKeys.detail(id));

      // Optimistically update
      if (previousTeam) {
        queryClient.setQueryData<Team>(teamKeys.detail(id), {
          ...previousTeam,
          ...updates,
        });
      }

      return { previousTeam };
    },
    onError: (_error, { id }, context) => {
      // Rollback on error
      if (context?.previousTeam) {
        queryClient.setQueryData(teamKeys.detail(id), context.previousTeam);
      }
    },
    onSettled: (_data, _error, { id }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
}

/**
 * Delete team
 */
export function useDeleteTeam(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teamsAPI.delete(id),
    onSuccess: () => {
      // Invalidate team lists
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      // Also invalidate workspace queries since team count changed
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}
