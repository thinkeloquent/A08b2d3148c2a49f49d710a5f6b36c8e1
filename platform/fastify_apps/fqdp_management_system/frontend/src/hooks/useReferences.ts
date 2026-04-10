import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type {
  Reference,
  CreateReferenceDTO,
  UpdateReferenceDTO,
  PaginatedResponse,
} from '@/types';
import { referencesAPI } from '@/services/api';

export const referenceKeys = {
  all: ['references'] as const,
  lists: () => [...referenceKeys.all, 'list'] as const,
  list: (params?: Record<string, unknown>) => [...referenceKeys.lists(), params] as const,
  details: () => [...referenceKeys.all, 'detail'] as const,
  detail: (id: string) => [...referenceKeys.details(), id] as const,
  byEntity: (entityType: string, entityId: string) =>
    [...referenceKeys.all, 'entity', entityType, entityId] as const,
};

export function useReferences(params?: { entityType?: string; entityId?: string; type?: string; search?: string }): UseQueryResult<PaginatedResponse<Reference>> {
  return useQuery({
    queryKey: referenceKeys.list(params as Record<string, unknown>),
    queryFn: () => referencesAPI.getAll(params),
  });
}

export function useEntityReferences(entityType: string, entityId: string): UseQueryResult<PaginatedResponse<Reference>> {
  return useQuery({
    queryKey: referenceKeys.byEntity(entityType, entityId),
    queryFn: () => referencesAPI.getAll({ entityType, entityId }),
    enabled: !!entityType && !!entityId,
  });
}

export function useCreateReference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReferenceDTO) => {
      const response = await referencesAPI.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: referenceKeys.all });
    },
  });
}

export function useUpdateReference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateReferenceDTO }) => {
      const response = await referencesAPI.update(id, updates);
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: referenceKeys.all });
    },
  });
}

export function useDeleteReference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => referencesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: referenceKeys.all });
    },
  });
}
