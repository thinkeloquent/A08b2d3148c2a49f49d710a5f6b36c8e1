/**
 * UI Component Metadata - Fastify Plugin
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
 * UI Component Metadata Plugin
 * Registers API endpoints
 *
 * @param {object} fastify - Fastify instance
 * @param {object} _options - Plugin options
 * @param {string} [_options.appName] - URL prefix for serving frontend static files (at /apps/{appName})
 * @param {string} [_options.adminAppName] - URL prefix for serving admin UI static files (at /admin/apps/{adminAppName})
 * @param {string} [_options.apiPrefix] - URL prefix for API routes
 */
async function uiComponentMetadataPlugin(fastify, _options) {
  fastify.log.info("→ Initializing UI Component Metadata plugin...");

  // Register error handler
  registerErrorHandlers(fastify);
  fastify.log.info("  ✓ Error handlers registered");

  // Register sensible plugin for httpErrors support
  await fastify.register(sensible);

  // Register database plugin
  await fastify.register(databasePlugin);
  fastify.log.info("  ✓ Database plugin registered");

  // Health check endpoint
  fastify.get("/api/ui-component-metadata", async (_request, _reply) => {
    return {
      status: "ok",
      service: "ui-component-metadata",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      endpoints: {
        health: "GET /api/ui-component-metadata",
        components: {
          list: "GET /api/ui-component-metadata/components",
          get: "GET /api/ui-component-metadata/components/:id",
          create: "POST /api/ui-component-metadata/components",
          update: "PUT /api/ui-component-metadata/components/:id",
          delete: "DELETE /api/ui-component-metadata/components/:id",
        },
        tags: {
          list: "GET /api/ui-component-metadata/tags",
          get: "GET /api/ui-component-metadata/tags/:id",
          create: "POST /api/ui-component-metadata/tags",
          update: "PUT /api/ui-component-metadata/tags/:id",
          delete: "DELETE /api/ui-component-metadata/tags/:id",
        },
      },
    };
  });
  fastify.log.info(
    "  ✓ Registered route: GET /api/ui-component-metadata (health check)",
  );

  // Register CRUD routes under /api/ui-component-metadata prefix
  await fastify.register(routes, { prefix: "/api/ui-component-metadata" });

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
      fastify.log.warn(
        `  ⚠ Run the frontend-admin build to enable the admin UI`,
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

  fastify.log.info("✅ UI Component Metadata plugin successfully loaded");

  return Promise.resolve();
}

// Export as Fastify plugin (supports both v4 and v5)
// NOTE: fp() mutates the function it receives (sets Symbol.for('skip-override')),
// so we wrap in an arrow to keep uiComponentMetadataPlugin's encapsulation intact for direct use.
export default fastifyPlugin(
  (fastify, opts) => uiComponentMetadataPlugin(fastify, opts),
  { name: "ui-component-metadata" },
);

// Export the plugin function for direct use (encapsulated — no skip-override)
export { uiComponentMetadataPlugin };
