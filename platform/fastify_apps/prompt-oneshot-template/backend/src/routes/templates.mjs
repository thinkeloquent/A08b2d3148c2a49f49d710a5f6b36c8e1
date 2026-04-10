/**
 * Template Routes
 * CRUD endpoints for document type templates
 */

import {
  getTemplateSummaries,
  getTemplateById,
  getTemplatesByCategory,
} from '../data/document-templates.mjs';

export default async function templateRoutes(fastify, _options) {
  // List all templates (summaries)
  fastify.get('/templates', async (request, _reply) => {
    const { category } = request.query;

    if (category) {
      const templates = getTemplatesByCategory(category);
      return {
        templates: templates.map(({ id, name, category, description, version }) => ({
          id, name, category, description, version,
        })),
        total: templates.length,
      };
    }

    const summaries = getTemplateSummaries();
    return { templates: summaries, total: summaries.length };
  });

  // Get a single template by ID (full content)
  fastify.get('/templates/:id', async (request, reply) => {
    const { id } = request.params;
    const template = getTemplateById(id);

    if (!template) {
      return reply.notFound(`Template "${id}" not found`);
    }

    return template;
  });

  // Get available categories
  fastify.get('/categories', async (_request, _reply) => {
    return {
      categories: [
        { id: 'requirements', name: 'Requirements', description: 'PRD, SRS, FRD, and other requirement documents' },
        { id: 'design', name: 'Design', description: 'HLD, LLD, ADR, and data design documents' },
        { id: 'specification', name: 'Specification', description: 'API specs, test specs, and other technical specifications' },
        { id: 'operational', name: 'Operational', description: 'Runbooks, deployment specs, and operational documents' },
      ],
    };
  });

  return Promise.resolve();
}
