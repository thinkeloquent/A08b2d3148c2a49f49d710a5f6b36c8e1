/**
 * Protocol Buffer definitions for form-builder API
 * Re-exports generated protobuf types
 */

import { form_builder } from '../generated/proto.js';

// Extract namespaces
const common = form_builder.common;
const form_definition = form_builder.form_definition;
const tag = form_builder.tag;
const version = form_builder.version;

// Common types
export const {
  FormStatus,
  PaginationRequest,
  PaginationResponse,
  ErrorResponse,
  Timestamp,
} = common;

// Form definition types
export const {
  FormDefinition,
  FormDefinitionSummary,
  ListFormDefinitionsRequest,
  ListFormDefinitionsResponse,
  GetFormDefinitionRequest,
  GetFormDefinitionResponse,
  CreateFormDefinitionRequest,
  CreateFormDefinitionResponse,
  UpdateFormDefinitionRequest,
  UpdateFormDefinitionResponse,
  DeleteFormDefinitionRequest,
  DeleteFormDefinitionResponse,
} = form_definition;

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

// Version types
export const {
  FormVersion,
  ListVersionsRequest,
  ListVersionsResponse,
  GetVersionRequest,
  GetVersionResponse,
  CreateVersionRequest,
  CreateVersionResponse,
  RestoreVersionRequest,
  RestoreVersionResponse,
} = version;

// Export full root for advanced usage
export const protoRoot = form_builder;

// Export namespaces for convenience
export { common, form_definition, tag, version };
