/**
 * Figma Component Inspector - Fastify Plugin
 * Provides API routes for the main Fastify server
 */

import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import fastifyPlugin from "fastify-plugin";

import sensible from "@fastify/sensible";
import { resolveApiKey, resolveProviderField } from "@internal/auth-config";
import { resolveFigmaEnv } from "@internal/env-resolver";

import { registerErrorHandlers } from "./plugins/error-handler.mjs";
import { FigmaService } from "./services/figma.service.mjs";
import routes from "./routes/index.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Figma Component Inspector Plugin
 * Registers API endpoints for inspecting Figma components
 *
 * @param {object} fastify - Fastify instance
 * @param {object} _options - Plugin options
 * @param {string} [_options.appName] - URL prefix for serving frontend static files
 * @param {string} [_options.adminAppName] - URL prefix for serving admin UI static files
 * @param {string} [_options.apiPrefix] - URL prefix for API routes
 */
async function figmaComponentInspectorPlugin(fastify, _options) {
  fastify.log.info("-> Initializing Figma Component Inspector plugin...");

  // Register error handler
  registerErrorHandlers(fastify);
  fastify.log.info("  -> Error handlers registered");

  // Register sensible plugin for httpErrors support
  await fastify.register(sensible);

  // Initialize FigmaService using AppYamlConfig provider connection
  // Same connection as test-integration/providers >> figma
  let figmaToken = null;
  let figmaServiceOptions = {};

  if (fastify.config && typeof fastify.config.getNested === "function") {
    const providerConfig = fastify.config.getNested(["providers", "figma"], {});
    figmaToken = resolveApiKey(providerConfig);

    figmaServiceOptions = {
      baseUrl: resolveProviderField(providerConfig, "base_url"),
      proxyUrl: providerConfig.proxy_url,         // false=none, null=env, string=explicit
      verifySsl: providerConfig.verify_ssl,       // boolean (default true)
      extraHeaders: providerConfig.headers || {},  // e.g. { Accept: "application/json" }
    };

    if (figmaToken) {
      fastify.log.info("  -> Figma token resolved from AppYamlConfig providers.figma");
    } else {
      fastify.log.warn("  -> AppYamlConfig providers.figma: no API key resolved");
    }

    const proxyDesc = providerConfig.proxy_url === false ? "disabled"
      : providerConfig.proxy_url === null || providerConfig.proxy_url === undefined ? "env"
      : providerConfig.proxy_url;
    fastify.log.info(`  -> Figma proxy: ${proxyDesc}`);
  }

  // Fallback to env-resolver (for standalone / test usage)
  if (!figmaToken) {
    const _figmaEnv = resolveFigmaEnv();
    figmaToken = _figmaEnv.token || "";
    if (figmaToken) {
      fastify.log.info("  -> Figma token resolved from env-resolver (fallback)");
    } else {
      fastify.log.warn("  -> Figma token not set -- Figma API calls will fail");
    }
  }

  const figmaService = FigmaService.getInstance(figmaToken, figmaServiceOptions);
  fastify.decorate("figmaService", figmaService);
  fastify.log.info("  -> FigmaService initialized and decorated");

  const apiPrefix =
    _options.apiPrefix || "/~/api/figma_component_inspector";

  // Health check endpoint at API root
  fastify.get(apiPrefix, async (_request, _reply) => {
    return {
      status: "ok",
      service: "figma-component-inspector",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      endpoints: {
        health: `GET ${apiPrefix}`,
        figmaFile: `GET ${apiPrefix}/figma/files/:fileId`,
        figmaImages: `GET ${apiPrefix}/figma/images/:fileId`,
        figmaVariables: `GET ${apiPrefix}/figma/variables/:fileId`,
        figmaNode: `GET ${apiPrefix}/figma/node/:fileId/:nodeId`,
        figmaComponents: `GET ${apiPrefix}/figma/components/:fileId`,
        figmaComments: `GET ${apiPrefix}/figma/files/:fileId/comments`,
      },
    };
  });
  fastify.log.info(
    `  -> Registered route: GET ${apiPrefix} (health check)`,
  );

  // Register CRUD routes under API prefix
  await fastify.register(routes, { prefix: apiPrefix });

  // Register static file serving for frontend
  if (_options.appName) {
    const staticRoot = resolve(__dirname, "../../frontend/dist");

    if (!existsSync(staticRoot)) {
      fastify.log.warn(
        `  ⚠ Frontend dist not found, skipping static serving: ${staticRoot}`,
      );
    } else {
      fastify.log.info(
        `-> Setting up frontend static serving via static-app-loader...`,
      );

      const { staticAppLoader } = await import("static-app-loader");

      await fastify.register(staticAppLoader, {
        appName: _options.appName,
        rootPath: staticRoot,
        spaMode: true,
        maxAge: process.env.NODE_ENV === "production" ? 86400 : 0,
      });

      fastify.log.info(
        `  -> Registered static assets at: ${_options.appName}`,
      );
    }
  }

  // Register static file serving for admin UI
  if (_options.adminAppName) {
    const adminStaticRoot = resolve(
      __dirname,
      "../../frontend-admin/dist",
    );

    if (!existsSync(adminStaticRoot)) {
      fastify.log.warn(
        `  ⚠ Admin UI dist not found, skipping static serving: ${adminStaticRoot}`,
      );
    } else {
      fastify.log.info(
        `-> Setting up admin UI static serving via static-app-loader...`,
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
        `  -> Registered admin UI at: /admin/apps/${_options.adminAppName}`,
      );
    }
  }

  fastify.log.info(
    "Figma Component Inspector plugin successfully loaded",
  );

  return Promise.resolve();
}

// Export as Fastify plugin
// NOTE: fp() mutates the function it receives (sets Symbol.for('skip-override')),
// so we wrap in an arrow to keep figmaComponentInspectorPlugin's encapsulation intact for direct use.
export default fastifyPlugin(
  (fastify, opts) => figmaComponentInspectorPlugin(fastify, opts),
  { name: "figma-component-inspector" },
);

// Export the plugin function for direct use (encapsulated -- no skip-override)
export { figmaComponentInspectorPlugin };
