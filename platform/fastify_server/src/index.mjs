/**
 * @internal/fastify-server
 * Main entry point - exports server utilities and components.
 *
 * Usage:
 *   import { logger, printRoutes } from "@internal/fastify-server";
 *   // or
 *   import * as app from "@internal/app";
 */

export { default as logger, create, LOG_LEVELS } from "./logger.mjs";
export { setupRouteCollector, printRoutes } from "./print_routes.mjs";
