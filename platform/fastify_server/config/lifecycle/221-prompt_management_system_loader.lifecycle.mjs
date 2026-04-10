/**
 * Prompt Management System Loader Lifecycle Module
 *
 * Registers the Prompt Management System plugin.
 */

import { appPromptManagementSystemPlugin } from "@internal/fastify-app-prompt-management-system";

/**
 * Register Prompt Management System plugin on startup.
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config
 */
export async function onStartup(server, config) {
  server.log.info("[lifecycle:prompt_management_system_loader] Initializing Prompt Management System plugin...");

  try {
    server.log.info("[lifecycle:prompt_management_system_loader] Registering Prompt Management System plugin");
    await server.register(appPromptManagementSystemPlugin, {
      appName: "prompt-management-system",
      adminAppName: "prompt-management-system",
      apiPrefix: "/~/api/prompt-management-system",
    });
    server.log.info("[lifecycle:prompt_management_system_loader] Prompt Management System plugin registered successfully");
  } catch (err) {
    server.log.error({ err, hookName: '221-prompt_management_system_loader' }, '[lifecycle:prompt_management_system_loader] Prompt Management System plugin registration failed');
    throw err;
  }
}
