/**
 * Custom React Query hooks for Group operations
 * Based on REQ.v002.md Section 2.2 (Group Management)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupAPI } from '@/services/api';
import type { Group } from '@/types';

// Query keys for caching
export const groupKeys = {
  all: ['groups'] as const,
  lists: () => [...groupKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...groupKeys.lists(), { filters }] as const,
  details: () => [...groupKeys.all, 'detail'] as const,
  detail: (id: string) => [...groupKeys.details(), id] as const,
  search: (query: string) => [...groupKeys.all, 'search', query] as const,
};

/**
 * Hook to fetch all groups with optional filters
 */
export function useGroups(params?: {
  search?: string;
  status?: 'active' | 'archived';
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: groupKeys.list(params),
    queryFn: async () => {
      const response = await groupAPI.getGroups(params);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data!;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch a single group with its roles
 */
export function useGroup(groupId: string, enabled = true) {
  return useQuery({
    queryKey: groupKeys.detail(groupId),
    queryFn: async () => {
      const response = await groupAPI.getGroup(groupId);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data!;
    },
    enabled: enabled && !!groupId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to search groups (for autocomplete)
 */
export function useSearchGroups(query: string, limit = 10, excludeIds?: string[]) {
  return useQuery({
    queryKey: groupKeys.search(query),
    queryFn: async () => {
      const response = await groupAPI.searchGroups(query, limit, excludeIds);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data!;
    },
    enabled: query.length > 0,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook to create a new group
 */
export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupData: Omit<Group, 'id' | 'createdAt'>) => {
      const response = await groupAPI.createGroup(groupData);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
  });
}

/**
 * Hook to update an existing group
 */
export function useUpdateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, groupData }: { groupId: string; groupData: Partial<Group> }) => {
      const response = await groupAPI.updateGroup(groupId, groupData);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data!;
    },
    onSuccess: (_data, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
  });
}

/**
 * Hook to delete/archive a group
 */
export function useDeleteGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupId,
      permanent = false,
      reassignTo,
    }: {
      groupId: string;
      permanent?: boolean;
      reassignTo?: string;
    }) => {
      const response = await groupAPI.deleteGroup(groupId, permanent, reassignTo);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data;
    },
    onSuccess: (_data, { groupId }) => {
      queryClient.removeQueries({ queryKey: groupKeys.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
  });
}
