/**
 * Model <-> Proto Converters
 * Handles conversion between Sequelize models and protobuf messages
 */

import {
  FigmaFileType,
  FigmaFileStatus,
  FigmaFileSource,
} from '@internal/figma-files-proto';

// FigmaFile Type enum mappings
const TYPE_TO_PROTO = {
  design_system: FigmaFileType.FIGMA_FILE_TYPE_DESIGN_SYSTEM,
  component_library: FigmaFileType.FIGMA_FILE_TYPE_COMPONENT_LIBRARY,
  prototype: FigmaFileType.FIGMA_FILE_TYPE_PROTOTYPE,
  illustration: FigmaFileType.FIGMA_FILE_TYPE_ILLUSTRATION,
  icon_set: FigmaFileType.FIGMA_FILE_TYPE_ICON_SET,
};

const PROTO_TO_TYPE = {
  [FigmaFileType.FIGMA_FILE_TYPE_DESIGN_SYSTEM]: 'design_system',
  [FigmaFileType.FIGMA_FILE_TYPE_COMPONENT_LIBRARY]: 'component_library',
  [FigmaFileType.FIGMA_FILE_TYPE_PROTOTYPE]: 'prototype',
  [FigmaFileType.FIGMA_FILE_TYPE_ILLUSTRATION]: 'illustration',
  [FigmaFileType.FIGMA_FILE_TYPE_ICON_SET]: 'icon_set',
  [FigmaFileType.FIGMA_FILE_TYPE_UNSPECIFIED]: null,
};

// FigmaFile Status enum mappings
const STATUS_TO_PROTO = {
  stable: FigmaFileStatus.FIGMA_FILE_STATUS_STABLE,
  beta: FigmaFileStatus.FIGMA_FILE_STATUS_BETA,
  deprecated: FigmaFileStatus.FIGMA_FILE_STATUS_DEPRECATED,
  experimental: FigmaFileStatus.FIGMA_FILE_STATUS_EXPERIMENTAL,
};

const PROTO_TO_STATUS = {
  [FigmaFileStatus.FIGMA_FILE_STATUS_STABLE]: 'stable',
  [FigmaFileStatus.FIGMA_FILE_STATUS_BETA]: 'beta',
  [FigmaFileStatus.FIGMA_FILE_STATUS_DEPRECATED]: 'deprecated',
  [FigmaFileStatus.FIGMA_FILE_STATUS_EXPERIMENTAL]: 'experimental',
  [FigmaFileStatus.FIGMA_FILE_STATUS_UNSPECIFIED]: null,
};

// FigmaFile Source enum mappings
const SOURCE_TO_PROTO = {
  figma: FigmaFileSource.FIGMA_FILE_SOURCE_FIGMA,
  figma_community: FigmaFileSource.FIGMA_FILE_SOURCE_FIGMA_COMMUNITY,
  manual: FigmaFileSource.FIGMA_FILE_SOURCE_MANUAL,
};

const PROTO_TO_SOURCE = {
  [FigmaFileSource.FIGMA_FILE_SOURCE_FIGMA]: 'figma',
  [FigmaFileSource.FIGMA_FILE_SOURCE_FIGMA_COMMUNITY]: 'figma_community',
  [FigmaFileSource.FIGMA_FILE_SOURCE_MANUAL]: 'manual',
  [FigmaFileSource.FIGMA_FILE_SOURCE_UNSPECIFIED]: null,
};

/**
 * Convert timestamp to proto format
 */
function toProtoTimestamp(date) {
  if (!date) return null;
  return { iso8601: date.toISOString() };
}

/**
 * Convert external_ids from model format to proto format
 * Model format: [["figma", "abc123"], ["community", "xyz"]]
 * Proto format: [{ registry: "figma", id: "abc123" }, ...]
 */
function externalIdsToProto(externalIds) {
  if (!externalIds || !Array.isArray(externalIds)) return [];
  return externalIds.map(([registry, id]) => ({ registry, id }));
}

