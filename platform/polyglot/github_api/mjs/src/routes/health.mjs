/**
 * Health check routes.
 * Provides server and GitHub API connectivity status endpoints.
 * @module routes/health
 */

/**
 * Fastify plugin that registers health check routes.
 * @param {import('fastify').FastifyInstance} fastify
 * @param {Object} opts
 * @param {import('../sdk/client.mjs').GitHubClient} opts.client - GitHub client instance
 */
export default async function healthRoutes(fastify, opts) {
  const { client } = opts;

  /**
   * GET /health - Basic health check.
   */
  fastify.get('/health', async (request, reply) => {
    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      rateLimit: client.lastRateLimit || null,
    };

    return reply.send(response);
  });

  /**
   * GET /health/rate-limit - Full rate limit status from GitHub API.
   */
  fastify.get('/health/rate-limit', async (request, reply) => {
    const rateLimit = await client.getRateLimit();
    return reply.send(rateLimit);
  });

  return Promise.resolve();
}
