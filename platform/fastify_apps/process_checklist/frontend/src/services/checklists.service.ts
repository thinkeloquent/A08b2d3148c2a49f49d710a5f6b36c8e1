import { apiClient } from './api.client';
import type {
  ChecklistInstance,
  GenerateChecklistRequest,
  ListChecklistsQuery,
  ApiSuccessResponse,
  PaginationMeta,
} from '../types/api.types';

const BASE_PATH = '/~/api/process_checklist/checklists';

export const checklistService = {
  async generateChecklist(
    data: GenerateChecklistRequest
  ): Promise<ChecklistInstance> {
    const response = await apiClient.post<ApiSuccessResponse<ChecklistInstance>>(
      BASE_PATH,
      data
    );
    return response.data.data;
  },

  async listChecklists(query?: ListChecklistsQuery): Promise<{
    checklists: ChecklistInstance[];
    meta: PaginationMeta;
  }> {
    const response = await apiClient.get<
      ApiSuccessResponse<ChecklistInstance[]> & { meta: PaginationMeta }
    >(BASE_PATH, { params: query });
    return {
      checklists: response.data.data,
      meta: response.data.meta!,
    };
  },

  async getChecklist(checklistId: string): Promise<ChecklistInstance> {
    const response = await apiClient.get<ApiSuccessResponse<ChecklistInstance>>(
      `${BASE_PATH}/${checklistId}`
    );
    return response.data.data;
  },
};
