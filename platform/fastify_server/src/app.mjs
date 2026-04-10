import * as server from "polyglot-server";
import path from "path";
import { fileURLToPath } from "url";
import { setupRouteCollector, printRoutes } from "./print_routes.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");

const config = {
  title: "Fastify Integrated Server",
  port: process.env.PORT || 8080,
  bootstrap: {
    load_env: path.join(ROOT_DIR, "config/environment"),
    lifecycle: path.join(ROOT_DIR, "config/lifecycle"),
    routes: path.join(ROOT_DIR, "routes"),
  },
  initial_state: {
    build_info: {
      build_id: process.env.BUILD_ID || "",
      build_version: process.env.BUILD_VERSION || "",
      app_env: process.env.APP_ENV || "",
      id: `${process.env.BUILD_ID || ""} ${process.env.BUILD_VERSION || ""} ${process.env.APP_ENV || ""}`,
    },
  },
};

export default async function app(fastify, opts) {
  // fastify-cli provides its own Fastify instance — use polyglot-server's
  // bootstrap() which configures the EXISTING instance (doesn't create a new one).
  // platform-core's setup() creates a new instance, so it can't be used here.
  setupRouteCollector(fastify);
  await server.bootstrap(fastify, config, { skipGracefulShutdown: true });
  fastify.addHook("onReady", async () => printRoutes(fastify));

  return Promise.resolve();
}

export const options = {
  logger: true,
  pluginTimeout: 120_000,
};
