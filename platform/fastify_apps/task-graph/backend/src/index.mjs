/**
 * Task Graph Backend Plugin
 *
 * Main Fastify plugin for task-graph application
 *
 * @module index
 */

import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fp from 'fastify-plugin';
import sensible from '@fastify/sensible';
import { databasePlugin_ } from './plugins/database.mjs';
import { eventPublisherPlugin_ } from './plugins/event-publisher.mjs';
import { registerErrorHandlers } from './plugins/error-handler.mjs';
import { taskRoutes, stepRoutes, healthRoutes, dependencyRoutes, failedJobRoutes, executionRoutes, fileRoutes, noteRoutes } from './routes/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const APP_NAME = 'task-graph';

/**
 * App Task Graph Plugin
 *
 * Registers API endpoints for task-graph application
 *
 * @param {object} fastify - Fastify instance
 * @param {object} options - Plugin options
 * @param {string} [options.appName] - URL prefix for serving frontend static files (at /apps/{appName})
 * @param {string} [options.adminAppName] - URL prefix for serving admin UI static files (at /admin/apps/{adminAppName})
 * @param {string} [options.apiPrefix] - URL prefix for API routes
 */
async function appTaskGraphPlugin(fastify, options = {}) {
  const {
    apiPrefix = '/api/task-graph',
    appName,
    adminAppName,
    skipDatabase = false,
    skipEventPublisher = false,
  } = options;

  fastify.log.info('→ Initializing Task Graph plugin...');

  // Register sensible plugin for httpErrors support (if not already registered)
  if (!fastify.hasDecorator('httpErrors')) {
    await fastify.register(sensible);
    fastify.log.info('  ✓ Sensible plugin registered');
  }

  // Register plugins
  if (!skipDatabase) {
    await fastify.register(databasePlugin_, options.database);
    fastify.log.info('  ✓ Database plugin registered');
  }

  if (!skipEventPublisher) {
    await fastify.register(eventPublisherPlugin_, options.eventPublisher);
    fastify.log.info('  ✓ Event publisher plugin registered');
  }

  registerErrorHandlers(fastify);
  fastify.log.info('  ✓ Error handlers registered');

  // Health check endpoint
  fastify.get(apiPrefix, async (_request, _reply) => {
    return {
      status: 'ok',
      service: 'task-graph',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: `GET ${apiPrefix}`,
        tasks: {
          list: `GET ${apiPrefix}/tasks`,
          get: `GET ${apiPrefix}/tasks/:id`,
          create: `POST ${apiPrefix}/tasks`,
          update: `PATCH ${apiPrefix}/tasks/:id`,
          delete: `DELETE ${apiPrefix}/tasks/:id`,
          start: `POST ${apiPrefix}/tasks/:id/start`,
          complete: `POST ${apiPrefix}/tasks/:id/complete`,
          fail: `POST ${apiPrefix}/tasks/:id/fail`,
          skip: `POST ${apiPrefix}/tasks/:id/skip`,
          retry: `POST ${apiPrefix}/tasks/:id/retry`,
        },
        steps: {
          batch: `POST ${apiPrefix}/steps/batch`,
          create: `POST ${apiPrefix}/steps`,
          get: `GET ${apiPrefix}/steps/:id`,
          update: `PATCH ${apiPrefix}/steps/:id`,
          delete: `DELETE ${apiPrefix}/steps/:id`,
          start: `POST ${apiPrefix}/steps/:id/start`,
          complete: `POST ${apiPrefix}/steps/:id/complete`,
          skip: `POST ${apiPrefix}/steps/:id/skip`,
          block: `POST ${apiPrefix}/steps/:id/block`,
          unblock: `POST ${apiPrefix}/steps/:id/unblock`,
        },
        dependencies: {
          create: `POST ${apiPrefix}/dependencies`,
          graph: `GET ${apiPrefix}/dependencies/:taskId/graph`,
          readiness: `GET ${apiPrefix}/dependencies/:taskId/execution-readiness`,
          delete: `DELETE ${apiPrefix}/dependencies/:prerequisiteId/:dependentId`,
        },
      },
    };
  });
  fastify.log.info(`  ✓ Registered route: GET ${apiPrefix} (health check)`);

  // Register routes
  await fastify.register(healthRoutes, { prefix: `${apiPrefix}/health` });
  await fastify.register(taskRoutes, { prefix: `${apiPrefix}/tasks` });
  await fastify.register(stepRoutes, { prefix: `${apiPrefix}/steps` });
  await fastify.register(dependencyRoutes, { prefix: `${apiPrefix}/dependencies` });
  await fastify.register(failedJobRoutes, { prefix: `${apiPrefix}/failed-jobs` });
  await fastify.register(executionRoutes, { prefix: `${apiPrefix}/executions` });
  await fastify.register(fileRoutes, { prefix: `${apiPrefix}/files` });
  await fastify.register(noteRoutes, { prefix: `${apiPrefix}/notes` });

  // Register static file serving for frontend
  if (appName) {
    const staticRoot = resolve(__dirname, '../../frontend/dist');

    if (!existsSync(staticRoot)) {
      fastify.log.warn(`  ⚠ Frontend dist not found, skipping static serving: ${staticRoot}`);
    } else {
      fastify.log.info('→ Setting up frontend static serving via static-app-loader...');

      const { staticAppLoader } = await import('static-app-loader');

      await fastify.register(staticAppLoader, {
        appName,
        rootPath: staticRoot,
        spaMode: true,
        maxAge: process.env.NODE_ENV === 'production' ? 86400 : 0,
      });

      fastify.log.info(`  ✓ Registered static assets at: ${appName}`);
    }
  }

  // Register static file serving for admin UI
  if (adminAppName) {
    const adminStaticRoot = resolve(__dirname, '../../frontend-admin/dist');

    if (!existsSync(adminStaticRoot)) {
      fastify.log.warn(`  ⚠ Admin UI dist not found, skipping static serving: ${adminStaticRoot}`);
    } else {
      fastify.log.info('→ Setting up admin UI static serving via static-app-loader...');

      const { staticAppLoader } = await import('static-app-loader');

      const adminBasePath = `/admin/apps/${adminAppName}`;
      await fastify.register(staticAppLoader, {
        appName: adminAppName,
        basePath: '/admin/apps/',
        rootPath: adminStaticRoot,
        spaMode: true,
        maxAge: process.env.NODE_ENV === 'production' ? 86400 : 0,
        defaultContext: {
          basePath: adminBasePath,
        },
      });

      fastify.log.info(`  ✓ Registered admin UI at: /admin/apps/${adminAppName}`);
    }
  }

  fastify.log.info('✅ Task Graph plugin successfully loaded');

  return Promise.resolve();
}

// Export as Fastify plugin (supports both v4 and v5)
// NOTE: fp() mutates the function it receives (sets Symbol.for('skip-override')),
// so we wrap in an arrow to keep appTaskGraphPlugin's encapsulation intact for direct use.
export default fp((fastify, opts) => appTaskGraphPlugin(fastify, opts), {
  name: 'task-graph',
  fastify: '5.x',
});

// Export the plugin function for direct use (encapsulated — no skip-override)
export { appTaskGraphPlugin };

// Export services and schemas for external use
export * from './services/task.service.mjs';
export * from './services/event-publisher.service.mjs';
export * from './schemas/index.mjs';
export * from './errors/index.mjs';
