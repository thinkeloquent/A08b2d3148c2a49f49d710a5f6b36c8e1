import { ElasticsearchConfig, checkConnection } from "@internal/db-connection-elasticsearch";
import { ConfigSanitizer } from "healthz-diagnostics";

/**
 * Mount elasticsearch health check route.
 * @param {import('fastify').FastifyInstance} server
 */
export async function mount(server) {
  server.get("/healthz/elasticsearch", async (request, reply) => {
    const start = performance.now();
    try {
      const config = new ElasticsearchConfig();
      server.log.info(
        {
          host: config.options.host,
          port: config.options.port,
          scheme: config.options.scheme,
          vendorType: config.options.vendorType,
          useTls: config.options.useTls,
          index: config.options.index,
        },
        "healthz/elasticsearch: checking connection"
      );
      const result = await checkConnection(config);
      const latency_ms = Math.round(performance.now() - start);
      if (result.success) {
        server.log.info({ latency_ms }, "healthz/elasticsearch: connected");
        return {
          status: "ok",
          service: "elasticsearch",
          latency_ms,
          config: new ConfigSanitizer().sanitize({ ...config.options }),
          info: result.info,
        };
      }
      const error = {
        name: "ConnectionError",
        message: result.error || "Connection check returned unsuccessful",
        code: null,
        cause: null,
      };
      server.log.error({ latency_ms, error }, "healthz/elasticsearch: connection failed");
      reply.code(503);
      return {
        status: "error",
        service: "elasticsearch",
        latency_ms,
        config: new ConfigSanitizer().sanitize({ ...config.options }),
        error,
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
      server.log.error({ latency_ms, error }, "healthz/elasticsearch: connection failed");
      reply.code(503);
      return {
        status: "error",
        service: "elasticsearch",
        latency_ms,
        error,
      };
    }
  });
}
