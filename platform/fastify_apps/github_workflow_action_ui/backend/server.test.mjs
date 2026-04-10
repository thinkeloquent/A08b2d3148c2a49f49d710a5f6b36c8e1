/**
 * Standalone development server for GitHub Workflow Action UI
 * Run with: node backend/server.test.mjs
 */

import "dotenv/config";
import Fastify from "fastify";
import githubWorkflowActionUiPlugin from "./src/index.mjs";

const PORT = process.env.GITHUB_WORKFLOW_UI_PORT || 3040;
const HOST = process.env.GITHUB_WORKFLOW_UI_HOST || "127.0.0.1";

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
    await fastify.register(githubWorkflowActionUiPlugin, {
      apiPrefix: "/~/api/github_workflow_action_ui",
    });

    await fastify.listen({ port: PORT, host: HOST });

    console.log(`\n🚀 GitHub Workflow Action UI running at http://${HOST}:${PORT}`);
    console.log(`   API: http://${HOST}:${PORT}/~/api/github_workflow_action_ui`);
    console.log(`   Health: http://${HOST}:${PORT}/~/api/github_workflow_action_ui/health\n`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
