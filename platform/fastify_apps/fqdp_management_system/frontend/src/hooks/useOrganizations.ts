/**
 * FQDP Management System - Organizations React Query Hooks
 * Version: 1.0
 * Custom hooks for Organizations CRUD operations using React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type {
  Organization,
  CreateOrganizationDTO,
  PaginatedResponse,
  ListQueryParams,
} from '@/types';
import { organizationsAPI } from '@/services/api';

/**
 * Query key factory for organizations
 */
export const organizationKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationKeys.all, 'list'] as const,
  list: (params?: ListQueryParams) => [...organizationKeys.lists(), params] as const,
  details: () => [...organizationKeys.all, 'detail'] as const,
  detail: (id: string) => [...organizationKeys.details(), id] as const,
};

/**
 * Hook to fetch all organizations with pagination and filtering
 */
export function useOrganizations(params?: ListQueryParams): UseQueryResult<PaginatedResponse<Organization>> {
  return useQuery({
    queryKey: organizationKeys.list(params),
    queryFn: () => organizationsAPI.getAll(),
  });
}

/**
 * Hook to fetch a single organization by ID
 */
export function useOrganization(
  id: string,
  options?: { enabled?: boolean }
): UseQueryResult<Organization> {
  return useQuery({
    queryKey: organizationKeys.detail(id),
    queryFn: async () => {
      const response = await organizationsAPI.getById(id);
      return response.data;
    },
    enabled: options?.enabled !== false && !!id,
  });
}

/**
 * Hook to create a new organization
 */
export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrganizationDTO) => {
      const response = await organizationsAPI.create(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all organization lists to refetch
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
    },
  });
}

/**
 * Hook to update an existing organization
 */
export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Organization> }) => {
      const response = await organizationsAPI.update(id, updates);
      return response.data;
    },
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: organizationKeys.detail(id) });

      // Snapshot previous value
      const previousOrg = queryClient.getQueryData<Organization>(organizationKeys.detail(id));

      // Optimistically update
      if (previousOrg) {
        queryClient.setQueryData<Organization>(organizationKeys.detail(id), {
          ...previousOrg,
          ...updates,
        });
      }

      return { previousOrg };
    },
    onError: (_error, { id }, context) => {
      // Rollback on error
      if (context?.previousOrg) {
        queryClient.setQueryData(organizationKeys.detail(id), context.previousOrg);
      }
    },
    onSettled: (_data, _error, { id }) => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
    },
  });
}

/**
 * Hook to delete an organization
 */
export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => organizationsAPI.delete(id),
    onSuccess: () => {
      // Invalidate all queries to refetch
      queryClient.invalidateQueries({ queryKey: organizationKeys.all });
    },
  });
}
