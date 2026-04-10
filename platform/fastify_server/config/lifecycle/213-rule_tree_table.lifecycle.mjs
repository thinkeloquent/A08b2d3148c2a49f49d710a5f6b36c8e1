/**
 * Rule Tree Table Lifecycle Module
 *
 * Registers the Rule Tree Table plugin.
 */

import { ruleTreeTablePlugin } from "@internal/fastify-app-rule-tree-table";

/**
 * Register Rule Tree Table plugin on startup.
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config
 */
export async function onStartup(server, config) {
  server.log.info("[lifecycle:rule_tree_table] Initializing Rule Tree Table plugin...");

  try {
    server.log.info("[lifecycle:rule_tree_table] Registering Rule Tree Table plugin");
    await server.register(ruleTreeTablePlugin, {
      appName: "rule_tree_table",
      adminAppName: "rule_tree_table",
      apiPrefix: "/~/api/rule_tree_table",
    });
    server.log.info("[lifecycle:rule_tree_table] Rule Tree Table plugin registered successfully");
  } catch (err) {
    server.log.error({ err, hookName: '213-rule_tree_table' }, '[lifecycle:rule_tree_table] Rule Tree Table plugin registration failed');
    throw err;
  }
}
