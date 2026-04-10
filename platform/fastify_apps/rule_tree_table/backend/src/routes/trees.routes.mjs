/**
 * Tree Routes
 * CRUD endpoints for rule trees
 */

import { createRuleService } from '../services/rule.service.mjs';
import { serializeTree, serializeTreeSummary, paginationResponse } from '../serializers/rule.serializer.mjs';

export default async function treeRoutes(fastify, _options) {
  const service = createRuleService(fastify.db);

  /**
   * List rule trees with pagination
   * GET /trees
   */
  fastify.get('/trees', {
    schema: {
      description: 'List rule trees with pagination',
      tags: ['Rule Trees'],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          search: { type: 'string' },
          is_active: { type: 'boolean' },
          graph_type: { type: 'string' },
          language: { type: 'string' },
        },
      },
    },
  }, async (request, _reply) => {
    const { page, limit, search, is_active, graph_type, language } = request.query;
    const result = await service.listTrees({ page, limit, search, is_active, graph_type, language });

    return {
      trees: result.trees.map(serializeTreeSummary),
      pagination: paginationResponse(result.total, result.page, result.limit),
    };
  });

  /**
   * Get a rule tree by ID (with nested rules)
   * GET /trees/:id
   */
  fastify.get('/trees/:id', {
    schema: {
      description: 'Get a rule tree by ID with nested rules',
      tags: ['Rule Trees'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request, reply) => {
    const tree = await service.getTree(request.params.id);
    if (!tree) {
      return reply.status(404).send({
        error: 'NotFound',
        message: 'Rule tree not found',
        statusCode: 404,
      });
    }
    return { tree: serializeTree(tree) };
  });

  /**
   * Create a new rule tree
   * POST /trees
   */
  fastify.post('/trees', {
    schema: {
      description: 'Create a new rule tree',
      tags: ['Rule Trees'],
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          is_active: { type: 'boolean', default: true },
          repo_url: { type: 'string' },
          branch: { type: 'string' },
          commit_sha: { type: 'string', maxLength: 40 },
          git_tag: { type: 'string' },
          graph_type: { type: 'string', maxLength: 64, default: 'conditional_logic' },
          language: { type: 'string', maxLength: 64 },
          rules: { type: 'object' },
        },
      },
    },
  }, async (request, reply) => {
    const tree = await service.createTree(request.body);
    return reply.status(201).send({ tree: serializeTree(tree) });
  });

  /**
   * Update a rule tree
   * PUT /trees/:id
   */
  fastify.put('/trees/:id', {
    schema: {
      description: 'Update a rule tree',
      tags: ['Rule Trees'],
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
          is_active: { type: 'boolean' },
          repo_url: { type: 'string' },
          branch: { type: 'string' },
          commit_sha: { type: 'string', maxLength: 40 },
          git_tag: { type: 'string' },
          graph_type: { type: 'string', maxLength: 64 },
          language: { type: 'string', maxLength: 64 },
          rules: { type: 'object' },
        },
      },
    },
  }, async (request, reply) => {
    const tree = await service.updateTree(request.params.id, request.body);
    if (!tree) {
      return reply.status(404).send({
        error: 'NotFound',
        message: 'Rule tree not found',
        statusCode: 404,
      });
    }
    return { tree: serializeTree(tree) };
  });

  /**
   * Delete a rule tree
   * DELETE /trees/:id
   */
  fastify.delete('/trees/:id', {
    schema: {
      description: 'Delete a rule tree and all its rules',
      tags: ['Rule Trees'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request, reply) => {
    const success = await service.deleteTree(request.params.id);
    if (!success) {
      return reply.status(404).send({
        error: 'NotFound',
        message: 'Rule tree not found',
        statusCode: 404,
      });
    }
    return { success: true };
  });
}
