import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { configFromEnv } from "aws-s3-client";
import { ConfigSanitizer } from "healthz-diagnostics";

/**
 * Build an S3Client from the shared config.
 * Supports proxy (via HttpOptions.agent) and forcePathStyle.
 * @param {import('aws-s3-client').SDKConfig} config
 * @returns {Promise<S3Client>}
 */
async function buildS3Client(config) {
  const clientConfig = { region: config.region };

  if (config.endpointUrl) {
    clientConfig.endpoint = config.endpointUrl;
  }

  // forcePathStyle from config (or default true when endpointUrl is set)
  clientConfig.forcePathStyle = config.forcePathStyle ?? !!config.endpointUrl;

  if (config.awsAccessKeyId && config.awsSecretAccessKey) {
    clientConfig.credentials = {
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey,
    };
  }

  // Proxy support via HttpOptions.agent
  if (config.proxyUrl) {
    const { HttpsProxyAgent } = await import("https-proxy-agent");
    const agent = new HttpsProxyAgent(config.proxyUrl);
    clientConfig.requestHandler = new NodeHttpHandler({
      httpAgent: agent,
      httpsAgent: agent,
    });
  }

  return new S3Client(clientConfig);
}

/**
 * Mount S3 health check route.
 * Uses ListBuckets as the connectivity test — no configured bucket required.
 * @param {import('fastify').FastifyInstance} server
 */
export async function mount(server) {
  const yamlS3 = server.config?.getNested?.(['storage', 's3']) ?? null;
  const config = configFromEnv(undefined, yamlS3);
  server.log.info(
    {
      region: config.region,
      bucket: config.bucketName || "(not set)",
      endpointUrl: config.endpointUrl || "(default)",
      keyPrefix: config.keyPrefix,
      hasCredentials: !!(config.awsAccessKeyId && config.awsSecretAccessKey),
      proxyUrl: config.proxyUrl || "(none)",
      forcePathStyle: config.forcePathStyle,
    },
    "[s3] S3 configuration loaded"
  );

  server.get("/healthz/s3", async (request, reply) => {
    const start = performance.now();
    let client;
    try {
      const yamlS3 = server.config?.getNested?.(['storage', 's3']) ?? null;
      const config = configFromEnv(undefined, yamlS3);
      server.log.info(
        {
          region: config.region,
          endpointUrl: config.endpointUrl || "(default)",
          hasCredentials: !!(config.awsAccessKeyId && config.awsSecretAccessKey),
        },
        "healthz/s3: checking connection"
      );
      client = await buildS3Client(config);
      const response = await client.send(new ListBucketsCommand({}));
      const bucketCount = response.Buckets?.length ?? 0;
      const latency_ms = Math.round(performance.now() - start);
      server.log.info({ latency_ms, bucketCount }, "healthz/s3: connected");

      return {
        status: "ok",
        service: "s3",
        latency_ms,
        config: new ConfigSanitizer().sanitize(config),
        bucketCount,
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
      server.log.error({ latency_ms, error }, "healthz/s3: connection failed");
      reply.code(503);
      return {
        status: "error",
        service: "s3",
        latency_ms,
        config: new ConfigSanitizer().sanitize(config),
        error,
      };
    } finally {
      if (client) {
        try {
          client.destroy();
        } catch (_) {
          // ignore destroy errors
        }
      }
    }
  });
}
