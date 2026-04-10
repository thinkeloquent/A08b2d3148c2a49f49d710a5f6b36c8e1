import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { CreateDependencyInput } from '../types';
import { TASK_KEYS } from './useTasks';

export const DEPENDENCY_KEYS = {
  all: ['dependencies'] as const,
  graph: (taskId: string) => [...DEPENDENCY_KEYS.all, 'graph', taskId] as const,
  readiness: (taskId: string) => [...DEPENDENCY_KEYS.all, 'readiness', taskId] as const,
};

export function useDependencyGraph(taskId: string) {
  return useQuery({
    queryKey: DEPENDENCY_KEYS.graph(taskId),
    queryFn: () => apiClient.getDependencyGraph(taskId),
    enabled: !!taskId,
  });
}

export function useExecutionReadiness(taskId: string) {
  return useQuery({
    queryKey: DEPENDENCY_KEYS.readiness(taskId),
    queryFn: () => apiClient.getExecutionReadiness(taskId),
    enabled: !!taskId,
  });
}

export function useCreateDependency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDependencyInput) => apiClient.createDependency(input),
    onSuccess: (_data, { prerequisiteId, dependentId }) => {
      queryClient.invalidateQueries({ queryKey: DEPENDENCY_KEYS.graph(prerequisiteId) });
      queryClient.invalidateQueries({ queryKey: DEPENDENCY_KEYS.graph(dependentId) });
      queryClient.invalidateQueries({ queryKey: DEPENDENCY_KEYS.readiness(dependentId) });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.detail(prerequisiteId) });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.detail(dependentId) });
    },
  });
}

export function useRemoveDependency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ prerequisiteId, dependentId }: { prerequisiteId: string; dependentId: string }) =>
      apiClient.removeDependency(prerequisiteId, dependentId),
    onSuccess: (_data, { prerequisiteId, dependentId }) => {
      queryClient.invalidateQueries({ queryKey: DEPENDENCY_KEYS.graph(prerequisiteId) });
      queryClient.invalidateQueries({ queryKey: DEPENDENCY_KEYS.graph(dependentId) });
      queryClient.invalidateQueries({ queryKey: DEPENDENCY_KEYS.readiness(dependentId) });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.detail(prerequisiteId) });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.detail(dependentId) });
    },
  });
}
