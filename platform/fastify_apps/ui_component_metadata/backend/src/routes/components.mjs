/**
 * Component Routes
 * CRUD endpoints for UI component definitions
 */

import { createComponentService } from '../services/component.service.mjs';

export default async function componentRoutes(fastify, _options) {
  const service = createComponentService(fastify.db);

  /**
   * List components with pagination and filters
   * GET /components
   */
  fastify.get('/components', {
    schema: {
      description: 'List component definitions with pagination and filters',
      tags: ['Components'],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          status: { type: 'string', enum: ['draft', 'published', 'archived'] },
          taxonomy_level: { type: 'string', enum: ['Atom', 'Molecule', 'Organism', 'Template', 'Page'] },
          search: { type: 'string' },
          tags: { type: 'string', description: 'Comma-separated tag names' },
          include_tags: { type: 'boolean', default: true },
        },
      },
    },
  }, async (request, reply) => {
    const { page = 1, limit = 20, status, taxonomy_level, search, tags, include_tags } = request.query;
    const offset = (page - 1) * limit;

    const result = await service.list({
      page,
      limit,
      offset,
      status,
      taxonomyLevel: taxonomy_level,
      search,
      tags: tags ? tags.split(',').map(t => t.trim()) : undefined,
      includeTags: include_tags,
    });

    return reply.send({
      components: result.components,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  });

  /**
   * Get component by ID
   * GET /components/:id
   */
  fastify.get('/components/:id', {
    schema: {
      description: 'Get component definition by ID',
      tags: ['Components'],
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

    const component = await service.getById(id, { includeTags: true });

    if (!component) {
      return reply.status(404).send({
        code: 404,
        message: 'Component definition not found',
      });
    }

    return reply.send({ component });
  });

  /**
   * Create a new component
   * POST /components
   */
  fastify.post('/components', {
    schema: {
      description: 'Create a new component definition',
      tags: ['Components'],
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          taxonomy_level: { type: 'string', enum: ['Atom', 'Molecule', 'Organism', 'Template', 'Page'] },
          status: { type: 'string', enum: ['draft', 'published', 'archived'] },
          aliases: { type: 'array', items: { type: 'string' } },
          directives: { type: 'string' },
          few_shot_examples: { type: 'array', items: { type: 'object' } },
          input_schema: { type: 'object' },
          output_schema: { type: ['object', 'null'] },
          lifecycle_config: { type: 'object' },
          interactions: { type: 'array', items: { type: 'object' } },
          service_dependencies: { type: 'array', items: { type: 'object' } },
          composition_rules: { type: 'object' },
          created_by: { type: 'string' },
          tag_names: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { tag_names, ...data } = request.body;
    const tagNames = tag_names || request.body.tagNames || [];

    const component = await service.create(data, tagNames);

    return reply.status(201).send({ component });
  });

  /**
   * Update a component
   * PUT /components/:id
   */
  fastify.put('/components/:id', {
    schema: {
      description: 'Update a component definition',
      tags: ['Components'],
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
          taxonomy_level: { type: 'string', enum: ['Atom', 'Molecule', 'Organism', 'Template', 'Page'] },
          status: { type: 'string', enum: ['draft', 'published', 'archived'] },
          aliases: { type: 'array', items: { type: 'string' } },
          directives: { type: 'string' },
          few_shot_examples: { type: 'array', items: { type: 'object' } },
          input_schema: { type: 'object' },
          output_schema: { type: ['object', 'null'] },
          lifecycle_config: { type: 'object' },
          interactions: { type: 'array', items: { type: 'object' } },
          service_dependencies: { type: 'array', items: { type: 'object' } },
          composition_rules: { type: 'object' },
          tag_names: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const { tag_names, ...data } = request.body;
    const tagNames = tag_names !== undefined
      ? tag_names
      : request.body.tagNames !== undefined
        ? request.body.tagNames
        : null;

    const component = await service.update(id, data, tagNames);

    if (!component) {
      return reply.status(404).send({
        code: 404,
        message: 'Component definition not found',
      });
    }

    return reply.send({ component });
  });

  /**
   * Delete a component
   * DELETE /components/:id
   */
  fastify.delete('/components/:id', {
    schema: {
      description: 'Delete a component definition',
      tags: ['Components'],
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
        message: 'Component definition not found',
      });
    }

    return reply.send({ success: true });
  });
}
