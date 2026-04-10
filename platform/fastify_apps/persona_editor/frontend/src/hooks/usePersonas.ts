/**
 * Persona Hooks
 * React Query hooks for persona CRUD operations
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { personasApi } from '../services/api';
import type {
  Persona,
  CreatePersonaRequest,
  UpdatePersonaRequest,
  AuditLog,
} from '../types/persona';
import type { ApiError } from '../types/errors';

/**
 * Query key factory for type-safe cache keys
 */
export const personaKeys = {
  all: ['personas'] as const,
  lists: () => [...personaKeys.all, 'list'] as const,
  list: () => [...personaKeys.lists()] as const,
  details: () => [...personaKeys.all, 'detail'] as const,
  detail: (id: string) => [...personaKeys.details(), id] as const,
  auditLogs: (id: string) => [...personaKeys.detail(id), 'audit-logs'] as const,
};

/**
 * Hook to fetch list of personas
 */
export function usePersonas(
  options?: Omit<
    UseQueryOptions<Persona[], ApiError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: personaKeys.list(),
    queryFn: () => personasApi.list(),
    ...options,
  });
}

/**
 * Hook to fetch a single persona by ID
 */
export function usePersona(
  id: string,
  options?: Omit<
    UseQueryOptions<Persona, ApiError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: personaKeys.detail(id),
    queryFn: () => personasApi.getById(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to fetch audit logs for a persona
 */
export function usePersonaAuditLogs(
  id: string,
  limit?: number,
  options?: Omit<
    UseQueryOptions<AuditLog[], ApiError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: personaKeys.auditLogs(id),
    queryFn: () => personasApi.getAuditLogs(id, limit),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to create a new persona
 */
export function useCreatePersona(
  options?: Omit<
    UseMutationOptions<Persona, ApiError, CreatePersonaRequest>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePersonaRequest) => personasApi.create(data),
    onSuccess: () => {
      // Invalidate all persona lists to refetch with new data
      queryClient.invalidateQueries({ queryKey: personaKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to update an existing persona
 */
export function useUpdatePersona(
  options?: Omit<
    UseMutationOptions<
      Persona,
      ApiError,
      { id: string; data: UpdatePersonaRequest }
    >,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePersonaRequest }) =>
      personasApi.update(id, data),
    onSuccess: (response, { id }) => {
      // Update the specific persona in cache
      queryClient.setQueryData(personaKeys.detail(id), response);
      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: personaKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to delete a persona
 */
export function useDeletePersona(
  options?: Omit<
    UseMutationOptions<void, ApiError, string>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => personasApi.delete(id),
    onSuccess: (_, id) => {
      // Remove the deleted persona from cache
      queryClient.removeQueries({ queryKey: personaKeys.detail(id) });
      // Invalidate lists to reflect deletion
      queryClient.invalidateQueries({ queryKey: personaKeys.lists() });
    },
    ...options,
  });
}
