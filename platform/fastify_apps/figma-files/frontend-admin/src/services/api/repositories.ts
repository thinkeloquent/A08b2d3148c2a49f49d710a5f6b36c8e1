/**
 * Figma File API Module
 * CRUD operations for figma files
 */

import { get, post, put, del } from './client';
import type {
  ListFigmaFilesResponse,
  GetFigmaFileResponse,
  CreateFigmaFileRequest,
  UpdateFigmaFileRequest,
  DeleteResponse,
  BulkCreateResponse,
  FigmaFileListFilters,
} from '../../types/api';

/**
 * Figma File API methods
 */
export const figmaFileApi = {
  /**
   * List figma files with optional filters and pagination
   * GET /files
   */
  list(filters?: FigmaFileListFilters): Promise<ListFigmaFilesResponse> {
    return get<ListFigmaFilesResponse>('/files', filters as Record<string, unknown>);
  },

  /**
   * Get a single figma file by ID
   * GET /files/:id
   */
  getById(
    id: string,
    options?: { include_tags?: boolean; include_metadata?: boolean }
  ): Promise<GetFigmaFileResponse> {
    return get<GetFigmaFileResponse>(`/files/${id}`, options as Record<string, unknown>);
  },

  /**
   * Create a new figma file
   * POST /files
   */
  create(data: CreateFigmaFileRequest): Promise<GetFigmaFileResponse> {
    return post<GetFigmaFileResponse>('/files', data);
  },

  /**
   * Update an existing figma file
   * PUT /files/:id
   */
  update(id: string, data: UpdateFigmaFileRequest): Promise<GetFigmaFileResponse> {
    return put<GetFigmaFileResponse>(`/files/${id}`, data);
  },

  /**
   * Delete a figma file
   * DELETE /files/:id
   */
  delete(id: string): Promise<DeleteResponse> {
    return del<DeleteResponse>(`/files/${id}`);
  },

  /**
   * Bulk create figma files
   * POST /files/bulk
   */
  bulkCreate(data: CreateFigmaFileRequest[]): Promise<BulkCreateResponse> {
    return post<BulkCreateResponse>('/files/bulk', { figmaFiles: data });
  },
};

// Legacy alias
export const repositoryApi = figmaFileApi;
