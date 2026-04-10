import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { promptsApi, versionsApi, deploymentsApi } from '../services/api';
import type { Prompt } from '../types';

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

export function useUpdatePrompt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Prompt> }) =>
      promptsApi.update(id, data),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['versions'] }),
  });
}

export function useUpdateVersionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ promptId, versionId, status }: { promptId: string; versionId: string; status: 'draft' | 'published' | 'archived' | 'disabled' }) =>
      versionsApi.updateStatus(promptId, versionId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['versions'] });
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
}

export function useUpdateVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ promptId, versionId, data }: { promptId: string; versionId: string; data: Record<string, unknown> }) =>
      versionsApi.update(promptId, versionId, data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['versions', vars.promptId] });
      queryClient.invalidateQueries({ queryKey: ['prompts', vars.promptId] });
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
}

export function useDeploy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ promptId, data }: { promptId: string; data: { environment: string; version_id: string } }) =>
      deploymentsApi.deploy(promptId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['prompts'] }),
  });
}
