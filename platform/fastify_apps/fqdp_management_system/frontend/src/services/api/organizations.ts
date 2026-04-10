import { apiClient } from './client';
import type {
  Organization,
  CreateOrganizationDTO,
  UpdateOrganizationDTO,
  ApiListResponse,
  ApiDetailResponse,
} from '../../types';

export const organizationsAPI = {
  async getAll(): Promise<ApiListResponse<Organization>> {
    return apiClient.get<ApiListResponse<Organization>>('/organizations');
  },

  async getById(id: string): Promise<ApiDetailResponse<Organization>> {
    return apiClient.get<ApiDetailResponse<Organization>>(`/organizations/${encodeURIComponent(id)}`);
  },

  async create(input: CreateOrganizationDTO): Promise<ApiDetailResponse<Organization>> {
    return apiClient.post<ApiDetailResponse<Organization>>('/organizations', input);
  },

  async update(
    id: string,
    input: UpdateOrganizationDTO
  ): Promise<ApiDetailResponse<Organization>> {
    return apiClient.put<ApiDetailResponse<Organization>>(`/organizations/${encodeURIComponent(id)}`, input);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete<void>(`/organizations/${encodeURIComponent(id)}`);
  },
};
