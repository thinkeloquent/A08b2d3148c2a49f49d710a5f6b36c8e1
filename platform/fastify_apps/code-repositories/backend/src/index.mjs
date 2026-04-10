/**
 * App Code Repos - Fastify Plugin
 * Provides API routes for the main Fastify server
 */

import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import fastifyPlugin from "fastify-plugin";

import sensible from "@fastify/sensible";

import { registerErrorHandlers } from "./plugins/error-handler.mjs";
import databasePlugin from "./plugins/database.mjs";
import contentNegotiationPlugin from "./plugins/content-negotiation.mjs";
import routes from "./routes/index.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * App Code Repos Plugin
 * Registers API endpoints
 *
 * @param {object} fastify - Fastify instance
 * @param {object} _options - Plugin options
 * @param {string} [_options.appName] - URL prefix for serving frontend static files (at /apps/{appName})
 * @param {string} [_options.adminAppName] - URL prefix for serving admin UI static files (at /admin/apps/{adminAppName})
 * @param {string} [_options.apiPrefix] - URL prefix for API routes
 */
async function appCodeRepositoriesPlugin(fastify, _options) {
  fastify.log.info("→ Initializing App Code Repos plugin...");

  // Register error handler
  registerErrorHandlers(fastify);
  fastify.log.info("  ✓ Error handlers registered");

  // Register sensible plugin for httpErrors support
  await fastify.register(sensible);

  // Register database plugin
  await fastify.register(databasePlugin);
  fastify.log.info("  ✓ Database plugin registered");

  // Register content negotiation plugin for protobuf support
  await fastify.register(contentNegotiationPlugin);
  fastify.log.info("  ✓ Content negotiation plugin registered");

  // Health check endpoint
  fastify.get("/api/code-repositories", async (_request, _reply) => {
    return {
      status: "ok",
      service: "code-repositories",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      endpoints: {
        health: "GET /api/code-repositories",
        repos: {
          list: "GET /api/code-repositories/repos",
          get: "GET /api/code-repositories/repos/:id",
          create: "POST /api/code-repositories/repos",
          update: "PUT /api/code-repositories/repos/:id",
          delete: "DELETE /api/code-repositories/repos/:id",
        },
        tags: {
          list: "GET /api/code-repositories/tags",
          get: "GET /api/code-repositories/tags/:id",
          create: "POST /api/code-repositories/tags",
          update: "PUT /api/code-repositories/tags/:id",
          delete: "DELETE /api/code-repositories/tags/:id",
        },
        metadata: {
          list: "GET /api/code-repositories/repos/:repoId/metadata",
          get: "GET /api/code-repositories/metadata/:id",
          create: "POST /api/code-repositories/repos/:repoId/metadata",
          update: "PUT /api/code-repositories/metadata/:id",
          delete: "DELETE /api/code-repositories/metadata/:id",
        },
      },
    };
  });
  fastify.log.info(
    "  ✓ Registered route: GET /api/code-repositories (health check)",
  );

  // Register CRUD routes under /api/code-repositories prefix
  await fastify.register(routes, { prefix: "/api/code-repositories" });

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

  fastify.log.info("✅ App Code Repos plugin successfully loaded");

  return Promise.resolve();
}

// Export as Fastify plugin (supports both v4 and v5)
// NOTE: fp() mutates the function it receives (sets Symbol.for('skip-override')),
// so we wrap in an arrow to keep appCodeRepositoriesPlugin's encapsulation intact for direct use.
export default fastifyPlugin(
  (fastify, opts) => appCodeRepositoriesPlugin(fastify, opts),
  { name: "code-repositories" },
);

// Export the plugin function for direct use (encapsulated — no skip-override)
export { appCodeRepositoriesPlugin };
