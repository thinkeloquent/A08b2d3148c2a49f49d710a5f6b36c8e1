/**
 * Figma Component Inspector Loader Lifecycle Module
 *
 * Registers the Figma Component Inspector app plugin:
 * - Figma file inspection and component tree browsing
 * - Component preview with image rendering
 * - CSS property extraction and design token display
 */

import { figmaComponentInspectorPlugin } from "@internal/fastify-app-figma-component-inspector";

/**
 * Register Figma Component Inspector plugin on startup.
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config
 */
export async function onStartup(server, config) {
  server.log.info(
    "[lifecycle:figma_component_inspector] Initializing Figma Component Inspector plugin...",
  );

  try {
    server.log.info("[lifecycle:figma_component_inspector] Registering Figma Component Inspector plugin");
    await server.register(figmaComponentInspectorPlugin, {
      appName: "figma_component_inspector",
      adminAppName: "figma_component_inspector",
      apiPrefix: "/~/api/figma_component_inspector",
    });
    server.log.info(
      "[lifecycle:figma_component_inspector] Figma Component Inspector plugin registered successfully",
    );
  } catch (err) {
    server.log.error({ err, hookName: '214-figma_component_inspector' }, '[lifecycle:figma_component_inspector] Figma Component Inspector plugin registration failed');
    throw err;
  }
}
