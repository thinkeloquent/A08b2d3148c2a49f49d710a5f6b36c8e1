import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { configFromEnv } from "aws-s3-client";

/**
 * Build an S3Client from user-supplied config (Postman-style).
 * @param {object} cfg
 * @returns {S3Client}
 */
async function buildClientFromConfig(cfg) {
  const clientConfig = {};

  if (cfg.region_name) {
    clientConfig.region = cfg.region_name;
  }
  if (cfg.endpoint_url) {
    clientConfig.endpoint = cfg.endpoint_url;
    clientConfig.forcePathStyle = cfg.addressing_style === "path";
  }
  if (cfg.aws_access_key_id && cfg.aws_secret_access_key) {
    clientConfig.credentials = {
      accessKeyId: cfg.aws_access_key_id,
      secretAccessKey: cfg.aws_secret_access_key,
    };
  }
  if (cfg.verify === false) {
    clientConfig.tls = false;
  }
  if (cfg.proxy_url) {
    const { HttpsProxyAgent } = await import("https-proxy-agent");
    const agent = new HttpsProxyAgent(cfg.proxy_url);
    clientConfig.requestHandler = new NodeHttpHandler({
      httpAgent: agent,
      httpsAgent: agent,
      connectionTimeout: (cfg.connection_timeout || 20) * 1000,
      requestTimeout: (cfg.read_timeout || 60) * 1000,
    });
  } else {
    clientConfig.requestHandler = new NodeHttpHandler({
      connectionTimeout: (cfg.connection_timeout || 20) * 1000,
      requestTimeout: (cfg.read_timeout || 60) * 1000,
    });
  }

  return new S3Client(clientConfig);
}

/**
 * Mount S3 cached-key test routes.
 * Provides a Postman-style API for testing cache_json_awss3_storage operations
 * (save, load, delete, exists, list, clear) with user-supplied config.
 * @param {import('fastify').FastifyInstance} server
 */
