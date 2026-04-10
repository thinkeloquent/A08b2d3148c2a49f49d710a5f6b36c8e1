/**
 * Custom React Query hooks for Action operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { actionAPI } from '@/services/api';
import type { Action } from '@/types';

// Query keys for caching
export const actionKeys = {
  all: ['actions'] as const,
  lists: () => [...actionKeys.all, 'list'] as const,
  search: (query: string) => [...actionKeys.all, 'search', query] as const,
};

/**
 * Hook to fetch all actions with usage stats
 */
export function useActions() {
  return useQuery({
    queryKey: actionKeys.lists(),
    queryFn: async () => {
      const response = await actionAPI.getActions();
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data!;
    },
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Hook to search actions (for autocomplete)
 */
export function useSearchActions(query: string, excludeIds?: string[]) {
  return useQuery({
    queryKey: actionKeys.search(query),
    queryFn: async () => {
      const response = await actionAPI.searchActions(query, 10, excludeIds);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data!;
    },
    enabled: query.length > 0,
    staleTime: 1000 * 30,
  });
}

/**
 * Hook to create a new action
 */
export function useCreateAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (actionData: { name: string; description?: string }) => {
      const response = await actionAPI.createAction(actionData);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: actionKeys.lists() });
    },
  });
}

/**
 * Hook to update an action
 */
export function useUpdateAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ actionId, actionData }: { actionId: string; actionData: Partial<Action> }) => {
      const response = await actionAPI.updateAction(actionId, actionData);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: actionKeys.lists() });
    },
  });
}

/**
 * Hook to delete an action
 */
export function useDeleteAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (actionId: string) => {
      const response = await actionAPI.deleteAction(actionId);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: actionKeys.lists() });
    },
  });
}
