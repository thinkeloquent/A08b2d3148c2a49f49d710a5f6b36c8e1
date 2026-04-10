/**
 * Prompt Oneshot Template Loader Lifecycle Module
 *
 * Registers the prompt-oneshot-template app plugin.
 */

import { promptOneshotTemplatePlugin } from "@internal/fastify-app-prompt-oneshot-template";

/**
 * Register prompt-oneshot-template plugin on startup.
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config
 */
export async function onStartup(server, config) {
  server.log.info("[lifecycle:prompt_oneshot_template_loader] Initializing...");

  try {
    await server.register(promptOneshotTemplatePlugin, {
      appName: "prompt-oneshot-template",
    });

    server.log.info("[lifecycle:prompt_oneshot_template_loader] Plugin registered successfully");
  } catch (err) {
    server.log.error(
      { err, hookName: "227-prompt_oneshot_template_loader" },
      "[lifecycle:prompt_oneshot_template_loader] Registration failed",
    );
    throw err;
  }
}
