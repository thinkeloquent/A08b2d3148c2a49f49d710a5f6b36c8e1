import { apiClient } from './client';
import type {
  Resource,
  CreateResourceDTO,
  UpdateResourceDTO,
  ApiListResponse,
  ApiDetailResponse,
} from '../../types';

export const resourcesAPI = {
  async getAll(): Promise<ApiListResponse<Resource>> {
    return apiClient.get<ApiListResponse<Resource>>('/resources');
  },

  async getById(id: string): Promise<ApiDetailResponse<Resource>> {
    return apiClient.get<ApiDetailResponse<Resource>>(`/resources/${id}`);
  },

  async create(input: CreateResourceDTO): Promise<ApiDetailResponse<Resource>> {
    return apiClient.post<ApiDetailResponse<Resource>>('/resources', input);
  },

  async update(
    id: string,
    input: UpdateResourceDTO
  ): Promise<ApiDetailResponse<Resource>> {
    return apiClient.put<ApiDetailResponse<Resource>>(`/resources/${id}`, input);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete<void>(`/resources/${id}`);
  },
};
