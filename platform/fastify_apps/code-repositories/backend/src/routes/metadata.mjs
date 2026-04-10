/**
 * Metadata Routes
 * CRUD endpoints for repository metadata
 */

import { createMetadataService } from '../services/metadata.service.mjs';
import { metadataToProto, metadataFromRequest } from '../serializers/converters.mjs';

export default async function metadataRoutes(fastify, _options) {
  const service = createMetadataService(fastify.db);

  /**
   * List metadata for a repository
   * GET /repos/:repoId/metadata
   */
  fastify.get('/repos/:repoId/metadata', {
    schema: {
      description: 'List metadata for a repository',
      tags: ['Metadata'],
      params: {
        type: 'object',
        required: ['repoId'],
        properties: {
          repoId: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request, reply) => {
    const { repoId } = request.params;

    const items = await service.listByRepository(repoId);

    const response = {
      items: items.map(metadataToProto),
    };

    return reply.sendNegotiated(
      response,
      'code_repositories.metadata.MetadataListResponse'
    );
  });

  /**
   * Get metadata by ID
   * GET /metadata/:id
   */
  fastify.get('/metadata/:id', {
    schema: {
      description: 'Get metadata by ID',
      tags: ['Metadata'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'integer' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;

    const metadata = await service.getById(id);

    if (!metadata) {
      return reply.status(404).send({
        code: 404,
        message: 'Metadata not found',
      });
    }

    const response = {
      metadata: metadataToProto(metadata),
    };

    return reply.sendNegotiated(
      response,
      'code_repositories.metadata.GetMetadataResponse'
    );
  });

  /**
   * Create metadata for a repository
   * POST /repos/:repoId/metadata
   */
  fastify.post('/repos/:repoId/metadata', {
    schema: {
      description: 'Create metadata for a repository',
      tags: ['Metadata'],
      params: {
        type: 'object',
        required: ['repoId'],
        properties: {
          repoId: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1 },
          content_type: { type: 'string' },
          source_url: { type: 'string' },
          source_hash_id: { type: 'string' },
          labels: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { repoId } = request.params;
    const data = metadataFromRequest(request.body);

    const { error, metadata } = await service.create(repoId, data);

    if (error) {
      return reply.status(404).send({
        code: 404,
        message: error,
      });
    }

    const response = {
      metadata: metadataToProto(metadata),
    };

    return reply.status(201).sendNegotiated(
      response,
      'code_repositories.metadata.CreateMetadataResponse'
    );
  });

  /**
   * Update metadata
   * PUT /metadata/:id
   */
  fastify.put('/metadata/:id', {
    schema: {
      description: 'Update metadata',
      tags: ['Metadata'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'integer' },
        },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1 },
          content_type: { type: 'string' },
          source_url: { type: 'string' },
          source_hash_id: { type: 'string' },
          labels: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const data = metadataFromRequest(request.body);

    const metadata = await service.update(id, data);

    if (!metadata) {
      return reply.status(404).send({
        code: 404,
        message: 'Metadata not found',
      });
    }

    const response = {
      metadata: metadataToProto(metadata),
    };

    return reply.sendNegotiated(
      response,
      'code_repositories.metadata.UpdateMetadataResponse'
    );
  });

  /**
   * Delete metadata
   * DELETE /metadata/:id
   */
  fastify.delete('/metadata/:id', {
    schema: {
      description: 'Delete metadata',
      tags: ['Metadata'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'integer' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;

    const success = await service.remove(id);

    if (!success) {
      return reply.status(404).send({
        code: 404,
        message: 'Metadata not found',
      });
    }

    const response = { success: true };

    return reply.sendNegotiated(
      response,
      'code_repositories.metadata.DeleteMetadataResponse'
    );
  });
}
