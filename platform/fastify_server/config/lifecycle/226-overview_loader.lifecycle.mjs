/**
 * Overview Loader Lifecycle Module
 *
 * Registers the Overview dashboard plugin.
 */

import { overviewPlugin } from "@internal/fastify-app-overview";

/**
 * Register Overview plugin on startup.
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config
 */
export async function onStartup(server, config) {
  server.log.info("[lifecycle:overview_loader] Initializing Overview plugin...");

  try {
    server.log.info("[lifecycle:overview_loader] Registering Overview plugin");
    await server.register(overviewPlugin, {
      appName: "overview",
      apiPrefix: "/~/api/overview",
    });
    server.log.info("[lifecycle:overview_loader] Overview plugin registered successfully");
  } catch (err) {
    server.log.error(
      { err, hookName: "226-overview_loader" },
      "[lifecycle:overview_loader] Overview plugin registration failed"
    );
    throw err;
  }
}
