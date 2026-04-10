/**
 * Ai Ask V2 - Fastify Plugin
 * Provides API routes for personas and LLM defaults
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
 * Ai Ask V2 Plugin
 * Registers API endpoints for personas and LLM defaults
 *
 * @param {object} fastify - Fastify instance
 * @param {object} _options - Plugin options
 * @param {string} [_options.appName] - URL prefix for serving frontend static files
 * @param {string} [_options.adminAppName] - URL prefix for serving admin UI static files
 * @param {string} [_options.apiPrefix] - URL prefix for API routes
 */
async function appAiAskV2Plugin(fastify, _options) {
  fastify.log.info("→ Initializing Ai Ask V2 plugin...");

  // Register error handler
  registerErrorHandlers(fastify);
  fastify.log.info("  ✓ Error handlers registered");

  // Register sensible plugin for httpErrors support
  await fastify.register(sensible);

  // Register database plugin
  await fastify.register(databasePlugin);
  fastify.log.info("  ✓ Database plugin registered");

  // Health check endpoint
  fastify.get("/api/ai-ask-v2", async (_request, _reply) => {
    return {
      status: "ok",
      service: "ai-ask-v2",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      endpoints: {
        health: "GET /api/ai-ask-v2",
        personas: {
          list: "GET /api/ai-ask-v2/personas",
          get: "GET /api/ai-ask-v2/personas/:id",
          create: "POST /api/ai-ask-v2/personas",
          update: "PUT /api/ai-ask-v2/personas/:id",
          delete: "DELETE /api/ai-ask-v2/personas/:id",
        },
        llmDefaults: {
          list: "GET /api/ai-ask-v2/llm-defaults",
          getByCategory: "GET /api/ai-ask-v2/llm-defaults/category/:category",
          get: "GET /api/ai-ask-v2/llm-defaults/:id",
          create: "POST /api/ai-ask-v2/llm-defaults",
          update: "PUT /api/ai-ask-v2/llm-defaults/:id",
          delete: "DELETE /api/ai-ask-v2/llm-defaults/:id",
        },
      },
    };
  });
  fastify.log.info("  ✓ Registered route: GET /api/ai-ask-v2 (health check)");

  // Register CRUD routes under /api/ai-ask-v2 prefix
  await fastify.register(routes, { prefix: "/api/ai-ask-v2" });

  // Register static file serving for frontend
  if (_options.appName) {
    const staticRoot = resolve(__dirname, "../../frontend/dist");

    if (!existsSync(staticRoot)) {
      fastify.log.warn(
        `  ⚠ Frontend dist not found, skipping static serving: ${staticRoot}`,
      );
    } else {
      fastify.log.info(`→ Setting up frontend static serving via static-app-loader...`);

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
      fastify.log.info(`→ Setting up admin UI static serving via static-app-loader...`);

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

      fastify.log.info(`  ✓ Registered admin UI at: /admin/apps/${_options.adminAppName}`);
    }
  }

  fastify.log.info("✅ Ai Ask V2 plugin successfully loaded");

  return Promise.resolve();
}

// Export as Fastify plugin
// NOTE: fp() mutates the function it receives (sets Symbol.for('skip-override')),
// so we wrap in an arrow to keep appAiAskV2Plugin's encapsulation intact for direct use.
export default fastifyPlugin(
  (fastify, opts) => appAiAskV2Plugin(fastify, opts),
  { name: "ai-ask-v2" },
);

// Export the plugin function for direct use (encapsulated — no skip-override)
export { appAiAskV2Plugin };
