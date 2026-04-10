import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { promptsApi, versionsApi } from '../services/api';

export function usePrompts(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['prompts', params],
    queryFn: () => promptsApi.list(params),
  });
}

export function usePrompt(id: string) {
  return useQuery({
    queryKey: ['prompts', id],
    queryFn: () => promptsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreatePrompt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: promptsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['prompts'] }),
  });
}

export function useVersions(promptId: string) {
  return useQuery({
    queryKey: ['versions', promptId],
    queryFn: () => versionsApi.list(promptId),
    enabled: !!promptId,
  });
}

export function useCreateVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ promptId, data }: { promptId: string; data: Record<string, unknown> }) =>
      versionsApi.create(promptId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['versions'] });
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
}

export function useUpdateVersionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ promptId, versionId, status }: { promptId: string; versionId: string; status: string }) =>
      versionsApi.updateStatus(promptId, versionId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['versions'] });
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
}
