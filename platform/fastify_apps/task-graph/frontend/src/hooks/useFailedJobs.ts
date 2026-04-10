import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';

export const FAILED_JOB_KEYS = {
  all: ['failed-jobs'] as const,
  lists: () => [...FAILED_JOB_KEYS.all, 'list'] as const,
  list: (params: { jobType?: string; limit?: number; offset?: number }) =>
    [...FAILED_JOB_KEYS.lists(), params] as const,
  details: () => [...FAILED_JOB_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...FAILED_JOB_KEYS.details(), id] as const,
};

export function useFailedJobs(params?: { jobType?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: FAILED_JOB_KEYS.list(params || {}),
    queryFn: () => apiClient.getFailedJobs(params),
  });
}

export function useFailedJob(id: string) {
  return useQuery({
    queryKey: FAILED_JOB_KEYS.detail(id),
    queryFn: () => apiClient.getFailedJob(id),
    enabled: !!id,
  });
}

export function useRetryFailedJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.retryFailedJob(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: FAILED_JOB_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: FAILED_JOB_KEYS.lists() });
    },
  });
}

export function useDeleteFailedJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteFailedJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAILED_JOB_KEYS.lists() });
    },
  });
}