/**
 * Convert external_ids from proto format to model format
 */
function externalIdsFromProto(externalIds) {
  if (!externalIds || !Array.isArray(externalIds)) return [];
  return externalIds.map(({ registry, id }) => [registry, id]);
}

/**
 * Convert Tag model to proto format
 */
function tagToProto(tag) {
  const plain = tag.get ? tag.get({ plain: true }) : tag;
  return {
    id: plain.id,
    name: plain.name,
    createdAt: toProtoTimestamp(plain.createdAt || plain.created_at),
    updatedAt: toProtoTimestamp(plain.updatedAt || plain.updated_at),
  };
}

/**
 * Convert Metadata model to proto format
 */
function metadataToProto(metadata) {
  const plain = metadata.get ? metadata.get({ plain: true }) : metadata;
  return {
    id: plain.id,
    name: plain.name,
    contentType: plain.content_type || plain.contentType || '',
    sourceUrl: plain.source_url || plain.sourceUrl || '',
    sourceHashId: plain.source_hash_id || plain.sourceHashId || '',
    labels: plain.labels || [],
    figmaFileId: plain.figma_file_id || plain.figmaFileId,
    createdAt: toProtoTimestamp(plain.createdAt || plain.created_at),
    updatedAt: toProtoTimestamp(plain.updatedAt || plain.updated_at),
  };
}

/**
 * Convert FigmaFile model to proto format
 */
function figmaFileToProto(figmaFile) {
  const plain = figmaFile.get ? figmaFile.get({ plain: true }) : figmaFile;

  return {
    id: plain.id,
    name: plain.name,
    description: plain.description || '',
    type: TYPE_TO_PROTO[plain.type] || FigmaFileType.FIGMA_FILE_TYPE_UNSPECIFIED,
    figmaUrl: plain.figma_url || plain.figmaUrl || '',
    figmaFileKey: plain.figma_file_key || plain.figmaFileKey || '',
    thumbnailUrl: plain.thumbnail_url || plain.thumbnailUrl || '',
    pageCount: plain.page_count || plain.pageCount || 0,
    componentCount: plain.component_count || plain.componentCount || 0,
    styleCount: plain.style_count || plain.styleCount || 0,
    lastModifiedBy: plain.last_modified_by || plain.lastModifiedBy || '',
    editorType: plain.editor_type || plain.editorType || '',
    trending: plain.trending || false,
    verified: plain.verified || false,
    status: STATUS_TO_PROTO[plain.status] || FigmaFileStatus.FIGMA_FILE_STATUS_UNSPECIFIED,
    source: SOURCE_TO_PROTO[plain.source] || FigmaFileSource.FIGMA_FILE_SOURCE_UNSPECIFIED,
    externalIds: externalIdsToProto(plain.external_ids || plain.externalIds),
    tags: (plain.tags || []).map(tagToProto),
    metadata: (plain.metadata || []).map(metadataToProto),
    createdAt: toProtoTimestamp(plain.createdAt || plain.created_at),
    updatedAt: toProtoTimestamp(plain.updatedAt || plain.updated_at),
  };
}

/**
 * Convert proto/JSON request to model data for Figma file creation/update
 */
