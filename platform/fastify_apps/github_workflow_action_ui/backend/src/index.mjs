/**
 * GitHub Workflow Action UI - Fastify Plugin
 *
 * Thin integration layer:
 * - Serves frontend SPA and admin SPA via static-app-loader
 * - Provides app-level health/config endpoints
 * - Error handling
 *
 * All GitHub API data flows through the existing polyglot proxy
 * at /~/api/rest/02-01-2026/providers/github_api/2022-11-28
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
 * @param {import('fastify').FastifyInstance} fastify
 * @param {object} _options
 * @param {string} [_options.appName] - Frontend SPA route name (at /apps/{appName})
 * @param {string} [_options.adminAppName] - Admin SPA route name (at /admin/apps/{adminAppName})
 * @param {string} [_options.apiPrefix] - API route prefix (default: /~/api/github_workflow_action_ui)
 */
async function githubWorkflowActionUiPlugin(fastify, _options) {
  const apiPrefix = _options.apiPrefix || "/~/api/github_workflow_action_ui";

  fastify.log.info("→ Initializing GitHub Workflow Action UI plugin...");

  // Register sensible plugin for httpErrors support (skip if already registered)
  if (!fastify.hasDecorator("httpErrors")) {
    await fastify.register(sensible);
  }

  // Register error handler (direct call, not fp-wrapped — avoids FSTWRN004)
  registerErrorHandlers(fastify);
  fastify.log.info("  ✓ Error handlers registered");

  // Health/info endpoint
  fastify.get(`${apiPrefix}`, async () => ({
    status: "ok",
    service: "github-workflow-action-ui",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: `GET ${apiPrefix}`,
      healthDetailed: `GET ${apiPrefix}/health`,
      config: `GET ${apiPrefix}/config`,
    },
  }));
  fastify.log.info(`  ✓ Registered route: GET ${apiPrefix} (info)`);

  // Register CRUD routes under API prefix
  await fastify.register(routes, { prefix: apiPrefix });

  // Register static file serving for frontend
  if (_options.appName) {
    const staticRoot = resolve(__dirname, "../../frontend/dist");

    if (!existsSync(staticRoot)) {
      fastify.log.warn(`  ⚠ Frontend dist not found, skipping static serving: ${staticRoot}`);
    } else {
      fastify.log.info("→ Setting up frontend static serving via static-app-loader...");

      const { staticAppLoader } = await import("static-app-loader");

      await fastify.register(staticAppLoader, {
        appName: _options.appName,
        rootPath: staticRoot,
        spaMode: true,
        maxAge: process.env.NODE_ENV === "production" ? 86400 : 0,
      });

      fastify.log.info(`  ✓ Registered static assets at: /apps/${_options.appName}`);
    }
  }

  // Register static file serving for admin UI
  if (_options.adminAppName) {
    const adminStaticRoot = resolve(__dirname, "../../frontend-admin/dist");

    if (!existsSync(adminStaticRoot)) {
      fastify.log.warn(`  ⚠ Admin UI dist not found, skipping static serving: ${adminStaticRoot}`);
    } else {
      fastify.log.info("→ Setting up admin UI static serving via static-app-loader...");

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

      fastify.log.info(`  ✓ Registered admin UI at: ${adminBasePath}`);
    }
  }

  fastify.log.info("✅ GitHub Workflow Action UI plugin successfully loaded");

  return Promise.resolve();
}

// fp-wrapped export (arrow wrapper to avoid skip-override mutation)
export default fastifyPlugin(
  (fastify, opts) => githubWorkflowActionUiPlugin(fastify, opts),
  { name: "github-workflow-action-ui" },
);

// Named raw export for direct usage (encapsulated — no skip-override)
export { githubWorkflowActionUiPlugin };
