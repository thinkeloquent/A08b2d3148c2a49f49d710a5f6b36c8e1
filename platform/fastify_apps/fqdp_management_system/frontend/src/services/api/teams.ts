import { apiClient } from './client';
import type {
  Team,
  CreateTeamDTO,
  UpdateTeamDTO,
  ApiListResponse,
  ApiDetailResponse,
} from '../../types';

export const teamsAPI = {
  async getAll(): Promise<ApiListResponse<Team>> {
    return apiClient.get<ApiListResponse<Team>>('/teams');
  },

  async getById(id: string): Promise<ApiDetailResponse<Team>> {
    return apiClient.get<ApiDetailResponse<Team>>(`/teams/${encodeURIComponent(id)}`);
  },

  async create(input: CreateTeamDTO): Promise<ApiDetailResponse<Team>> {
    return apiClient.post<ApiDetailResponse<Team>>('/teams', input);
  },

  async update(
    id: string,
    input: UpdateTeamDTO
  ): Promise<ApiDetailResponse<Team>> {
    return apiClient.put<ApiDetailResponse<Team>>(`/teams/${id}`, input);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete<void>(`/teams/${id}`);
  },
};
