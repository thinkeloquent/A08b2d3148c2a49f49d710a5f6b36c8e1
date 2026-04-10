/**
 * Task Graph Loader Lifecycle Module
 *
 * Registers the App Task Graph plugin.
 */

import { appTaskGraphPlugin } from "@internal/fastify-app-task-graph";

/**
 * Register Task Graph plugin on startup.
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config
 */
export async function onStartup(server, config) {
  server.log.info("[lifecycle:task_graph_loader] Initializing App Task Graph plugin...");

  try {
    server.log.info("[lifecycle:task_graph_loader] Registering App Task Graph plugin");
    await server.register(appTaskGraphPlugin, {
      appName: "task-graph",
      adminAppName: "task-graph",
      apiPrefix: "/~/api/task-graph",
    });
    server.log.info("[lifecycle:task_graph_loader] App Task Graph plugin registered successfully");
  } catch (err) {
    server.log.error({ err, hookName: '210-task_graph_loader' }, '[lifecycle:task_graph_loader] App Task Graph plugin registration failed');
    throw err;
  }
}
