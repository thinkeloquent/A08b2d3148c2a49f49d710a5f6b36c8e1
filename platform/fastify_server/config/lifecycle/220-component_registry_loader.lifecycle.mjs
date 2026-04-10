/**
 * Component Registry Loader Lifecycle Module
 *
 * Registers the Component Registry plugin.
 */

import { appComponentRegistryPlugin } from "@internal/fastify-app-component-registry";

/**
 * Register Component Registry plugin on startup.
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config
 */
export async function onStartup(server, config) {
  server.log.info("[lifecycle:component_registry_loader] Initializing Component Registry plugin...");

  try {
    server.log.info("[lifecycle:component_registry_loader] Registering Component Registry plugin");
    await server.register(appComponentRegistryPlugin, {
      appName: "component-registry",
      adminAppName: "component-registry",
      apiPrefix: "/~/api/component-registry",
    });
    server.log.info("[lifecycle:component_registry_loader] Component Registry plugin registered successfully");
  } catch (err) {
    server.log.error({ err, hookName: '220-component_registry_loader' }, '[lifecycle:component_registry_loader] Component Registry plugin registration failed');
    throw err;
  }
}
