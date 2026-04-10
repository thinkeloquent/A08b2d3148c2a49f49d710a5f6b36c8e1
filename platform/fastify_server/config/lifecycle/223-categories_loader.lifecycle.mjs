/**
 * Categories Loader Lifecycle Module
 *
 * Registers the Category Manager plugin.
 */

import { categoriesPlugin } from '@internal/fastify-app-categories';

/**
 * Register Categories plugin on startup.
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config
 */
export async function onStartup(server, config) {
  server.log.info('[lifecycle:categories_loader] Initializing Categories plugin...');

  try {
    server.log.info('[lifecycle:categories_loader] Registering Categories plugin');
    await server.register(categoriesPlugin, {
      appName: 'categories',
      apiPrefix: '/~/api/categories',
    });
    server.log.info('[lifecycle:categories_loader] Categories plugin registered successfully');
  } catch (err) {
    server.log.error(
      { err, hookName: '223-categories_loader' },
      '[lifecycle:categories_loader] Categories plugin registration failed'
    );
    throw err;
  }
}
