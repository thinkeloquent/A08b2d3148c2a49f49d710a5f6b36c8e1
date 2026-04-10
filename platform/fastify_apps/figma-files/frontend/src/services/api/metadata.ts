/**
 * Metadata API Module
 * CRUD operations for figma file metadata
 */

import { get, post, put, del } from './client';
import type {
  ListMetadataResponse,
  GetMetadataResponse,
  CreateMetadataRequest,
  UpdateMetadataRequest,
  DeleteResponse,
} from '../../types/api';

/**
 * Metadata API methods
 */
export const metadataApi = {
  /**
   * List metadata for a figma file
   * GET /figma-files/:figmaFileId/metadata
   */
  listByFigmaFile(figmaFileId: string): Promise<ListMetadataResponse> {
    return get<ListMetadataResponse>(`/figma-files/${figmaFileId}/metadata`);
  },

  /**
   * Get metadata by ID
   * GET /metadata/:id
   */
  getById(id: number): Promise<GetMetadataResponse> {
    return get<GetMetadataResponse>(`/metadata/${id}`);
  },

  /**
   * Create metadata for a figma file
   * POST /figma-files/:figmaFileId/metadata
   */
  create(figmaFileId: string, data: CreateMetadataRequest): Promise<GetMetadataResponse> {
    return post<GetMetadataResponse>(`/figma-files/${figmaFileId}/metadata`, data);
  },

  /**
   * Update metadata
   * PUT /metadata/:id
   */
  update(id: number, data: UpdateMetadataRequest): Promise<GetMetadataResponse> {
    return put<GetMetadataResponse>(`/metadata/${id}`, data);
  },

  /**
   * Delete metadata
   * DELETE /metadata/:id
   */
  delete(id: number): Promise<DeleteResponse> {
    return del<DeleteResponse>(`/metadata/${id}`);
  },
};
