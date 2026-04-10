/**
 * Deployment Routes
 */

import { createDeploymentService } from '../services/deployment.service.mjs';

export default async function deploymentRoutes(fastify, _options) {
  const service = createDeploymentService(fastify.db);

  // List deployments for a prompt
  fastify.get('/prompts/:promptId/deployments', {
    schema: {
      params: { type: 'object', required: ['promptId'], properties: { promptId: { type: 'string', format: 'uuid' } } },
    },
  }, async (request, reply) => {
    const deployments = await service.listByPrompt(request.params.promptId);
    return reply.send({ data: deployments });
  });

  // Deploy a version to an environment
  fastify.post('/prompts/:promptId/deploy', {
    schema: {
      params: { type: 'object', required: ['promptId'], properties: { promptId: { type: 'string', format: 'uuid' } } },
      body: {
        type: 'object',
        required: ['environment', 'version_id'],
        properties: {
          environment: { type: 'string', minLength: 1, maxLength: 50 },
          version_id: { type: 'string', format: 'uuid' },
          deployed_by: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const deployment = await service.deploy(
      request.params.promptId,
      request.body.environment,
      request.body.version_id,
      request.body.deployed_by,
    );

    if (!deployment) {
      return reply.status(404).send({ error: 'NOT_FOUND', message: 'Version not found or does not belong to this prompt', statusCode: 404 });
    }

    return reply.status(200).send(deployment);
  });

  // Consumer API: Get prompt by slug and environment
  fastify.get('/prompts/:slug/:environment', {
    schema: {
      params: {
        type: 'object',
        required: ['slug', 'environment'],
        properties: {
          slug: { type: 'string' },
          environment: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const result = await service.getBySlugAndEnvironment(request.params.slug, request.params.environment);
    if (!result) {
      return reply.status(404).send({ error: 'NOT_FOUND', message: `No deployment found for "${request.params.slug}" in "${request.params.environment}"`, statusCode: 404 });
    }
    return reply.send(result);
  });

  // Render a prompt template with variables
  fastify.post('/prompts/:slug/render', {
    schema: {
      params: { type: 'object', required: ['slug'], properties: { slug: { type: 'string' } } },
      body: {
        type: 'object',
        properties: {
          environment: { type: 'string', default: 'production' },
          variables: { type: 'object' },
        },
      },
    },
  }, async (request, reply) => {
    const { environment = 'production', variables = {} } = request.body;

    const result = await service.getBySlugAndEnvironment(request.params.slug, environment);
    if (!result) {
      return reply.status(404).send({ error: 'NOT_FOUND', message: `No deployment found for "${request.params.slug}" in "${environment}"`, statusCode: 404 });
    }

    const renderedText = service.renderTemplate(result.version.template, variables);
    return reply.send({
      rendered: renderedText,
      config: result.version.config,
      version: { id: result.version.id, version_number: result.version.version_number },
      prompt: result.prompt,
    });
  });
}
