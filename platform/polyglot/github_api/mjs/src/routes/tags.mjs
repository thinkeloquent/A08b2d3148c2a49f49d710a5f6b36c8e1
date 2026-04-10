/**
 * Tag and release routes.
 * Exposes GitHub Tags and Releases API operations as REST endpoints.
 * @module routes/tags
 */

/**
 * Fastify plugin that registers tag and release routes.
 * @param {import('fastify').FastifyInstance} fastify
 * @param {Object} opts
 * @param {import('../sdk/tags/client.mjs').TagsClient} opts.tags - Tags SDK client
 */
export default async function tagRoutes(fastify, opts) {
  const { tags } = opts;

  /**
   * GET /repos/:owner/:repo/tags - List tags.
   */
  fastify.get('/repos/:owner/:repo/tags', async (request, reply) => {
    const { owner, repo } = request.params;
    const result = await tags.listTags(owner, repo, request.query);
    return reply.send(result);
  });

  /**
   * GET /repos/:owner/:repo/releases - List releases.
   */
  fastify.get('/repos/:owner/:repo/releases', async (request, reply) => {
    const { owner, repo } = request.params;
    const result = await tags.listReleases(owner, repo, request.query);
    return reply.send(result);
  });

  /**
   * POST /repos/:owner/:repo/releases - Create a release.
   */
  fastify.post('/repos/:owner/:repo/releases', async (request, reply) => {
    const { owner, repo } = request.params;
    const result = await tags.createRelease(owner, repo, request.body);
    return reply.status(201).send(result);
  });

  /**
   * GET /repos/:owner/:repo/releases/latest - Get the latest release.
   */
  fastify.get(
    '/repos/:owner/:repo/releases/latest',
    async (request, reply) => {
      const { owner, repo } = request.params;
      const result = await tags.getLatestRelease(owner, repo);
      return reply.send(result);
    },
  );

  /**
   * GET /repos/:owner/:repo/releases/tags/:tag - Get release by tag.
   */
  fastify.get(
    '/repos/:owner/:repo/releases/tags/:tag',
    async (request, reply) => {
      const { owner, repo, tag } = request.params;
      const result = await tags.getReleaseByTag(owner, repo, tag);
      return reply.send(result);
    },
  );

  /**
   * GET /repos/:owner/:repo/releases/:id - Get a release by ID.
   */
  fastify.get(
    '/repos/:owner/:repo/releases/:id',
    async (request, reply) => {
      const { owner, repo, id } = request.params;
      const result = await tags.getRelease(owner, repo, parseInt(id, 10));
      return reply.send(result);
    },
  );

  /**
   * PATCH /repos/:owner/:repo/releases/:id - Update a release.
   */
  fastify.patch(
    '/repos/:owner/:repo/releases/:id',
    async (request, reply) => {
      const { owner, repo, id } = request.params;
      const result = await tags.updateRelease(
        owner,
        repo,
        parseInt(id, 10),
        request.body,
      );
      return reply.send(result);
    },
  );

  /**
   * DELETE /repos/:owner/:repo/releases/:id - Delete a release.
   */
  fastify.delete(
    '/repos/:owner/:repo/releases/:id',
    async (request, reply) => {
      const { owner, repo, id } = request.params;
      await tags.deleteRelease(owner, repo, parseInt(id, 10));
      return reply.status(204).send();
    },
  );

  return Promise.resolve();
}
