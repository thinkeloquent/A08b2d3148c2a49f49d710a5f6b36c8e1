/**
 * =============================================================================
 * Static App Loader - Fastify Server Example
 * =============================================================================
 *
 * A minimal Fastify server demonstrating static-app-loader integration.
 *
 * Run: npx tsx watch server.ts
 * Visit: http://localhost:3000/dashboard
 */

import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify, { FastifyInstance } from 'fastify';

import {
  staticAppLoader,
  createMultiAppLoader,
  logger,
} from '../../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_PATH = join(__dirname, 'public');

// Create logger
const log = logger.create('fastify-example', 'server.ts');

/**
 * Initialize the Fastify server with static app loader.
 */
async function init(): Promise<FastifyInstance> {
  const server = Fastify({
    logger: {
      level: 'info',
    },
  });

  // Health check endpoint
  server.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }));

  // API routes
  server.get('/api/user', async () => ({
    id: 1,
    name: 'Demo User',
    email: 'demo@example.com',
  }));

  // Register static apps using multi-app builder
  const results = await createMultiAppLoader()
    .addApp((b) =>
      b
        .appName('dashboard')
        .rootPath(PUBLIC_PATH)
        .spaMode(true)
        .urlPrefix('/assets')
        .defaultContext({
          appName: 'Dashboard',
          version: '1.0.0',
          apiBase: '/api',
        })
    )
    .addApp((b) =>
      b
        .appName('admin')
        .rootPath(PUBLIC_PATH)
        .spaMode(true)
        .urlPrefix('/assets')
        .defaultContext({
          appName: 'Admin Panel',
          version: '1.0.0',
          apiBase: '/api',
        })
    )
    .onCollision('warn')
    .logger(log)
    .register(server);

  // Log registration results
  results.forEach((r) => {
    if (r.success) {
      log.info(`Registered app: ${r.appName} at ${r.routePrefix}`);
    } else {
      log.error(`Failed to register app: ${r.appName}`, { error: r.error });
    }
  });

  return server;
}

/**
 * Start the server.
 */
async function start(): Promise<void> {
  const server = await init();

  try {
    const address = await server.listen({ port: 3000, host: '0.0.0.0' });
    log.info(`Server listening at ${address}`);
    log.info('Available routes:');
    log.info('  GET /health - Health check');
    log.info('  GET /api/user - API endpoint');
    log.info('  GET /dashboard/* - Dashboard SPA');
    log.info('  GET /admin/* - Admin SPA');
  } catch (err) {
    log.error('Failed to start server', { error: String(err) });
    process.exit(1);
  }
}

// Handle shutdown
process.on('SIGINT', () => {
  log.info('Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log.info('Shutting down...');
  process.exit(0);
});

start();
