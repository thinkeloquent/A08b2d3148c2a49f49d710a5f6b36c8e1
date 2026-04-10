/**
 * Tags API Module
 * CRUD operations for component tags
 */

import { get, post, put, del } from './client';
import type {
  ListTagsResponse,
  GetTagResponse,
  TagRequest,
  DeleteResponse,
} from '../../types/api';

export const tagApi = {
  /**
   * List all tags
   * GET /tags
   */
  list(): Promise<ListTagsResponse> {
    return get<ListTagsResponse>('/tags');
  },

  /**
   * Get a single tag by ID
   * GET /tags/:id
   */
  getById(id: string): Promise<GetTagResponse> {
    return get<GetTagResponse>(`/tags/${id}`);
  },

  /**
   * Create a new tag
   * POST /tags
   */
  create(data: TagRequest): Promise<GetTagResponse> {
    return post<GetTagResponse>('/tags', data);
  },

  /**
   * Update an existing tag
   * PUT /tags/:id
   */
  update(id: string, data: TagRequest): Promise<GetTagResponse> {
    return put<GetTagResponse>(`/tags/${id}`, data);
  },

  /**
   * Delete a tag
   * DELETE /tags/:id
   */
  delete(id: string): Promise<DeleteResponse> {
    return del<DeleteResponse>(`/tags/${id}`);
  },
};
