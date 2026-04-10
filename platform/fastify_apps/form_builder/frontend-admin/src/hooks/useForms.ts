import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formsApi } from '@/services/api/forms';

export function useForms(params?: { page?: number; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['forms', params],
    queryFn: () => formsApi.list(params),
  });
}

export function useForm(id: string) {
  return useQuery({
    queryKey: ['form', id],
    queryFn: () => formsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateForm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => formsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forms'] }),
  });
}

export function useUpdateForm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => formsApi.update(id, data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['forms'] });
      qc.invalidateQueries({ queryKey: ['form', vars.id] });
    },
  });
}

export function useDeleteForm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => formsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forms'] }),
  });
}

export function useFormVersions(formId: string) {
  return useQuery({
    queryKey: ['form-versions', formId],
    queryFn: () => formsApi.listVersions(formId),
    enabled: !!formId,
  });
}

export function useCreateVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ formId, changeSummary }: { formId: string; changeSummary?: string }) =>
      formsApi.createVersion(formId, changeSummary),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ['form-versions', vars.formId] }),
  });
}

export function useRestoreVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ formId, versionId }: { formId: string; versionId: string }) =>
      formsApi.restoreVersion(formId, versionId),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['form', vars.formId] });
      qc.invalidateQueries({ queryKey: ['form-versions', vars.formId] });
    },
  });
}
