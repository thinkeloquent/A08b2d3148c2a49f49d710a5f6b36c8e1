/**
 * LLM Defaults Hooks for Admin Dashboard
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { llmDefaultsApi } from '../services/api';
import type {
  LLMDefaultCategory,
  CreateLLMDefaultRequest,
  UpdateLLMDefaultRequest,
} from '../types/llm-default';

export const llmDefaultKeys = {
  all: ['llm-defaults'] as const,
  list: (category?: LLMDefaultCategory) =>
    category ? [...llmDefaultKeys.all, 'list', category] as const : [...llmDefaultKeys.all, 'list'] as const,
  detail: (id: string) => [...llmDefaultKeys.all, 'detail', id] as const,
  presets: (category: LLMDefaultCategory) => [...llmDefaultKeys.all, 'presets', category] as const,
};

export function useLLMDefaults(category?: LLMDefaultCategory) {
  return useQuery({
    queryKey: llmDefaultKeys.list(category),
    queryFn: () => llmDefaultsApi.list(category),
  });
}

export function useLLMDefault(id: string) {
  return useQuery({
    queryKey: llmDefaultKeys.detail(id),
    queryFn: () => llmDefaultsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateLLMDefault() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLLMDefaultRequest) => llmDefaultsApi.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: llmDefaultKeys.list() });
      queryClient.invalidateQueries({ queryKey: llmDefaultKeys.list(response.category) });
    },
  });
}

export function useUpdateLLMDefault() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLLMDefaultRequest }) =>
      llmDefaultsApi.update(id, data),
    onSuccess: (response, { id }) => {
      queryClient.setQueryData(llmDefaultKeys.detail(id), response);
      queryClient.invalidateQueries({ queryKey: llmDefaultKeys.list() });
    },
  });
}

export function usePresets(category?: LLMDefaultCategory) {
  return useQuery({
    queryKey: llmDefaultKeys.presets(category!),
    queryFn: () => llmDefaultsApi.presets(category!),
    enabled: !!category,
  });
}

export function useDeleteLLMDefault() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; category: LLMDefaultCategory }) =>
      llmDefaultsApi.delete(id),
    onSuccess: (_, { id, category }) => {
      queryClient.removeQueries({ queryKey: llmDefaultKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: llmDefaultKeys.list() });
      queryClient.invalidateQueries({ queryKey: llmDefaultKeys.list(category) });
    },
  });
}
