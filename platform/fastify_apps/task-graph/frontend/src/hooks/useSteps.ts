import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { BatchCreateStepsInput } from '../types';

export const STEP_KEYS = {
  all: ['steps'] as const,
  lists: () => [...STEP_KEYS.all, 'list'] as const,
  list: (taskId: string) => [...STEP_KEYS.lists(), taskId] as const,
  progress: (taskId: string) => [...STEP_KEYS.all, 'progress', taskId] as const,
};

export function useSteps(taskId: string) {
  return useQuery({
    queryKey: STEP_KEYS.list(taskId),
    queryFn: () => apiClient.getStepsByTask(taskId),
    enabled: !!taskId,
  });
}

export function useStepProgress(taskId: string) {
  return useQuery({
    queryKey: STEP_KEYS.progress(taskId),
    queryFn: () => apiClient.getStepProgress(taskId),
    enabled: !!taskId,
  });
}

export function useBatchCreateSteps() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BatchCreateStepsInput) => apiClient.batchCreateSteps(input),
    onSuccess: (_data, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: STEP_KEYS.list(taskId) });
      queryClient.invalidateQueries({ queryKey: STEP_KEYS.progress(taskId) });
    },
  });
}

export function useStartStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ stepId }: { stepId: string; taskId: string }) =>
      apiClient.startStep(stepId),
    onSuccess: (_data, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: STEP_KEYS.list(taskId) });
      queryClient.invalidateQueries({ queryKey: STEP_KEYS.progress(taskId) });
    },
  });
}

export function useCompleteStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ stepId }: { stepId: string; taskId: string }) =>
      apiClient.completeStep(stepId),
    onSuccess: (_data, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: STEP_KEYS.list(taskId) });
      queryClient.invalidateQueries({ queryKey: STEP_KEYS.progress(taskId) });
    },
  });
}

export function useSkipStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ stepId, reason, metadata }: {
      stepId: string;
      taskId: string;
      reason: string;
      metadata?: Record<string, unknown>;
    }) => apiClient.skipStep(stepId, reason, metadata),
    onSuccess: (_data, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: STEP_KEYS.list(taskId) });
      queryClient.invalidateQueries({ queryKey: STEP_KEYS.progress(taskId) });
    },
  });
}

export function useBlockStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ stepId, reason, metadata }: {
      stepId: string;
      taskId: string;
      reason: string;
      metadata?: Record<string, unknown>;
    }) => apiClient.blockStep(stepId, reason, metadata),
    onSuccess: (_data, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: STEP_KEYS.list(taskId) });
      queryClient.invalidateQueries({ queryKey: STEP_KEYS.progress(taskId) });
    },
  });
}

export function useUnblockStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ stepId }: { stepId: string; taskId: string }) =>
      apiClient.unblockStep(stepId),
    onSuccess: (_data, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: STEP_KEYS.list(taskId) });
      queryClient.invalidateQueries({ queryKey: STEP_KEYS.progress(taskId) });
    },
  });
}

export function useUpdateStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ stepId, updates }: {
      stepId: string;
      taskId: string;
      updates: {
        metadata?: Record<string, unknown>;
      };
    }) => apiClient.updateStep(stepId, updates),
    onSuccess: (_data, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: STEP_KEYS.list(taskId) });
      queryClient.invalidateQueries({ queryKey: STEP_KEYS.progress(taskId) });
    },
  });
}
