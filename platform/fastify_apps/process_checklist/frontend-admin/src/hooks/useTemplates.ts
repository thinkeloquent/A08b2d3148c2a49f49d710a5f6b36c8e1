import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templatesApi } from '../services/api';
import type { CreateTemplateRequest, UpdateTemplateRequest } from '../types';

export const templateKeys = {
  all: ['templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...templateKeys.lists(), filters] as const,
  details: () => [...templateKeys.all, 'detail'] as const,
  detail: (id: string) => [...templateKeys.details(), id] as const,
};

export function useTemplates(params?: {
  page?: number;
  limit?: number;
  category?: string;
}) {
  return useQuery({
    queryKey: templateKeys.list(params),
    queryFn: () => templatesApi.list(params),
  });
}

export function useTemplate(templateId: string) {
  return useQuery({
    queryKey: templateKeys.detail(templateId),
    queryFn: () => templatesApi.get(templateId),
    enabled: !!templateId,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTemplateRequest) => templatesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      templateId,
      data,
    }: {
      templateId: string;
      data: UpdateTemplateRequest;
    }) => templatesApi.update(templateId, data),
    onSuccess: (_result, { templateId }) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(templateId) });
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) => templatesApi.delete(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}