export async function mount(server) {
  /**
   * Resolve server-side S3 config from YAML + env (same source as /healthz/s3).
   */
  function getServerConfig() {
    const yamlS3 = server.config?.getNested?.(['storage', 's3']) ?? null;
    return configFromEnv(undefined, yamlS3);
  }

  /**
   * GET /healthz/s3-cached-key/defaults
   *
   * Returns the server-resolved S3 config (credentials masked) so the
   * frontend can show defaults and pre-fill fields.
   */
  server.get("/healthz/s3-cached-key/defaults", async () => {
    const sc = getServerConfig();
    return {
      bucket_name: sc.bucketName || "",
      region_name: sc.region || "",
      endpoint_url: sc.endpointUrl || "",
      has_credentials: !!(sc.awsAccessKeyId && sc.awsSecretAccessKey),
      proxy_url: sc.proxyUrl || "",
      addressing_style: sc.forcePathStyle ? "path" : "virtual",
      key_prefix: sc.keyPrefix || "jss3:",
    };
  });

  /**
   * POST /healthz/s3-cached-key
   *
   * Body:
   *   config: { bucket_name?, endpoint_url?, region_name?, aws_access_key_id?,
   *             aws_secret_access_key?, proxy_url?, addressing_style?, verify?,
   *             connection_timeout?, read_timeout?, key_prefix?, ttl? }
   *   operation: "save" | "load" | "delete" | "exists" | "list" | "clear"
   *   params: { key?, data?, ttl? }
   *
   * Optional config fields fall back to server-resolved values
   * (YAML app config → environment variables).
   */
  server.post("/healthz/s3-cached-key", async (request, reply) => {
    const { config: userCfg = {}, operation, params = {} } = request.body || {};

    if (!operation) {
      reply.code(400);
      return { status: "error", error: "operation is required" };
    }

    // Merge: user-supplied values → server defaults
    const sc = getServerConfig();
    const cfg = {
      bucket_name: userCfg.bucket_name || sc.bucketName,
      endpoint_url: userCfg.endpoint_url || sc.endpointUrl,
      region_name: userCfg.region_name || sc.region,
      aws_access_key_id: userCfg.aws_access_key_id || sc.awsAccessKeyId,
      aws_secret_access_key: userCfg.aws_secret_access_key || sc.awsSecretAccessKey,
      proxy_url: userCfg.proxy_url || sc.proxyUrl,
      addressing_style: userCfg.addressing_style ?? (sc.forcePathStyle ? "path" : "virtual"),
      connection_timeout: userCfg.connection_timeout ?? 20,
      read_timeout: userCfg.read_timeout ?? 60,
      verify: userCfg.verify ?? true,
      key_prefix: userCfg.key_prefix ?? sc.keyPrefix ?? "jss3:",
      ttl: userCfg.ttl,
    };

    if (!cfg.bucket_name) {
      reply.code(400);
      return { status: "error", error: "bucket_name is required (not in request or server config)" };
    }

    const keyPrefix = cfg.key_prefix || "jss3:";
    const defaultTtl = cfg.ttl ?? null;
    const bucket = cfg.bucket_name;

    let client;
    const start = performance.now();
    try {
      client = await buildClientFromConfig(cfg);

      // Ensure bucket exists — create if missing
      try {
        await client.send(new HeadBucketCommand({ Bucket: bucket }));
      } catch (err) {
        const errName = (err.name || "").toLowerCase();
        const errCode = (err.$metadata?.httpStatusCode || 0);
        if (errName === "notfound" || errName === "nosuchbucket" || errCode === 404 || errCode === 403) {
          server.log.info({ bucket }, "healthz/s3-cached-key: bucket not found, creating");
          await client.send(new CreateBucketCommand({ Bucket: bucket }));
          server.log.info({ bucket }, "healthz/s3-cached-key: bucket created");
        } else {
          throw err;
        }
      }

      switch (operation) {
        // ── SAVE ──
        case "save": {
          const key = params.key;
          if (!key) {
            reply.code(400);
            return { status: "error", error: "params.key is required for save" };
          }
          const data = params.data ?? {};
          const ttl = params.ttl ?? defaultTtl;
          const now = Date.now() / 1000;
          const expiresAt = ttl ? now + ttl : null;

          const entry = {
            key,
            data,
            created_at: now,
            expires_at: expiresAt,
          };

          const s3Key = `${keyPrefix}${key}`;
          const body = JSON.stringify(entry);

          await client.send(
            new PutObjectCommand({
              Bucket: bucket,
              Key: s3Key,
              Body: body,
              ContentType: "application/json",
            })
          );

          const latency_ms = Math.round(performance.now() - start);
          return {
            status: "ok",
            operation: "save",
            latency_ms,
            result: {
              key,
              s3_key: s3Key,
              ttl: ttl ?? null,
              expires_at: expiresAt,
              size_bytes: Buffer.byteLength(body, "utf-8"),
            },
          };
        }

        // ── LOAD ──
        case "load": {
          const key = params.key;
          if (!key) {
            reply.code(400);
            return { status: "error", error: "params.key is required for load" };
          }
          const s3Key = `${keyPrefix}${key}`;

          let response;
          try {
            response = await client.send(
              new GetObjectCommand({ Bucket: bucket, Key: s3Key })
            );
          } catch (err) {
            const errStr = String(err).toLowerCase();
            if (
              errStr.includes("nosuchkey") ||
              errStr.includes("404") ||
              errStr.includes("not found")
            ) {
              const latency_ms = Math.round(performance.now() - start);
              return {
                status: "ok",
                operation: "load",
                latency_ms,
                result: { key, s3_key: s3Key, found: false, data: null },
              };
            }
            throw err;
          }

          const content = await response.Body.transformToString();
          let entry;
          try {
            entry = JSON.parse(content);
          } catch {
            entry = { raw: content };
          }

          // Check TTL
          const now = Date.now() / 1000;
          const isExpired =
            entry.expires_at != null && now > entry.expires_at;

          const latency_ms = Math.round(performance.now() - start);
          return {
            status: "ok",
            operation: "load",
            latency_ms,
            result: {
              key,
              s3_key: s3Key,
              found: true,
              expired: isExpired,
              entry,
            },
          };
        }

        // ── DELETE ──
        case "delete": {
          const key = params.key;
          if (!key) {
            reply.code(400);
            return { status: "error", error: "params.key is required for delete" };
          }
          const s3Key = `${keyPrefix}${key}`;

          await client.send(
            new DeleteObjectCommand({ Bucket: bucket, Key: s3Key })
          );

          const latency_ms = Math.round(performance.now() - start);
          return {
            status: "ok",
            operation: "delete",
            latency_ms,
            result: { key, s3_key: s3Key, deleted: true },
          };
        }

        // ── EXISTS ──
        case "exists": {
          const key = params.key;
          if (!key) {
            reply.code(400);
            return { status: "error", error: "params.key is required for exists" };
          }
          const s3Key = `${keyPrefix}${key}`;

          let exists = false;
          try {
            await client.send(
              new HeadObjectCommand({ Bucket: bucket, Key: s3Key })
            );
            exists = true;
          } catch (err) {
            const errStr = String(err).toLowerCase();
            if (
              errStr.includes("404") ||
              errStr.includes("not found") ||
              errStr.includes("nosuchkey")
            ) {
              exists = false;
            } else {
              throw err;
            }
          }

          const latency_ms = Math.round(performance.now() - start);
          return {
            status: "ok",
            operation: "exists",
            latency_ms,
            result: { key, s3_key: s3Key, exists },
          };
        }

        // ── LIST ──
        case "list": {
          const allKeys = [];
          let continuationToken;

          while (true) {
            const listParams = {
              Bucket: bucket,
              Prefix: keyPrefix,
              MaxKeys: 100,
            };
            if (continuationToken) {
              listParams.ContinuationToken = continuationToken;
            }

            const response = await client.send(
              new ListObjectsV2Command(listParams)
            );

            for (const obj of response.Contents || []) {
              const s3Key = obj.Key || "";
              const storageKey = s3Key.startsWith(keyPrefix)
                ? s3Key.slice(keyPrefix.length)
                : s3Key;
              allKeys.push({
                key: storageKey,
                s3_key: s3Key,
                size: obj.Size,
                last_modified: obj.LastModified?.toISOString() || null,
              });
            }

            if (response.IsTruncated) {
              continuationToken = response.NextContinuationToken;
            } else {
              break;
            }
          }

          const latency_ms = Math.round(performance.now() - start);
          return {
            status: "ok",
            operation: "list",
            latency_ms,
            result: { key_prefix: keyPrefix, count: allKeys.length, keys: allKeys },
          };
        }

        // ── CLEAR ──
        case "clear": {
          // List all keys with prefix, then batch-delete
          const keysToDelete = [];
          let continuationToken;

          while (true) {
            const listParams = {
              Bucket: bucket,
              Prefix: keyPrefix,
              MaxKeys: 1000,
            };
            if (continuationToken) {
              listParams.ContinuationToken = continuationToken;
            }

            const response = await client.send(
              new ListObjectsV2Command(listParams)
            );

            for (const obj of response.Contents || []) {
              keysToDelete.push({ Key: obj.Key });
            }

            if (response.IsTruncated) {
              continuationToken = response.NextContinuationToken;
            } else {
              break;
            }
          }

          if (keysToDelete.length > 0) {
            // Delete in batches of 1000
            for (let i = 0; i < keysToDelete.length; i += 1000) {
              const batch = keysToDelete.slice(i, i + 1000);
              await client.send(
                new DeleteObjectsCommand({
                  Bucket: bucket,
                  Delete: { Objects: batch },
                })
              );
            }
          }

          const latency_ms = Math.round(performance.now() - start);
          return {
            status: "ok",
            operation: "clear",
            latency_ms,
            result: {
              key_prefix: keyPrefix,
              deleted_count: keysToDelete.length,
            },
          };
        }

        default:
          reply.code(400);
          return {
            status: "error",
            error: `Unknown operation: ${operation}. Use: save, load, delete, exists, list, clear`,
          };
      }
    } catch (err) {
      const latency_ms = Math.round(performance.now() - start);
      server.log.error(
        { operation, latency_ms, error: err.message },
        "healthz/s3-cached-key: operation failed"
      );
      reply.code(500);
      return {
        status: "error",
        operation,
        latency_ms,
        error: {
          name: err.name || "Error",
          message: err.message,
          code: err.code || null,
        },
      };
    } finally {
      if (client) {
        try {
          client.destroy();
        } catch (_) {
          // ignore
        }
      }
    }
  });
}
