/**
 * React Query hooks for Form Builder API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formsApi, type ListFormsParams } from '../services/api/forms';
import type { ExportableFormSchema } from '../utils/importExport';

const FORMS_KEY = ['forms'] as const;

export function useForms(params: ListFormsParams = {}) {
  return useQuery({
    queryKey: [...FORMS_KEY, params],
    queryFn: () => formsApi.list(params),
  });
}

export function useForm(id: string | null) {
  return useQuery({
    queryKey: [...FORMS_KEY, id],
    queryFn: () => formsApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: formsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FORMS_KEY });
    },
  });
}

export function useUpdateForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: {
      id: string;
      data: {
        name?: string;
        description?: string;
        version?: string;
        status?: string;
        schema_data?: ExportableFormSchema;
        metadata_data?: Record<string, unknown>;
        tag_names?: string[];
      };
    }) => formsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FORMS_KEY });
    },
  });
}

export function useDeleteForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: formsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FORMS_KEY });
    },
  });
}
