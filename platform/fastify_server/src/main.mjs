import { setup } from "@internal/platform-core-fastify/bootstrap";
import path from "path";
import { fileURLToPath } from "url";
import { setupRouteCollector, printRoutes } from "./print_routes.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const config = {
  title: "Fastify Integrated Server",
  port: parseInt(process.env.PORT || "51000", 10),
  paths: {
    // User-space paths — merged with platform-core defaults
    environment: path.join(ROOT_DIR, "config/environment"),
    lifecycles: path.join(ROOT_DIR, "config/lifecycle"),
    routes: path.join(ROOT_DIR, "routes"),
    apps: path.resolve(ROOT_DIR, "..", "fastify_apps"),
    frontendApps: path.resolve(ROOT_DIR, "..", "frontend_apps"),
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

try {
  // 1. Setup (creates server, loads all modules, runs startup hooks)
  const app = await setup(config);
  setupRouteCollector(app);

  // 2. Listen
  const host = app._config.host;
  const port = app._config.port;
  await app.listen({ host, port });
  app.log.info({ host, port, addresses: app.addresses() }, "Server listening");

  // 3. Print routes after server is ready
  printRoutes(app);
} catch (err) {
  console.error(err);
  process.exit(1);
}
