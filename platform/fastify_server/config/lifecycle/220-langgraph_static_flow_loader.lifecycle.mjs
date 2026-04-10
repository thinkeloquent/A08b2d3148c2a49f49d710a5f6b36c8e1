/**
 * LangGraph Static Flow Loader Lifecycle Module
 *
 * Registers the LangGraph Static Flow plugin.
 */

import { appLanggraphStaticFlowPlugin } from '@internal/fastify-app-langgraph-static-flow';

/**
 * Register LangGraph Static Flow plugin on startup.
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config
 */
export async function onStartup(server, config) {
  server.log.info('[lifecycle:langgraph_static_flow_loader] Initializing LangGraph Static Flow plugin...');

  try {
    server.log.info('[lifecycle:langgraph_static_flow_loader] Registering LangGraph Static Flow plugin');
    await server.register(appLanggraphStaticFlowPlugin, {
      appName: 'langgraph-static-flow',
      apiPrefix: '/~/api/langgraph-static-flow',
    });
    server.log.info('[lifecycle:langgraph_static_flow_loader] LangGraph Static Flow plugin registered successfully');
  } catch (err) {
    server.log.error(
      { err, hookName: '220-langgraph_static_flow_loader' },
      '[lifecycle:langgraph_static_flow_loader] LangGraph Static Flow plugin registration failed'
    );
    throw err;
  }
}
