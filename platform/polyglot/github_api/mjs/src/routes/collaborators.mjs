/**
 * Collaborator routes.
 * Exposes GitHub Collaborator API operations as REST endpoints.
 * @module routes/collaborators
 */

/**
 * Fastify plugin that registers collaborator routes.
 * @param {import('fastify').FastifyInstance} fastify
 * @param {Object} opts
 * @param {import('../sdk/collaborators/client.mjs').CollaboratorsClient} opts.collaborators - Collaborators SDK client
 */
export default async function collaboratorRoutes(fastify, opts) {
  const { collaborators } = opts;

  /**
   * GET /repos/:owner/:repo/collaborators - List collaborators.
   */
  fastify.get(
    '/repos/:owner/:repo/collaborators',
    async (request, reply) => {
      const { owner, repo } = request.params;
      const result = await collaborators.list(owner, repo, request.query);
      return reply.send(result);
    },
  );

  /**
   * PUT /repos/:owner/:repo/collaborators/:username - Add a collaborator.
   */
  fastify.put(
    '/repos/:owner/:repo/collaborators/:username',
    async (request, reply) => {
      const { owner, repo, username } = request.params;
      const permission = request.body?.permission || 'push';
      const result = await collaborators.add(
        owner,
        repo,
        username,
        permission,
      );
      return reply.status(201).send(result);
    },
  );

  /**
   * DELETE /repos/:owner/:repo/collaborators/:username - Remove a collaborator.
   */
  fastify.delete(
    '/repos/:owner/:repo/collaborators/:username',
    async (request, reply) => {
      const { owner, repo, username } = request.params;
      await collaborators.remove(owner, repo, username);
      return reply.status(204).send();
    },
  );

  /**
   * GET /repos/:owner/:repo/collaborators/:username/permission - Check permission.
   */
  fastify.get(
    '/repos/:owner/:repo/collaborators/:username/permission',
    async (request, reply) => {
      const { owner, repo, username } = request.params;
      const result = await collaborators.checkPermission(
        owner,
        repo,
        username,
      );
      return reply.send(result);
    },
  );

  /**
   * GET /repos/:owner/:repo/invitations - List invitations.
   */
  fastify.get(
    '/repos/:owner/:repo/invitations',
    async (request, reply) => {
      const { owner, repo } = request.params;
      const result = await collaborators.listInvitations(owner, repo);
      return reply.send(result);
    },
  );

  return Promise.resolve();
}
