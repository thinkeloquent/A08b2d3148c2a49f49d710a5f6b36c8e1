/**
 * Server integration adapters for Fastify and computed functions (Story 5).
 */

import type { FastifyInstance } from "fastify";
import { FetchHttpCacheClient } from "./client.js";
import { resolveConfig } from "./config.js";
import { createLogger } from "./logger.js";
import { createFetchCacheSdk } from "./sdk.js";
import type { SDKConfig } from "./types.js";

const logger = createLogger("adapters");

// ─── Fastify Adapter ────────────────────────────────────────────────────────

export interface FastifyPluginOptions {
  yamlConfig?: Record<string, unknown>;
  overrides?: SDKConfig;
}

/**
 * Fastify plugin (NOT fp-wrapped, stays encapsulated).
 *
 * Usage:
 *   fastify.register(createFastifyPlugin, { yamlConfig });
 *   // Access via fastify.fetchCacheClient
 */
export async function createFastifyPlugin(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
): Promise<void> {
  const client = createFetchCacheSdk(opts.overrides ?? {}, opts.yamlConfig);

  fastify.decorate("fetchCacheClient", client);

  fastify.addHook("onClose", async () => {
    await client.close();
    logger.info("Fastify adapter shutdown");
  });

  logger.info("Fastify adapter initialized");
}

// ─── Computed Function Provider ─────────────────────────────────────────────

/**
 * Create a computed function provider for overwrite_from_context.
 *
 * Registers as {{fn:fetch_cache.<serviceName>}} pattern.
 */
export function createComputedProvider(
  serviceName: string,
  config: SDKConfig,
): (context?: Record<string, unknown>) => Promise<unknown> {
  let client: FetchHttpCacheClient | null = null;

  return async (context?: Record<string, unknown>): Promise<unknown> => {
    if (client === null) {
      client = createFetchCacheSdk(config);
    }

    const resolved = resolveConfig(config);
    let url = resolved.http.baseUrl;
    if (context?.url) url = context.url as string;
    if (!url) throw new Error(`No URL configured for fetch_cache.${serviceName}`);

    const result = await client.get(url);
    if (result.success) return result.data;
    throw new Error(`fetch_cache.${serviceName} failed: ${result.error}`);
  };
}

// ─── Fastify Type Augmentation ──────────────────────────────────────────────

declare module "fastify" {
  interface FastifyInstance {
    fetchCacheClient: FetchHttpCacheClient;
  }
}
