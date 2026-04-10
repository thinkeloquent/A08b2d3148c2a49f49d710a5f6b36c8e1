/**
 * AWS S3 Storage API Lifecycle Hook for Fastify
 *
 * Registers versioned provider routes for S3 CRUD operations
 * under the /~/api/rest/{api_release_date}/providers/s3_api prefix.
 * Bucket is provided as a URL path parameter.
 *
 * Loading Order: 535 (after GitHub SDK audit at 530)
 *
 * Environment Variables (for S3 client config):
 *   AWS_S3_REGION        - AWS region (default: us-east-1)
 *   AWS_S3_ENDPOINT      - Custom endpoint URL (for LocalStack, MinIO)
 *   AWS_S3_ACCESS_KEY    - AWS access key ID
 *   AWS_S3_SECRET_KEY    - AWS secret access key
 *
 * Registered endpoints (prefix: /~/api/rest/{api_release_date}/providers/s3_api):
 *   GET    /health                                           - Health check
 *   GET    /v1/buckets                                       - List all buckets
 *   POST   /v1/buckets/:bucket                               - Create bucket
 *   HEAD   /v1/buckets/:bucket                               - Check bucket exists
 *   GET    /v1/buckets/:bucket/objects                       - List objects (query: prefix, cursor, maxKeys)
 *   POST   /v1/buckets/:bucket/objects                       - Put object (body: { key, data, contentType? })
 *   GET    /v1/buckets/:bucket/objects/by-key                - Get object (query: key)
 *   PUT    /v1/buckets/:bucket/objects/by-key                - Update object (query: key, body: data)
 *   DELETE /v1/buckets/:bucket/objects/by-key                - Delete object (query: key)
 *   GET    /v1/buckets/:bucket/objects/metadata              - Get object metadata (query: key)
 */

