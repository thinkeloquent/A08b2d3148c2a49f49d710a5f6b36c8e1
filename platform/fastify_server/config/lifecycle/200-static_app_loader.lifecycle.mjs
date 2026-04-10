/**
 * Static App Loader Lifecycle Module
 *
 * Registers frontend apps using the static-app-loader SDK.
 * Replaces manual route files like app_test_integration_endpoints.route.mjs
 * with a declarative configuration approach.
 */

import { staticAppLoader, createMultiAppLoader } from "static-app-loader";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Get the frontend apps directory path.
 */
function getFrontendAppsDir() {
  return path.resolve(__dirname, "..", "..", "..", "frontend_apps");
}

/**
 * Static app configurations.
 * Add new frontend apps here.
 */
function getAppConfigs(frontendAppsDir) {
  return [
    {
      // Use 'app/test-integration-endpoints' to match legacy route: /app/test-integration-endpoints
      appName: "test-integration/gemini-openai-sdk",
      rootPath: path.join(
        frontendAppsDir,
        "test-integration-gemini-openai-sdk",
        "dist",
      ),
      spaMode: true,
      maxAge: process.env.NODE_ENV === "production" ? 86400 : 0,
    },
    {
      // Embedding endpoints tester app
      appName: "test-integration/embedding-endpoints",
      rootPath: path.join(
        frontendAppsDir,
        "test-integration-embedding-endpoints",
        "dist",
      ),
      spaMode: true,
      maxAge: process.env.NODE_ENV === "production" ? 86400 : 0,
    },
    {
      // Provider integration health tester app
      appName: "test-integration/providers",
      rootPath: path.join(
        frontendAppsDir,
        "test-integration-providers",
        "dist",
      ),
      spaMode: true,
      maxAge: process.env.NODE_ENV === "production" ? 86400 : 0,
    },
    {
      // Storage integration health tester app
      appName: "test-integration/storage",
      rootPath: path.join(frontendAppsDir, "test-integration-storage", "dist"),
      spaMode: true,
      maxAge: process.env.NODE_ENV === "production" ? 86400 : 0,
    },
    {
      // RAG integration tester app
      appName: "test-integration/rag-001",
      rootPath: path.join(
        frontendAppsDir,
        "test-integration-rag-001",
        "dist",
      ),
      spaMode: true,
      maxAge: process.env.NODE_ENV === "production" ? 86400 : 0,
    },
    {
      // Test integrations hub - links to all test integration apps
      appName: "test-integrations",
      rootPath: path.join(frontendAppsDir, "test-integrations", "dist"),
      spaMode: true,
      maxAge: process.env.NODE_ENV === "production" ? 86400 : 0,
    },
    {
      // Clipboard to Markdown converter
      appName: "clipboard2md",
      rootPath: path.join(frontendAppsDir, "clipboard2md", "dist"),
      spaMode: true,
      maxAge: process.env.NODE_ENV === "production" ? 86400 : 0,
    },
    {
      // GitHub File Metadata Retrieval
      appName: "github-file-metadata-retrieval",
      rootPath: path.join(frontendAppsDir, "github_file_metadata_retrieval", "dist"),
      spaMode: true,
      maxAge: process.env.NODE_ENV === "production" ? 86400 : 0,
    },
    {
      // Figma File Navigator — hierarchical file tree canvas
      appName: "figma-file-navigator",
      rootPath: path.join(frontendAppsDir, "figma-file-navigator", "dist"),
      spaMode: true,
      maxAge: process.env.NODE_ENV === "production" ? 86400 : 0,
    },
    {
      // Organization Management — standalone CRUD app
      appName: "organizations",
      rootPath: path.join(frontendAppsDir, "organization", "dist"),
      spaMode: true,
      maxAge: process.env.NODE_ENV === "production" ? 86400 : 0,
    },
  ];
}

/**
 * Register static frontend apps on startup.
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config
 */
export async function onStartup(server, config) {
  server.log.info("[lifecycle:static-app-loader] Registering static frontend apps...");

  try {
    const frontendAppsDir = getFrontendAppsDir();
    server.log.info({ frontendAppsDir }, "[lifecycle:static-app-loader] Resolved frontend apps directory");

    const appConfigs = getAppConfigs(frontendAppsDir);
    server.log.info({ totalApps: appConfigs.length }, "[lifecycle:static-app-loader] Total configured static apps");

    // Filter out apps whose dist directories don't exist
    const availableApps = [];
    for (const appConfig of appConfigs) {
      const { existsSync } = await import("fs");
      if (existsSync(appConfig.rootPath)) {
        availableApps.push(appConfig);
        server.log.debug({ appName: appConfig.appName, rootPath: appConfig.rootPath }, "[lifecycle:static-app-loader] Static app dist found");
      } else {
        server.log.warn(
          { appName: appConfig.appName, rootPath: appConfig.rootPath },
          `[lifecycle:static-app-loader] Static app dist not found, skipping: ${appConfig.appName}`,
        );
      }
    }

    server.log.info({ available: availableApps.length, total: appConfigs.length }, "[lifecycle:static-app-loader] Available static apps after filtering");

    if (availableApps.length === 0) {
      server.log.info("[lifecycle:static-app-loader] No static apps to register");
      return;
    }

    // Use the multi-app loader for batch registration
    const loader = createMultiAppLoader()
      .onCollision("warn")
      .logger({
        info: (msg, ctx) => server.log.info(ctx, msg),
        warn: (msg, ctx) => server.log.warn(ctx, msg),
        error: (msg, ctx) => server.log.error(ctx, msg),
        debug: (msg, ctx) => server.log.debug(ctx, msg),
        trace: (msg, ctx) => server.log.trace(ctx, msg),
      });

    // Add all available apps to the loader
    for (const appConfig of availableApps) {
      loader.addAppConfig(appConfig);
    }

    server.log.info("[lifecycle:static-app-loader] Starting batch registration");
    const results = await loader.register(server);

    const successCount = results.filter((r) => r.success).length;
    server.log.info(
      { successCount, totalAttempted: availableApps.length },
      `[lifecycle:static-app-loader] Registered ${successCount}/${availableApps.length} static apps`,
    );

    // Log registered routes
    for (const result of results) {
      if (result.success) {
        server.log.info(
          { appName: result.appName, routePrefix: result.routePrefix },
          `[lifecycle:static-app-loader] Static app registered: ${result.appName} at ${result.routePrefix}`,
        );
      } else {
        server.log.error(
          { appName: result.appName, error: result.error },
          `[lifecycle:static-app-loader] Failed to register static app: ${result.appName}`,
        );
      }
    }
  } catch (err) {
    server.log.error({ err, hookName: '200-static_app_loader' }, '[lifecycle:static-app-loader] Static app loader initialization failed');
    throw err;
  }
}
