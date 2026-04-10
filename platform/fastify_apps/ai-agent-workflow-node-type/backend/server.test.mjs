import "dotenv/config";
import Fastify from "fastify";
import aiAgentWorkflowNodeTypePlugin from "./src/index.mjs";

const PORT = Number(process.env.AI_AGENT_WORKFLOW_NODE_TYPE_PORT || 3062);
const HOST = process.env.AI_AGENT_WORKFLOW_NODE_TYPE_HOST || "127.0.0.1";

async function start() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || "info",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
        },
      },
    },
  });

  try {
    await fastify.register(aiAgentWorkflowNodeTypePlugin, {
      apiPrefix: "/~/api/ai_agent_workflow_node_type",
    });

    await fastify.listen({ port: PORT, host: HOST });

    console.log(`\nAI Agent Workflow Node Type running at http://${HOST}:${PORT}`);
    console.log(`API: http://${HOST}:${PORT}/~/api/ai_agent_workflow_node_type`);
    console.log(`Health: http://${HOST}:${PORT}/~/api/ai_agent_workflow_node_type/health\n`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
