import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import fastifyPlugin from "fastify-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function aiAgentWorkflowNodeTypePlugin(fastify, options) {
  const apiPrefix = options.apiPrefix || "/~/api/ai_agent_workflow_node_type";

  fastify.get(`${apiPrefix}`, async () => ({
    status: "ok",
    service: "ai-agent-workflow-node-type",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: `GET ${apiPrefix}/health`,
    },
  }));

  fastify.get(`${apiPrefix}/health`, async () => ({
    status: "healthy",
    service: "ai-agent-workflow-node-type",
    timestamp: new Date().toISOString(),
  }));

  // Register static file serving for frontend via static-app-loader
  if (options.appName) {
    const staticRoot = resolve(__dirname, "../../frontend/dist");

    if (!existsSync(staticRoot)) {
      fastify.log.warn(
        `  ⚠ Frontend dist not found, skipping static serving: ${staticRoot}`
      );
    } else {
      fastify.log.info("→ Setting up frontend static serving via static-app-loader...");

      const { staticAppLoader } = await import("static-app-loader");

      await fastify.register(staticAppLoader, {
        appName: options.appName,
        rootPath: staticRoot,
        spaMode: true,
        maxAge: process.env.NODE_ENV === "production" ? 86400 : 0,
      });

      fastify.log.info(`  ✓ Registered static assets at: ${options.appName}`);
    }
  }
}

export default fastifyPlugin(
  (fastify, opts) => aiAgentWorkflowNodeTypePlugin(fastify, opts),
  { name: "ai-agent-workflow-node-type" },
);

export { aiAgentWorkflowNodeTypePlugin };
