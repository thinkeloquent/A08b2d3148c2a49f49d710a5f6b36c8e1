/**
 * Prompt Management System - Fastify Plugin
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

async function appPromptManagementSystemPlugin(fastify, _options) {
  fastify.log.info("→ Initializing Prompt Management System plugin...");

  // Register error handler (direct call, NOT fp-wrapped)
  registerErrorHandlers(fastify);
  fastify.log.info("  ✓ Error handlers registered");

  // Register sensible plugin for httpErrors support
  await fastify.register(sensible);

  // Register database plugin
  await fastify.register(databasePlugin);
  fastify.log.info("  ✓ Database plugin registered");

  // Health check endpoint
  fastify.get("/api/prompt-management-system", async (_request, _reply) => {
    return {
      status: "ok",
      service: "prompt-management-system",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      endpoints: {
        health: "GET /api/prompt-management-system",
        projects: {
          list: "GET /api/prompt-management-system/projects",
          get: "GET /api/prompt-management-system/projects/:id",
          create: "POST /api/prompt-management-system/projects",
          update: "PUT /api/prompt-management-system/projects/:id",
          delete: "DELETE /api/prompt-management-system/projects/:id",
        },
        prompts: {
          list: "GET /api/prompt-management-system/prompts",
          get: "GET /api/prompt-management-system/prompts/:id",
          create: "POST /api/prompt-management-system/prompts",
          update: "PUT /api/prompt-management-system/prompts/:id",
          delete: "DELETE /api/prompt-management-system/prompts/:id",
        },
        versions: {
          list: "GET /api/prompt-management-system/prompts/:promptId/versions",
          get: "GET /api/prompt-management-system/prompts/:promptId/versions/:id",
          create: "POST /api/prompt-management-system/prompts/:promptId/versions",
        },
        deployments: {
          list: "GET /api/prompt-management-system/prompts/:promptId/deployments",
          deploy: "POST /api/prompt-management-system/prompts/:promptId/deploy",
          getByEnv: "GET /api/prompt-management-system/prompts/:slug/:environment",
        },
        render: "POST /api/prompt-management-system/prompts/:slug/render",
      },
    };
  });
  fastify.log.info("  ✓ Registered route: GET /api/prompt-management-system (health check)");

  // Register CRUD routes
  await fastify.register(routes, { prefix: "/api/prompt-management-system" });

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

  fastify.log.info("✅ Prompt Management System plugin successfully loaded");

  return Promise.resolve();
}

// Export as Fastify plugin
// NOTE: fp() mutates the function it receives (sets Symbol.for('skip-override')),
// so we wrap in an arrow to keep appPromptManagementSystemPlugin's encapsulation intact.
export default fastifyPlugin(
  (fastify, opts) => appPromptManagementSystemPlugin(fastify, opts),
  { name: "prompt-management-system" },
);

// Export the plugin function for direct use (encapsulated — no skip-override)
export { appPromptManagementSystemPlugin };
