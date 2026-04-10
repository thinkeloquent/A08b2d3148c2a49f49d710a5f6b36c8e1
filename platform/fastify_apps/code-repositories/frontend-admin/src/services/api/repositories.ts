/**
 * Repository API Module
 * CRUD operations for code repositories
 */

import { get, post, put, del } from './client';
import type {
  ListRepositoriesResponse,
  GetRepositoryResponse,
  CreateRepositoryRequest,
  UpdateRepositoryRequest,
  DeleteResponse,
  BulkCreateResponse,
  RepositoryListFilters,
} from '../../types/api';

/**
 * Repository API methods
 */
export const repositoryApi = {
  /**
   * List repositories with optional filters and pagination
   * GET /repos
   */
  list(filters?: RepositoryListFilters): Promise<ListRepositoriesResponse> {
    return get<ListRepositoriesResponse>('/repos', filters as Record<string, unknown>);
  },

  /**
   * Get a single repository by ID
   * GET /repos/:id
   */
  getById(
    id: string,
    options?: { include_tags?: boolean; include_metadata?: boolean }
  ): Promise<GetRepositoryResponse> {
    return get<GetRepositoryResponse>(`/repos/${id}`, options as Record<string, unknown>);
  },

  /**
   * Create a new repository
   * POST /repos
   */
  create(data: CreateRepositoryRequest): Promise<GetRepositoryResponse> {
    return post<GetRepositoryResponse>('/repos', data);
  },

  /**
   * Update an existing repository
   * PUT /repos/:id
   */
  update(id: string, data: UpdateRepositoryRequest): Promise<GetRepositoryResponse> {
    return put<GetRepositoryResponse>(`/repos/${id}`, data);
  },

  /**
   * Delete a repository
   * DELETE /repos/:id
   */
  delete(id: string): Promise<DeleteResponse> {
    return del<DeleteResponse>(`/repos/${id}`);
  },

  /**
   * Bulk create repositories
   * POST /repos/bulk
   */
  bulkCreate(data: CreateRepositoryRequest[]): Promise<BulkCreateResponse> {
    return post<BulkCreateResponse>('/repos/bulk', { repositories: data });
  },
};
