import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';

export const EXECUTION_KEYS = {
  all: ['executions'] as const,
  logs: (params: { taskId?: string; limit?: number; offset?: number }) =>
    [...EXECUTION_KEYS.all, 'logs', params] as const,
  timeline: (taskId: string) => [...EXECUTION_KEYS.all, 'timeline', taskId] as const,
};

export function useExecutionLogs(params: { taskId?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: EXECUTION_KEYS.logs(params),
    queryFn: () => apiClient.getExecutionLogs(params),
  });
}

export function useExecutionTimeline(taskId: string) {
  return useQuery({
    queryKey: EXECUTION_KEYS.timeline(taskId),
    queryFn: () => apiClient.getExecutionTimeline(taskId),
    enabled: !!taskId,
  });
}
