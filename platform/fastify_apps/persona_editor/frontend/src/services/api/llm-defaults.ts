/**
 * LLM Defaults API Module
 * CRUD operations for LLM defaults
 */

import { get, post, put, del } from './client';
import type {
  LLMDefault,
  LLMDefaultCategory,
  CreateLLMDefaultRequest,
  UpdateLLMDefaultRequest,
} from '../../types/llm-default';

/**
 * LLM Defaults API methods
 */
export const llmDefaultsApi = {
  /**
   * List all LLM defaults with optional category filter
   * GET /llm-defaults?category=<category>
   */
  list(category?: LLMDefaultCategory): Promise<LLMDefault[]> {
    const params = category ? { category } : undefined;
    return get<LLMDefault[]>('/llm-defaults', params);
  },

  /**
   * Get LLM defaults by category
   * GET /llm-defaults/category/:category
   */
  getByCategory(category: LLMDefaultCategory): Promise<LLMDefault[]> {
    return get<LLMDefault[]>(`/llm-defaults/category/${category}`);
  },

  /**
   * Get a single LLM default by ID
   * GET /llm-defaults/:id
   */
  getById(id: string): Promise<LLMDefault> {
    return get<LLMDefault>(`/llm-defaults/${id}`);
  },

  /**
   * Create a new LLM default
   * POST /llm-defaults
   */
  create(data: CreateLLMDefaultRequest): Promise<LLMDefault> {
    return post<LLMDefault>('/llm-defaults', data);
  },

  /**
   * Update an existing LLM default
   * PUT /llm-defaults/:id
   */
  update(id: string, data: UpdateLLMDefaultRequest): Promise<LLMDefault> {
    return put<LLMDefault>(`/llm-defaults/${id}`, data);
  },

  /**
   * Delete an LLM default
   * DELETE /llm-defaults/:id
   */
  delete(id: string): Promise<void> {
    return del<void>(`/llm-defaults/${id}`);
  },
};
