/**
 * Persona Editor Lifecycle Module
 *
 * Registers the Persona Editor plugin.
 */

import { personaEditorPlugin } from "@internal/fastify-app-persona-editor";

/**
 * Register Persona Editor plugin on startup.
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config
 */
export async function onStartup(server, config) {
  server.log.info("[lifecycle:persona_editor] Initializing Persona Editor plugin...");

  try {
    server.log.info("[lifecycle:persona_editor] Registering Persona Editor plugin");
    await server.register(personaEditorPlugin, {
      appName: "persona-editor",
      adminAppName: "persona-editor",
      apiPrefix: "/~/api/persona_editor",
    });
    server.log.info("[lifecycle:persona_editor] Persona Editor plugin registered successfully");
  } catch (err) {
    server.log.error({ err, hookName: '211-persona_editor' }, '[lifecycle:persona_editor] Persona Editor plugin registration failed');
    throw err;
  }
}
