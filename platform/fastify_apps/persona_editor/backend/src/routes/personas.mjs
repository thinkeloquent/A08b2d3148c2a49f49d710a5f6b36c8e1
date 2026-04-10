/**
 * Personas Routes
 * CRUD endpoints for personas
 */

import { Edge } from 'edge.js';
import { createPersonaService } from '../services/persona.service.mjs';
import { createAuditService } from '../services/audit.service.mjs';

const edge = Edge.create();

const FORMATS = ['markdown', 'json', 'yaml', 'xml', 'toml'];

const MIME_TYPES = {
  markdown: 'text/markdown',
  json: 'application/json',
  yaml: 'text/yaml',
  xml: 'application/xml',
  toml: 'text/plain',
};

const FILE_EXTENSIONS = {
  markdown: '.md',
  json: '.json',
  yaml: '.yaml',
  xml: '.xml',
  toml: '.toml',
};

function formatPrompt(prompt, name, format) {
  switch (format) {
    case 'markdown':
      return prompt;
    case 'json':
      return JSON.stringify({ name, generated_prompt: prompt }, null, 2);
    case 'yaml': {
      const indent = prompt.split('\n').map((l) => `  ${l}`).join('\n');
      return `name: ${JSON.stringify(name)}\ngenerated_prompt: |\n${indent}\n`;
    }
    case 'xml': {
      const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<persona>\n  <name>${esc(name)}</name>\n  <generated_prompt>${esc(prompt)}</generated_prompt>\n</persona>`;
    }
    case 'toml': {
      const escaped = prompt.replace(/\\/g, '\\\\');
      return `name = ${JSON.stringify(name)}\ngenerated_prompt = """\n${escaped}\n"""`;
    }
    default:
      return prompt;
  }
}

export default async function personasRoutes(fastify, _options) {
  const personaService = createPersonaService(fastify.db);
  const auditService = createAuditService(fastify.db);

  /**
   * List all personas
   * GET /personas
   */
  fastify.get('/', {
    schema: {
      description: 'List all personas',
      tags: ['Personas'],
    },
  }, async (request, reply) => {
    const personas = await personaService.findAll();
    return reply.send(personas);
  });

  /**
   * Get persona by ID
   * GET /personas/:id
   */
  fastify.get('/:id', {
    schema: {
      description: 'Get persona by ID',
      tags: ['Personas'],
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
    const persona = await personaService.findById(id);

    if (!persona) {
      return reply.status(404).send({
        error: 'NotFound',
        message: `Persona not found: ${id}`,
        statusCode: 404,
      });
    }

    return reply.send(persona);
  });

  /**
   * Create a new persona
   * POST /personas
   */
  fastify.post('/', {
    schema: {
      description: 'Create a new persona',
      tags: ['Personas'],
      body: {
        type: 'object',
        required: ['name', 'description', 'llm_provider'],
        properties: {
          name: { type: 'string', minLength: 3, maxLength: 255 },
          description: { type: 'string', minLength: 10 },
          role: { type: 'string', maxLength: 50 },
          tone: { type: 'string', maxLength: 50 },
          version: { type: 'string' },
          llm_provider: { type: 'string' },
          llm_temperature: { type: 'number', minimum: 0.0, maximum: 1.0 },
          llm_parameters: { type: 'object' },
          goals: { type: 'array', items: { type: 'string' }, maxItems: 10 },
          tools: { type: 'array', items: { type: 'string' } },
          permitted_to: { type: 'array', items: { type: 'string' } },
          prompt_system_template: { type: 'array', items: { type: 'string' } },
          prompt_user_template: { type: 'array', items: { type: 'string' } },
          prompt_context_template: { type: 'array', items: { type: 'string' } },
          prompt_instruction: { type: 'array', items: { type: 'string' } },
          agent_delegate: { type: 'array', items: { type: 'string' } },
          agent_call: { type: 'array', items: { type: 'string' } },
          memory: {
            type: 'object',
            properties: {
              enabled: { type: 'boolean' },
              scope: { type: 'string', enum: ['session', 'persistent'] },
              storage_id: { type: 'string' },
            },
          },
          context_files: { type: 'array', items: { type: 'string' } },
          persona_prompt_data: { type: 'object' },
          persona_prompt_template: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const data = request.body;
    const persona = await personaService.create(data);

    // Create audit log
    await auditService.createLog(
      persona.id,
      'CREATE',
      { created: data },
      request.headers['x-user-id'] || 'system',
      request.ip
    );

    return reply.status(201).send(persona);
  });

  /**
   * Update a persona
   * PUT /personas/:id
   */
  fastify.put('/:id', {
    schema: {
      description: 'Update a persona',
      tags: ['Personas'],
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
          description: { type: 'string', minLength: 10 },
          role: { type: 'string', maxLength: 50 },
          tone: { type: 'string', maxLength: 50 },
          version: { type: 'string' },
          llm_provider: { type: 'string' },
          llm_temperature: { type: 'number', minimum: 0.0, maximum: 1.0 },
          llm_parameters: { type: 'object' },
          goals: { type: 'array', items: { type: 'string' }, maxItems: 10 },
          tools: { type: 'array', items: { type: 'string' } },
          permitted_to: { type: 'array', items: { type: 'string' } },
          prompt_system_template: { type: 'array', items: { type: 'string' } },
          prompt_user_template: { type: 'array', items: { type: 'string' } },
          prompt_context_template: { type: 'array', items: { type: 'string' } },
          prompt_instruction: { type: 'array', items: { type: 'string' } },
          agent_delegate: { type: 'array', items: { type: 'string' } },
          agent_call: { type: 'array', items: { type: 'string' } },
          memory: {
            type: 'object',
            properties: {
              enabled: { type: 'boolean' },
              scope: { type: 'string', enum: ['session', 'persistent'] },
              storage_id: { type: 'string' },
            },
          },
          context_files: { type: 'array', items: { type: 'string' } },
          persona_prompt_data: { type: 'object' },
          persona_prompt_template: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const data = request.body;

    const existing = await personaService.findById(id);
    if (!existing) {
      return reply.status(404).send({
        error: 'NotFound',
        message: `Persona not found: ${id}`,
        statusCode: 404,
      });
    }

    const persona = await personaService.update(id, data);

    // Create audit log
    await auditService.createLog(
      id,
      'UPDATE',
      { before: existing.toJSON(), after: persona.toJSON() },
      request.headers['x-user-id'] || 'system',
      request.ip
    );

    return reply.send(persona);
  });

  /**
   * Delete a persona
   * DELETE /personas/:id
   */
  fastify.delete('/:id', {
    schema: {
      description: 'Delete a persona',
      tags: ['Personas'],
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

    const existing = await personaService.findById(id);
    if (!existing) {
      return reply.status(404).send({
        error: 'NotFound',
        message: `Persona not found: ${id}`,
        statusCode: 404,
      });
    }

    // Create audit log before deletion
    await auditService.createLog(
      id,
      'DELETE',
      { deleted: existing.toJSON() },
      request.headers['x-user-id'] || 'system',
      request.ip
    );

    await personaService.remove(id);
    return reply.status(204).send();
  });

  /**
   * Get audit logs for a persona
   * GET /personas/:id/audit-logs
   */
  fastify.get('/:id/audit-logs', {
    schema: {
      description: 'Get audit logs for a persona',
      tags: ['Personas', 'Audit'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 500, default: 100 },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const { limit = 100 } = request.query;

    const persona = await personaService.findById(id);
    if (!persona) {
      return reply.status(404).send({
        error: 'NotFound',
        message: `Persona not found: ${id}`,
        statusCode: 404,
      });
    }

    const logs = await auditService.getLogsForPersona(id, parseInt(limit));
    return reply.send(logs);
  });

  /**
   * Get persona prompt data (template context)
   * GET /personas/:id/prompt/data
   */
  fastify.get('/:id/prompt/data', {
    schema: {
      description: 'Get persona prompt template data context',
      tags: ['Personas', 'Prompt'],
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
    const persona = await personaService.findById(id);

    if (!persona) {
      return reply.status(404).send({
        error: 'NotFound',
        message: `Persona not found: ${id}`,
        statusCode: 404,
      });
    }

    return reply.send({
      persona_id: persona.id,
      name: persona.name,
      persona_prompt_data: persona.persona_prompt_data ?? null,
    });
  });

  /**
   * Get persona prompt template source
   * GET /personas/:id/prompt/template
   */
  fastify.get('/:id/prompt/template', {
    schema: {
      description: 'Get persona prompt Edge.js template source',
      tags: ['Personas', 'Prompt'],
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
    const persona = await personaService.findById(id);

    if (!persona) {
      return reply.status(404).send({
        error: 'NotFound',
        message: `Persona not found: ${id}`,
        statusCode: 404,
      });
    }

    return reply.send({
      persona_id: persona.id,
      name: persona.name,
      persona_prompt_template: persona.persona_prompt_template ?? null,
    });
  });

  /**
   * Get generated (rendered) prompt in various formats
   * GET /personas/:id/prompt/generated
   *
   * Query params:
   *   format — markdown (default), json, yaml, xml, toml
   *   download — if "true", sets Content-Disposition for file download
   */
  fastify.get('/:id/prompt/generated', {
    schema: {
      description: 'Get the rendered persona prompt in the requested format',
      tags: ['Personas', 'Prompt'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          format: { type: 'string', enum: FORMATS, default: 'markdown' },
          download: { type: 'string', enum: ['true', 'false'], default: 'false' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const { format = 'markdown', download = 'false' } = request.query;
    const persona = await personaService.findById(id);

    if (!persona) {
      return reply.status(404).send({
        error: 'NotFound',
        message: `Persona not found: ${id}`,
        statusCode: 404,
      });
    }

    const template = persona.persona_prompt_template;
    const data = persona.persona_prompt_data;

    if (!template || !data) {
      return reply.status(404).send({
        error: 'NoPrompt',
        message: 'Persona has no saved prompt template or data. Generate a prompt first.',
        statusCode: 404,
      });
    }

    let rendered;
    try {
      rendered = await edge.renderRaw(template, data);
    } catch (err) {
      fastify.log.error({ err }, 'Edge template render failed for persona prompt export');
      return reply.status(400).send({
        error: 'TemplateRenderError',
        message: err.message || 'Failed to render template',
        statusCode: 400,
      });
    }

    const formatted = formatPrompt(rendered, persona.name, format);
    const mime = MIME_TYPES[format] || 'text/plain';
    const ext = FILE_EXTENSIONS[format] || '.txt';

    if (download === 'true') {
      const safeName = (persona.name || 'persona').replace(/\s+/g, '_').toLowerCase();
      reply.header('Content-Disposition', `attachment; filename="${safeName}${ext}"`);
    }

    return reply.type(mime).send(formatted);
  });
}
