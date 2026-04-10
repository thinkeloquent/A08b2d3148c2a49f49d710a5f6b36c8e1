/**
 * Form Builder - Fastify Plugin
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
 * Form Builder Plugin
 * Registers API endpoints
 *
 * @param {object} fastify - Fastify instance
 * @param {object} _options - Plugin options
 * @param {string} [_options.appName] - URL prefix for serving frontend static files (at /apps/{appName})
 * @param {string} [_options.adminAppName] - URL prefix for serving admin UI static files (at /admin/apps/{adminAppName})
 * @param {string} [_options.apiPrefix] - URL prefix for API routes
 */
async function formBuilderPlugin(fastify, _options) {
  fastify.log.info("→ Initializing Form Builder plugin...");

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
  fastify.get("/api/form-builder", async (_request, _reply) => {
    return {
      status: "ok",
      service: "form-builder",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      endpoints: {
        health: "GET /api/form-builder",
        forms: {
          list: "GET /api/form-builder/forms",
          get: "GET /api/form-builder/forms/:id",
          create: "POST /api/form-builder/forms",
          update: "PUT /api/form-builder/forms/:id",
          delete: "DELETE /api/form-builder/forms/:id",
          import: "POST /api/form-builder/forms/import",
          export: "GET /api/form-builder/forms/:id/export",
        },
        versions: {
          list: "GET /api/form-builder/forms/:id/versions",
          create: "POST /api/form-builder/forms/:id/versions",
          get: "GET /api/form-builder/forms/:id/versions/:vid",
          restore: "POST /api/form-builder/forms/:id/versions/:vid/restore",
        },
        tags: {
          list: "GET /api/form-builder/tags",
          get: "GET /api/form-builder/tags/:id",
          create: "POST /api/form-builder/tags",
          update: "PUT /api/form-builder/tags/:id",
          delete: "DELETE /api/form-builder/tags/:id",
        },
      },
    };
  });
  fastify.log.info(
    "  ✓ Registered route: GET /api/form-builder (health check)",
  );

  // Register CRUD routes under /api/form-builder prefix
  await fastify.register(routes, { prefix: "/api/form-builder" });

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

  fastify.log.info("✅ Form Builder plugin successfully loaded");

  return Promise.resolve();
}

// Export as Fastify plugin (supports both v4 and v5)
// NOTE: fp() mutates the function it receives (sets Symbol.for('skip-override')),
// so we wrap in an arrow to keep formBuilderPlugin's encapsulation intact for direct use.
export default fastifyPlugin(
  (fastify, opts) => formBuilderPlugin(fastify, opts),
  { name: "form-builder" },
);

// Export the plugin function for direct use (encapsulated — no skip-override)
export { formBuilderPlugin };
