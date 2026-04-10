import { PostgresConfig, getPostgresClient, checkConnection } from "@internal/db_connection_postgres";
import { ConfigSanitizer } from "healthz-diagnostics";

/**
 * Mount postgres health check route.
 * @param {import('fastify').FastifyInstance} server
 */
export async function mount(server) {
  server.get("/healthz/postgres", async (request, reply) => {
    const start = performance.now();
    let client;
    try {
      const config = new PostgresConfig();
      server.log.info(
        {
          host: config.host,
          port: config.port,
          database: config.database,
          schema: config.schema,
          ssl_mode: config.sslMode,
        },
        "healthz/postgres: checking connection"
      );
      client = getPostgresClient(config);
      await checkConnection(client);
      const latency_ms = Math.round(performance.now() - start);
      server.log.info({ latency_ms }, "healthz/postgres: connected");
      return {
        status: "ok",
        service: "postgres",
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
      server.log.error({ latency_ms, error }, "healthz/postgres: connection failed");
      reply.code(503);
      return {
        status: "error",
        service: "postgres",
        latency_ms,
        error,
      };
    } finally {
      if (client) {
        try {
          await client.close();
        } catch (_) {
          // ignore close errors
        }
      }
    }
  });
}
