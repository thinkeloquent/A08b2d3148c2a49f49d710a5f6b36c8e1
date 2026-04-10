import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistsApi } from '../services/api';
import type { GenerateChecklistRequest } from '../types';

export const checklistKeys = {
  all: ['checklists'] as const,
  lists: () => [...checklistKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...checklistKeys.lists(), filters] as const,
  details: () => [...checklistKeys.all, 'detail'] as const,
  detail: (id: string) => [...checklistKeys.details(), id] as const,
};

export function useChecklists(params?: {
  page?: number;
  limit?: number;
  templateRef?: string;
}) {
  return useQuery({
    queryKey: checklistKeys.list(params),
    queryFn: () => checklistsApi.list(params),
  });
}

export function useChecklist(checklistId: string) {
  return useQuery({
    queryKey: checklistKeys.detail(checklistId),
    queryFn: () => checklistsApi.get(checklistId),
    enabled: !!checklistId,
  });
}

export function useGenerateChecklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GenerateChecklistRequest) =>
      checklistsApi.generate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.lists() });
    },
  });
}
