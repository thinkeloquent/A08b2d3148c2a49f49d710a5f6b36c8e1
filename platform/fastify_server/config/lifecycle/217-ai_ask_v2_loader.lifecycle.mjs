/**
 * Ai Ask V2 Lifecycle Module
 *
 * Registers the Ai Ask V2 plugin.
 */

import { appAiAskV2Plugin } from "@internal/fastify-app-ai-ask-v2";

/**
 * Register Ai Ask V2 plugin on startup.
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config
 */
export async function onStartup(server, config) {
  server.log.info("[lifecycle:ai_ask_v2_loader] Initializing AI Ask V2 plugin...");

  try {
    server.log.info("[lifecycle:ai_ask_v2_loader] Registering AI Ask V2 plugin");
    await server.register(appAiAskV2Plugin, {
      appName: "ai-ask-v2",
      adminAppName: "ai-ask-v2",
      apiPrefix: "/~/api/ai-ask-v2",
    });
    server.log.info("[lifecycle:ai_ask_v2_loader] AI Ask V2 plugin registered successfully");
  } catch (err) {
    server.log.error({ err, hookName: '217-ai_ask_v2_loader' }, '[lifecycle:ai_ask_v2_loader] AI Ask V2 plugin registration failed');
    throw err;
  }
}
