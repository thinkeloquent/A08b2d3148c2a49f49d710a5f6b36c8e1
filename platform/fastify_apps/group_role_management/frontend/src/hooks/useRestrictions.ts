/**
 * Custom React Query hooks for Restriction operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { restrictionAPI } from '@/services/api';
import type { Restriction } from '@/types';

// Query keys for caching
export const restrictionKeys = {
  all: ['restrictions'] as const,
  lists: () => [...restrictionKeys.all, 'list'] as const,
  search: (query: string) => [...restrictionKeys.all, 'search', query] as const,
};

/**
 * Hook to fetch all restrictions with usage stats
 */
export function useRestrictions() {
  return useQuery({
    queryKey: restrictionKeys.lists(),
    queryFn: async () => {
      const response = await restrictionAPI.getRestrictions();
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data!;
    },
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Hook to search restrictions (for autocomplete)
 */
export function useSearchRestrictions(query: string, excludeIds?: string[]) {
  return useQuery({
    queryKey: restrictionKeys.search(query),
    queryFn: async () => {
      const response = await restrictionAPI.searchRestrictions(query, 10, excludeIds);
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
 * Hook to create a new restriction
 */
export function useCreateRestriction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (restrictionData: { name: string; description?: string }) => {
      const response = await restrictionAPI.createRestriction(restrictionData);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: restrictionKeys.lists() });
    },
  });
}

/**
 * Hook to update a restriction
 */
export function useUpdateRestriction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ restrictionId, restrictionData }: { restrictionId: string; restrictionData: Partial<Restriction> }) => {
      const response = await restrictionAPI.updateRestriction(restrictionId, restrictionData);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: restrictionKeys.lists() });
    },
  });
}

/**
 * Hook to delete a restriction
 */
export function useDeleteRestriction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (restrictionId: string) => {
      const response = await restrictionAPI.deleteRestriction(restrictionId);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: restrictionKeys.lists() });
    },
  });
}
