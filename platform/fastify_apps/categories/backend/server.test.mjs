import "dotenv/config";
import Fastify from "fastify";
import categoriesPlugin from "./src/index.mjs";

const PORT = Number(process.env.CATEGORIES_PORT || 3063);
const HOST = process.env.CATEGORIES_HOST || "127.0.0.1";

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
    await fastify.register(categoriesPlugin, {
      apiPrefix: "/~/api/categories",
    });

    await fastify.listen({ port: PORT, host: HOST });

    console.log(`\nCategory Manager running at http://${HOST}:${PORT}`);
    console.log(`API: http://${HOST}:${PORT}/~/api/categories`);
    console.log(`Health: http://${HOST}:${PORT}/~/api/categories/health\n`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
