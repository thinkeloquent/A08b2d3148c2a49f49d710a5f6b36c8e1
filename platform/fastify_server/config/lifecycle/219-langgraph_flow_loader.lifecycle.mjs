/**
 * LangGraph Flow Loader Lifecycle Module
 *
 * Registers the LangGraph Flow plugin.
 */

import { appLanggraphFlowPlugin } from '@internal/fastify-app-langgraph-flow';

/**
 * Register LangGraph Flow plugin on startup.
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config
 */
export async function onStartup(server, config) {
  server.log.info('[lifecycle:langgraph_flow_loader] Initializing LangGraph Flow plugin...');

  try {
    server.log.info('[lifecycle:langgraph_flow_loader] Registering LangGraph Flow plugin');
    await server.register(appLanggraphFlowPlugin, {
      appName: 'langgraph-flow',
      apiPrefix: '/~/api/langgraph-flow',
    });
    server.log.info('[lifecycle:langgraph_flow_loader] LangGraph Flow plugin registered successfully');
  } catch (err) {
    server.log.error(
      { err, hookName: '219-langgraph_flow_loader' },
      '[lifecycle:langgraph_flow_loader] LangGraph Flow plugin registration failed'
    );
    throw err;
  }
}
