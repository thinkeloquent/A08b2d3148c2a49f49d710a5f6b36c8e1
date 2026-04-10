/**
 * Chroma Explorer - Fastify Plugin
 * Provides API routes for browsing ChromaDB SQLite databases
 */

import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fastifyPlugin from 'fastify-plugin';

import sensible from '@fastify/sensible';

import { registerErrorHandlers } from './plugins/error-handler.mjs';
import routes from './routes/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Chroma Explorer Plugin
 * Registers API endpoints for browsing ChromaDB SQLite databases.
 *
 * @param {import('fastify').FastifyInstance} fastify
 * @param {object} _options - Plugin options
 * @param {string} [_options.appName] - URL prefix for serving frontend static files (at /apps/{appName})
 * @param {string} [_options.apiPrefix] - URL prefix for API routes
 */
async function appChromaExplorerPlugin(fastify, _options) {
  fastify.log.info('→ Initializing Chroma Explorer plugin...');

  // Register error handler (direct call, not fp-wrapped)
  registerErrorHandlers(fastify);
  fastify.log.info('  ✓ Error handlers registered');

  // Register sensible plugin for httpErrors support
  if (!fastify.hasDecorator('httpErrors')) {
    await fastify.register(sensible);
  }

  // Health check endpoint
  fastify.get('/api/chroma-explorer', async (_request, _reply) => {
    return {
      status: 'ok',
      service: 'chroma-explorer',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      databases: ['ant-design', 'material-ui'],
      endpoints: {
        health: 'GET /api/chroma-explorer',
        databases: 'GET /api/chroma-explorer/databases',
        collections: 'GET /api/chroma-explorer/databases/:dbName/collections',
        embeddings: 'GET /api/chroma-explorer/databases/:dbName/embeddings',
        embedding: 'GET /api/chroma-explorer/databases/:dbName/embeddings/:embeddingId',
        metadataKeys: 'GET /api/chroma-explorer/databases/:dbName/metadata-keys',
        components: 'GET /api/chroma-explorer/databases/:dbName/components',
        stats: 'GET /api/chroma-explorer/databases/:dbName/stats',
        search: 'GET /api/chroma-explorer/databases/:dbName/search?q=...',
      },
    };
  });
  fastify.log.info('  ✓ Registered route: GET /api/chroma-explorer (health check)');

  // Register all Chroma Explorer routes under /api/chroma-explorer prefix
  await fastify.register(routes, { prefix: '/api/chroma-explorer' });
  fastify.log.info('  ✓ Registered Chroma Explorer API routes');

  // Register static file serving for frontend
  if (_options.appName) {
    const staticRoot = resolve(__dirname, '../../frontend/dist');

    if (!existsSync(staticRoot)) {
      fastify.log.warn(
        `  ⚠ Frontend dist not found, skipping static serving: ${staticRoot}`,
      );
    } else {
      fastify.log.info('→ Setting up frontend static serving via static-app-loader...');

      const { staticAppLoader } = await import('static-app-loader');

      await fastify.register(staticAppLoader, {
        appName: _options.appName,
        rootPath: staticRoot,
        spaMode: true,
        maxAge: process.env.NODE_ENV === 'production' ? 86400 : 0,
      });

      fastify.log.info(`  ✓ Registered static assets at: /apps/${_options.appName}`);
    }
  }

  fastify.log.info('✅ Chroma Explorer plugin successfully loaded');

  return Promise.resolve();
}

// Export as Fastify plugin (fp() mutates the original — wrap in arrow to preserve encapsulation)
export default fastifyPlugin(
  (fastify, opts) => appChromaExplorerPlugin(fastify, opts),
  { name: 'chroma-explorer' },
);

// Named export for lifecycle loader (encapsulated — no skip-override)
export { appChromaExplorerPlugin as chromaExplorerPlugin };
