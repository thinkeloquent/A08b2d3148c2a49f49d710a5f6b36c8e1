/**
 * GitHub Workflow Action UI Lifecycle Module
 *
 * Registers the GitHub Workflow Action UI plugin.
 */

import { default as githubWorkflowActionUiPlugin } from "@internal/fastify-app-github-workflow-action-ui";

/**
 * Register GitHub Workflow Action UI plugin on startup.
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config
 */
export async function onStartup(server, config) {
  server.log.info("[lifecycle:github_workflow_action_ui] Initializing GitHub Workflow Action UI plugin...");

  try {
    server.log.info("[lifecycle:github_workflow_action_ui] Registering GitHub Workflow Action UI plugin");
    await server.register(githubWorkflowActionUiPlugin, {
      appName: "github-workflow-action-ui",
      adminAppName: "github-workflow-action-ui",
      apiPrefix: "/~/api/github_workflow_action_ui",
    });
    server.log.info("[lifecycle:github_workflow_action_ui] GitHub Workflow Action UI plugin registered successfully");
  } catch (err) {
    server.log.error({ err, hookName: '212-github_workflow_action_ui' }, '[lifecycle:github_workflow_action_ui] GitHub Workflow Action UI plugin registration failed');
    throw err;
  }
}
