/**
 * Webhook routes.
 * Exposes GitHub Webhook API operations as REST endpoints.
 * @module routes/webhooks
 */

/**
 * Fastify plugin that registers webhook routes.
 * @param {import('fastify').FastifyInstance} fastify
 * @param {Object} opts
 * @param {import('../sdk/webhooks/client.mjs').WebhooksClient} opts.webhooks - Webhooks SDK client
 */
export default async function webhookRoutes(fastify, opts) {
  const { webhooks } = opts;

  /**
   * GET /repos/:owner/:repo/hooks - List webhooks.
   */
  fastify.get('/repos/:owner/:repo/hooks', async (request, reply) => {
    const { owner, repo } = request.params;
    const result = await webhooks.list(owner, repo, request.query);
    return reply.send(result);
  });

  /**
   * GET /repos/:owner/:repo/hooks/:hookId - Get a webhook.
   */
  fastify.get(
    '/repos/:owner/:repo/hooks/:hookId',
    async (request, reply) => {
      const { owner, repo, hookId } = request.params;
      const result = await webhooks.get(owner, repo, parseInt(hookId, 10));
      return reply.send(result);
    },
  );

  /**
   * POST /repos/:owner/:repo/hooks - Create a webhook.
   */
  fastify.post('/repos/:owner/:repo/hooks', async (request, reply) => {
    const { owner, repo } = request.params;
    const result = await webhooks.create(owner, repo, request.body);
    return reply.status(201).send(result);
  });

  /**
   * PATCH /repos/:owner/:repo/hooks/:hookId - Update a webhook.
   */
  fastify.patch(
    '/repos/:owner/:repo/hooks/:hookId',
    async (request, reply) => {
      const { owner, repo, hookId } = request.params;
      const result = await webhooks.update(
        owner,
        repo,
        parseInt(hookId, 10),
        request.body,
      );
      return reply.send(result);
    },
  );

  /**
   * DELETE /repos/:owner/:repo/hooks/:hookId - Delete a webhook.
   */
  fastify.delete(
    '/repos/:owner/:repo/hooks/:hookId',
    async (request, reply) => {
      const { owner, repo, hookId } = request.params;
      await webhooks.delete(owner, repo, parseInt(hookId, 10));
      return reply.status(204).send();
    },
  );

  /**
   * POST /repos/:owner/:repo/hooks/:hookId/tests - Test a webhook.
   */
  fastify.post(
    '/repos/:owner/:repo/hooks/:hookId/tests',
    async (request, reply) => {
      const { owner, repo, hookId } = request.params;
      const result = await webhooks.test(owner, repo, parseInt(hookId, 10));
      return reply.status(204).send(result);
    },
  );

  /**
   * POST /repos/:owner/:repo/hooks/:hookId/pings - Ping a webhook.
   */
  fastify.post(
    '/repos/:owner/:repo/hooks/:hookId/pings',
    async (request, reply) => {
      const { owner, repo, hookId } = request.params;
      const result = await webhooks.ping(owner, repo, parseInt(hookId, 10));
      return reply.status(204).send(result);
    },
  );

  return Promise.resolve();
}
