/**
 * Standalone server for development/testing
 * In production, this plugin is loaded by the main fastify server
 *
 * Usage:
 *   node server.test.mjs
 *   node server.test.mjs --port=3000
 */

import "dotenv/config";
import { parseArgs } from "node:util";
import Fastify from "fastify";
import appPlugin from "./src/index.mjs";

// Parse command-line arguments
const { values: args } = parseArgs({
  options: {
    port: { type: "string", short: "p" },
    host: { type: "string", short: "h" },
    "log-level": { type: "string", short: "l" },
  },
  strict: false,
});

if (args.port) process.env.PORT = args.port;
if (args.host) process.env.HOST = args.host;
if (args["log-level"]) process.env.LOG_LEVEL = args["log-level"];

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || "info",
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
        colorize: true,
        singleLine: false,
      },
    },
  },
});

// Register the app plugin
await fastify.register(appPlugin);
fastify.log.info("✓ FQDP Management System plugin registered");

// Health check
fastify.get("/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

// Start the server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || "3000", 10);
    const host = process.env.HOST || "0.0.0.0";

    await fastify.listen({ port, host });

    fastify.log.info(`✓ Server started on http://localhost:${port}`);
    fastify.log.info(
      `✓ API: http://localhost:${port}/api/fqdp_management_system`,
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
