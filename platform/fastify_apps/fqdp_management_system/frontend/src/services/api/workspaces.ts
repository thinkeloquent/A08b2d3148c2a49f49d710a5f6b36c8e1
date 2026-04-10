import { apiClient } from './client';
import type {
  Workspace,
  CreateWorkspaceDTO,
  UpdateWorkspaceDTO,
  ApiListResponse,
  ApiDetailResponse,
} from '../../types';

export const workspacesAPI = {
  async getAll(): Promise<ApiListResponse<Workspace>> {
    return apiClient.get<ApiListResponse<Workspace>>('/workspaces');
  },

  async getById(id: string): Promise<ApiDetailResponse<Workspace>> {
    return apiClient.get<ApiDetailResponse<Workspace>>(`/workspaces/${encodeURIComponent(id)}`);
  },

  async create(input: CreateWorkspaceDTO): Promise<ApiDetailResponse<Workspace>> {
    return apiClient.post<ApiDetailResponse<Workspace>>('/workspaces', input);
  },

  async update(
    id: string,
    input: UpdateWorkspaceDTO
  ): Promise<ApiDetailResponse<Workspace>> {
    return apiClient.put<ApiDetailResponse<Workspace>>(`/workspaces/${encodeURIComponent(id)}`, input);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete<void>(`/workspaces/${encodeURIComponent(id)}`);
  },
};
