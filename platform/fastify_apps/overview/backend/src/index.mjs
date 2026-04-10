import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import fastifyPlugin from "fastify-plugin";
import { registerErrorHandlers } from "./plugins/error-handler.mjs";
import appsRoutes from "./routes/apps.mjs";
import chatRoutes from "./routes/chat.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function overviewPlugin(fastify, options) {
  const apiPrefix = options.apiPrefix || "/~/api/overview";

  // 1. Error handler (direct call, not fp-wrapped)
  registerErrorHandlers(fastify);

  // 2. Health endpoint
  fastify.get(apiPrefix, async () => ({
    status: "ok",
    service: "overview",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      apps: `${apiPrefix}/apps`,
      chat: `${apiPrefix}/chat`,
    },
  }));

  // 3. API routes
  await fastify.register(appsRoutes, { prefix: `${apiPrefix}/apps` });
  await fastify.register(chatRoutes, { prefix: `${apiPrefix}/chat` });

  // 4. Static file serving for frontend
  if (options.appName) {
    const staticRoot = resolve(__dirname, "../../frontend/dist");

    if (!existsSync(staticRoot)) {
      fastify.log.warn(
        `  [overview] Frontend dist not found, skipping static serving: ${staticRoot}`
      );
    } else {
      const { staticAppLoader } = await import("static-app-loader");

      await fastify.register(staticAppLoader, {
        appName: options.appName,
        rootPath: staticRoot,
        spaMode: true,
        maxAge: process.env.NODE_ENV === "production" ? 86400 : 0,
      });
    }
  }
}

export default fastifyPlugin(
  (fastify, opts) => overviewPlugin(fastify, opts),
  { name: "overview" },
);

export { overviewPlugin };
