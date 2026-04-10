/**
 * Tag Routes
 * CRUD endpoints for repository tags
 */

import { createTagService } from '../services/tag.service.mjs';
import { tagToProto, tagFromRequest } from '../serializers/converters.mjs';

export default async function tagRoutes(fastify, _options) {
  const service = createTagService(fastify.db);

  /**
   * List all tags
   * GET /tags
   */
  fastify.get('/tags', {
    schema: {
      description: 'List all tags',
      tags: ['Tags'],
    },
  }, async (request, reply) => {
    const tags = await service.list();

    const response = {
      tags: tags.map(tagToProto),
    };

    return reply.sendNegotiated(
      response,
      'code_repositories.tag.TagListResponse'
    );
  });

  /**
   * Get tag by ID
   * GET /tags/:id
   */
  fastify.get('/tags/:id', {
    schema: {
      description: 'Get tag by ID',
      tags: ['Tags'],
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

    const tag = await service.getById(id);

    if (!tag) {
      return reply.status(404).send({
        code: 404,
        message: 'Tag not found',
      });
    }

    const response = {
      tag: tagToProto(tag),
    };

    return reply.sendNegotiated(
      response,
      'code_repositories.tag.GetTagResponse'
    );
  });

  /**
   * Create a new tag
   * POST /tags
   */
  fastify.post('/tags', {
    schema: {
      description: 'Create a new tag',
      tags: ['Tags'],
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1 },
        },
      },
    },
  }, async (request, reply) => {
    const data = tagFromRequest(request.body);

    try {
      const tag = await service.create(data);

      const response = {
        tag: tagToProto(tag),
      };

      return reply.status(201).sendNegotiated(
        response,
        'code_repositories.tag.CreateTagResponse'
      );
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({
          code: 409,
          message: 'Tag with this name already exists',
        });
      }
      throw error;
    }
  });

  /**
   * Update a tag
   * PUT /tags/:id
   */
  fastify.put('/tags/:id', {
    schema: {
      description: 'Update a tag',
      tags: ['Tags'],
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
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const data = tagFromRequest(request.body);

    try {
      const tag = await service.update(id, data);

      if (!tag) {
        return reply.status(404).send({
          code: 404,
          message: 'Tag not found',
        });
      }

      const response = {
        tag: tagToProto(tag),
      };

      return reply.sendNegotiated(
        response,
        'code_repositories.tag.UpdateTagResponse'
      );
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({
          code: 409,
          message: 'Tag with this name already exists',
        });
      }
      throw error;
    }
  });

  /**
   * Delete a tag
   * DELETE /tags/:id
   */
  fastify.delete('/tags/:id', {
    schema: {
      description: 'Delete a tag',
      tags: ['Tags'],
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
        message: 'Tag not found',
      });
    }

    const response = { success: true };

    return reply.sendNegotiated(
      response,
      'code_repositories.tag.DeleteTagResponse'
    );
  });
}
