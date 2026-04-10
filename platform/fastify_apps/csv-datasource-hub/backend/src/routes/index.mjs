import datasourcesRoutes from './datasources.mjs';
import categoriesRoutes from './categories.mjs';
import tagsRoutes from './tags.mjs';
import instancesRoutes from './instances.mjs';
import payloadsRoutes from './payloads.mjs';

export default async function routes(fastify, _options) {
  fastify.register(datasourcesRoutes, { prefix: '/datasources' });
  fastify.register(categoriesRoutes, { prefix: '/categories' });
  fastify.register(tagsRoutes, { prefix: '/tags' });
  fastify.register(instancesRoutes);
  fastify.register(payloadsRoutes);

  fastify.log.info('  > Registered CSV Datasource Hub routes');
  return Promise.resolve();
}

export { datasourcesRoutes, categoriesRoutes, tagsRoutes, instancesRoutes, payloadsRoutes };
