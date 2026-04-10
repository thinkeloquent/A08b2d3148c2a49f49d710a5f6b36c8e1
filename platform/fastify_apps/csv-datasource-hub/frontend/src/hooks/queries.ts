import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { datasourceApi, tagApi, instanceApi, payloadApi } from '../services/api';

// Datasource queries
export function useDatasources(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['datasources', params],
    queryFn: () => datasourceApi.list(params),
  });
}

export function useDatasource(id: string | null) {
  return useQuery({
    queryKey: ['datasources', id],
    queryFn: () => datasourceApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateDatasource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: datasourceApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['datasources'] }),
  });
}

export function useUpdateDatasource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => datasourceApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['datasources'] }),
  });
}

export function useArchiveDatasource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: datasourceApi.archive,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['datasources'] }),
  });
}

export function useDeleteDatasource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: datasourceApi.destroy,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['datasources'] });
      qc.invalidateQueries({ queryKey: ['datasource-categories'] });
    },
  });
}

export function useDatasourceCategories() {
  return useQuery({
    queryKey: ['datasource-categories'],
    queryFn: datasourceApi.distinctCategories,
  });
}

// Tag queries
export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: tagApi.list,
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tagApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  });
}

// Instance queries
export function useInstances(datasourceId: string | null, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['instances', datasourceId, params],
    queryFn: () => instanceApi.listByDatasource(datasourceId!, params),
    enabled: !!datasourceId,
  });
}

export function useInstance(id: string | null) {
  return useQuery({
    queryKey: ['instances', id],
    queryFn: () => instanceApi.get(id!),
    enabled: !!id,
  });
}

export function useUploadInstance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ datasourceId, file, label, instanceDate }: {
      datasourceId: string; file: File; label?: string; instanceDate?: string;
    }) => instanceApi.upload(datasourceId, file, label, instanceDate),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['instances'] });
      qc.invalidateQueries({ queryKey: ['datasources'] });
    },
  });
}

export function useDeleteInstance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: instanceApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['instances'] });
      qc.invalidateQueries({ queryKey: ['datasources'] });
    },
  });
}

// Payload queries
export function usePayloadData(instanceId: string | null, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['payloads', instanceId, params],
    queryFn: () => payloadApi.getData(instanceId!, params),
    enabled: !!instanceId,
  });
}

export function usePayloadColumns(instanceId: string | null) {
  return useQuery({
    queryKey: ['columns', instanceId],
    queryFn: () => payloadApi.getColumns(instanceId!),
    enabled: !!instanceId,
  });
}
