/**
 * Branch routes.
 * Exposes GitHub Branch API operations as REST endpoints.
 * @module routes/branches
 */

/**
 * Fastify plugin that registers branch routes.
 * @param {import('fastify').FastifyInstance} fastify
 * @param {Object} opts
 * @param {import('../sdk/branches/client.mjs').BranchesClient} opts.branches - Branches SDK client
 */
export default async function branchRoutes(fastify, opts) {
  const { branches } = opts;

  /**
   * GET /repos/:owner/:repo/branches - List branches.
   */
  fastify.get('/repos/:owner/:repo/branches', async (request, reply) => {
    const { owner, repo } = request.params;
    const result = await branches.list(owner, repo, request.query);
    return reply.send(result);
  });

  /**
   * GET /repos/:owner/:repo/branches/:branch - Get a branch.
   */
  fastify.get(
    '/repos/:owner/:repo/branches/:branch',
    async (request, reply) => {
      const { owner, repo, branch } = request.params;
      const result = await branches.get(owner, repo, branch);
      return reply.send(result);
    },
  );

  /**
   * GET /repos/:owner/:repo/branches/:branch/protection - Get branch protection.
   */
  fastify.get(
    '/repos/:owner/:repo/branches/:branch/protection',
    async (request, reply) => {
      const { owner, repo, branch } = request.params;
      const result = await branches.getProtection(owner, repo, branch);
      return reply.send(result);
    },
  );

  /**
   * PUT /repos/:owner/:repo/branches/:branch/protection - Update branch protection.
   */
  fastify.put(
    '/repos/:owner/:repo/branches/:branch/protection',
    async (request, reply) => {
      const { owner, repo, branch } = request.params;
      const result = await branches.updateProtection(
        owner,
        repo,
        branch,
        request.body,
      );
      return reply.send(result);
    },
  );

  /**
   * DELETE /repos/:owner/:repo/branches/:branch/protection - Remove branch protection.
   */
  fastify.delete(
    '/repos/:owner/:repo/branches/:branch/protection',
    async (request, reply) => {
      const { owner, repo, branch } = request.params;
      await branches.removeProtection(owner, repo, branch);
      return reply.status(204).send();
    },
  );

  /**
   * POST /repos/:owner/:repo/branches/:branch/rename - Rename a branch.
   */
  fastify.post(
    '/repos/:owner/:repo/branches/:branch/rename',
    async (request, reply) => {
      const { owner, repo, branch } = request.params;
      const { new_name } = request.body;
      const result = await branches.rename(owner, repo, branch, new_name);
      return reply.send(result);
    },
  );

  /**
   * POST /repos/:owner/:repo/merges - Merge branches.
   */
  fastify.post('/repos/:owner/:repo/merges', async (request, reply) => {
    const { owner, repo } = request.params;
    const { base, head, commit_message } = request.body;
    const result = await branches.merge(owner, repo, base, head, {
      commit_message,
    });
    return reply.status(201).send(result);
  });

  /**
   * GET /repos/:owner/:repo/compare/:base...:head - Compare two refs.
   */
  fastify.get(
    '/repos/:owner/:repo/compare/:base...:head',
    async (request, reply) => {
      const { owner, repo, base, head } = request.params;
      const result = await branches.compare(owner, repo, base, head);
      return reply.send(result);
    },
  );

  return Promise.resolve();
}
