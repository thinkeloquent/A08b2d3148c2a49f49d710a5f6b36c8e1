import axios from 'axios';
import type {
  Template,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  ChecklistInstance,
  GenerateChecklistRequest,
  PaginatedResponse,
  ApiSuccessResponse,
} from '../types';

const client = axios.create({
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

const BASE = '/~/api/process_checklist';

export const templatesApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    sortBy?: string;
    order?: string;
  }): Promise<PaginatedResponse<Template>> => {
    const res = await client.get(`${BASE}/templates`, { params });
    return { data: res.data.data, meta: res.data.meta };
  },

  get: async (templateId: string): Promise<Template> => {
    const res = await client.get<ApiSuccessResponse<Template>>(
      `${BASE}/templates/${templateId}`,
    );
    return res.data.data;
  },

  create: async (data: CreateTemplateRequest): Promise<Template> => {
    const res = await client.post<ApiSuccessResponse<Template>>(
      `${BASE}/templates`,
      data,
    );
    return res.data.data;
  },

  update: async (
    templateId: string,
    data: UpdateTemplateRequest,
  ): Promise<Template> => {
    const res = await client.put<ApiSuccessResponse<Template>>(
      `${BASE}/templates/${templateId}`,
      data,
    );
    return res.data.data;
  },

  delete: async (templateId: string): Promise<void> => {
    await client.delete(`${BASE}/templates/${templateId}`);
  },
};

export const checklistsApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    templateRef?: string;
    sortBy?: string;
    order?: string;
  }): Promise<PaginatedResponse<ChecklistInstance>> => {
    const res = await client.get(`${BASE}/checklists`, { params });
    return { data: res.data.data, meta: res.data.meta };
  },

  get: async (checklistId: string): Promise<ChecklistInstance> => {
    const res = await client.get<ApiSuccessResponse<ChecklistInstance>>(
      `${BASE}/checklists/${checklistId}`,
    );
    return res.data.data;
  },

  generate: async (
    data: GenerateChecklistRequest,
  ): Promise<ChecklistInstance> => {
    const res = await client.post<ApiSuccessResponse<ChecklistInstance>>(
      `${BASE}/checklists`,
      data,
    );
    return res.data.data;
  },
};
