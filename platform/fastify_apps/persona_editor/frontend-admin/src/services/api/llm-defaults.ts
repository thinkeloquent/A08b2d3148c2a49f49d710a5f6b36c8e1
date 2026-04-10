/**
 * LLM Defaults API for Admin Dashboard
 */

import { get, post, put, del } from './client';
import type {
  LLMDefault,
  LLMDefaultCategory,
  CreateLLMDefaultRequest,
  UpdateLLMDefaultRequest,
  PresetTemplate,
} from '../../types/llm-default';

export const llmDefaultsApi = {
  list: (category?: LLMDefaultCategory) =>
    get<LLMDefault[]>('/llm-defaults', category ? { category } : undefined),
  getByCategory: (category: LLMDefaultCategory) =>
    get<LLMDefault[]>(`/llm-defaults/category/${category}`),
  getById: (id: string) => get<LLMDefault>(`/llm-defaults/${id}`),
  create: (data: CreateLLMDefaultRequest) => post<LLMDefault>('/llm-defaults', data),
  update: (id: string, data: UpdateLLMDefaultRequest) =>
    put<LLMDefault>(`/llm-defaults/${id}`, data),
  delete: (id: string) => del<void>(`/llm-defaults/${id}`),
  presets: (category: LLMDefaultCategory) =>
    get<PresetTemplate[]>(`/presets/${category}`),
};
