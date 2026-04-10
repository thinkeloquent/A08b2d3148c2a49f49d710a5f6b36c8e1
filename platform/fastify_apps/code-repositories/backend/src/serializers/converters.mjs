/**
 * Model <-> Proto Converters
 * Handles conversion between Sequelize models and protobuf messages
 */

import {
  RepositoryType,
  RepositoryStatus,
  RepositorySource,
} from '@internal/code-repositories-proto';

// Repository Type enum mappings
const TYPE_TO_PROTO = {
  npm: RepositoryType.REPOSITORY_TYPE_NPM,
  docker: RepositoryType.REPOSITORY_TYPE_DOCKER,
  python: RepositoryType.REPOSITORY_TYPE_PYTHON,
};

const PROTO_TO_TYPE = {
  [RepositoryType.REPOSITORY_TYPE_NPM]: 'npm',
  [RepositoryType.REPOSITORY_TYPE_DOCKER]: 'docker',
  [RepositoryType.REPOSITORY_TYPE_PYTHON]: 'python',
  [RepositoryType.REPOSITORY_TYPE_UNSPECIFIED]: null,
};

// Repository Status enum mappings
const STATUS_TO_PROTO = {
  stable: RepositoryStatus.REPOSITORY_STATUS_STABLE,
  beta: RepositoryStatus.REPOSITORY_STATUS_BETA,
  deprecated: RepositoryStatus.REPOSITORY_STATUS_DEPRECATED,
  experimental: RepositoryStatus.REPOSITORY_STATUS_EXPERIMENTAL,
};

const PROTO_TO_STATUS = {
  [RepositoryStatus.REPOSITORY_STATUS_STABLE]: 'stable',
  [RepositoryStatus.REPOSITORY_STATUS_BETA]: 'beta',
  [RepositoryStatus.REPOSITORY_STATUS_DEPRECATED]: 'deprecated',
  [RepositoryStatus.REPOSITORY_STATUS_EXPERIMENTAL]: 'experimental',
  [RepositoryStatus.REPOSITORY_STATUS_UNSPECIFIED]: null,
};

// Repository Source enum mappings
const SOURCE_TO_PROTO = {
  github: RepositorySource.REPOSITORY_SOURCE_GITHUB,
  npm: RepositorySource.REPOSITORY_SOURCE_NPM,
  dockerhub: RepositorySource.REPOSITORY_SOURCE_DOCKERHUB,
  pypi: RepositorySource.REPOSITORY_SOURCE_PYPI,
  manual: RepositorySource.REPOSITORY_SOURCE_MANUAL,
};

const PROTO_TO_SOURCE = {
  [RepositorySource.REPOSITORY_SOURCE_GITHUB]: 'github',
  [RepositorySource.REPOSITORY_SOURCE_NPM]: 'npm',
  [RepositorySource.REPOSITORY_SOURCE_DOCKERHUB]: 'dockerhub',
  [RepositorySource.REPOSITORY_SOURCE_PYPI]: 'pypi',
  [RepositorySource.REPOSITORY_SOURCE_MANUAL]: 'manual',
  [RepositorySource.REPOSITORY_SOURCE_UNSPECIFIED]: null,
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
 * Model format: [["npm", "fastify"], ["github", "fastify/fastify"]]
 * Proto format: [{ registry: "npm", id: "fastify" }, ...]
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
    repositoryId: plain.repository_id || plain.repositoryId,
    createdAt: toProtoTimestamp(plain.createdAt || plain.created_at),
    updatedAt: toProtoTimestamp(plain.updatedAt || plain.updated_at),
  };
}

/**
 * Convert CodeRepository model to proto format
 */
function repositoryToProto(repo) {
  const plain = repo.get ? repo.get({ plain: true }) : repo;

  return {
    id: plain.id,
    name: plain.name,
    description: plain.description || '',
    type: TYPE_TO_PROTO[plain.type] || RepositoryType.REPOSITORY_TYPE_UNSPECIFIED,
    githubUrl: plain.github_url || plain.githubUrl || '',
    packageUrl: plain.package_url || plain.packageUrl || '',
    stars: plain.stars || 0,
    forks: plain.forks || 0,
    version: plain.version || '',
    maintainer: plain.maintainer || '',
    lastUpdated: plain.last_updated || plain.lastUpdated || '',
    trending: plain.trending || false,
    verified: plain.verified || false,
    language: plain.language || '',
    license: plain.license || '',
    size: plain.size || '',
    dependencies: plain.dependencies || 0,
    healthScore: plain.health_score || plain.healthScore || 0,
    status: STATUS_TO_PROTO[plain.status] || RepositoryStatus.REPOSITORY_STATUS_UNSPECIFIED,
    source: SOURCE_TO_PROTO[plain.source] || RepositorySource.REPOSITORY_SOURCE_UNSPECIFIED,
    externalIds: externalIdsToProto(plain.external_ids || plain.externalIds),
    tags: (plain.tags || []).map(tagToProto),
    metadata: (plain.metadata || []).map(metadataToProto),
    createdAt: toProtoTimestamp(plain.createdAt || plain.created_at),
    updatedAt: toProtoTimestamp(plain.updatedAt || plain.updated_at),
  };
}

/**
 * Convert proto/JSON request to model data for repository creation/update
 */
function repositoryFromRequest(data) {
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

  if (data.github_url !== undefined) result.github_url = data.github_url;
  if (data.githubUrl !== undefined) result.github_url = data.githubUrl;
  if (data.package_url !== undefined) result.package_url = data.package_url;
  if (data.packageUrl !== undefined) result.package_url = data.packageUrl;
  if (data.stars !== undefined) result.stars = data.stars;
  if (data.forks !== undefined) result.forks = data.forks;
  if (data.version !== undefined) result.version = data.version;
  if (data.maintainer !== undefined) result.maintainer = data.maintainer;
  if (data.last_updated !== undefined) result.last_updated = data.last_updated;
  if (data.lastUpdated !== undefined) result.last_updated = data.lastUpdated;
  if (data.trending !== undefined) result.trending = data.trending;
  if (data.verified !== undefined) result.verified = data.verified;
  if (data.language !== undefined) result.language = data.language;
  if (data.license !== undefined) result.license = data.license;
  if (data.size !== undefined) result.size = data.size;
  if (data.dependencies !== undefined) result.dependencies = data.dependencies;
  if (data.health_score !== undefined) result.health_score = data.health_score;
  if (data.healthScore !== undefined) result.health_score = data.healthScore;

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
  if (data.repository_id !== undefined) result.repository_id = data.repository_id;
  if (data.repositoryId !== undefined) result.repository_id = data.repositoryId;

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
  repositoryToProto,
  tagToProto,
  metadataToProto,
  externalIdsToProto,
  toProtoTimestamp,
  // Converters from request
  repositoryFromRequest,
  tagFromRequest,
  metadataFromRequest,
  externalIdsFromProto,
  // Pagination helpers
  paginationFromRequest,
  paginationResponse,
};
