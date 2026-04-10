/**
 * Repository routes.
 * Exposes GitHub Repository API operations as REST endpoints.
 * @module routes/repos
 */

/**
 * Fastify plugin that registers repository routes.
 * @param {import('fastify').FastifyInstance} fastify
 * @param {Object} opts
 * @param {import('../sdk/repos/client.mjs').ReposClient} opts.repos - Repos SDK client
 */
export default async function repoRoutes(fastify, opts) {
  const { repos } = opts;

  /**
   * GET /repos/:owner/:repo - Get a repository.
   */
  fastify.get('/repos/:owner/:repo', async (request, reply) => {
    const { owner, repo } = request.params;
    const result = await repos.get(owner, repo);
    return reply.send(result);
  });

  /**
   * GET /repos/user/:username - List repositories for a user.
   */
  fastify.get('/repos/user/:username', async (request, reply) => {
    const { username } = request.params;
    const result = await repos.listForUser(username, request.query);
    return reply.send(result);
  });

  /**
   * GET /repos/me - List repositories for the authenticated user.
   */
  fastify.get('/repos/me', async (request, reply) => {
    const result = await repos.listForAuthenticatedUser(request.query);
    return reply.send(result);
  });

  /**
   * GET /repos/org/:org - List repositories for an organization.
   */
  fastify.get('/repos/org/:org', async (request, reply) => {
    const { org } = request.params;
    const result = await repos.listForOrg(org, request.query);
    return reply.send(result);
  });

  /**
   * POST /repos - Create a repository for the authenticated user.
   */
  fastify.post('/repos', async (request, reply) => {
    const result = await repos.create(request.body);
    return reply.status(201).send(result);
  });

  /**
   * POST /repos/org/:org - Create a repository in an organization.
   */
  fastify.post('/repos/org/:org', async (request, reply) => {
    const { org } = request.params;
    const result = await repos.createInOrg(org, request.body);
    return reply.status(201).send(result);
  });

  /**
   * PATCH /repos/:owner/:repo - Update a repository.
   */
  fastify.patch('/repos/:owner/:repo', async (request, reply) => {
    const { owner, repo } = request.params;
    const result = await repos.update(owner, repo, request.body);
    return reply.send(result);
  });

  /**
   * DELETE /repos/:owner/:repo - Delete a repository.
   */
  fastify.delete('/repos/:owner/:repo', async (request, reply) => {
    const { owner, repo } = request.params;
    await repos.delete(owner, repo);
    return reply.status(204).send();
  });

  /**
   * GET /repos/:owner/:repo/topics - Get repository topics.
   */
  fastify.get('/repos/:owner/:repo/topics', async (request, reply) => {
    const { owner, repo } = request.params;
    const result = await repos.getTopics(owner, repo);
    return reply.send(result);
  });

  /**
   * PUT /repos/:owner/:repo/topics - Replace repository topics.
   */
  fastify.put('/repos/:owner/:repo/topics', async (request, reply) => {
    const { owner, repo } = request.params;
    const { names } = request.body;
    const result = await repos.replaceTopics(owner, repo, names);
    return reply.send(result);
  });

  /**
   * GET /repos/:owner/:repo/languages - Get repository languages.
   */
  fastify.get('/repos/:owner/:repo/languages', async (request, reply) => {
    const { owner, repo } = request.params;
    const result = await repos.getLanguages(owner, repo);
    return reply.send(result);
  });

  /**
   * GET /repos/:owner/:repo/contributors - List repository contributors.
   */
  fastify.get('/repos/:owner/:repo/contributors', async (request, reply) => {
    const { owner, repo } = request.params;
    const result = await repos.listContributors(owner, repo, request.query);
    return reply.send(result);
  });

  /**
   * POST /repos/:owner/:repo/forks - Fork a repository.
   */
  fastify.post('/repos/:owner/:repo/forks', async (request, reply) => {
    const { owner, repo } = request.params;
    const result = await repos.fork(owner, repo, request.body || {});
    return reply.status(202).send(result);
  });

  /**
   * GET /repos/:owner/:repo/forks - List forks.
   */
  fastify.get('/repos/:owner/:repo/forks', async (request, reply) => {
    const { owner, repo } = request.params;
    const result = await repos.listForks(owner, repo, request.query);
    return reply.send(result);
  });

  /**
   * PUT /repos/:owner/:repo/subscription - Watch a repository.
   */
  fastify.put('/repos/:owner/:repo/subscription', async (request, reply) => {
    const { owner, repo } = request.params;
    const result = await repos.watch(owner, repo);
    return reply.send(result);
  });

  /**
   * DELETE /repos/:owner/:repo/subscription - Unwatch a repository.
   */
  fastify.delete(
    '/repos/:owner/:repo/subscription',
    async (request, reply) => {
      const { owner, repo } = request.params;
      await repos.unwatch(owner, repo);
      return reply.status(204).send();
    },
  );

  /**
   * GET /repos/:owner/:repo/commits - List commits.
   */
  fastify.get('/repos/:owner/:repo/commits', async (request, reply) => {
    const { owner, repo } = request.params;
    const result = await repos.getCommits(owner, repo, request.query);
    return reply.send(result);
  });

  /**
   * GET /repos/:owner/:repo/commits/:ref - Get a single commit.
   */
  fastify.get('/repos/:owner/:repo/commits/:ref', async (request, reply) => {
    const { owner, repo, ref } = request.params;
    const result = await repos.getCommit(owner, repo, ref);
    return reply.send(result);
  });

  /**
   * GET /repos/:owner/:repo/commits/:ref/pulls - List PRs associated with a commit.
   */
  fastify.get('/repos/:owner/:repo/commits/:ref/pulls', async (request, reply) => {
    const { owner, repo, ref } = request.params;
    const result = await repos.listCommitPulls(owner, repo, ref);
    return reply.send(result);
  });

  /**
   * GET /repos/:owner/:repo/contents - Get root contents.
   */
  fastify.get('/repos/:owner/:repo/contents', async (request, reply) => {
    const { owner, repo } = request.params;
    const result = await repos.getContents(owner, repo, '', request.query);
    return reply.send(result);
  });

  /**
   * GET /repos/:owner/:repo/contents/* - Get contents at path.
   */
  fastify.get('/repos/:owner/:repo/contents/*', async (request, reply) => {
    const { owner, repo } = request.params;
    const path = request.params['*'];
    const result = await repos.getContents(owner, repo, path, request.query);
    return reply.send(result);
  });

  /**
   * GET /repos/:owner/:repo/git/trees/:tree_sha - Get a git tree.
   */
  fastify.get('/repos/:owner/:repo/git/trees/:tree_sha', async (request, reply) => {
    const { owner, repo, tree_sha } = request.params;
    const result = await repos.getGitTree(owner, repo, tree_sha, request.query);
    return reply.send(result);
  });

  /**
   * PUT /repos/:owner/:repo/contents/* - Create or update file contents.
   */
  fastify.put('/repos/:owner/:repo/contents/*', async (request, reply) => {
    const { owner, repo } = request.params;
    const path = request.params['*'];
    const result = await repos.createOrUpdateContents(owner, repo, path, request.body);
    return reply.status(201).send(result);
  });

  /**
   * POST /repos/:owner/:repo/git/refs - Create a git reference (branch/tag).
   */
  fastify.post('/repos/:owner/:repo/git/refs', async (request, reply) => {
    const { owner, repo } = request.params;
    const result = await repos.createGitRef(owner, repo, request.body.ref, request.body.sha);
    return reply.status(201).send(result);
  });

  /**
   * POST /repos/:owner/:repo/pulls - Create a pull request.
   */
  fastify.post('/repos/:owner/:repo/pulls', async (request, reply) => {
    const { owner, repo } = request.params;
    const result = await repos.createPullRequest(owner, repo, request.body);
    return reply.status(201).send(result);
  });

  /**
   * POST /repos/:owner/:repo/issues/:issueNumber/labels - Add labels to an issue or PR.
   */
  fastify.post('/repos/:owner/:repo/issues/:issueNumber/labels', async (request, reply) => {
    const { owner, repo, issueNumber } = request.params;
    const { labels } = request.body || {};
    const result = await repos.addLabels(owner, repo, parseInt(issueNumber, 10), labels);
    return reply.status(200).send(result);
  });

  return Promise.resolve();
}
