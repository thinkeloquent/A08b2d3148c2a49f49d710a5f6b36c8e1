/**
 * Component Registry - Fastify Plugin
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
 * Component Registry Plugin
 * Registers API endpoints
 *
 * @param {object} fastify - Fastify instance
 * @param {object} _options - Plugin options
 * @param {string} [_options.appName] - URL prefix for serving frontend static files
 * @param {string} [_options.adminAppName] - URL prefix for serving admin UI static files
 */
async function appComponentRegistryPlugin(fastify, _options) {
  fastify.log.info("→ Initializing Component Registry plugin...");

  // Register error handler
  registerErrorHandlers(fastify);
  fastify.log.info("  ✓ Error handlers registered");

  // Register sensible plugin for httpErrors support
  await fastify.register(sensible);

  // Register database plugin
  await fastify.register(databasePlugin);
  fastify.log.info("  ✓ Database plugin registered");

  // Health check endpoint
  fastify.get("/api/component-registry", async (_request, _reply) => {
    return {
      status: "ok",
      service: "component-registry",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      endpoints: {
        health: "GET /api/component-registry",
        components: {
          list: "GET /api/component-registry/components",
          get: "GET /api/component-registry/components/:id",
          create: "POST /api/component-registry/components",
          update: "PUT /api/component-registry/components/:id",
          delete: "DELETE /api/component-registry/components/:id",
        },
        tags: {
          list: "GET /api/component-registry/tags",
          create: "POST /api/component-registry/tags",
          update: "PUT /api/component-registry/tags/:id",
          delete: "DELETE /api/component-registry/tags/:id",
        },
        categories: {
          list: "GET /api/component-registry/categories",
          create: "POST /api/component-registry/categories",
          update: "PUT /api/component-registry/categories/:id",
          delete: "DELETE /api/component-registry/categories/:id",
        },
      },
    };
  });
  fastify.log.info(
    "  ✓ Registered route: GET /api/component-registry (health check)",
  );

  // Register CRUD routes under /api/component-registry prefix
  await fastify.register(routes, { prefix: "/api/component-registry" });

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

  fastify.log.info("✅ Component Registry plugin successfully loaded");

  return Promise.resolve();
}

// Export as Fastify plugin
// NOTE: fp() mutates the function it receives (sets Symbol.for('skip-override')),
// so we wrap in an arrow to keep appComponentRegistryPlugin's encapsulation intact.
export default fastifyPlugin(
  (fastify, opts) => appComponentRegistryPlugin(fastify, opts),
  { name: "component-registry" },
);

// Export the plugin function for direct use (encapsulated — no skip-override)
export { appComponentRegistryPlugin };
