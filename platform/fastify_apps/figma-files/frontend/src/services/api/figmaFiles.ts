/**
 * Figma Files API Module
 * CRUD operations for figma files
 */

import { get, post, put, del } from './client';
import type {
  ListFigmaFilesResponse,
  GetFigmaFileResponse,
  CreateFigmaFileRequest,
  UpdateFigmaFileRequest,
  DeleteResponse,
  FigmaFileListFilters,
} from '../../types/api';

/**
 * Figma file API methods
 */
export const figmaFileApi = {
  /**
   * List figma files with optional filters and pagination
   * GET /figma-files
   */
  list(filters?: FigmaFileListFilters): Promise<ListFigmaFilesResponse> {
    return get<ListFigmaFilesResponse>('/figma-files', filters as Record<string, unknown>);
  },

  /**
   * Get a single figma file by ID
   * GET /figma-files/:id
   */
  getById(
    id: string,
    options?: { include_tags?: boolean; include_metadata?: boolean }
  ): Promise<GetFigmaFileResponse> {
    return get<GetFigmaFileResponse>(`/figma-files/${id}`, options as Record<string, unknown>);
  },

  /**
   * Create a new figma file
   * POST /figma-files
   */
  create(data: CreateFigmaFileRequest): Promise<GetFigmaFileResponse> {
    return post<GetFigmaFileResponse>('/figma-files', data);
  },

  /**
   * Update an existing figma file
   * PUT /figma-files/:id
   */
  update(id: string, data: UpdateFigmaFileRequest): Promise<GetFigmaFileResponse> {
    return put<GetFigmaFileResponse>(`/figma-files/${id}`, data);
  },

  /**
   * Delete a figma file
   * DELETE /figma-files/:id
   */
  delete(id: string): Promise<DeleteResponse> {
    return del<DeleteResponse>(`/figma-files/${id}`);
  },
};
