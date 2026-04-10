/**
 * AI Agent Workflow Node Type Loader Lifecycle Module
 *
 * Registers the AI Agent Workflow Node Type plugin.
 */

import { aiAgentWorkflowNodeTypePlugin } from '@internal/fastify-app-ai-agent-workflow-node-type';

/**
 * Register AI Agent Workflow Node Type plugin on startup.
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config
 */
export async function onStartup(server, config) {
  server.log.info('[lifecycle:ai_agent_workflow_node_type_loader] Initializing AI Agent Workflow Node Type plugin...');

  try {
    server.log.info('[lifecycle:ai_agent_workflow_node_type_loader] Registering AI Agent Workflow Node Type plugin');
    await server.register(aiAgentWorkflowNodeTypePlugin, {
      appName: 'ai-agent-workflow-node-type',
      apiPrefix: '/~/api/ai_agent_workflow_node_type',
    });
    server.log.info('[lifecycle:ai_agent_workflow_node_type_loader] AI Agent Workflow Node Type plugin registered successfully');
  } catch (err) {
    server.log.error(
      { err, hookName: '222-ai_agent_workflow_node_type_loader' },
      '[lifecycle:ai_agent_workflow_node_type_loader] AI Agent Workflow Node Type plugin registration failed'
    );
    throw err;
  }
}
