/**
 * Components API Module
 * CRUD operations for UI component definitions
 */

import { get, post, put, del } from './client';
import type {
  ListComponentsResponse,
  GetComponentResponse,
  CreateComponentRequest,
  UpdateComponentRequest,
  DeleteResponse,
  ComponentListFilters,
} from '../../types/api';

export const componentApi = {
  /**
   * List components with optional filters and pagination
   * GET /components
   */
  list(filters?: ComponentListFilters): Promise<ListComponentsResponse> {
    return get<ListComponentsResponse>('/components', filters as Record<string, unknown>);
  },

  /**
   * Get a single component by ID
   * GET /components/:id
   */
  getById(id: string): Promise<GetComponentResponse> {
    return get<GetComponentResponse>(`/components/${id}`);
  },

  /**
   * Create a new component
   * POST /components
   */
  create(data: CreateComponentRequest): Promise<GetComponentResponse> {
    return post<GetComponentResponse>('/components', data);
  },

  /**
   * Update an existing component
   * PUT /components/:id
   */
  update(id: string, data: UpdateComponentRequest): Promise<GetComponentResponse> {
    return put<GetComponentResponse>(`/components/${id}`, data);
  },

  /**
   * Delete a component
   * DELETE /components/:id
   */
  delete(id: string): Promise<DeleteResponse> {
    return del<DeleteResponse>(`/components/${id}`);
  },
};
