import { apiClient } from './api.client';
import type {
  Template,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  ListTemplatesQuery,
  ApiSuccessResponse,
  PaginationMeta,
} from '../types/api.types';

const BASE_PATH = '/~/api/process_checklist/templates';

export const templateService = {
  async listTemplates(query?: ListTemplatesQuery): Promise<{
    templates: Template[];
    meta: PaginationMeta;
  }> {
    const response = await apiClient.get<
      ApiSuccessResponse<Template[]> & { meta: PaginationMeta }
    >(BASE_PATH, { params: query });
    return {
      templates: response.data.data,
      meta: response.data.meta!,
    };
  },

  async getTemplate(templateId: string): Promise<Template> {
    const response = await apiClient.get<ApiSuccessResponse<Template>>(
      `${BASE_PATH}/${templateId}`
    );
    return response.data.data;
  },

  async createTemplate(data: CreateTemplateRequest): Promise<Template> {
    const response = await apiClient.post<ApiSuccessResponse<Template>>(
      BASE_PATH,
      data
    );
    return response.data.data;
  },

  async updateTemplate(
    templateId: string,
    data: UpdateTemplateRequest
  ): Promise<Template> {
    const response = await apiClient.put<ApiSuccessResponse<Template>>(
      `${BASE_PATH}/${templateId}`,
      data
    );
    return response.data.data;
  },

  async deleteTemplate(templateId: string): Promise<void> {
    await apiClient.delete(`${BASE_PATH}/${templateId}`);
  },
};
