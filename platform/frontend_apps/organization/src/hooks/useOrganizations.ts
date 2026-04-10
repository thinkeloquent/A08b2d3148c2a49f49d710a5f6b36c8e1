import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { Organization, CreateOrganizationDTO, PaginatedResponse } from '@/types';
import { organizationsAPI } from '@/services/api';

export const organizationKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationKeys.all, 'list'] as const,
  list: (params?: Record<string, unknown>) => [...organizationKeys.lists(), params] as const,
  details: () => [...organizationKeys.all, 'detail'] as const,
  detail: (id: string) => [...organizationKeys.details(), id] as const,
};

export function useOrganizations(): UseQueryResult<PaginatedResponse<Organization>> {
  return useQuery({
    queryKey: organizationKeys.list(),
    queryFn: () => organizationsAPI.getAll(),
  });
}

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

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrganizationDTO) => {
      const response = await organizationsAPI.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Organization> }) => {
      const response = await organizationsAPI.update(id, updates);
      return response.data;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: organizationKeys.detail(id) });
      const previousOrg = queryClient.getQueryData<Organization>(organizationKeys.detail(id));

      if (previousOrg) {
        queryClient.setQueryData<Organization>(organizationKeys.detail(id), {
          ...previousOrg,
          ...updates,
        });
      }

      return { previousOrg };
    },
    onError: (_error, { id }, context) => {
      if (context?.previousOrg) {
        queryClient.setQueryData(organizationKeys.detail(id), context.previousOrg);
      }
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => organizationsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.all });
    },
  });
}
