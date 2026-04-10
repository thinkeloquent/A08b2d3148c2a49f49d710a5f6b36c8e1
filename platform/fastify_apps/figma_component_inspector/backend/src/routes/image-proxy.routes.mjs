/**
 * Image Proxy Routes
 *
 * Cache strategy (controlled by feature flag `figma_component_inspector.image_cache`):
 *
 *   enabled=true  → S3 cache (bucket: figma-component-inspector)
 *   enabled=false → in-memory LRU cache (server-side, 100 entries, 30 min TTL)
 *
 * Browser cache (controlled by feature option `image.cache_control`):
 *
 *   max_age:   seconds the browser may cache (default 3600)
 *   immutable: append "immutable" directive (default false)
 *
 * Both paths avoid hitting the Figma API on every request.
 * Query param `bust=1` forces a re-fetch in either mode.
 *
 * Key format: previews/{fileId}/{nodeId}_{scale}x.{format}
 */

import {
  HeadBucketCommand,
  CreateBucketCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

// ── S3 cache ─────────────────────────────────────────────────────────────────

const BUCKET = "figma-component-inspector";
let bucketReady = false;

async function ensureBucket(s3Client) {
  if (bucketReady) return;
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET }));
  } catch {
    await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET }));
  }
  bucketReady = true;
}

// ── In-memory LRU cache ──────────────────────────────────────────────────────

const MEM_MAX_ENTRIES = 100;
const MEM_TTL_MS = 30 * 60 * 1000; // 30 minutes

/** @type {Map<string, { buffer: Buffer, contentType: string, createdAt: number }>} */
const memCache = new Map();

function memGet(key) {
  const entry = memCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > MEM_TTL_MS) {
    memCache.delete(key);
    return null;
  }
  // Move to end (most-recently used)
  memCache.delete(key);
  memCache.set(key, entry);
  return entry;
}

function memSet(key, buffer, contentType) {
  // Evict oldest if at capacity
  if (memCache.size >= MEM_MAX_ENTRIES) {
    const oldest = memCache.keys().next().value;
    memCache.delete(oldest);
  }
  memCache.set(key, { buffer, contentType, createdAt: Date.now() });
}

// ── Shared helpers ───────────────────────────────────────────────────────────

function buildKey(fileId, nodeId, scale, format) {
  const safeNodeId = nodeId.replace(/:/g, "-");
  return `previews/${fileId}/${safeNodeId}_${scale}x.${format}`;
}

const CONTENT_TYPES = {
  png: "image/png",
  jpg: "image/jpeg",
  svg: "image/svg+xml",
  pdf: "application/pdf",
};

// 1x1 transparent PNG (67 bytes) — returned when Figma has no image for a node
const TRANSPARENT_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQAB" +
  "Nl7BcQAAAABJRU5ErkJggg==",
  "base64",
);

/**
 * Build the Cache-Control header value from feature options.
 *
 * @param {object} cacheOpts - { max_age?: number, immutable?: boolean }
 * @returns {string}
 */
function buildCacheControl(cacheOpts) {
  const maxAge = cacheOpts?.max_age ?? 3600;
  if (maxAge <= 0) return "no-store";
  const parts = ["public", `max-age=${maxAge}`];
  if (cacheOpts?.immutable) parts.push("immutable");
  return parts.join(", ");
}

/**
 * Fetch image binary from Figma API + CDN.
 *
 * Returns { buffer, imageUrl, placeholder } where placeholder=true means
 * Figma had no image for this node (a 1x1 transparent PNG is returned
 * so <img src> never breaks).
 */
async function fetchFromFigma(figmaService, fileId, nodeId, scale, format, reply, log) {
  let imageUrl;
  try {
    const data = await figmaService.getComponentImages(fileId, [nodeId], scale, format);
    imageUrl = data?.images?.[nodeId];
    if (!imageUrl) {
      log.debug({ fileId, nodeId }, "Figma returned no image URL — serving placeholder");
      return { buffer: TRANSPARENT_PNG, imageUrl: null, placeholder: true };
    }
  } catch (err) {
    log.error(err, "Figma image API error");
    reply.status(err.statusCode || 502).send({ success: false, error: err.message });
    return null;
  }

  try {
    const resp = await fetch(imageUrl);
    if (!resp.ok) {
      log.warn({ fileId, nodeId, status: resp.status }, "Figma CDN error — serving placeholder");
      return { buffer: TRANSPARENT_PNG, imageUrl, placeholder: true };
    }
    const buffer = Buffer.from(await resp.arrayBuffer());
    return { buffer, imageUrl, placeholder: false };
  } catch (err) {
    log.error(err, "Failed to download image from Figma CDN");
    reply.status(502).send({ success: false, error: "Failed to download image from Figma" });
    return null;
  }
}

// ── Route handler ────────────────────────────────────────────────────────────

