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

// Repository type enum (matches backend protobuf)
export enum RepositoryType {
  UNSPECIFIED = 0,
  NPM = 1,
  DOCKER = 2,
  PYTHON = 3,
}

// Repository status enum
export enum RepositoryStatus {
  UNSPECIFIED = 0,
  STABLE = 1,
  BETA = 2,
  DEPRECATED = 3,
  EXPERIMENTAL = 4,
}

// Repository source enum
export enum RepositorySource {
  UNSPECIFIED = 0,
  GITHUB = 1,
  NPM = 2,
  DOCKERHUB = 3,
  PYPI = 4,
  MANUAL = 5,
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
  repositoryId?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Repository from API (uses numeric enums)
export interface ApiRepository {
  id: string;
  name: string;
  description?: string;
  type: RepositoryType | number;
  githubUrl?: string;
  packageUrl?: string;
  stars?: number;
  forks?: number;
  version?: string;
  maintainer?: string;
  lastUpdated?: string;
  trending?: boolean;
  verified?: boolean;
  language?: string;
  license?: string;
  size?: string;
  dependencies?: number;
  healthScore?: number;
  status: RepositoryStatus | number;
  source?: RepositorySource | number;
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

// Repository list filters
export interface RepositoryListFilters extends PaginationRequest {
  type?: 'npm' | 'docker' | 'python';
  status?: 'stable' | 'beta' | 'deprecated' | 'experimental';
  search?: string;
  tags?: string;
  trending?: boolean;
  verified?: boolean;
  include_tags?: boolean;
  include_metadata?: boolean;
}

// List repositories response
export interface ListRepositoriesResponse {
  repositories: ApiRepository[];
  pagination: PaginationResponse;
}

// Single repository response
export interface GetRepositoryResponse {
  repository: ApiRepository;
}

// Create repository request
export interface CreateRepositoryRequest {
  name: string;
  type: 'npm' | 'docker' | 'python';
  description?: string;
  github_url?: string;
  package_url?: string;
  stars?: number;
  forks?: number;
  version?: string;
  maintainer?: string;
  last_updated?: string;
  trending?: boolean;
  verified?: boolean;
  language?: string;
  license?: string;
  size?: string;
  dependencies?: number;
  health_score?: number;
  status?: 'stable' | 'beta' | 'deprecated' | 'experimental';
  source?: 'github' | 'npm' | 'dockerhub' | 'pypi' | 'manual';
  external_ids?: [string, string][];
  tag_names?: string[];
}

// Update repository request (all fields optional)
export interface UpdateRepositoryRequest {
  name?: string;
  type?: 'npm' | 'docker' | 'python';
  description?: string;
  github_url?: string;
  package_url?: string;
  stars?: number;
  forks?: number;
  version?: string;
  maintainer?: string;
  last_updated?: string;
  trending?: boolean;
  verified?: boolean;
  language?: string;
  license?: string;
  size?: string;
  dependencies?: number;
  health_score?: number;
  status?: 'stable' | 'beta' | 'deprecated' | 'experimental';
  source?: 'github' | 'npm' | 'dockerhub' | 'pypi' | 'manual';
  external_ids?: [string, string][];
  tag_names?: string[];
}

// Delete response
export interface DeleteResponse {
  success: boolean;
}

// Bulk create response
export interface BulkCreateResponse {
  created: ApiRepository[];
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

// Helper to convert API repository type enum to string
export function typeEnumToString(type: RepositoryType | number): 'npm' | 'docker' | 'python' {
  switch (type) {
    case RepositoryType.NPM:
    case 1:
      return 'npm';
    case RepositoryType.DOCKER:
    case 2:
      return 'docker';
    case RepositoryType.PYTHON:
    case 3:
      return 'python';
    default:
      return 'npm';
  }
}

// Helper to convert API status enum to string
export function statusEnumToString(status: RepositoryStatus | number): 'stable' | 'beta' | 'deprecated' | 'experimental' {
  switch (status) {
    case RepositoryStatus.STABLE:
    case 1:
      return 'stable';
    case RepositoryStatus.BETA:
    case 2:
      return 'beta';
    case RepositoryStatus.DEPRECATED:
    case 3:
      return 'deprecated';
    case RepositoryStatus.EXPERIMENTAL:
    case 4:
      return 'experimental';
    default:
      return 'stable';
  }
}
