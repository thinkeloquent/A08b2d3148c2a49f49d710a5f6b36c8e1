/**
 * Persona Editor - Fastify Plugin
 * Provides API routes for persona management
 */

import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fastifyPlugin from 'fastify-plugin';

import sensible from '@fastify/sensible';

import databasePlugin from './plugins/database.mjs';
import { registerErrorHandlers } from './plugins/error-handler.mjs';
import routes from './routes/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Persona Editor Plugin
 * Registers API endpoints for persona management
 *
 * @param {object} fastify - Fastify instance
 * @param {object} _options - Plugin options
 * @param {string} [_options.appName] - URL prefix for serving frontend static files (at /apps/{appName})
 * @param {string} [_options.adminAppName] - URL prefix for serving admin UI static files (at /admin/apps/{adminAppName})
 * @param {string} [_options.apiPrefix] - URL prefix for API routes (default: /~/api/persona_editor)
 */
async function personaEditorPlugin(fastify, _options) {
  const apiPrefix = _options.apiPrefix || '/~/api/persona_editor';

  fastify.log.info('→ Initializing Persona Editor plugin...');

  // Register sensible plugin for httpErrors support (skip if already registered)
  if (!fastify.hasDecorator('httpErrors')) {
    await fastify.register(sensible);
  }

  // Register error handler
  registerErrorHandlers(fastify);
  fastify.log.info('  ✓ Error handlers registered');

  // Register database plugin
  await fastify.register(databasePlugin);
  fastify.log.info('  ✓ Database plugin registered');

  // Health check / info endpoint
  fastify.get(`${apiPrefix}`, async (_request, _reply) => {
    return {
      status: 'ok',
      service: 'persona-editor',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: `GET ${apiPrefix}`,
        personas: {
          list: `GET ${apiPrefix}/personas`,
          get: `GET ${apiPrefix}/personas/:id`,
          create: `POST ${apiPrefix}/personas`,
          update: `PUT ${apiPrefix}/personas/:id`,
          delete: `DELETE ${apiPrefix}/personas/:id`,
          auditLogs: `GET ${apiPrefix}/personas/:id/audit-logs`,
        },
        llmDefaults: {
          list: `GET ${apiPrefix}/llm-defaults`,
          byCategory: `GET ${apiPrefix}/llm-defaults/category/:category`,
          get: `GET ${apiPrefix}/llm-defaults/:id`,
          create: `POST ${apiPrefix}/llm-defaults`,
          update: `PUT ${apiPrefix}/llm-defaults/:id`,
          delete: `DELETE ${apiPrefix}/llm-defaults/:id`,
        },
        presets: {
          byCategory: `GET ${apiPrefix}/presets/:category`,
        },
        health: {
          basic: `GET ${apiPrefix}/health`,
          detailed: `GET ${apiPrefix}/health/detailed`,
        },
      },
    };
  });
  fastify.log.info(`  ✓ Registered route: GET ${apiPrefix} (info/health check)`);

  // Register CRUD routes under API prefix
  await fastify.register(routes, { prefix: apiPrefix });

  // Register static file serving for frontend
  if (_options.appName) {
    const staticRoot = resolve(__dirname, '../../frontend/dist');

    if (!existsSync(staticRoot)) {
      fastify.log.warn(`  ⚠ Frontend dist not found, skipping static serving: ${staticRoot}`);
    } else {
      fastify.log.info('→ Setting up frontend static serving via static-app-loader...');

      const { staticAppLoader } = await import('static-app-loader');

      await fastify.register(staticAppLoader, {
        appName: _options.appName,
        rootPath: staticRoot,
        spaMode: true,
        maxAge: process.env.NODE_ENV === 'production' ? 86400 : 0,
      });

      fastify.log.info(`  ✓ Registered static assets at: ${_options.appName}`);
    }
  }

  // Register static file serving for admin UI
  if (_options.adminAppName) {
    const adminStaticRoot = resolve(__dirname, '../../frontend-admin/dist');

    if (!existsSync(adminStaticRoot)) {
      fastify.log.warn(`  ⚠ Admin UI dist not found, skipping static serving: ${adminStaticRoot}`);
    } else {
      fastify.log.info('→ Setting up admin UI static serving via static-app-loader...');

      const { staticAppLoader } = await import('static-app-loader');

      const adminBasePath = `/admin/apps/${_options.adminAppName}`;
      await fastify.register(staticAppLoader, {
        appName: _options.adminAppName,
        basePath: '/admin/apps/',
        rootPath: adminStaticRoot,
        spaMode: true,
        maxAge: process.env.NODE_ENV === 'production' ? 86400 : 0,
        defaultContext: {
          basePath: adminBasePath,
        },
      });

      fastify.log.info(`  ✓ Registered admin UI at: /admin/apps/${_options.adminAppName}`);
    }
  }

  fastify.log.info('✅ Persona Editor plugin successfully loaded');

  return Promise.resolve();
}

// Export as Fastify plugin (supports both v4 and v5)
// NOTE: fp() mutates the function it receives (sets Symbol.for('skip-override')),
// so we wrap in an arrow to keep personaEditorPlugin's encapsulation intact for direct use.
export default fastifyPlugin(
  (fastify, opts) => personaEditorPlugin(fastify, opts),
  { name: 'persona-editor' },
);

// Export the plugin function for direct use (encapsulated — no skip-override)
export { personaEditorPlugin };
