/**
 * App Rule Tree Table - Fastify Plugin
 * Provides API routes for managing hierarchical rule trees
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
 * App Rule Tree Table Plugin
 * Registers API endpoints for rule tree management
 *
 * @param {object} fastify - Fastify instance
 * @param {object} _options - Plugin options
 * @param {string} [options.appName] - URL prefix for serving frontend static files (at /apps/{appName})
 * @param {string} [options.adminAppName] - URL prefix for serving admin UI static files (at /admin/apps/{adminAppName})
 * @param {string} [_options.apiPrefix] - URL prefix for API routes
 */
async function ruleTreeTablePlugin(fastify, options) {
  const { apiPrefix = "/api/rule-tree-table" } = options;

  fastify.log.info("→ Initializing Rule Tree Table plugin...");

  // Register error handler
  registerErrorHandlers(fastify);
  fastify.log.info("  ✓ Error handlers registered");

  // Register sensible plugin for httpErrors support
  await fastify.register(sensible);

  // Register database plugin
  await fastify.register(databasePlugin);
  fastify.log.info("  ✓ Database plugin registered");

  // Health check endpoint
  fastify.get(apiPrefix, async (_request, _reply) => {
    // Attempt to gather stats from first tree if available
    let stats = { total: 0, groups: 0, conditions: 0, enabled: 0 };
    try {
      const { RuleTree, RuleItem } = fastify.db;
      const treeCount = await RuleTree.count();
      const itemCount = await RuleItem.count();
      stats = { trees: treeCount, totalItems: itemCount };
    } catch {
      // DB may not be ready
    }

    return {
      status: "ok",
      service: "rule-tree-table",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      stats,
      endpoints: {
        health: `GET ${apiPrefix}`,
        trees: {
          list: `GET ${apiPrefix}/trees`,
          get: `GET ${apiPrefix}/trees/:id`,
          create: `POST ${apiPrefix}/trees`,
          update: `PUT ${apiPrefix}/trees/:id`,
          delete: `DELETE ${apiPrefix}/trees/:id`,
        },
        rules: {
          get: `GET ${apiPrefix}/rules`,
          save: `POST ${apiPrefix}/rules`,
          validate: `POST ${apiPrefix}/rules/validate`,
        },
      },
    };
  });
  fastify.log.info(
    `  ✓ Registered route: GET ${apiPrefix} (health check)`,
  );

  // Register CRUD routes under apiPrefix
  await fastify.register(routes, { prefix: apiPrefix });

  // Register static file serving for frontend
  if (options.appName) {
    const staticRoot = resolve(__dirname, "../../frontend/dist");
    if (existsSync(staticRoot)) {
      const { staticAppLoader } = await import("static-app-loader");
      await fastify.register(staticAppLoader, {
        appName: options.appName,
        rootPath: staticRoot,
        spaMode: true,
        maxAge: process.env.NODE_ENV === "production" ? 86400 : 0,
      });
      fastify.log.info(`  ✓ Registered static assets at: ${options.appName}`);
    } else {
      fastify.log.warn(`  ⚠ Frontend dist not found at ${staticRoot} — skipping static serving`);
    }
  }

  // Register static file serving for admin UI
  if (options.adminAppName) {
    const adminStaticRoot = resolve(__dirname, "../../frontend-admin/dist");
    if (existsSync(adminStaticRoot)) {
      const { staticAppLoader } = await import("static-app-loader");
      const adminBasePath = `/admin/apps/${options.adminAppName}`;
      await fastify.register(staticAppLoader, {
        appName: options.adminAppName,
        basePath: "/admin/apps/",
        rootPath: adminStaticRoot,
        spaMode: true,
        maxAge: process.env.NODE_ENV === "production" ? 86400 : 0,
        defaultContext: {
          basePath: adminBasePath,
        },
      });
      fastify.log.info(`  ✓ Registered admin UI at: /admin/apps/${options.adminAppName}`);
    } else {
      fastify.log.warn(`  ⚠ Admin dist not found at ${adminStaticRoot} — skipping admin static serving`);
    }
  }

  fastify.log.info("✅ Rule Tree Table plugin successfully loaded");

  return Promise.resolve();
}

// Export as Fastify plugin (supports both v4 and v5)
// NOTE: fp() mutates the function it receives (sets Symbol.for('skip-override')),
// so we wrap in an arrow to keep ruleTreeTablePlugin's encapsulation intact for direct use.
export default fastifyPlugin(
  (fastify, opts) => ruleTreeTablePlugin(fastify, opts),
  { name: "rule-tree-table" },
);

// Export the plugin function for direct use (encapsulated — no skip-override)
export { ruleTreeTablePlugin };