function figmaFileFromRequest(data) {
  const result = {};

  if (data.name !== undefined) result.name = data.name;
  if (data.description !== undefined) result.description = data.description;

  // Handle type - can be string or proto enum
  if (data.type !== undefined) {
    if (typeof data.type === 'string') {
      result.type = data.type;
    } else if (typeof data.type === 'number') {
      result.type = PROTO_TO_TYPE[data.type];
    }
  }

  if (data.figma_url !== undefined) result.figma_url = data.figma_url;
  if (data.figmaUrl !== undefined) result.figma_url = data.figmaUrl;
  if (data.figma_file_key !== undefined) result.figma_file_key = data.figma_file_key;
  if (data.figmaFileKey !== undefined) result.figma_file_key = data.figmaFileKey;
  if (data.thumbnail_url !== undefined) result.thumbnail_url = data.thumbnail_url;
  if (data.thumbnailUrl !== undefined) result.thumbnail_url = data.thumbnailUrl;
  if (data.page_count !== undefined) result.page_count = data.page_count;
  if (data.pageCount !== undefined) result.page_count = data.pageCount;
  if (data.component_count !== undefined) result.component_count = data.component_count;
  if (data.componentCount !== undefined) result.component_count = data.componentCount;
  if (data.style_count !== undefined) result.style_count = data.style_count;
  if (data.styleCount !== undefined) result.style_count = data.styleCount;
  if (data.last_modified_by !== undefined) result.last_modified_by = data.last_modified_by;
  if (data.lastModifiedBy !== undefined) result.last_modified_by = data.lastModifiedBy;
  if (data.editor_type !== undefined) result.editor_type = data.editor_type;
  if (data.editorType !== undefined) result.editor_type = data.editorType;
  if (data.trending !== undefined) result.trending = data.trending;
  if (data.verified !== undefined) result.verified = data.verified;

  // Handle status - can be string or proto enum
  if (data.status !== undefined) {
    if (typeof data.status === 'string') {
      result.status = data.status;
    } else if (typeof data.status === 'number') {
      result.status = PROTO_TO_STATUS[data.status];
    }
  }

  // Handle source - can be string or proto enum
  if (data.source !== undefined) {
    if (typeof data.source === 'string') {
      result.source = data.source;
    } else if (typeof data.source === 'number') {
      result.source = PROTO_TO_SOURCE[data.source];
    }
  }

  // Handle external_ids
  if (data.external_ids !== undefined) {
    result.external_ids = data.external_ids;
  } else if (data.externalIds !== undefined) {
    result.external_ids = externalIdsFromProto(data.externalIds);
  }

  return result;
}

/**
 * Convert proto/JSON request to model data for tag creation/update
 */
function tagFromRequest(data) {
  const result = {};
  if (data.name !== undefined) result.name = data.name;
  return result;
}

/**
 * Convert proto/JSON request to model data for metadata creation/update
 */
function metadataFromRequest(data) {
  const result = {};

  if (data.name !== undefined) result.name = data.name;
  if (data.content_type !== undefined) result.content_type = data.content_type;
  if (data.contentType !== undefined) result.content_type = data.contentType;
  if (data.source_url !== undefined) result.source_url = data.source_url;
  if (data.sourceUrl !== undefined) result.source_url = data.sourceUrl;
  if (data.source_hash_id !== undefined) result.source_hash_id = data.source_hash_id;
  if (data.sourceHashId !== undefined) result.source_hash_id = data.sourceHashId;
  if (data.labels !== undefined) result.labels = data.labels;
  if (data.figma_file_id !== undefined) result.figma_file_id = data.figma_file_id;
  if (data.figmaFileId !== undefined) result.figma_file_id = data.figmaFileId;

  return result;
}

/**
 * Convert pagination params from request
 */
function paginationFromRequest(data) {
  const page = parseInt(data.page, 10) || 1;
  const limit = Math.min(parseInt(data.limit, 10) || 20, 100);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/**
 * Build pagination response
 */
function paginationResponse(total, page, limit) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export {
  // Enum mappings
  TYPE_TO_PROTO,
  PROTO_TO_TYPE,
  STATUS_TO_PROTO,
  PROTO_TO_STATUS,
  SOURCE_TO_PROTO,
  PROTO_TO_SOURCE,
  // Converters to proto
  figmaFileToProto,
  tagToProto,
  metadataToProto,
  externalIdsToProto,
  toProtoTimestamp,
  // Converters from request
  figmaFileFromRequest,
  tagFromRequest,
  metadataFromRequest,
  externalIdsFromProto,
  // Pagination helpers
  paginationFromRequest,
  paginationResponse,
};
