import { apiClient } from './client';
import type {
  Application,
  CreateApplicationDTO,
  UpdateApplicationDTO,
  ApiListResponse,
  ApiDetailResponse,
} from '../../types';

export const applicationsAPI = {
  async getAll(): Promise<ApiListResponse<Application>> {
    return apiClient.get<ApiListResponse<Application>>('/applications');
  },

  async getById(id: string): Promise<ApiDetailResponse<Application>> {
    return apiClient.get<ApiDetailResponse<Application>>(`/applications/${id}`);
  },

  async create(input: CreateApplicationDTO): Promise<ApiDetailResponse<Application>> {
    return apiClient.post<ApiDetailResponse<Application>>('/applications', input);
  },

  async update(
    id: string,
    input: UpdateApplicationDTO
  ): Promise<ApiDetailResponse<Application>> {
    return apiClient.put<ApiDetailResponse<Application>>(`/applications/${id}`, input);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete<void>(`/applications/${id}`);
  },
};
