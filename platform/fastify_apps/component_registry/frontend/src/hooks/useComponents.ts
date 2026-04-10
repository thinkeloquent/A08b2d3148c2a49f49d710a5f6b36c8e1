import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { componentAPI, categoryAPI, type ListComponentsParams } from '@/services/api';
import type { RegisterFormData } from '@/types';

export const componentKeys = {
  all: ['components'] as const,
  lists: () => [...componentKeys.all, 'list'] as const,
  list: (params?: ListComponentsParams) => [...componentKeys.lists(), { params }] as const,
  details: () => [...componentKeys.all, 'detail'] as const,
  detail: (id: string) => [...componentKeys.details(), id] as const,
  stats: () => [...componentKeys.all, 'stats'] as const,
  authors: () => [...componentKeys.all, 'authors'] as const,
};

export const categoryKeys = {
  all: ['categories'] as const,
  list: () => [...categoryKeys.all, 'list'] as const,
};

export function useComponents(params?: ListComponentsParams) {
  return useQuery({
    queryKey: componentKeys.list(params),
    queryFn: () => componentAPI.getComponents(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useComponent(id: string, enabled = true) {
  return useQuery({
    queryKey: componentKeys.detail(id),
    queryFn: () => componentAPI.getComponent(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useComponentStats() {
  return useQuery({
    queryKey: componentKeys.stats(),
    queryFn: () => componentAPI.getStats(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useComponentAuthors() {
  return useQuery({
    queryKey: componentKeys.authors(),
    queryFn: () => componentAPI.getAuthors(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: () => categoryAPI.getCategories(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateComponent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterFormData) => componentAPI.createComponent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: componentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: componentKeys.stats() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.list() });
    },
  });
}

export function useDeleteComponent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => componentAPI.deleteComponent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: componentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: componentKeys.stats() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.list() });
    },
  });
}
