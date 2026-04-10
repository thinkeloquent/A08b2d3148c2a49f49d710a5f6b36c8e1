/**
 * Group Role Management Loader Lifecycle Module
 *
 * Registers the Group Role Management plugin.
 */

import { appGroupRoleManagementPlugin } from "@internal/fastify-app-group-role-management";

/**
 * Register Group Role Management plugin on startup.
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config
 */
export async function onStartup(server, config) {
  server.log.info("[lifecycle:group_role_management_loader] Initializing Group Role Management plugin...");

  try {
    server.log.info("[lifecycle:group_role_management_loader] Registering Group Role Management plugin");
    await server.register(appGroupRoleManagementPlugin, {
      appName: "group-role-management",
      adminAppName: "group-role-management",
      apiPrefix: "/~/api/group-role-management",
    });
    server.log.info("[lifecycle:group_role_management_loader] Group Role Management plugin registered successfully");
  } catch (err) {
    server.log.error({ err, hookName: '215-group_role_management_loader' }, '[lifecycle:group_role_management_loader] Group Role Management plugin registration failed');
    throw err;
  }
}
