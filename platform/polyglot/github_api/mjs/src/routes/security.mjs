/**
 * Security routes.
 * Exposes GitHub Security API operations as REST endpoints.
 * @module routes/security
 */

/**
 * Fastify plugin that registers security routes.
 * @param {import('fastify').FastifyInstance} fastify
 * @param {Object} opts
 * @param {import('../sdk/security/client.mjs').SecurityClient} opts.security - Security SDK client
 */
export default async function securityRoutes(fastify, opts) {
  const { security } = opts;

  /**
   * GET /repos/:owner/:repo/vulnerability-alerts - Get vulnerability alerts status.
   */
  fastify.get(
    '/repos/:owner/:repo/vulnerability-alerts',
    async (request, reply) => {
      const { owner, repo } = request.params;
      const result = await security.getVulnerabilityAlerts(owner, repo);
      return reply.send(result);
    },
  );

  /**
   * PUT /repos/:owner/:repo/vulnerability-alerts - Enable vulnerability alerts.
   */
  fastify.put(
    '/repos/:owner/:repo/vulnerability-alerts',
    async (request, reply) => {
      const { owner, repo } = request.params;
      await security.enableVulnerabilityAlerts(owner, repo);
      return reply.status(204).send();
    },
  );

  /**
   * DELETE /repos/:owner/:repo/vulnerability-alerts - Disable vulnerability alerts.
   */
  fastify.delete(
    '/repos/:owner/:repo/vulnerability-alerts',
    async (request, reply) => {
      const { owner, repo } = request.params;
      await security.disableVulnerabilityAlerts(owner, repo);
      return reply.status(204).send();
    },
  );

  /**
   * GET /repos/:owner/:repo/rulesets - List rulesets.
   */
  fastify.get('/repos/:owner/:repo/rulesets', async (request, reply) => {
    const { owner, repo } = request.params;
    const result = await security.listRulesets(owner, repo);
    return reply.send(result);
  });

  /**
   * GET /repos/:owner/:repo/rulesets/:id - Get a ruleset.
   */
  fastify.get(
    '/repos/:owner/:repo/rulesets/:id',
    async (request, reply) => {
      const { owner, repo, id } = request.params;
      const result = await security.getRuleset(owner, repo, parseInt(id, 10));
      return reply.send(result);
    },
  );

  /**
   * POST /repos/:owner/:repo/rulesets - Create a ruleset.
   */
  fastify.post('/repos/:owner/:repo/rulesets', async (request, reply) => {
    const { owner, repo } = request.params;
    const result = await security.createRuleset(owner, repo, request.body);
    return reply.status(201).send(result);
  });

  /**
   * PUT /repos/:owner/:repo/rulesets/:id - Update a ruleset.
   */
  fastify.put(
    '/repos/:owner/:repo/rulesets/:id',
    async (request, reply) => {
      const { owner, repo, id } = request.params;
      const result = await security.updateRuleset(
        owner,
        repo,
        parseInt(id, 10),
        request.body,
      );
      return reply.send(result);
    },
  );

  /**
   * DELETE /repos/:owner/:repo/rulesets/:id - Delete a ruleset.
   */
  fastify.delete(
    '/repos/:owner/:repo/rulesets/:id',
    async (request, reply) => {
      const { owner, repo, id } = request.params;
      await security.deleteRuleset(owner, repo, parseInt(id, 10));
      return reply.status(204).send();
    },
  );

  return Promise.resolve();
}
