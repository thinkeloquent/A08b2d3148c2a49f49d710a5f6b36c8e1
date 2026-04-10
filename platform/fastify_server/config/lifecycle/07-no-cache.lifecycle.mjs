/**
 * No-Cache Headers Lifecycle Module
 *
 * Adds cache-control headers to prevent browsers from serving stale
 * assets during development. Only applies in non-production environments.
 * Reads cache header values from security.yml via AppYamlConfig.
 */

/**
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config
 */
export async function onStartup(server, config) {
  const env = process.env.NODE_ENV || 'development';
  server.log.info({ NODE_ENV: env }, '[lifecycle:no-cache] Checking environment for no-cache configuration');

  try {
    if (env === 'production') {
      server.log.info('[lifecycle:no-cache] Production environment detected, skipping no-cache headers');
      return;
    }

    // Read cache config from security.yml
    const noCache = server.config?.getNested?.(['cache', 'noCache']) ?? true;
    server.log.debug({ noCache }, '[lifecycle:no-cache] no-cache config value');
    if (!noCache) {
      server.log.info('[lifecycle:no-cache] no-cache disabled in config, skipping');
      return;
    }

    const cacheControl = server.config?.getNested?.(['cache', 'headers', 'cacheControl']) || 'no-cache, no-store, must-revalidate';
    const pragma = server.config?.getNested?.(['cache', 'headers', 'pragma']) || 'no-cache';
    const expires = server.config?.getNested?.(['cache', 'headers', 'expires']) || '0';

    server.log.debug({ cacheControl, pragma, expires }, '[lifecycle:no-cache] Cache header values');

    server.addHook('onRequest', async (_request, reply) => {
      reply.headers({
        'Cache-Control': cacheControl,
        'Pragma': pragma,
        'Expires': expires,
      });
    });

    server.log.info({ cacheControl, pragma, expires }, '[lifecycle:no-cache] No-cache headers enabled (non-production)');
  } catch (err) {
    server.log.error({ err, hookName: '07-no-cache' }, '[lifecycle:no-cache] No-cache configuration failed');
    throw err;
  }
}
