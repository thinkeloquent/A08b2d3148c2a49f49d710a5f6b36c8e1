/**
 * Protocol Buffer definitions for code-repositories API
 * Re-exports generated protobuf types
 */

import { code_repositories } from '../generated/proto.js';

// Extract namespaces
const common = code_repositories.common;
const repository = code_repositories.repository;
const tag = code_repositories.tag;
const metadata = code_repositories.metadata;

// Common types
export const {
  RepositoryType,
  RepositoryStatus,
  RepositorySource,
  ExternalId,
  PaginationRequest,
  PaginationResponse,
  ErrorResponse,
  Timestamp,
} = common;

// Repository types
export const {
  Repository,
  ListRepositoriesRequest,
  ListRepositoriesResponse,
  GetRepositoryRequest,
  GetRepositoryResponse,
  CreateRepositoryRequest,
  CreateRepositoryResponse,
  UpdateRepositoryRequest,
  UpdateRepositoryResponse,
  DeleteRepositoryRequest,
  DeleteRepositoryResponse,
} = repository;

// Tag types
export const {
  Tag,
  TagListResponse,
  CreateTagRequest,
  CreateTagResponse,
  UpdateTagRequest,
  UpdateTagResponse,
  GetTagRequest,
  GetTagResponse,
  DeleteTagRequest,
  DeleteTagResponse,
} = tag;

// Metadata types
export const {
  Metadata,
  MetadataListResponse,
  CreateMetadataRequest,
  CreateMetadataResponse,
  UpdateMetadataRequest,
  UpdateMetadataResponse,
  GetMetadataRequest,
  GetMetadataResponse,
  DeleteMetadataRequest,
  DeleteMetadataResponse,
} = metadata;

// Export full root for advanced usage
export const protoRoot = code_repositories;

// Export namespaces for convenience
export { common, repository, tag, metadata };
