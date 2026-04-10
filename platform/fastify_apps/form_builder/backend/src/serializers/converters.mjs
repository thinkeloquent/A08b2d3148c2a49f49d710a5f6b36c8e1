/**
 * Model <-> Proto Converters
 * Handles conversion between Sequelize models and protobuf messages
 */

import {
  FormStatus,
} from '@internal/form-builder-proto';

// Form Status enum mappings
const STATUS_TO_PROTO = {
  draft: FormStatus.FORM_STATUS_DRAFT,
  published: FormStatus.FORM_STATUS_PUBLISHED,
  archived: FormStatus.FORM_STATUS_ARCHIVED,
};

const PROTO_TO_STATUS = {
  [FormStatus.FORM_STATUS_DRAFT]: 'draft',
  [FormStatus.FORM_STATUS_PUBLISHED]: 'published',
  [FormStatus.FORM_STATUS_ARCHIVED]: 'archived',
  [FormStatus.FORM_STATUS_UNSPECIFIED]: null,
};

/**
 * Convert timestamp to proto format
 */
function toProtoTimestamp(date) {
  if (!date) return null;
  return { iso8601: date.toISOString() };
}

/**
 * Convert Tag model to proto format
 */
function tagToProto(tag) {
  const plain = tag.get ? tag.get({ plain: true }) : tag;
  return {
    id: plain.id,
    name: plain.name,
    color: plain.color || '',
    createdAt: toProtoTimestamp(plain.createdAt || plain.created_at),
    updatedAt: toProtoTimestamp(plain.updatedAt || plain.updated_at),
  };
}

/**
 * Convert FormDefinition model to proto format (full, with schema_data)
 */
function formToProto(form) {
  const plain = form.get ? form.get({ plain: true }) : form;

  return {
    id: plain.id,
    name: plain.name,
    description: plain.description || '',
    version: plain.version || '',
    status: STATUS_TO_PROTO[plain.status] || FormStatus.FORM_STATUS_UNSPECIFIED,
    schemaData: plain.schema_data ? Buffer.from(JSON.stringify(plain.schema_data)) : null,
    metadataData: plain.metadata_data ? Buffer.from(JSON.stringify(plain.metadata_data)) : null,
    createdBy: plain.created_by || plain.createdBy || '',
    tags: (plain.tags || []).map(tagToProto),
    createdAt: toProtoTimestamp(plain.createdAt || plain.created_at),
    updatedAt: toProtoTimestamp(plain.updatedAt || plain.updated_at),
  };
}

/**
 * Convert FormDefinition model to summary proto format (no schema_data)
 */
function formToSummaryProto(form) {
  const plain = form.get ? form.get({ plain: true }) : form;

  // Count pages and elements from schema_data
  let pageCount = 0;
  let elementCount = 0;
  if (plain.schema_data && plain.schema_data.pages) {
    pageCount = plain.schema_data.pages.length;
    elementCount = plain.schema_data.pages.reduce(
      (sum, page) => sum + (page.elements?.length || 0),
      0
    );
  }

  return {
    id: plain.id,
    name: plain.name,
    description: plain.description || '',
    version: plain.version || '',
    status: STATUS_TO_PROTO[plain.status] || FormStatus.FORM_STATUS_UNSPECIFIED,
    createdBy: plain.created_by || plain.createdBy || '',
    tags: (plain.tags || []).map(tagToProto),
    pageCount,
    elementCount,
    createdAt: toProtoTimestamp(plain.createdAt || plain.created_at),
    updatedAt: toProtoTimestamp(plain.updatedAt || plain.updated_at),
  };
}

/**
 * Convert FormDefinitionVersion model to proto format
 */
function versionToProto(version) {
  const plain = version.get ? version.get({ plain: true }) : version;

  return {
    id: plain.id,
    formDefinitionId: plain.form_definition_id || plain.formDefinitionId,
    version: plain.version || '',
    schemaData: plain.schema_data ? Buffer.from(JSON.stringify(plain.schema_data)) : null,
    metadataData: plain.metadata_data ? Buffer.from(JSON.stringify(plain.metadata_data)) : null,
    changeSummary: plain.change_summary || plain.changeSummary || '',
    createdAt: toProtoTimestamp(plain.createdAt || plain.created_at),
  };
}

/**
 * Convert proto/JSON request to model data for form creation/update
 */
function formFromRequest(data) {
  const result = {};

  if (data.name !== undefined) result.name = data.name;
  if (data.description !== undefined) result.description = data.description;
  if (data.version !== undefined) result.version = data.version;
  if (data.created_by !== undefined) result.created_by = data.created_by;
  if (data.createdBy !== undefined) result.created_by = data.createdBy;

  // Handle status — can be string or proto enum
  if (data.status !== undefined) {
    if (typeof data.status === 'string') {
      result.status = data.status;
    } else if (typeof data.status === 'number') {
      result.status = PROTO_TO_STATUS[data.status];
    }
  }

  // Handle schema_data — can be JSON object or Buffer (proto bytes)
  if (data.schema_data !== undefined) {
    result.schema_data = typeof data.schema_data === 'string'
      ? JSON.parse(data.schema_data)
      : data.schema_data;
  } else if (data.schemaData !== undefined) {
    result.schema_data = Buffer.isBuffer(data.schemaData)
      ? JSON.parse(data.schemaData.toString())
      : typeof data.schemaData === 'string'
        ? JSON.parse(data.schemaData)
        : data.schemaData;
  }

  // Handle metadata_data
  if (data.metadata_data !== undefined) {
    result.metadata_data = typeof data.metadata_data === 'string'
      ? JSON.parse(data.metadata_data)
      : data.metadata_data;
  } else if (data.metadataData !== undefined) {
    result.metadata_data = Buffer.isBuffer(data.metadataData)
      ? JSON.parse(data.metadataData.toString())
      : typeof data.metadataData === 'string'
        ? JSON.parse(data.metadataData)
        : data.metadataData;
  }

  return result;
}

/**
 * Convert proto/JSON request to model data for tag creation/update
 */
function tagFromRequest(data) {
  const result = {};
  if (data.name !== undefined) result.name = data.name;
  if (data.color !== undefined) result.color = data.color;
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

/**
 * Convert form model to JSON API response (no proto encoding)
 */
function formToJson(form) {
  const plain = form.get ? form.get({ plain: true }) : form;
  return {
    ...plain,
    tags: (plain.tags || []).map(t => t.get ? t.get({ plain: true }) : t),
  };
}

export {
  // Enum mappings
  STATUS_TO_PROTO,
  PROTO_TO_STATUS,
  // Converters to proto
  formToProto,
  formToSummaryProto,
  versionToProto,
  tagToProto,
  toProtoTimestamp,
  // Converters from request
  formFromRequest,
  tagFromRequest,
  // Pagination helpers
  paginationFromRequest,
  paginationResponse,
  // JSON helpers
  formToJson,
};
