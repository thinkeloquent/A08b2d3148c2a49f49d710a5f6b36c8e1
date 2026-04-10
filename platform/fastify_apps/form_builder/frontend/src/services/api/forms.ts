/**
 * Form Builder Forms API
 */

import { apiClient } from './client';
import type { ExportableFormSchema } from '../../utils/importExport';

export interface FormDefinitionSummary {
  id: string;
  name: string;
  description: string;
  version: string;
  status: string;
  created_by: string;
  tags: Array<{ id: string; name: string; color: string }>;
  created_at: string;
  updated_at: string;
}

export interface FormDefinition extends FormDefinitionSummary {
  schema_data: ExportableFormSchema | null;
  metadata_data: Record<string, unknown> | null;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListFormsResponse {
  formDefinitions: FormDefinitionSummary[];
  pagination: PaginationInfo;
}

export interface FormResponse {
  formDefinition: FormDefinition;
}

export interface ListFormsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  tags?: string;
}

export const formsApi = {
  async list(params: ListFormsParams = {}): Promise<ListFormsResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.status) searchParams.set('status', params.status);
    if (params.search) searchParams.set('search', params.search);
    if (params.tags) searchParams.set('tags', params.tags);
    const qs = searchParams.toString();
    return apiClient.get<ListFormsResponse>(`/forms${qs ? `?${qs}` : ''}`);
  },

  async getById(id: string): Promise<FormResponse> {
    return apiClient.get<FormResponse>(`/forms/${id}`);
  },

  async create(data: {
    name: string;
    description?: string;
    version?: string;
    status?: string;
    schema_data?: ExportableFormSchema;
    metadata_data?: Record<string, unknown>;
    tag_names?: string[];
    created_by?: string;
  }): Promise<FormResponse> {
    return apiClient.post<FormResponse>('/forms', data);
  },

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      version?: string;
      status?: string;
      schema_data?: ExportableFormSchema;
      metadata_data?: Record<string, unknown>;
      tag_names?: string[];
    },
  ): Promise<FormResponse> {
    return apiClient.put<FormResponse>(`/forms/${id}`, data);
  },

  async remove(id: string): Promise<{ success: boolean }> {
    return apiClient.del<{ success: boolean }>(`/forms/${id}`);
  },

  async exportForm(id: string): Promise<ExportableFormSchema> {
    return apiClient.get<ExportableFormSchema>(`/forms/${id}/export`);
  },

  async importForm(content: Record<string, unknown>): Promise<FormResponse> {
    return apiClient.post<FormResponse>('/forms/import', content);
  },
};
