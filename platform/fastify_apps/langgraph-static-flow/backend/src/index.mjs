/**
 * LangGraph Static Flow - Fastify Plugin
 * Provides API routes for the main Fastify server
 */

import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fastifyPlugin from 'fastify-plugin';

import sensible from '@fastify/sensible';

import { registerErrorHandlers } from './plugins/error-handler.mjs';
import databasePlugin from './plugins/database.mjs';
import routes from './routes/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function appLanggraphStaticFlowPlugin(fastify, _options) {
  fastify.log.info('→ Initializing LangGraph Static Flow plugin...');

  registerErrorHandlers(fastify);
  fastify.log.info('  ✓ Error handlers registered');

  if (!fastify.hasDecorator('httpErrors')) {
    await fastify.register(sensible);
  }

  await fastify.register(databasePlugin);
  fastify.log.info('  ✓ Database plugin registered');

  const apiPrefix = _options.apiPrefix || '/api/langgraph-static-flow';

  fastify.get(apiPrefix, async (_request, _reply) => {
    return {
      status: 'ok',
      service: 'langgraph-static-flow',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: `GET ${apiPrefix}`,
        flows: {
          list: `GET ${apiPrefix}/flows`,
          get: `GET ${apiPrefix}/flows/:id`,
          create: `POST ${apiPrefix}/flows`,
          update: `PUT ${apiPrefix}/flows/:id`,
          delete: `DELETE ${apiPrefix}/flows/:id`,
          versions: `GET ${apiPrefix}/flows/:id/versions`,
          restore: `POST ${apiPrefix}/flows/:id/restore/:versionId`,
          preview: `GET ${apiPrefix}/flows/:id/preview`,
          review: `GET ${apiPrefix}/flows/:id/review`,
        },
        nodes: {
          list: `GET ${apiPrefix}/flows/:flowId/nodes`,
          get: `GET ${apiPrefix}/flows/:flowId/nodes/:nodeId`,
          create: `POST ${apiPrefix}/flows/:flowId/nodes`,
          update: `PUT ${apiPrefix}/flows/:flowId/nodes/:nodeId`,
          delete: `DELETE ${apiPrefix}/flows/:flowId/nodes/:nodeId`,
        },
        conditions: {
          list: `GET ${apiPrefix}/flows/:flowId/conditions`,
          get: `GET ${apiPrefix}/flows/:flowId/conditions/:conditionId`,
          create: `POST ${apiPrefix}/flows/:flowId/conditions`,
          update: `PUT ${apiPrefix}/flows/:flowId/conditions/:conditionId`,
          delete: `DELETE ${apiPrefix}/flows/:flowId/conditions/:conditionId`,
        },
        sessions: {
          list: `GET ${apiPrefix}/sessions`,
          get: `GET ${apiPrefix}/sessions/:id`,
          current: `GET ${apiPrefix}/sessions/current/:flowId`,
          history: `GET ${apiPrefix}/sessions/history/:flowId`,
          create: `POST ${apiPrefix}/sessions`,
          update: `PUT ${apiPrefix}/sessions/:id`,
          delete: `DELETE ${apiPrefix}/sessions/:id`,
          add_checkpoint: `POST ${apiPrefix}/sessions/:id/checkpoint`,
          add_stage: `POST ${apiPrefix}/sessions/:id/stage`,
        },
        templates: {
          list: `GET ${apiPrefix}/templates`,
          get: `GET ${apiPrefix}/templates/:id`,
          by_slug: `GET ${apiPrefix}/templates/slug/:slug`,
          create: `POST ${apiPrefix}/templates`,
          update: `PUT ${apiPrefix}/templates/:id`,
          delete: `DELETE ${apiPrefix}/templates/:id`,
          create_flow: `POST ${apiPrefix}/templates/:id/create-flow`,
        },
        review: {
          validate: `POST ${apiPrefix}/review/validate`,
          stage: `POST ${apiPrefix}/review/stage`,
          commit: `POST ${apiPrefix}/review/commit/:token`,
          discard: `DELETE ${apiPrefix}/review/stage/:token`,
        },
        string_templates: {
          list: `GET ${apiPrefix}/string-templates`,
          get: `GET ${apiPrefix}/string-templates/:id`,
          create: `POST ${apiPrefix}/string-templates`,
          update: `PUT ${apiPrefix}/string-templates/:id`,
          delete: `DELETE ${apiPrefix}/string-templates/:id`,
          resolve: `POST ${apiPrefix}/string-templates/resolve`,
          bulk_upsert: `POST ${apiPrefix}/string-templates/bulk-upsert`,
        },
        import_export: {
          import: `POST ${apiPrefix}/flows/import`,
          export: `GET ${apiPrefix}/flows/:id/export`,
        },
      },
    };
  });
  fastify.log.info(`  ✓ Registered route: GET ${apiPrefix} (health check)`);

  await fastify.register(routes, { prefix: apiPrefix });
  fastify.log.info(`  ✓ Registered API routes under ${apiPrefix}`);

  if (_options.appName) {
    const staticRoot = resolve(__dirname, '../../frontend/dist');

    if (!existsSync(staticRoot)) {
      fastify.log.warn(
        `  ⚠ Frontend dist not found, skipping static serving: ${staticRoot}`
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

      fastify.log.info(`  ✓ Registered static assets at: ${_options.appName}`);
    }
  }

  if (_options.adminAppName) {
    const adminStaticRoot = resolve(__dirname, '../../frontend-admin/dist');

    if (!existsSync(adminStaticRoot)) {
      fastify.log.warn(
        `  ⚠ Admin UI dist not found, skipping static serving: ${adminStaticRoot}`
      );
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

      fastify.log.info(
        `  ✓ Registered admin UI at: /admin/apps/${_options.adminAppName}`
      );
    }
  }

  fastify.log.info('✅ LangGraph Static Flow plugin successfully loaded');

  return Promise.resolve();
}

// NOTE: fp() mutates the function it receives (sets Symbol.for('skip-override')),
// so we wrap in an arrow to keep appLanggraphStaticFlowPlugin's encapsulation intact for direct use.
export default fastifyPlugin(
  (fastify, opts) => appLanggraphStaticFlowPlugin(fastify, opts),
  { name: 'langgraph-static-flow' }
);

// Export the plugin function for direct use (encapsulated — no skip-override)
export { appLanggraphStaticFlowPlugin };
