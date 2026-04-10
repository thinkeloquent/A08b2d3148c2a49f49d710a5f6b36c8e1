/**
 * Custom React Query hooks for Role operations
 * Based on REQ.v002.md Section 2.1 (Role Management)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleAPI } from '@/services/api';
import type { Role } from '@/types';

// Query keys for caching
export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...roleKeys.lists(), { filters }] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
};

/**
 * Hook to fetch all roles with optional filters
 * Supports: search, label filter, status, sorting, pagination
 */
export function useRoles(params?: {
  label?: string;
  search?: string;
  status?: 'active' | 'archived';
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  groups?: string;
}) {
  return useQuery({
    queryKey: roleKeys.list(params),
    queryFn: async () => {
      const response = await roleAPI.getRoles(params);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data!;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch a single role by ID
 */
export function useRole(roleId: string, enabled = true) {
  return useQuery({
    queryKey: roleKeys.detail(roleId),
    queryFn: async () => {
      const response = await roleAPI.getRole(roleId);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data!;
    },
    enabled: enabled && !!roleId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to create a new role
 * Invalidates role list cache on success
 */
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleData: Omit<Role, 'id' | 'createdAt'>) => {
      const response = await roleAPI.createRole(roleData);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data!;
    },
    onSuccess: () => {
      // Invalidate and refetch role lists
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
}

/**
 * Hook to update an existing role
 * Uses optimistic updates for better UX
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roleId,
      roleData,
      version,
    }: {
      roleId: string;
      roleData: Partial<Role>;
      version?: number;
    }) => {
      const response = await roleAPI.updateRole(roleId, roleData, version);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data!;
    },
    onMutate: async ({ roleId, roleData }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: roleKeys.detail(roleId) });

      // Snapshot previous value
      const previousRole = queryClient.getQueryData<Role>(roleKeys.detail(roleId));

      // Optimistically update
      if (previousRole) {
        queryClient.setQueryData<Role>(roleKeys.detail(roleId), {
          ...previousRole,
          ...roleData,
        });
      }

      return { previousRole };
    },
    onError: (_err, { roleId }, context) => {
      // Rollback on error
      if (context?.previousRole) {
        queryClient.setQueryData(roleKeys.detail(roleId), context.previousRole);
      }
    },
    onSettled: (_data, _error, { roleId }) => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(roleId) });
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
}

/**
 * Hook to delete/archive a role
 */
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, permanent = false }: { roleId: string; permanent?: boolean }) => {
      const response = await roleAPI.deleteRole(roleId, permanent);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data;
    },
    onSuccess: (_data, { roleId }) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: roleKeys.detail(roleId) });
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
}

/**
 * Hook to clone a role
 */
export function useCloneRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, name }: { roleId: string; name?: string }) => {
      const response = await roleAPI.cloneRole(roleId, name);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
}
