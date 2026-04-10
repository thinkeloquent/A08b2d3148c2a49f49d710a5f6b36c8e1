/**
 * Figma File Routes
 * CRUD endpoints for Figma files
 */

import { createFigmaFileService } from '../services/figma-file.service.mjs';
import {
  figmaFileToProto,
  figmaFileFromRequest,
  paginationFromRequest,
  paginationResponse,
} from '../serializers/converters.mjs';

export default async function figmaFileRoutes(fastify, _options) {
  const service = createFigmaFileService(fastify.db);

  /**
   * List Figma files with pagination and filters
   * GET /files
   */
  fastify.get('/files', {
    schema: {
      description: 'List Figma files with pagination and filters',
      tags: ['FigmaFiles'],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          type: { type: 'string', enum: ['design_system', 'component_library', 'prototype', 'illustration', 'icon_set'] },
          status: { type: 'string', enum: ['stable', 'beta', 'deprecated', 'experimental'] },
          search: { type: 'string' },
          tags: { type: 'string', description: 'Comma-separated tag names' },
          trending: { type: 'boolean' },
          verified: { type: 'boolean' },
          editor_type: { type: 'string' },
          include_tags: { type: 'boolean', default: false },
          include_metadata: { type: 'boolean', default: false },
        },
      },
    },
  }, async (request, reply) => {
    const pagination = paginationFromRequest(request.query);
    const { type, status, search, tags, trending, verified, editor_type, include_tags, include_metadata } = request.query;

    const result = await service.list({
      ...pagination,
      type,
      status,
      search,
      tags: tags ? tags.split(',').map(t => t.trim()) : undefined,
      trending,
      verified,
      editorType: editor_type,
      includeTags: include_tags,
      includeMetadata: include_metadata,
    });

    const response = {
      figmaFiles: result.figmaFiles.map(figmaFileToProto),
      pagination: paginationResponse(result.total, result.page, result.limit),
    };

    return reply.sendNegotiated(
      response,
      'figma_files.figma_file.ListFigmaFilesResponse'
    );
  });

  /**
   * Get Figma file by ID
   * GET /files/:id
   */
  fastify.get('/files/:id', {
    schema: {
      description: 'Get Figma file by ID',
      tags: ['FigmaFiles'],
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

    const figmaFile = await service.getById(id, {
      includeTags: include_tags,
      includeMetadata: include_metadata,
    });

    if (!figmaFile) {
      return reply.status(404).send({
        code: 404,
        message: 'Figma file not found',
      });
    }

    const response = {
      figmaFile: figmaFileToProto(figmaFile),
    };

    return reply.sendNegotiated(
      response,
      'figma_files.figma_file.GetFigmaFileResponse'
    );
  });

  /**
   * Create a new Figma file
   * POST /files
   */
  fastify.post('/files', {
    schema: {
      description: 'Create a new Figma file',
      tags: ['FigmaFiles'],
      body: {
        type: 'object',
        required: ['name', 'type'],
        properties: {
          name: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          type: { type: 'string', enum: ['design_system', 'component_library', 'prototype', 'illustration', 'icon_set'] },
          figma_url: { type: 'string' },
          figma_file_key: { type: 'string' },
          thumbnail_url: { type: 'string' },
          page_count: { type: 'integer', minimum: 0, default: 0 },
          component_count: { type: 'integer', minimum: 0, default: 0 },
          style_count: { type: 'integer', minimum: 0, default: 0 },
          last_modified_by: { type: 'string' },
          editor_type: { type: 'string' },
          trending: { type: 'boolean' },
          verified: { type: 'boolean' },
          status: { type: 'string', enum: ['stable', 'beta', 'deprecated', 'experimental'] },
          source: { type: 'string', enum: ['figma', 'figma_community', 'manual'] },
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
    const data = figmaFileFromRequest(request.body);
    const tagNames = request.body.tag_names || request.body.tagNames || [];

    try {
      const figmaFile = await service.create(data, tagNames);

      const response = {
        figmaFile: figmaFileToProto(figmaFile),
      };

      return reply.status(201).sendNegotiated(
        response,
        'figma_files.figma_file.CreateFigmaFileResponse'
      );
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({
          code: 409,
          message: 'Figma file with this key already exists',
        });
      }
      throw error;
    }
  });

  /**
   * Update a Figma file
   * PUT /files/:id
   */
  fastify.put('/files/:id', {
    schema: {
      description: 'Update a Figma file',
      tags: ['FigmaFiles'],
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
          type: { type: 'string', enum: ['design_system', 'component_library', 'prototype', 'illustration', 'icon_set'] },
          figma_url: { type: 'string' },
          figma_file_key: { type: 'string' },
          thumbnail_url: { type: 'string' },
          page_count: { type: 'integer', minimum: 0 },
          component_count: { type: 'integer', minimum: 0 },
          style_count: { type: 'integer', minimum: 0 },
          last_modified_by: { type: 'string' },
          editor_type: { type: 'string' },
          trending: { type: 'boolean' },
          verified: { type: 'boolean' },
          status: { type: 'string', enum: ['stable', 'beta', 'deprecated', 'experimental'] },
          source: { type: 'string', enum: ['figma', 'figma_community', 'manual'] },
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
    const data = figmaFileFromRequest(request.body);
    const tagNames = request.body.tag_names !== undefined
      ? request.body.tag_names
      : request.body.tagNames !== undefined
        ? request.body.tagNames
        : null;

    try {
      const figmaFile = await service.update(id, data, tagNames);

      if (!figmaFile) {
        return reply.status(404).send({
          code: 404,
          message: 'Figma file not found',
        });
      }

      const response = {
        figmaFile: figmaFileToProto(figmaFile),
      };

      return reply.sendNegotiated(
        response,
        'figma_files.figma_file.UpdateFigmaFileResponse'
      );
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({
          code: 409,
          message: 'Figma file with this key already exists',
        });
      }
      throw error;
    }
  });

  /**
   * Delete a Figma file
   * DELETE /files/:id
   */
  fastify.delete('/files/:id', {
    schema: {
      description: 'Delete a Figma file',
      tags: ['FigmaFiles'],
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
        message: 'Figma file not found',
      });
    }

    const response = { success: true };

    return reply.sendNegotiated(
      response,
      'figma_files.figma_file.DeleteFigmaFileResponse'
    );
  });
}
