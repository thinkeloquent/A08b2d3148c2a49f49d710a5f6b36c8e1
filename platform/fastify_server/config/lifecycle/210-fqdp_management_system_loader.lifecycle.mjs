/**
 * FQDP Management System Loader Lifecycle Module
 *
 * Registers the FQDP Management System app plugin:
 * - Organization > Workspace > Team > Application > Project > Resource hierarchy
 * - FQDP ID generation for resources
 */

import { fqdpManagementSystemPlugin } from "@internal/fastify-app-fqdp-management-system";

/**
 * Register FQDP Management System plugin on startup.
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config
 */
export async function onStartup(server, config) {
  server.log.info(
    "[lifecycle:fqdp_management_system_loader] Initializing FQDP Management System plugin...",
  );

  try {
    server.log.info("[lifecycle:fqdp_management_system_loader] Registering FQDP Management System plugin");
    await server.register(fqdpManagementSystemPlugin, {
      appName: "fqdp_management_system",
      adminAppName: "fqdp_management_system",
      apiPrefix: "/~/api/fqdp_management_system",
    });
    server.log.info(
      "[lifecycle:fqdp_management_system_loader] FQDP Management System plugin registered successfully",
    );
  } catch (err) {
    server.log.error({ err, hookName: '210-fqdp_management_system_loader' }, '[lifecycle:fqdp_management_system_loader] FQDP Management System plugin registration failed');
    throw err;
  }
}
