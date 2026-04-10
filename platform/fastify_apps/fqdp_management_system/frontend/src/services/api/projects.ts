import { apiClient } from './client';
import type {
  Project,
  CreateProjectDTO,
  UpdateProjectDTO,
  ApiListResponse,
  ApiDetailResponse,
} from '../../types';

export const projectsAPI = {
  async getAll(): Promise<ApiListResponse<Project>> {
    return apiClient.get<ApiListResponse<Project>>('/projects');
  },

  async getById(id: string): Promise<ApiDetailResponse<Project>> {
    return apiClient.get<ApiDetailResponse<Project>>(`/projects/${id}`);
  },

  async create(input: CreateProjectDTO): Promise<ApiDetailResponse<Project>> {
    return apiClient.post<ApiDetailResponse<Project>>('/projects', input);
  },

  async update(
    id: string,
    input: UpdateProjectDTO
  ): Promise<ApiDetailResponse<Project>> {
    return apiClient.put<ApiDetailResponse<Project>>(`/projects/${id}`, input);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete<void>(`/projects/${id}`);
  },
};
