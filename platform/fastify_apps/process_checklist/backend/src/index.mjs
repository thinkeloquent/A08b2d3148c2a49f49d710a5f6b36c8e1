/**
 * Process Checklist - Fastify Plugin
 * Provides API routes for checklist template management and checklist generation
 */

import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import fastifyPlugin from "fastify-plugin";
import sensible from "@fastify/sensible";

import { registerErrorHandlers } from "./plugins/error-handler.mjs";
import databasePlugin from "./plugins/database.mjs";
import routes from "./routes/index.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Process Checklist Plugin
 *
 * @param {import('fastify').FastifyInstance} fastify
 * @param {object} _options
 * @param {string} [_options.appName] - App name for frontend static serving
 * @param {string} [_options.adminAppName] - App name for admin static serving
 * @param {string} [_options.apiPrefix] - URL prefix for API routes
 */
async function processChecklistPlugin(fastify, _options) {
  fastify.log.info("→ Initializing Process Checklist plugin...");

  // Register error handler (direct call, not fp-wrapped)
  registerErrorHandlers(fastify);
  fastify.log.info("  ✓ Error handlers registered");

  // Register sensible plugin for httpErrors support
  await fastify.register(sensible);

  // Register database plugin (fp-wrapped, dual-mode)
  await fastify.register(databasePlugin);
  fastify.log.info("  ✓ Database plugin registered");

  const apiPrefix = _options.apiPrefix || "/~/api/process_checklist";

  // Health check endpoint
  fastify.get(apiPrefix, async () => ({
    status: "ok",
    service: "process-checklist",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: `GET ${apiPrefix}`,
      templates: `GET ${apiPrefix}/templates`,
      templateById: `GET ${apiPrefix}/templates/:id`,
      createTemplate: `POST ${apiPrefix}/templates`,
      updateTemplate: `PUT ${apiPrefix}/templates/:id`,
      deleteTemplate: `DELETE ${apiPrefix}/templates/:id`,
      checklists: `GET ${apiPrefix}/checklists`,
      checklistById: `GET ${apiPrefix}/checklists/:id`,
      generateChecklist: `POST ${apiPrefix}/checklists`,
    },
  }));
  fastify.log.info(`  ✓ Registered route: GET ${apiPrefix} (health check)`);

  // Register CRUD routes under API prefix
  await fastify.register(routes, { prefix: apiPrefix });
  fastify.log.info(`  ✓ Registered API routes at ${apiPrefix}`);

  // Register static file serving for frontend
  if (_options.appName) {
    const staticRoot = resolve(__dirname, "../../frontend/dist");

    if (!existsSync(staticRoot)) {
      fastify.log.warn(
        `  ⚠ Frontend dist not found, skipping static serving: ${staticRoot}`,
      );
    } else {
      fastify.log.info("→ Setting up frontend static serving...");

      const { staticAppLoader } = await import("static-app-loader");

      await fastify.register(staticAppLoader, {
        appName: _options.appName,
        rootPath: staticRoot,
        spaMode: true,
        maxAge: process.env.NODE_ENV === "production" ? 86400 : 0,
      });

      fastify.log.info(`  ✓ Registered static assets at: ${_options.appName}`);
    }
  }

  // Register static file serving for admin UI
  if (_options.adminAppName) {
    const adminStaticRoot = resolve(__dirname, "../../frontend-admin/dist");

    if (!existsSync(adminStaticRoot)) {
      fastify.log.warn(
        `  ⚠ Admin UI dist not found, skipping static serving: ${adminStaticRoot}`,
      );
    } else {
      fastify.log.info("→ Setting up admin UI static serving...");

      const { staticAppLoader } = await import("static-app-loader");

      await fastify.register(staticAppLoader, {
        appName: _options.adminAppName,
        basePath: "/admin/apps/",
        rootPath: adminStaticRoot,
        spaMode: true,
        maxAge: process.env.NODE_ENV === "production" ? 86400 : 0,
        defaultContext: {
          basePath: `/admin/apps/${_options.adminAppName}`,
        },
      });

      fastify.log.info(
        `  ✓ Registered admin UI at: /admin/apps/${_options.adminAppName}`,
      );
    }
  }

  fastify.log.info("✅ Process Checklist plugin successfully loaded");

  return Promise.resolve();
}

// Export as Fastify plugin
// NOTE: fp() mutates the function it receives, so wrap in arrow to preserve encapsulation
export default fastifyPlugin(
  (fastify, opts) => processChecklistPlugin(fastify, opts),
  { name: "process-checklist" },
);

// Export the plugin function for direct use (encapsulated - no skip-override)
export { processChecklistPlugin };
