/**
 * Chroma Explorer Loader Lifecycle Module
 *
 * Registers the ChromaDB Explorer app plugin:
 * - Read-only browsing of ChromaDB SQLite databases
 * - Ant-design and material-ui embedding databases
 * - Full-text search, metadata exploration, statistics
 */

import { chromaExplorerPlugin } from '@internal/fastify-app-chroma-explorer';

/**
 * Register Chroma Explorer plugin on startup.
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config
 */
export async function onStartup(server, config) {
  server.log.info('[lifecycle:chroma_explorer] Initializing Chroma Explorer plugin...');

  try {
    server.log.info('[lifecycle:chroma_explorer] Registering Chroma Explorer plugin');
    await server.register(chromaExplorerPlugin, {
      appName: 'chroma-explorer',
      apiPrefix: '/api/chroma-explorer',
    });
    server.log.info('[lifecycle:chroma_explorer] Chroma Explorer plugin registered successfully');
  } catch (err) {
    server.log.error(
      { err, hookName: '225-chroma_explorer_loader' },
      '[lifecycle:chroma_explorer] Chroma Explorer plugin registration failed',
    );
    throw err;
  }
}
