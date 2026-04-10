/**
 * Component Hooks
 * React Query hooks for UI component CRUD operations
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { componentApi } from '../services/api';
import type {
  ListComponentsResponse,
  GetComponentResponse,
  CreateComponentRequest,
  UpdateComponentRequest,
  DeleteResponse,
  ComponentListFilters,
} from '../types/api';
import type { ApiError } from '../types/errors';

export const componentKeys = {
  all: ['components'] as const,
  lists: () => [...componentKeys.all, 'list'] as const,
  list: (filters?: ComponentListFilters) => [...componentKeys.lists(), filters] as const,
  details: () => [...componentKeys.all, 'detail'] as const,
  detail: (id: string) => [...componentKeys.details(), id] as const,
};

export function useComponents(
  filters?: ComponentListFilters,
  options?: Omit<UseQueryOptions<ListComponentsResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: componentKeys.list(filters),
    queryFn: () => componentApi.list(filters),
    ...options,
  });
}

export function useComponent(
  id: string,
  options?: Omit<UseQueryOptions<GetComponentResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: componentKeys.detail(id),
    queryFn: () => componentApi.getById(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateComponent(
  options?: Omit<
    UseMutationOptions<GetComponentResponse, ApiError, CreateComponentRequest>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateComponentRequest) => componentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: componentKeys.lists() });
    },
    ...options,
  });
}

export function useUpdateComponent(
  options?: Omit<
    UseMutationOptions<GetComponentResponse, ApiError, { id: string; data: UpdateComponentRequest }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateComponentRequest }) =>
      componentApi.update(id, data),
    onSuccess: (response, { id }) => {
      queryClient.setQueryData(componentKeys.detail(id), response);
      queryClient.invalidateQueries({ queryKey: componentKeys.lists() });
    },
    ...options,
  });
}

export function useDeleteComponent(
  options?: Omit<UseMutationOptions<DeleteResponse, ApiError, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};

  return useMutation({
    mutationFn: (id: string) => componentApi.delete(id),
    onSuccess: (data, id, onMutateResult, mutationContext) => {
      queryClient.removeQueries({ queryKey: componentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: componentKeys.lists() });
      onSuccess?.(data, id, onMutateResult, mutationContext);
    },
    ...rest,
  });
}
