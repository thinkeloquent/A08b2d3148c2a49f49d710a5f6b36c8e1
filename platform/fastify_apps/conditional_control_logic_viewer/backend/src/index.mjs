/**
 * Conditional Control Logic Viewer - Fastify Plugin
 * Provides API routes for the main Fastify server
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
 * Conditional Control Logic Viewer Plugin
 * Registers API endpoints
 *
 * @param {object} fastify - Fastify instance
 * @param {object} _options - Plugin options
 * @param {string} [_options.appName] - URL prefix for serving frontend static files
 * @param {string} [_options.adminAppName] - URL prefix for serving admin UI static files
 */
async function appConditionalControlLogicViewerPlugin(fastify, _options) {
  fastify.log.info("→ Initializing Conditional Control Logic Viewer plugin...");

  // Register error handler
  registerErrorHandlers(fastify);
  fastify.log.info("  ✓ Error handlers registered");

  // Register sensible plugin for httpErrors support
  await fastify.register(sensible);

  // Register database plugin
  await fastify.register(databasePlugin);
  fastify.log.info("  ✓ Database plugin registered");

  // Health check endpoint
  fastify.get("/api/conditional-control-logic-viewer", async (_request, _reply) => {
    return {
      status: "ok",
      service: "conditional-control-logic-viewer",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      endpoints: {
        health: "GET /api/conditional-control-logic-viewer",
        filterTrees: {
          list: "GET /api/conditional-control-logic-viewer/filter-trees",
          get: "GET /api/conditional-control-logic-viewer/filter-trees/:id",
          create: "POST /api/conditional-control-logic-viewer/filter-trees",
          update: "PUT /api/conditional-control-logic-viewer/filter-trees/:id",
          delete: "DELETE /api/conditional-control-logic-viewer/filter-trees/:id",
          clone: "POST /api/conditional-control-logic-viewer/filter-trees/:id/clone",
        },
        dropdownOptions: {
          list: "GET /api/conditional-control-logic-viewer/dropdown-options",
          get: "GET /api/conditional-control-logic-viewer/dropdown-options/:id",
          create: "POST /api/conditional-control-logic-viewer/dropdown-options",
          update: "PUT /api/conditional-control-logic-viewer/dropdown-options/:id",
          delete: "DELETE /api/conditional-control-logic-viewer/dropdown-options/:id",
        },
      },
    };
  });
  fastify.log.info(
    "  ✓ Registered route: GET /api/conditional-control-logic-viewer (health check)",
  );

  // Register CRUD routes under /api/conditional-control-logic-viewer prefix
  await fastify.register(routes, { prefix: "/api/conditional-control-logic-viewer" });

  // Register static file serving for frontend
  if (_options.appName) {
    const staticRoot = resolve(__dirname, "../../frontend/dist");

    if (!existsSync(staticRoot)) {
      fastify.log.warn(
        `  ⚠ Frontend dist not found, skipping static serving: ${staticRoot}`,
      );
    } else {
      fastify.log.info(
        `→ Setting up frontend static serving via static-app-loader...`,
      );

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
      fastify.log.info(
        `→ Setting up admin UI static serving via static-app-loader...`,
      );

      const { staticAppLoader } = await import("static-app-loader");

      const adminBasePath = `/admin/apps/${_options.adminAppName}`;
      await fastify.register(staticAppLoader, {
        appName: _options.adminAppName,
        basePath: "/admin/apps/",
        rootPath: adminStaticRoot,
        spaMode: true,
        maxAge: process.env.NODE_ENV === "production" ? 86400 : 0,
        defaultContext: {
          basePath: adminBasePath,
        },
      });

      fastify.log.info(
        `  ✓ Registered admin UI at: /admin/apps/${_options.adminAppName}`,
      );
    }
  }

  fastify.log.info("✅ Conditional Control Logic Viewer plugin successfully loaded");

  return Promise.resolve();
}

// Export as Fastify plugin
// NOTE: fp() mutates the function it receives (sets Symbol.for('skip-override')),
// so we wrap in an arrow to keep appConditionalControlLogicViewerPlugin's encapsulation intact.
export default fastifyPlugin(
  (fastify, opts) => appConditionalControlLogicViewerPlugin(fastify, opts),
  { name: "conditional-control-logic-viewer" },
);

// Export the plugin function for direct use (encapsulated — no skip-override)
export { appConditionalControlLogicViewerPlugin };
