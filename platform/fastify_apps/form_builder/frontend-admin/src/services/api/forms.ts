import { api } from './client';
import type { ListFormsResponse, FormResponse, FormVersion } from '@/types/api';

export const formsApi = {
  list: (params?: { page?: number; limit?: number; status?: string; search?: string; tags?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.status) qs.set('status', params.status);
    if (params?.search) qs.set('search', params.search);
    if (params?.tags) qs.set('tags', params.tags);
    const q = qs.toString();
    return api.get<ListFormsResponse>(`/forms${q ? `?${q}` : ''}`);
  },
  get: (id: string) => api.get<FormResponse>(`/forms/${id}`),
  create: (data: Record<string, unknown>) => api.post<FormResponse>('/forms', data),
  update: (id: string, data: Record<string, unknown>) => api.put<FormResponse>(`/forms/${id}`, data),
  delete: (id: string) => api.delete<{ success: boolean }>(`/forms/${id}`),
  export: (id: string) => api.get<Record<string, unknown>>(`/forms/${id}/export`),
  import: (data: Record<string, unknown>) => api.post<FormResponse>('/forms/import', data),

  // Versions
  listVersions: (formId: string) =>
    api.get<{ versions: FormVersion[] }>(`/forms/${formId}/versions`),
  createVersion: (formId: string, changeSummary?: string) =>
    api.post<{ version: FormVersion }>(`/forms/${formId}/versions`, { change_summary: changeSummary }),
  getVersion: (formId: string, versionId: string) =>
    api.get<{ version: FormVersion }>(`/forms/${formId}/versions/${versionId}`),
  restoreVersion: (formId: string, versionId: string) =>
    api.post<{ success: boolean; restoredVersion: string }>(`/forms/${formId}/versions/${versionId}/restore`, {}),
};
