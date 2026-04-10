/**
 * Form Routes
 * CRUD endpoints for form definitions, versions, import/export
 */

import { createFormService } from '../services/form.service.mjs';
import {
  formToProto,
  formToSummaryProto,
  formToJson,
  formFromRequest,
  versionToProto,
  paginationFromRequest,
  paginationResponse,
} from '../serializers/converters.mjs';

export default async function formRoutes(fastify, _options) {
  const service = createFormService(fastify.db);

  /**
   * List forms with pagination and filters
   * GET /forms
   */
  fastify.get('/forms', {
    schema: {
      description: 'List form definitions with pagination and filters',
      tags: ['Forms'],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          status: { type: 'string', enum: ['draft', 'published', 'archived'] },
          search: { type: 'string' },
          tags: { type: 'string', description: 'Comma-separated tag names' },
          include_tags: { type: 'boolean', default: true },
        },
      },
    },
  }, async (request, reply) => {
    const pagination = paginationFromRequest(request.query);
    const { status, search, tags, include_tags } = request.query;

    const result = await service.list({
      ...pagination,
      status,
      search,
      tags: tags ? tags.split(',').map(t => t.trim()) : undefined,
      includeTags: include_tags,
    });

    const response = {
      formDefinitions: result.forms.map(formToSummaryProto),
      pagination: paginationResponse(result.total, result.page, result.limit),
    };

    return reply.sendNegotiated(
      response,
      'form_builder.form_definition.ListFormDefinitionsResponse'
    );
  });

  /**
   * Get form by ID
   * GET /forms/:id
   */
  fastify.get('/forms/:id', {
    schema: {
      description: 'Get form definition by ID',
      tags: ['Forms'],
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

    const form = await service.getById(id, { includeTags: true });

    if (!form) {
      return reply.status(404).send({
        code: 404,
        message: 'Form definition not found',
      });
    }

    const response = {
      formDefinition: formToJson(form),
    };

    return reply.sendNegotiated(
      response,
      'form_builder.form_definition.GetFormDefinitionResponse'
    );
  });

  /**
   * Create a new form
   * POST /forms
   */
  fastify.post('/forms', {
    schema: {
      description: 'Create a new form definition',
      tags: ['Forms'],
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          version: { type: 'string' },
          status: { type: 'string', enum: ['draft', 'published', 'archived'] },
          schema_data: { type: 'object' },
          metadata_data: { type: 'object' },
          created_by: { type: 'string' },
          tag_names: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const data = formFromRequest(request.body);
    const tagNames = request.body.tag_names || request.body.tagNames || [];

    const form = await service.create(data, tagNames);

    const response = {
      formDefinition: formToJson(form),
    };

    return reply.status(201).sendNegotiated(
      response,
      'form_builder.form_definition.CreateFormDefinitionResponse'
    );
  });

  /**
   * Update a form
   * PUT /forms/:id
   */
  fastify.put('/forms/:id', {
    schema: {
      description: 'Update a form definition',
      tags: ['Forms'],
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
          version: { type: 'string' },
          status: { type: 'string', enum: ['draft', 'published', 'archived'] },
          schema_data: { type: 'object' },
          metadata_data: { type: 'object' },
          tag_names: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const data = formFromRequest(request.body);
    const tagNames = request.body.tag_names !== undefined
      ? request.body.tag_names
      : request.body.tagNames !== undefined
        ? request.body.tagNames
        : null;

    const form = await service.update(id, data, tagNames);

    if (!form) {
      return reply.status(404).send({
        code: 404,
        message: 'Form definition not found',
      });
    }

    const response = {
      formDefinition: formToJson(form),
    };

    return reply.sendNegotiated(
      response,
      'form_builder.form_definition.UpdateFormDefinitionResponse'
    );
  });

  /**
   * Delete a form
   * DELETE /forms/:id
   */
  fastify.delete('/forms/:id', {
    schema: {
      description: 'Delete a form definition',
      tags: ['Forms'],
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
        message: 'Form definition not found',
      });
    }

    return reply.sendNegotiated(
      { success: true },
      'form_builder.form_definition.DeleteFormDefinitionResponse'
    );
  });

  /**
   * Create a version snapshot
   * POST /forms/:id/versions
   */
  fastify.post('/forms/:id/versions', {
    schema: {
      description: 'Snapshot current form state as a version',
      tags: ['Versions'],
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
          change_summary: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const changeSummary = request.body?.change_summary || request.body?.changeSummary || null;

    const version = await service.createVersion(id, changeSummary);

    if (!version) {
      return reply.status(404).send({
        code: 404,
        message: 'Form definition not found',
      });
    }

    const response = {
      version: versionToProto(version),
    };

    return reply.status(201).sendNegotiated(
      response,
      'form_builder.version.CreateVersionResponse'
    );
  });

  /**
   * List versions for a form
   * GET /forms/:id/versions
   */
  fastify.get('/forms/:id/versions', {
    schema: {
      description: 'List version history for a form',
      tags: ['Versions'],
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

    const versions = await service.listVersions(id);

    const response = {
      versions: versions.map(versionToProto),
    };

    return reply.sendNegotiated(
      response,
      'form_builder.version.ListVersionsResponse'
    );
  });

  /**
   * Get specific version
   * GET /forms/:id/versions/:vid
   */
  fastify.get('/forms/:id/versions/:vid', {
    schema: {
      description: 'Get a specific form version',
      tags: ['Versions'],
      params: {
        type: 'object',
        required: ['id', 'vid'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          vid: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request, reply) => {
    const { vid } = request.params;

    const version = await service.getVersion(vid);

    if (!version) {
      return reply.status(404).send({
        code: 404,
        message: 'Version not found',
      });
    }

    const response = {
      version: versionToProto(version),
    };

    return reply.sendNegotiated(
      response,
      'form_builder.version.GetVersionResponse'
    );
  });

  /**
   * Restore to a previous version
   * POST /forms/:id/versions/:vid/restore
   */
  fastify.post('/forms/:id/versions/:vid/restore', {
    schema: {
      description: 'Restore form to a previous version',
      tags: ['Versions'],
      params: {
        type: 'object',
        required: ['id', 'vid'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          vid: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request, reply) => {
    const { id, vid } = request.params;

    const form = await service.restoreVersion(id, vid);

    if (!form) {
      return reply.status(404).send({
        code: 404,
        message: 'Form or version not found',
      });
    }

    return reply.sendNegotiated(
      { success: true, restoredVersion: form.version },
      'form_builder.version.RestoreVersionResponse'
    );
  });

  /**
   * Import form from JSON/YAML body
   * POST /forms/import
   */
  fastify.post('/forms/import', {
    schema: {
      description: 'Import a form from JSON or YAML content',
      tags: ['Forms'],
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          version: { type: 'string' },
          schema: { type: 'object' },
          metadata: { type: 'object' },
          tag_names: { type: 'array', items: { type: 'string' } },
          created_by: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const content = request.body;

    const form = await service.importFromContent(content, content.created_by || null);

    const response = {
      formDefinition: formToJson(form),
    };

    return reply.status(201).sendNegotiated(
      response,
      'form_builder.form_definition.CreateFormDefinitionResponse'
    );
  });

  /**
   * Export form
   * GET /forms/:id/export
   */
  fastify.get('/forms/:id/export', {
    schema: {
      description: 'Export form definition',
      tags: ['Forms'],
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

    const content = await service.exportToContent(id);

    if (!content) {
      return reply.status(404).send({
        code: 404,
        message: 'Form definition not found',
      });
    }

    return reply.send(content);
  });
}
