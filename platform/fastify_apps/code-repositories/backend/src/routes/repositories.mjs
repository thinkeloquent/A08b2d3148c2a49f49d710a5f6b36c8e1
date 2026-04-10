/**
 * Repository Routes
 * CRUD endpoints for code repositories
 */

import { createRepositoryService } from '../services/repository.service.mjs';
import {
  repositoryToProto,
  repositoryFromRequest,
  paginationFromRequest,
  paginationResponse,
} from '../serializers/converters.mjs';

export default async function repositoryRoutes(fastify, _options) {
  const service = createRepositoryService(fastify.db);

  /**
   * List repositories with pagination and filters
   * GET /repos
   */
  fastify.get('/repos', {
    schema: {
      description: 'List repositories with pagination and filters',
      tags: ['Repositories'],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          type: { type: 'string', enum: ['npm', 'docker', 'python'] },
          status: { type: 'string', enum: ['stable', 'beta', 'deprecated', 'experimental'] },
          search: { type: 'string' },
          tags: { type: 'string', description: 'Comma-separated tag names' },
          trending: { type: 'boolean' },
          verified: { type: 'boolean' },
          include_tags: { type: 'boolean', default: false },
          include_metadata: { type: 'boolean', default: false },
        },
      },
    },
  }, async (request, reply) => {
    const pagination = paginationFromRequest(request.query);
    const { type, status, search, tags, trending, verified, include_tags, include_metadata } = request.query;

    const result = await service.list({
      ...pagination,
      type,
      status,
      search,
      tags: tags ? tags.split(',').map(t => t.trim()) : undefined,
      trending,
      verified,
      includeTags: include_tags,
      includeMetadata: include_metadata,
    });

    const response = {
      repositories: result.repositories.map(repositoryToProto),
      pagination: paginationResponse(result.total, result.page, result.limit),
    };

    return reply.sendNegotiated(
      response,
      'code_repositories.repository.ListRepositoriesResponse'
    );
  });

  /**
   * Get repository by ID
   * GET /repos/:id
   */
  fastify.get('/repos/:id', {
    schema: {
      description: 'Get repository by ID',
      tags: ['Repositories'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          include_tags: { type: 'boolean', default: true },
          include_metadata: { type: 'boolean', default: true },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const { include_tags = true, include_metadata = true } = request.query;

    const repository = await service.getById(id, {
      includeTags: include_tags,
      includeMetadata: include_metadata,
    });

    if (!repository) {
      return reply.status(404).send({
        code: 404,
        message: 'Repository not found',
      });
    }

    const response = {
      repository: repositoryToProto(repository),
    };

    return reply.sendNegotiated(
      response,
      'code_repositories.repository.GetRepositoryResponse'
    );
  });

  /**
   * Create a new repository
   * POST /repos
   */
  fastify.post('/repos', {
    schema: {
      description: 'Create a new repository',
      tags: ['Repositories'],
      body: {
        type: 'object',
        required: ['name', 'type'],
        properties: {
          name: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          type: { type: 'string', enum: ['npm', 'docker', 'python'] },
          github_url: { type: 'string' },
          package_url: { type: 'string' },
          stars: { type: 'integer' },
          forks: { type: 'integer' },
          version: { type: 'string' },
          maintainer: { type: 'string' },
          last_updated: { type: 'string' },
          trending: { type: 'boolean' },
          verified: { type: 'boolean' },
          language: { type: 'string' },
          license: { type: 'string' },
          size: { type: 'string' },
          dependencies: { type: 'integer' },
          health_score: { type: 'integer', minimum: 0, maximum: 100 },
          status: { type: 'string', enum: ['stable', 'beta', 'deprecated', 'experimental'] },
          source: { type: 'string', enum: ['github', 'npm', 'dockerhub', 'pypi', 'manual'] },
          external_ids: {
            type: 'array',
            items: {
              type: 'array',
              items: { type: 'string' },
              minItems: 2,
              maxItems: 2,
            },
          },
          tag_names: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const data = repositoryFromRequest(request.body);
    const tagNames = request.body.tag_names || request.body.tagNames || [];

    try {
      const repository = await service.create(data, tagNames);

      const response = {
        repository: repositoryToProto(repository),
      };

      return reply.status(201).sendNegotiated(
        response,
        'code_repositories.repository.CreateRepositoryResponse'
      );
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({
          code: 409,
          message: 'Repository with this name already exists',
        });
      }
      throw error;
    }
  });

  /**
   * Update a repository
   * PUT /repos/:id
   */
  fastify.put('/repos/:id', {
    schema: {
      description: 'Update a repository',
      tags: ['Repositories'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          type: { type: 'string', enum: ['npm', 'docker', 'python'] },
          github_url: { type: 'string' },
          package_url: { type: 'string' },
          stars: { type: 'integer' },
          forks: { type: 'integer' },
          version: { type: 'string' },
          maintainer: { type: 'string' },
          last_updated: { type: 'string' },
          trending: { type: 'boolean' },
          verified: { type: 'boolean' },
          language: { type: 'string' },
          license: { type: 'string' },
          size: { type: 'string' },
          dependencies: { type: 'integer' },
          health_score: { type: 'integer', minimum: 0, maximum: 100 },
          status: { type: 'string', enum: ['stable', 'beta', 'deprecated', 'experimental'] },
          source: { type: 'string', enum: ['github', 'npm', 'dockerhub', 'pypi', 'manual'] },
          external_ids: {
            type: 'array',
            items: {
              type: 'array',
              items: { type: 'string' },
              minItems: 2,
              maxItems: 2,
            },
          },
          tag_names: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const data = repositoryFromRequest(request.body);
    const tagNames = request.body.tag_names !== undefined
      ? request.body.tag_names
      : request.body.tagNames !== undefined
        ? request.body.tagNames
        : null;

    try {
      const repository = await service.update(id, data, tagNames);

      if (!repository) {
        return reply.status(404).send({
          code: 404,
          message: 'Repository not found',
        });
      }

      const response = {
        repository: repositoryToProto(repository),
      };

      return reply.sendNegotiated(
        response,
        'code_repositories.repository.UpdateRepositoryResponse'
      );
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({
          code: 409,
          message: 'Repository with this name already exists',
        });
      }
      throw error;
    }
  });

  /**
   * Delete a repository
   * DELETE /repos/:id
   */
  fastify.delete('/repos/:id', {
    schema: {
      description: 'Delete a repository',
      tags: ['Repositories'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;

    const success = await service.remove(id);

    if (!success) {
      return reply.status(404).send({
        code: 404,
        message: 'Repository not found',
      });
    }

    const response = { success: true };

    return reply.sendNegotiated(
      response,
      'code_repositories.repository.DeleteRepositoryResponse'
    );
  });
}
