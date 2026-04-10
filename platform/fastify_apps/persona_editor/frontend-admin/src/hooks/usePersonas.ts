/**
 * Persona Hooks for Admin Dashboard
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { personasApi } from '../services/api';
import type { CreatePersonaRequest, UpdatePersonaRequest } from '../types/persona';

export const personaKeys = {
  all: ['personas'] as const,
  list: () => [...personaKeys.all, 'list'] as const,
  detail: (id: string) => [...personaKeys.all, 'detail', id] as const,
  auditLogs: (id: string) => [...personaKeys.detail(id), 'audit-logs'] as const,
};

export function usePersonas() {
  return useQuery({
    queryKey: personaKeys.list(),
    queryFn: () => personasApi.list(),
  });
}

export function usePersona(id: string) {
  return useQuery({
    queryKey: personaKeys.detail(id),
    queryFn: () => personasApi.getById(id),
    enabled: !!id,
  });
}

export function usePersonaAuditLogs(id: string, limit?: number) {
  return useQuery({
    queryKey: personaKeys.auditLogs(id),
    queryFn: () => personasApi.getAuditLogs(id, limit),
    enabled: !!id,
  });
}

export function useCreatePersona() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePersonaRequest) => personasApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personaKeys.list() });
    },
  });
}

export function useUpdatePersona() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePersonaRequest }) =>
      personasApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: personaKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: personaKeys.list() });
    },
  });
}

export function useDeletePersona() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => personasApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: personaKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: personaKeys.list() });
    },
  });
}
