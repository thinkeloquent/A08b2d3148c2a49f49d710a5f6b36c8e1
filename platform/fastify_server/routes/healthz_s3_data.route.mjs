import {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { configFromEnv } from "aws-s3-client";

/**
 * Mount S3 data-exploration routes.
 * Read-only endpoints for browsing buckets, objects, and object metadata.
 * @param {import('fastify').FastifyInstance} server
 */
export async function mount(server) {
  // Helper: create a short-lived S3 client, destroy when done
  async function createClient() {
    const yamlS3 = server.config?.getNested?.(['storage', 's3']) ?? null;
    const config = configFromEnv(undefined, yamlS3);
    const clientConfig = { region: config.region };
    if (config.endpointUrl) {
      clientConfig.endpoint = config.endpointUrl;
    }
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
    return { client: new S3Client(clientConfig), config };
  }

  async function withClient(fn) {
    const { client, config } = await createClient();
    try {
      return await fn(client, config);
    } finally {
      try {
        client.destroy();
      } catch (_) {
        // ignore
      }
    }
  }

  // ── GET /healthz/s3/buckets ──
  server.get("/healthz/s3/buckets", async (_request, reply) => {
    try {
      return await withClient(async (client, config) => {
        const response = await client.send(new ListBucketsCommand({}));

        const buckets = (response.Buckets || []).map((b) => ({
          name: b.Name,
          creationDate: b.CreationDate?.toISOString() || null,
        }));

        return {
          configuredBucket: config.bucketName || null,
          buckets,
        };
      });
    } catch (err) {
      reply.code(500);
      return { error: err.message || String(err) };
    }
  });

  // ── GET /healthz/s3/buckets/:bucket/objects?prefix=&cursor=&maxKeys=50 ──
  server.get("/healthz/s3/buckets/:bucket/objects", async (request, reply) => {
    const { bucket } = request.params;
    const prefix = request.query.prefix || "";
    const cursor = request.query.cursor || undefined;
    const maxKeys = Math.min(200, Math.max(1, parseInt(request.query.maxKeys, 10) || 50));

    try {
      return await withClient(async (client) => {
        const params = {
          Bucket: bucket,
          MaxKeys: maxKeys,
        };
        if (prefix) params.Prefix = prefix;
        if (cursor) params.ContinuationToken = cursor;

        const response = await client.send(new ListObjectsV2Command(params));

        const objects = (response.Contents || []).map((obj) => ({
          key: obj.Key,
          size: obj.Size,
          lastModified: obj.LastModified?.toISOString() || null,
          storageClass: obj.StorageClass || null,
        }));

        // Derive common prefixes (virtual folders)
        const commonPrefixes = (response.CommonPrefixes || []).map(
          (p) => p.Prefix
        );

        return {
          bucket,
          prefix: prefix || null,
          nextCursor: response.NextContinuationToken || null,
          isTruncated: response.IsTruncated || false,
          keyCount: response.KeyCount || 0,
          objects,
          commonPrefixes,
        };
      });
    } catch (err) {
      reply.code(500);
      return { error: err.message || String(err) };
    }
  });

  // ── GET /healthz/s3/buckets/:bucket/objects/metadata?key=<objectKey> ──
  // Object key passed as query param since S3 keys can contain slashes
  server.get("/healthz/s3/buckets/:bucket/objects/metadata", async (request, reply) => {
    const { bucket } = request.params;
    const objectKey = request.query.key;

    if (!objectKey) {
      reply.code(400);
      return { error: "Object key is required" };
    }

    try {
      return await withClient(async (client) => {
        const response = await client.send(
          new HeadObjectCommand({ Bucket: bucket, Key: objectKey })
        );

        return {
          bucket,
          key: objectKey,
          contentType: response.ContentType || null,
          contentLength: response.ContentLength || 0,
          lastModified: response.LastModified?.toISOString() || null,
          eTag: response.ETag || null,
          storageClass: response.StorageClass || null,
          metadata: response.Metadata || {},
          serverSideEncryption: response.ServerSideEncryption || null,
        };
      });
    } catch (err) {
      const errStr = String(err).toLowerCase();
      if (errStr.includes("404") || errStr.includes("not found") || errStr.includes("nosuchkey")) {
        reply.code(404);
        return { error: `Object not found: ${objectKey}` };
      }
      reply.code(500);
      return { error: err.message || String(err) };
    }
  });
}
