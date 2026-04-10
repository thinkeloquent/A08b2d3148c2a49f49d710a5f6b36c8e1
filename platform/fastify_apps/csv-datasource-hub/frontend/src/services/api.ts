import type {
  CsvDatasource,
  CsvInstance,
  CsvPayload,
  DatasourceTag,
  PaginatedResponse,
  OffsetResponse,
} from '../types';

const API_BASE = '/~/api/csv-datasource';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {};
  if (options?.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers: { ...headers, ...options?.headers } });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const datasourceApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<PaginatedResponse<CsvDatasource>>(`/datasources${qs}`);
  },
  get: (id: string) => request<CsvDatasource>(`/datasources/${id}`),
  create: (data: Partial<CsvDatasource>) =>
    request<CsvDatasource>('/datasources', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CsvDatasource>) =>
    request<CsvDatasource>(`/datasources/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  archive: (id: string) => request<CsvDatasource>(`/datasources/${id}`, { method: 'DELETE' }),
  destroy: (id: string) => request<void>(`/datasources/${id}`, { method: 'DELETE' }),
  distinctCategories: () => request<{ categories: string[] }>('/datasources/categories'),
  setLabels: (id: string, labels: { key: string; value: string }[]) =>
    request<CsvDatasource>(`/datasources/${id}/labels`, { method: 'PUT', body: JSON.stringify({ labels }) }),
};

export const tagApi = {
  list: () => request<DatasourceTag[]>('/tags'),
  create: (data: { name: string; color?: string }) =>
    request<DatasourceTag>('/tags', { method: 'POST', body: JSON.stringify(data) }),
  setOnDatasource: (datasourceId: string, tagIds: string[]) =>
    request<CsvDatasource>(`/datasources/${datasourceId}/tags`, { method: 'PUT', body: JSON.stringify({ tagIds }) }),
};

export const instanceApi = {
  listByDatasource: (datasourceId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<PaginatedResponse<CsvInstance>>(`/datasources/${datasourceId}/instances${qs}`);
  },
  get: (id: string) => request<CsvInstance>(`/instances/${id}`),
  upload: async (datasourceId: string, file: File, label?: string, instanceDate?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (label) formData.append('label', label);
    if (instanceDate) formData.append('instance_date', instanceDate);
    return request<CsvInstance>(`/datasources/${datasourceId}/instances`, {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },
  remove: (id: string) => request<void>(`/instances/${id}`, { method: 'DELETE' }),
};

export const payloadApi = {
  getData: (instanceId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<OffsetResponse<CsvPayload>>(`/instances/${instanceId}/data${qs}`);
  },
  getColumns: (instanceId: string) =>
    request<{ columns: string[] }>(`/instances/${instanceId}/columns`),
  search: (instanceId: string, params: Record<string, string>) => {
    const qs = '?' + new URLSearchParams(params).toString();
    return request<OffsetResponse<CsvPayload>>(`/instances/${instanceId}/data/search${qs}`);
  },
  getExportUrl: (instanceId: string, format: 'csv' | 'json' = 'csv') =>
    `${API_BASE}/instances/${instanceId}/data/export?format=${format}`,
};