export default async function imageProxyRoutes(fastify, _options) {
  const figmaService = fastify.figmaService;

  // Resolve cache_control from feature options once at registration time
  const cacheOpts = typeof fastify.getFeatureOption === "function"
    ? fastify.getFeatureOption("figma_component_inspector", "image", "cache_control")
    : undefined;
  const cacheControl = buildCacheControl(cacheOpts);

  /**
   * GET /image/:fileId/:nodeId
   * Query: scale (default 2), format (default png), bust (forces re-fetch)
   *
   * Feature flag:   feature_flags.figma_component_inspector.image_cache
   * Feature option: feature_options.figma_component_inspector.image.cache_control
   */
  fastify.addHook("onSend", async (_request, reply) => {
    reply.header("Access-Control-Expose-Headers", "X-Cache, X-Cache-Date, X-Placeholder");
  });

  fastify.get("/:fileId/:nodeId", async (request, reply) => {
    const { fileId, nodeId } = request.params;
    if (!fileId?.trim() || !nodeId?.trim()) {
      return reply.badRequest("fileId and nodeId are required");
    }

    const scale = parseFloat(request.query.scale) || 2;
    const format = ["png", "jpg", "svg", "pdf"].includes(request.query.format)
      ? request.query.format
      : "png";
    const bustCache = request.query.bust === "1";
    const contentType = CONTENT_TYPES[format];
    const key = buildKey(fileId, nodeId, scale, format);

    // Check feature flag
    const s3CacheEnabled = typeof fastify.isFeatureEnabled === "function"
      ? fastify.isFeatureEnabled("figma_component_inspector", "image_cache")
      : true;

    const s3Client = fastify.s3Client;

    // ── Path A: S3 cache ─────────────────────────────────────────────────
    if (s3Client && s3CacheEnabled) {
      try {
        await ensureBucket(s3Client);
      } catch (err) {
        request.log.warn(err, "S3 bucket init failed, falling back to memory cache");
        return serveFromMemoryCache(key, figmaService, fileId, nodeId, scale, format, contentType, cacheControl, bustCache, request, reply);
      }

      // Try S3 cache first
      if (!bustCache) {
        try {
          const cached = await s3Client.send(
            new GetObjectCommand({ Bucket: BUCKET, Key: key }),
          );
          reply.header("Content-Type", contentType);
          reply.header("X-Cache", "HIT");
          reply.header("X-Cache-Date", (cached.LastModified ?? new Date()).toISOString());
          reply.header("Cache-Control", cacheControl);
          return reply.send(cached.Body);
        } catch {
          // Cache miss — continue to fetch
        }
      }

      // Fetch from Figma
      const result = await fetchFromFigma(figmaService, fileId, nodeId, scale, format, reply, request.log);
      if (!result) return; // error already sent

      if (result.placeholder) {
        // Don't cache placeholders — the real image may become available later
        reply.header("Content-Type", "image/png");
        reply.header("X-Cache", "MISS");
        reply.header("X-Placeholder", "true");
        reply.header("Cache-Control", "no-cache");
        return reply.send(result.buffer);
      }

      // Store in S3 (fire and forget)
      s3Client
        .send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: result.buffer, ContentType: contentType }))
        .catch((err) => request.log.warn(err, "S3 cache write failed"));

      reply.header("Content-Type", contentType);
      reply.header("X-Cache", "MISS");
      reply.header("X-Cache-Date", new Date().toISOString());
      reply.header("Cache-Control", cacheControl);
      return reply.send(result.buffer);
    }

    // ── Path B: in-memory cache (S3 disabled or unavailable) ─────────────
    return serveFromMemoryCache(key, figmaService, fileId, nodeId, scale, format, contentType, cacheControl, bustCache, request, reply);
  });
}

/** Serve an image using the in-memory LRU cache. */
async function serveFromMemoryCache(key, figmaService, fileId, nodeId, scale, format, contentType, cacheControl, bustCache, request, reply) {
  // Check memory cache
  if (!bustCache) {
    const cached = memGet(key);
    if (cached) {
      reply.header("Content-Type", cached.contentType);
      reply.header("X-Cache", "MEM-HIT");
      reply.header("X-Cache-Date", new Date(cached.createdAt).toISOString());
      reply.header("Cache-Control", cacheControl);
      return reply.send(cached.buffer);
    }
  }

  // Fetch from Figma
  const result = await fetchFromFigma(figmaService, fileId, nodeId, scale, format, reply, request.log);
  if (!result) return; // error already sent

  if (result.placeholder) {
    // Don't cache placeholders — return transparent PNG with no-cache
    reply.header("Content-Type", "image/png");
    reply.header("X-Cache", "MEM-MISS");
    reply.header("X-Placeholder", "true");
    reply.header("Cache-Control", "no-cache");
    return reply.send(result.buffer);
  }

  // Store in memory
  memSet(key, result.buffer, contentType);

  reply.header("Content-Type", contentType);
  reply.header("X-Cache", "MEM-MISS");
  reply.header("X-Cache-Date", new Date().toISOString());
  reply.header("Cache-Control", cacheControl);
  return reply.send(result.buffer);
}
