import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { CreateFileInput } from '../types';

export const FILE_KEYS = {
  all: ['files'] as const,
  byTask: (taskId: string) => [...FILE_KEYS.all, 'task', taskId] as const,
  byStep: (stepId: string) => [...FILE_KEYS.all, 'step', stepId] as const,
};

export function useFilesByTask(taskId: string) {
  return useQuery({
    queryKey: FILE_KEYS.byTask(taskId),
    queryFn: () => apiClient.getFilesByTask(taskId),
    enabled: !!taskId,
  });
}

export function useFilesByStep(stepId: string) {
  return useQuery({
    queryKey: FILE_KEYS.byStep(stepId),
    queryFn: () => apiClient.getFilesByStep(stepId),
    enabled: !!stepId,
  });
}

export function useCreateFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFileInput) => apiClient.createFile(input),
    onSuccess: (_data, variables) => {
      if (variables.taskId) {
        queryClient.invalidateQueries({ queryKey: FILE_KEYS.byTask(variables.taskId) });
      }
      if (variables.stepId) {
        queryClient.invalidateQueries({ queryKey: FILE_KEYS.byStep(variables.stepId) });
      }
    },
  });
}

export function useUpdateFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId, stepId }: { fileId: string; stepId: string | null; taskId: string }) =>
      apiClient.updateFile(fileId, stepId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: FILE_KEYS.byTask(variables.taskId) });
      if (variables.stepId) {
        queryClient.invalidateQueries({ queryKey: FILE_KEYS.byStep(variables.stepId) });
      }
    },
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId }: { fileId: string; taskId: string }) =>
      apiClient.deleteFile(fileId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: FILE_KEYS.byTask(variables.taskId) });
    },
  });
}
