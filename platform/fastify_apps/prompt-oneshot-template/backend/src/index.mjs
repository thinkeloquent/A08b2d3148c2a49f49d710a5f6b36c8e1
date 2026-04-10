/**
 * Prompt Oneshot Template - Fastify Plugin
 * Provides API routes and frontend serving for the document template authoring workspace
 */

import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import fastifyPlugin from "fastify-plugin";

import sensible from "@fastify/sensible";

import { registerErrorHandlers } from "./plugins/error-handler.mjs";
import routes from "./routes/index.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Prompt Oneshot Template Plugin
 *
 * @param {object} fastify - Fastify instance
 * @param {object} _options - Plugin options
 * @param {string} [_options.appName] - URL prefix for serving frontend static files
 * @param {string} [_options.adminAppName] - URL prefix for serving admin UI static files
 */
async function promptOneshotTemplatePlugin(fastify, _options) {
  fastify.log.info("→ Initializing Prompt Oneshot Template plugin...");

  // Register error handler
  registerErrorHandlers(fastify);
  fastify.log.info("  ✓ Error handlers registered");

  // Register sensible plugin for httpErrors support
  await fastify.register(sensible);

  // Health check endpoint
  fastify.get("/api/prompt-oneshot-template", async (_request, _reply) => {
    return {
      status: "ok",
      service: "prompt-oneshot-template",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      endpoints: {
        health: "GET /api/prompt-oneshot-template",
        templates: {
          list: "GET /api/prompt-oneshot-template/templates",
          get: "GET /api/prompt-oneshot-template/templates/:id",
        },
        categories: {
          list: "GET /api/prompt-oneshot-template/categories",
        },
      },
    };
  });
  fastify.log.info(
    "  ✓ Registered route: GET /api/prompt-oneshot-template (health check)",
  );

  // Register routes under /api/prompt-oneshot-template prefix
  await fastify.register(routes, { prefix: "/api/prompt-oneshot-template" });
  fastify.log.info("  ✓ Template routes registered");

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

  fastify.log.info("✅ Prompt Oneshot Template plugin successfully loaded");

  return Promise.resolve();
}

// Export as Fastify plugin
// NOTE: fp() mutates the function it receives (sets Symbol.for('skip-override')),
// so we wrap in an arrow to keep promptOneshotTemplatePlugin's encapsulation intact.
export default fastifyPlugin(
  (fastify, opts) => promptOneshotTemplatePlugin(fastify, opts),
  { name: "prompt-oneshot-template" },
);

// Export the plugin function for direct use (encapsulated — no skip-override)
export { promptOneshotTemplatePlugin };
