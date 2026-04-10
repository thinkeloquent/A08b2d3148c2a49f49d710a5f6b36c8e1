import { RedisConfig, getRedisClient } from "@internal/db_connection_redis";
import { ConfigSanitizer } from "healthz-diagnostics";

/**
 * Mount redis health check route.
 * @param {import('fastify').FastifyInstance} server
 */
export async function mount(server) {
  server.get("/healthz/redis", async (request, reply) => {
    const start = performance.now();
    let client;
    try {
      const config = new RedisConfig();
      server.log.info(
        {
          host: config.host,
          port: config.port,
          db: config.db,
          useSsl: config.useSsl,
        },
        "healthz/redis: checking connection"
      );
      client = getRedisClient(config);
      await client.ping();
      const latency_ms = Math.round(performance.now() - start);
      server.log.info({ latency_ms }, "healthz/redis: connected");
      return {
        status: "ok",
        service: "redis",
        latency_ms,
        config: new ConfigSanitizer().sanitize({ ...config }),
      };
    } catch (err) {
      const latency_ms = Math.round(performance.now() - start);
      const error = {
        name: err.name || "Error",
        message: err.message,
        code: err.code || null,
        cause: err.cause
          ? { name: err.cause.name, message: err.cause.message, code: err.cause.code || null }
          : null,
      };
      server.log.error({ latency_ms, error }, "healthz/redis: connection failed");
      reply.code(503);
      return {
        status: "error",
        service: "redis",
        latency_ms,
        error,
      };
    } finally {
      if (client) {
        try {
          client.disconnect();
        } catch (_) {
          // ignore disconnect errors
        }
      }
    }
  });
}
