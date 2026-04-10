/**
 * Protocol Buffer definitions for figma-files API
 * Re-exports generated protobuf types
 */

import { figma_files } from '../generated/proto.js';

// Extract namespaces
const common = figma_files.common;
const figma_file = figma_files.figma_file;
const tag = figma_files.tag;
const metadata = figma_files.metadata;

// Common types
export const {
  FigmaFileType,
  FigmaFileStatus,
  FigmaFileSource,
  ExternalId,
  PaginationRequest,
  PaginationResponse,
  ErrorResponse,
  Timestamp,
} = common;

// FigmaFile types
export const {
  FigmaFile,
  ListFigmaFilesRequest,
  ListFigmaFilesResponse,
  GetFigmaFileRequest,
  GetFigmaFileResponse,
  CreateFigmaFileRequest,
  CreateFigmaFileResponse,
  UpdateFigmaFileRequest,
  UpdateFigmaFileResponse,
  DeleteFigmaFileRequest,
  DeleteFigmaFileResponse,
} = figma_file;

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
export const protoRoot = figma_files;

// Export namespaces for convenience
export { common, figma_file, tag, metadata };
