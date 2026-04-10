/**
 * CSV Datasource Hub - Fastify Plugin
 * Schema-agnostic CSV report ingestion and management
 */

import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fastifyPlugin from 'fastify-plugin';
import sensible from '@fastify/sensible';
import multipart from '@fastify/multipart';

import databasePlugin from './plugins/database.mjs';
import { registerErrorHandlers } from './plugins/error-handler.mjs';
import routes from './routes/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function csvDatasourceHubPlugin(fastify, _options) {
  const apiPrefix = _options.apiPrefix || '/~/api/csv-datasource';

  fastify.log.info('-> Initializing CSV Datasource Hub plugin...');

  if (!fastify.hasDecorator('httpErrors')) {
    await fastify.register(sensible);
  }

  registerErrorHandlers(fastify);
  fastify.log.info('  > Error handlers registered');

  await fastify.register(multipart, { limits: { fileSize: 50 * 1024 * 1024 } });
  fastify.log.info('  > Multipart plugin registered (50MB limit)');

  await fastify.register(databasePlugin);
  fastify.log.info('  > Database plugin registered');

  // Health check / info endpoint
  fastify.get(`${apiPrefix}`, async (_request, _reply) => {
    return {
      status: 'ok',
      service: 'csv-datasource-hub',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  });

  await fastify.register(routes, { prefix: apiPrefix });

  if (_options.appName) {
    const staticRoot = resolve(__dirname, '../../frontend/dist');

    if (!existsSync(staticRoot)) {
      fastify.log.warn(`  Frontend dist not found, skipping static serving: ${staticRoot}`);
    } else {
      const { staticAppLoader } = await import('static-app-loader');
      await fastify.register(staticAppLoader, {
        appName: _options.appName,
        rootPath: staticRoot,
        spaMode: true,
        maxAge: process.env.NODE_ENV === 'production' ? 86400 : 0,
      });
      fastify.log.info(`  > Registered static assets at: ${_options.appName}`);
    }
  }

  fastify.log.info('CSV Datasource Hub plugin successfully loaded');
  return Promise.resolve();
}

export default fastifyPlugin(
  (fastify, opts) => csvDatasourceHubPlugin(fastify, opts),
  { name: 'csv-datasource-hub' },
);

export { csvDatasourceHubPlugin };
