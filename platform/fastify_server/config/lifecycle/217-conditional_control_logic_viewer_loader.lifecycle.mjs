/**
 * Conditional Control Logic Viewer Loader Lifecycle Module
 *
 * Registers the Conditional Control Logic Viewer plugin.
 */

import { appConditionalControlLogicViewerPlugin } from "@internal/fastify-app-conditional-control-logic-viewer";

/**
 * Register Conditional Control Logic Viewer plugin on startup.
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config
 */
export async function onStartup(server, config) {
  server.log.info("[lifecycle:conditional_control_logic_viewer_loader] Initializing Conditional Control Logic Viewer plugin...");

  try {
    server.log.info("[lifecycle:conditional_control_logic_viewer_loader] Registering Conditional Control Logic Viewer plugin");
    await server.register(appConditionalControlLogicViewerPlugin, {
      appName: "conditional-control-logic-viewer",
      adminAppName: "conditional-control-logic-viewer",
      apiPrefix: "/~/api/conditional-control-logic-viewer",
    });
    server.log.info("[lifecycle:conditional_control_logic_viewer_loader] Conditional Control Logic Viewer plugin registered successfully");
  } catch (err) {
    server.log.error({ err, hookName: '217-conditional_control_logic_viewer_loader' }, '[lifecycle:conditional_control_logic_viewer_loader] Conditional Control Logic Viewer plugin registration failed');
    throw err;
  }
}
