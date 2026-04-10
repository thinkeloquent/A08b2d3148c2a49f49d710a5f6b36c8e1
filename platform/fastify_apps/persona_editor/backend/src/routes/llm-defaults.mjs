/**
 * LLM Defaults Routes
 * CRUD endpoints for LLM defaults
 */

import { createLLMDefaultService } from '../services/llm-default.service.mjs';

const VALID_CATEGORIES = ['tools', 'permissions', 'goals', 'prompts', 'tones', 'roles', 'providers'];

export default async function llmDefaultsRoutes(fastify, _options) {
  const service = createLLMDefaultService(fastify.db);

  /**
   * List all defaults (with optional category filter)
   * GET /llm-defaults
   */
  fastify.get('/', {
    schema: {
      description: 'List all LLM defaults',
      tags: ['LLM Defaults'],
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: VALID_CATEGORIES },
        },
      },
    },
  }, async (request, reply) => {
    const { category } = request.query;
    const defaults = category
      ? await service.findByCategory(category)
      : await service.findAll();
    return reply.send(defaults);
  });

  /**
   * Get defaults by category
   * GET /llm-defaults/category/:category
   */
  fastify.get('/category/:category', {
    schema: {
      description: 'Get LLM defaults by category',
      tags: ['LLM Defaults'],
      params: {
        type: 'object',
        required: ['category'],
        properties: {
          category: { type: 'string', enum: VALID_CATEGORIES },
        },
      },
    },
  }, async (request, reply) => {
    const { category } = request.params;

    if (!VALID_CATEGORIES.includes(category)) {
      return reply.status(400).send({
        error: 'BadRequest',
        message: `Invalid category: ${category}. Valid categories: ${VALID_CATEGORIES.join(', ')}`,
        statusCode: 400,
      });
    }

    const defaults = await service.findByCategory(category);
    return reply.send(defaults);
  });

  /**
   * Get default by ID
   * GET /llm-defaults/:id
   */
  fastify.get('/:id', {
    schema: {
      description: 'Get LLM default by ID',
      tags: ['LLM Defaults'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const llmDefault = await service.findById(id);

    if (!llmDefault) {
      return reply.status(404).send({
        error: 'NotFound',
        message: `LLM Default not found: ${id}`,
        statusCode: 404,
      });
    }

    return reply.send(llmDefault);
  });

  /**
   * Create a new default
   * POST /llm-defaults
   */
  fastify.post('/', {
    schema: {
      description: 'Create a new LLM default',
      tags: ['LLM Defaults'],
      body: {
        type: 'object',
        required: ['category', 'name', 'description', 'value'],
        properties: {
          category: { type: 'string', enum: VALID_CATEGORIES },
          name: { type: 'string', minLength: 3, maxLength: 255 },
          description: { type: 'string', minLength: 5 },
          value: {},  // Any type for flexible JSONB
          context: {},  // Any type for flexible JSONB
          is_default: { type: 'boolean' },
        },
      },
    },
  }, async (request, reply) => {
    const data = request.body;

    // If setting as default, unset others in category
    if (data.is_default) {
      await service.unsetDefaultsInCategory(data.category);
    }

    const llmDefault = await service.create(data);
    return reply.status(201).send(llmDefault);
  });

  /**
   * Update a default
   * PUT /llm-defaults/:id
   */
  fastify.put('/:id', {
    schema: {
      description: 'Update an LLM default',
      tags: ['LLM Defaults'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 3, maxLength: 255 },
          description: { type: 'string', minLength: 5 },
          value: {},
          context: {},
          is_default: { type: 'boolean' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const data = request.body;

    const existing = await service.findById(id);
    if (!existing) {
      return reply.status(404).send({
        error: 'NotFound',
        message: `LLM Default not found: ${id}`,
        statusCode: 404,
      });
    }

    // If setting as default, unset others in category
    if (data.is_default && !existing.is_default) {
      await service.unsetDefaultsInCategory(existing.category);
    }

    const llmDefault = await service.update(id, data);
    return reply.send(llmDefault);
  });

  /**
   * Delete a default
   * DELETE /llm-defaults/:id
   */
  fastify.delete('/:id', {
    schema: {
      description: 'Delete an LLM default',
      tags: ['LLM Defaults'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;

    const existing = await service.findById(id);
    if (!existing) {
      return reply.status(404).send({
        error: 'NotFound',
        message: `LLM Default not found: ${id}`,
        statusCode: 404,
      });
    }

    await service.remove(id);
    return reply.status(204).send();
  });
}
