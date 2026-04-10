import { apiClient } from './client';
import type {
  Reference,
  CreateReferenceDTO,
  UpdateReferenceDTO,
  ApiListResponse,
  ApiDetailResponse,
} from '../../types';

export const referencesAPI = {
  async getAll(params?: { entityType?: string; entityId?: string; type?: string; search?: string }): Promise<ApiListResponse<Reference>> {
    const searchParams = new URLSearchParams();
    if (params?.entityType) searchParams.set('entityType', params.entityType);
    if (params?.entityId) searchParams.set('entityId', params.entityId);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.search) searchParams.set('search', params.search);
    const qs = searchParams.toString();
    return apiClient.get<ApiListResponse<Reference>>(`/references${qs ? `?${qs}` : ''}`);
  },

  async getById(id: string): Promise<ApiDetailResponse<Reference>> {
    return apiClient.get<ApiDetailResponse<Reference>>(`/references/${encodeURIComponent(id)}`);
  },

  async create(input: CreateReferenceDTO): Promise<ApiDetailResponse<Reference>> {
    return apiClient.post<ApiDetailResponse<Reference>>('/references', input);
  },

  async update(
    id: string,
    input: UpdateReferenceDTO
  ): Promise<ApiDetailResponse<Reference>> {
    return apiClient.put<ApiDetailResponse<Reference>>(`/references/${encodeURIComponent(id)}`, input);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete<void>(`/references/${encodeURIComponent(id)}`);
  },
};
