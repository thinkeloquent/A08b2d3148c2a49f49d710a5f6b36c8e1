/**
 * API Types - Matching backend response schemas
 */

// Timestamp type from protobuf
export interface Timestamp {
  iso8601: string;
}

// External ID for registry references
export interface ExternalId {
  registry: string;
  id: string;
}

// FigmaFile type enum (matches backend)
export enum FigmaFileType {
  UNSPECIFIED = 0,
  DESIGN_SYSTEM = 1,
  COMPONENT_LIBRARY = 2,
  PROTOTYPE = 3,
  ILLUSTRATION = 4,
  ICON_SET = 5,
}

// FigmaFile status enum
export enum FigmaFileStatus {
  UNSPECIFIED = 0,
  STABLE = 1,
  BETA = 2,
  DEPRECATED = 3,
  EXPERIMENTAL = 4,
}

// FigmaFile source enum
export enum FigmaFileSource {
  UNSPECIFIED = 0,
  FIGMA = 1,
  FIGMA_COMMUNITY = 2,
  MANUAL = 3,
}

// Tag type
export interface Tag {
  id: number;
  name: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Metadata type
export interface Metadata {
  id: number;
  name: string;
  contentType?: string;
  sourceUrl?: string;
  sourceHashId?: string;
  labels?: string[];
  figmaFileId?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// FigmaFile from API (uses numeric enums)
export interface ApiFigmaFile {
  id: string;
  name: string;
  description?: string;
  type: FigmaFileType | number;
  figmaUrl?: string;
  figmaFileKey?: string;
  thumbnailUrl?: string;
  pageCount?: number;
  componentCount?: number;
  styleCount?: number;
  lastModifiedBy?: string;
  editorType?: string;
  trending?: boolean;
  verified?: boolean;
  status: FigmaFileStatus | number;
  source?: FigmaFileSource | number;
  externalIds?: ExternalId[];
  tags?: Tag[];
  metadata?: Metadata[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Pagination request params
export interface PaginationRequest {
  page?: number;
  limit?: number;
}

// Pagination response
export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// FigmaFile list filters
export interface FigmaFileListFilters extends PaginationRequest {
  type?: 'design_system' | 'component_library' | 'prototype' | 'illustration' | 'icon_set';
  status?: 'stable' | 'beta' | 'deprecated' | 'experimental';
  search?: string;
  tags?: string;
  trending?: boolean;
  verified?: boolean;
  include_tags?: boolean;
  include_metadata?: boolean;
}

// List figma files response
export interface ListFigmaFilesResponse {
  figmaFiles: ApiFigmaFile[];
  pagination: PaginationResponse;
}

// Single figma file response
export interface GetFigmaFileResponse {
  figmaFile: ApiFigmaFile;
}

// Create figma file request
export interface CreateFigmaFileRequest {
  name: string;
  type: 'design_system' | 'component_library' | 'prototype' | 'illustration' | 'icon_set';
  description?: string;
  figma_url?: string;
  figma_file_key?: string;
  thumbnail_url?: string;
  page_count?: number;
  component_count?: number;
  style_count?: number;
  last_modified_by?: string;
  editor_type?: string;
  trending?: boolean;
  verified?: boolean;
  status?: 'stable' | 'beta' | 'deprecated' | 'experimental';
  source?: 'figma' | 'figma_community' | 'manual';
  external_ids?: [string, string][];
  tag_names?: string[];
}

// Update figma file request (all fields optional)
export interface UpdateFigmaFileRequest {
  name?: string;
  type?: 'design_system' | 'component_library' | 'prototype' | 'illustration' | 'icon_set';
  description?: string;
  figma_url?: string;
  figma_file_key?: string;
  thumbnail_url?: string;
  page_count?: number;
  component_count?: number;
  style_count?: number;
  last_modified_by?: string;
  editor_type?: string;
  trending?: boolean;
  verified?: boolean;
  status?: 'stable' | 'beta' | 'deprecated' | 'experimental';
  source?: 'figma' | 'figma_community' | 'manual';
  external_ids?: [string, string][];
  tag_names?: string[];
}

// Delete response
export interface DeleteResponse {
  success: boolean;
}

// Bulk create response
export interface BulkCreateResponse {
  created: ApiFigmaFile[];
  errors?: { index: number; message: string }[];
}

// Tag list response
export interface ListTagsResponse {
  tags: Tag[];
}

// Single tag response
export interface GetTagResponse {
  tag: Tag;
}

// Create/Update tag request
export interface TagRequest {
  name: string;
}

// Metadata list response
export interface ListMetadataResponse {
  items: Metadata[];
}

// Single metadata response
export interface GetMetadataResponse {
  metadata: Metadata;
}

// Create metadata request
export interface CreateMetadataRequest {
  name: string;
  content_type?: string;
  source_url?: string;
  source_hash_id?: string;
  labels?: string[];
}

// Update metadata request
export interface UpdateMetadataRequest {
  name?: string;
  content_type?: string;
  source_url?: string;
  source_hash_id?: string;
  labels?: string[];
}

// API error response format
export interface ApiErrorResponse {
  code: number;
  message: string;
}

// Helper to convert API figma file type enum to string
export function typeEnumToString(
  type: FigmaFileType | number
): 'design_system' | 'component_library' | 'prototype' | 'illustration' | 'icon_set' {
  switch (type) {
    case FigmaFileType.DESIGN_SYSTEM:
    case 1:
      return 'design_system';
    case FigmaFileType.COMPONENT_LIBRARY:
    case 2:
      return 'component_library';
    case FigmaFileType.PROTOTYPE:
    case 3:
      return 'prototype';
    case FigmaFileType.ILLUSTRATION:
    case 4:
      return 'illustration';
    case FigmaFileType.ICON_SET:
    case 5:
      return 'icon_set';
    default:
      return 'design_system';
  }
}

// Helper to convert API status enum to string
export function statusEnumToString(
  status: FigmaFileStatus | number
): 'stable' | 'beta' | 'deprecated' | 'experimental' {
  switch (status) {
    case FigmaFileStatus.STABLE:
    case 1:
      return 'stable';
    case FigmaFileStatus.BETA:
    case 2:
      return 'beta';
    case FigmaFileStatus.DEPRECATED:
    case 3:
      return 'deprecated';
    case FigmaFileStatus.EXPERIMENTAL:
    case 4:
      return 'experimental';
    default:
      return 'stable';
  }
}
