/**
 * Standalone test server for process-checklist backend
 * Run: node server.test.mjs
 */

import "dotenv/config";
import Fastify from "fastify";
import { processChecklistPlugin } from "./src/index.mjs";

const fastify = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: { colorize: true },
    },
  },
});

await fastify.register(processChecklistPlugin, {
  appName: "process_checklist",
  adminAppName: "process_checklist",
  apiPrefix: "/~/api/process_checklist",
});

try {
  await fastify.listen({ port: 3000, host: "0.0.0.0" });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