import {
  S3Client,
  ListBucketsCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { configFromEnv } from 'aws-s3-client';

const VENDOR = 's3_api';
const VENDOR_VERSION = 'v1.0.0';

/**
 * Build an S3Client from resolved config.
 * @param {import('aws-s3-client').SDKConfig} config
 * @returns {Promise<S3Client>}
 */
async function buildS3Client(config) {
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

  if (config.proxyUrl) {
    const { HttpsProxyAgent } = await import('https-proxy-agent');
    const agent = new HttpsProxyAgent(config.proxyUrl);
    clientConfig.requestHandler = new NodeHttpHandler({
      httpAgent: agent,
      httpsAgent: agent,
    });
  }

  return new S3Client(clientConfig);
}

/**
 * Startup hook -- Register S3 provider routes.
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config
 */
export async function onStartup(server, config) {
  server.log.info('[lifecycle:s3_api] Initializing S3 API...');

  try {
    const apiReleaseDate = server.config?.getNested?.(
      ['api_release_date', 'contract_snapshot_date', 'provider_s3'],
    ) ?? '02-01-2026';
    const PREFIX = `/~/api/rest/${apiReleaseDate}/providers/${VENDOR}`;
    server.log.info({ PREFIX, apiReleaseDate, VENDOR }, '[lifecycle:s3_api] Resolved API route prefix');

    // Resolve S3 config (credentials, endpoint, region) — bucket comes from URL
    const yamlS3 = server.config?.getNested?.(['storage', 's3']) ?? null;
    const s3Config = configFromEnv(undefined, yamlS3);

    let configured = false;
    let s3Client;
    try {
      s3Client = await buildS3Client(s3Config);
      configured = true;

      if (!server.hasDecorator('s3Client')) server.decorate('s3Client', s3Client);
      server.log.info(
        { region: s3Config.region, endpointUrl: s3Config.endpointUrl || '(default)' },
        '[lifecycle:s3_api] S3 client initialized',
      );
    } catch (err) {
      server.log.warn({ err }, '[lifecycle:s3_api] S3 client creation failed -- v1 routes will NOT be registered.');
    }

    /** Helper: run an operation with the S3 client, catch and format errors. */
    function isNotFoundError(err) {
      const errStr = String(err).toLowerCase();
      return errStr.includes('nosuchkey') || errStr.includes('not found') || errStr.includes('404');
    }

    await server.register(
      async function s3ApiRoutes(scope) {
        // Health -- always registered
        scope.get('/health', async () => ({
          status: 'ok',
          vendor: VENDOR,
          vendor_version: VENDOR_VERSION,
          configured,
          region: s3Config.region,
          endpointUrl: s3Config.endpointUrl || null,
        }));

        if (!configured) return;

        // v1 routes
        await scope.register(async (v1) => {
          // ── List all buckets ──
          v1.get('/buckets', async (_req, reply) => {
            const start = performance.now();
            try {
              const response = await s3Client.send(new ListBucketsCommand({}));
              const buckets = (response.Buckets || []).map((b) => ({
                name: b.Name,
                creationDate: b.CreationDate?.toISOString() || null,
              }));
              return {
                status: 'ok',
                latency_ms: Math.round(performance.now() - start),
                buckets,
              };
            } catch (err) {
              reply.code(500);
              return { status: 'error', latency_ms: Math.round(performance.now() - start), error: err.message };
            }
          });

          // ── Create bucket ──
          v1.post('/buckets/:bucket', async (req, reply) => {
            const { bucket } = req.params;
            const start = performance.now();
            try {
              await s3Client.send(new CreateBucketCommand({ Bucket: bucket }));
              reply.code(201);
              return {
                status: 'ok',
                latency_ms: Math.round(performance.now() - start),
                bucket,
                created: true,
              };
            } catch (err) {
              reply.code(500);
              return { status: 'error', latency_ms: Math.round(performance.now() - start), error: err.message };
            }
          });

          // ── Check bucket exists ──
          v1.head('/buckets/:bucket', async (req, reply) => {
            const { bucket } = req.params;
            try {
              await s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
              reply.code(200).send();
            } catch {
              reply.code(404).send();
            }
          });

          // ── List objects in bucket ──
          v1.get('/buckets/:bucket/objects', async (req, reply) => {
            const { bucket } = req.params;
            const prefix = req.query.prefix || '';
            const cursor = req.query.cursor || undefined;
            const maxKeys = Math.min(200, Math.max(1, parseInt(req.query.maxKeys, 10) || 50));
            const start = performance.now();

            try {
              const params = { Bucket: bucket, MaxKeys: maxKeys };
              if (prefix) params.Prefix = prefix;
              if (cursor) params.ContinuationToken = cursor;

              const response = await s3Client.send(new ListObjectsV2Command(params));

              const objects = (response.Contents || []).map((obj) => ({
                key: obj.Key,
                size: obj.Size,
                lastModified: obj.LastModified?.toISOString() || null,
                storageClass: obj.StorageClass || null,
              }));

              const commonPrefixes = (response.CommonPrefixes || []).map((p) => p.Prefix);

              return {
                status: 'ok',
                latency_ms: Math.round(performance.now() - start),
                bucket,
                prefix: prefix || null,
                nextCursor: response.NextContinuationToken || null,
                isTruncated: response.IsTruncated || false,
                keyCount: response.KeyCount || 0,
                objects,
                commonPrefixes,
              };
            } catch (err) {
              reply.code(500);
              return { status: 'error', latency_ms: Math.round(performance.now() - start), error: err.message };
            }
          });

          // ── Put object (create/update) ──
          v1.post('/buckets/:bucket/objects', async (req, reply) => {
            const { bucket } = req.params;
            const { key, data, contentType } = req.body || {};
            const start = performance.now();

            if (!key) {
              reply.code(400);
              return { status: 'error', error: 'key is required in request body' };
            }

            try {
              const body = typeof data === 'string' ? data : JSON.stringify(data ?? {});
              await s3Client.send(new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: body,
                ContentType: contentType || 'application/json',
              }));

              reply.code(201);
              return {
                status: 'ok',
                latency_ms: Math.round(performance.now() - start),
                bucket,
                key,
                size_bytes: Buffer.byteLength(body, 'utf-8'),
              };
            } catch (err) {
              reply.code(500);
              return { status: 'error', latency_ms: Math.round(performance.now() - start), error: err.message };
            }
          });

          // ── Get object by key ──
          v1.get('/buckets/:bucket/objects/by-key', async (req, reply) => {
            const { bucket } = req.params;
            const objectKey = req.query.key;
            const start = performance.now();

            if (!objectKey) {
              reply.code(400);
              return { status: 'error', error: 'query parameter "key" is required' };
            }

            try {
              const response = await s3Client.send(
                new GetObjectCommand({ Bucket: bucket, Key: objectKey }),
              );
              const content = await response.Body.transformToString();

              let parsed;
              try {
                parsed = JSON.parse(content);
              } catch {
                parsed = content;
              }

              return {
                status: 'ok',
                latency_ms: Math.round(performance.now() - start),
                bucket,
                key: objectKey,
                contentType: response.ContentType || null,
                contentLength: response.ContentLength || 0,
                data: parsed,
              };
            } catch (err) {
              if (isNotFoundError(err)) {
                reply.code(404);
                return { status: 'error', error: `Object not found: ${objectKey}` };
              }
              reply.code(500);
              return { status: 'error', latency_ms: Math.round(performance.now() - start), error: err.message };
            }
          });

          // ── Update object by key ──
          v1.put('/buckets/:bucket/objects/by-key', async (req, reply) => {
            const { bucket } = req.params;
            const objectKey = req.query.key;
            const start = performance.now();

            if (!objectKey) {
              reply.code(400);
              return { status: 'error', error: 'query parameter "key" is required' };
            }

            try {
              const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});
              await s3Client.send(new PutObjectCommand({
                Bucket: bucket,
                Key: objectKey,
                Body: body,
                ContentType: req.headers['content-type'] || 'application/json',
              }));

              return {
                status: 'ok',
                latency_ms: Math.round(performance.now() - start),
                bucket,
                key: objectKey,
                size_bytes: Buffer.byteLength(body, 'utf-8'),
              };
            } catch (err) {
              reply.code(500);
              return { status: 'error', latency_ms: Math.round(performance.now() - start), error: err.message };
            }
          });

          // ── Delete object by key ──
          v1.delete('/buckets/:bucket/objects/by-key', async (req, reply) => {
            const { bucket } = req.params;
            const objectKey = req.query.key;
            const start = performance.now();

            if (!objectKey) {
              reply.code(400);
              return { status: 'error', error: 'query parameter "key" is required' };
            }

            try {
              await s3Client.send(
                new DeleteObjectCommand({ Bucket: bucket, Key: objectKey }),
              );

              return {
                status: 'ok',
                latency_ms: Math.round(performance.now() - start),
                bucket,
                key: objectKey,
                deleted: true,
              };
            } catch (err) {
              reply.code(500);
              return { status: 'error', latency_ms: Math.round(performance.now() - start), error: err.message };
            }
          });

          // ── Get object metadata ──
          v1.get('/buckets/:bucket/objects/metadata', async (req, reply) => {
            const { bucket } = req.params;
            const objectKey = req.query.key;
            const start = performance.now();

            if (!objectKey) {
              reply.code(400);
              return { status: 'error', error: 'query parameter "key" is required' };
            }

            try {
              const response = await s3Client.send(
                new HeadObjectCommand({ Bucket: bucket, Key: objectKey }),
              );

              return {
                status: 'ok',
                latency_ms: Math.round(performance.now() - start),
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
            } catch (err) {
              if (isNotFoundError(err)) {
                reply.code(404);
                return { status: 'error', error: `Object not found: ${objectKey}` };
              }
              reply.code(500);
              return { status: 'error', latency_ms: Math.round(performance.now() - start), error: err.message };
            }
          });

          return Promise.resolve();
        }, { prefix: '/v1' });

        return Promise.resolve();
      },
      { prefix: PREFIX },
    );

    server.addHook('onClose', async () => {
      server.log.info('[s3_api] Cleaning up S3 API resources...');
      if (s3Client) {
        try { s3Client.destroy(); } catch { /* ignore */ }
      }
    });

    if (configured) {
      server.log.info({ PREFIX }, `[lifecycle:s3_api] S3 API initialized -- routes registered at ${PREFIX}/*`);
    } else {
      server.log.info({ PREFIX }, `[lifecycle:s3_api] Health endpoint registered at ${PREFIX}/health (v1 routes skipped -- no S3 client)`);
    }

  } catch (err) {
    server.log.error({ err, hookName: '535.s3_api' }, '[lifecycle:s3_api] S3 API initialization failed');
    throw err;
  }
}

/**
 * Shutdown hook.
 * @param {import('fastify').FastifyInstance} server
 */
export async function onShutdown(server) {
  server.log.info('[lifecycle:s3_api] S3 API shutdown complete');
}
