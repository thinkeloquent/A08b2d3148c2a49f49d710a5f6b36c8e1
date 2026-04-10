/**
 * Fastify plugin for computed-url-builder.
 *
 * Provides integration with Fastify applications through decorators
 * and request-level builders.
 *
 * @module computed-url-builder/fastify
 *
 * @example
 * import Fastify from 'fastify';
 * import urlBuilderPlugin from '@thinkeloquent/computed-url-builder/fastify';
 *
 * const fastify = Fastify();
 *
 * await fastify.register(urlBuilderPlugin, {
 *   urlKeys: { dev: 'https://dev.api.com' },
 *   basePath: '/v1'
 * });
 *
 * fastify.get('/', async (request, reply) => {
 *   const url = fastify.urlBuilder.build('dev');
 *   return { url };
 * });
 */

import createUrlBuilder, { createLogger } from './index.mjs';

/**
 * @typedef {Object} PluginOptions
 * @property {import('./index.mjs').UrlKeys} [urlKeys] - URL configuration (if not using env)
 * @property {string} [basePath=''] - Base path for URLs
 * @property {string} [envPrefix='URL_BUILDER_'] - Environment variable prefix
 * @property {boolean} [fromEnv=true] - Whether to load from environment variables
 * @property {import('./logger.mjs').Logger} [logger] - Custom logger instance
 */

/**
 * Fastify plugin that adds URL builder functionality.
 *
 * @param {import('fastify').FastifyInstance} fastify - Fastify instance
 * @param {PluginOptions} options - Plugin options
 */
async function urlBuilderPlugin(fastify, options = {}) {
  const {
    urlKeys,
    basePath = '',
    envPrefix = 'URL_BUILDER_',
    fromEnv = true,
    logger: customLogger,
  } = options;

  const logger = customLogger || createLogger('computed-url-builder', import.meta.url);
  logger.info('Registering URL builder plugin');

  // Create the builder
  let builder;

  if (urlKeys) {
    // Use provided configuration
    logger.debug('Creating builder with provided urlKeys');
    builder = createUrlBuilder(urlKeys, basePath, { logger });
  } else if (fromEnv) {
    // Load from environment variables
    logger.debug(`Creating builder from environment with prefix '${envPrefix}'`);
    builder = createUrlBuilder.fromEnv(envPrefix, basePath, { logger });
  } else {
    // Empty builder
    logger.debug('Creating empty builder');
    builder = createUrlBuilder({}, basePath, { logger });
  }

  // Decorate fastify instance with the builder
  fastify.decorate('urlBuilder', builder);

  // Optionally decorate requests with a builder getter
  fastify.decorateRequest('getUrlBuilder', function () {
    return builder;
  });

  logger.info(
    `URL builder plugin registered with ${Object.keys(builder.env).length} environments`
  );

  return Promise.resolve();
}

// Add plugin metadata for Fastify
urlBuilderPlugin[Symbol.for('fastify.display-name')] = 'computed-url-builder';
urlBuilderPlugin[Symbol.for('skip-override')] = true;

export default urlBuilderPlugin;
export { urlBuilderPlugin };
