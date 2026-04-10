import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { CreateTaskInput, TaskStatus } from '../types';

export const TASK_KEYS = {
  all: ['tasks'] as const,
  lists: () => [...TASK_KEYS.all, 'list'] as const,
  list: (filters: { status?: TaskStatus; limit?: number; offset?: number }) =>
    [...TASK_KEYS.lists(), filters] as const,
  details: () => [...TASK_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...TASK_KEYS.details(), id] as const,
};

export function useTasks(filters?: { status?: TaskStatus; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: TASK_KEYS.list(filters || {}),
    queryFn: () => apiClient.getTasks(filters),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: TASK_KEYS.detail(id),
    queryFn: () => apiClient.getTask(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => apiClient.createTask(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.lists() });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateTaskInput> }) =>
      apiClient.updateTask(id, input),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.lists() });
    },
  });
}

export function useStartTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => apiClient.startTask(taskId),
    onSuccess: (_data, taskId) => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.lists() });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => apiClient.completeTask(taskId),
    onSuccess: (_data, taskId) => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.lists() });
    },
  });
}

export function useFailTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, error }: { taskId: string; error?: string }) =>
      apiClient.failTask(taskId, error),
    onSuccess: (_data, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.lists() });
    },
  });
}

export function useSkipTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, reason }: { taskId: string; reason: string }) =>
      apiClient.skipTask(taskId, reason),
    onSuccess: (_data, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.lists() });
    },
  });
}

export function useRetryTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => apiClient.retryTask(taskId),
    onSuccess: (_data, taskId) => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.lists() });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => apiClient.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.lists() });
    },
  });
}
