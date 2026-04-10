/**
 * Static Plugin
 *
 * Base configuration helper for @fastify/static.
 * Used by static-frontend-loader to mount individual frontends.
 *
 * This module exports a factory for creating static plugin options
 * with sane defaults, and a direct-registration helper.
 */

/**
 * Build @fastify/static options with platform defaults.
 * @param {Object} opts - Override options
 * @returns {Object} Merged options for @fastify/static
 */
export function buildStaticOptions(opts = {}) {
  return {
    // root is required and must be provided by caller
    root: opts.root,
    prefix: opts.prefix || '/',
    decorateReply: opts.decorateReply ?? false,
    wildcard: opts.wildcard ?? true,
    // Serve index.html for SPA fallback when wildcard is true
    index: opts.index || 'index.html',
    // Cache headers
    cacheControl: opts.cacheControl ?? true,
    maxAge: opts.maxAge || '1d',
    immutable: opts.immutable ?? false,
    ...opts,
  };
}

/**
 * Register @fastify/static on a Fastify instance with the given options.
 * @param {import('fastify').FastifyInstance} server
 * @param {Object} opts - Options passed to buildStaticOptions
 */
export async function registerStatic(server, opts = {}) {
  const { default: fastifyStatic } = await import('@fastify/static');
  const mergedOpts = buildStaticOptions(opts);

  if (!mergedOpts.root) {
    throw new Error('registerStatic: opts.root is required');
  }

  await server.register(fastifyStatic, mergedOpts);
}
