/**
 * Config Bridge — AppYamlConfig / env → ClientConfig
 *
 * Bridges the three-tier config resolution from aws-s3-client (configFromEnv)
 * into a ClientConfig suitable for createAsyncClient.
 *
 * Works both in server context (pass YAML section) and CLI (auto-resolve from env).
 *
 * @example Server context:
 * ```typescript
 * const yaml = server.config.getNested(['storage', 's3']);
 * const config = getClientFactoryFromAppConfig(yaml);
 * const { client, destroy } = createAsyncClient(config);
 * ```
 *
 * @example CLI / direct call:
 * ```typescript
 * const config = getClientFactoryFromAppConfig();
 * const { client, destroy } = createAsyncClient(config);
 * ```
 */

import { configFromEnv } from "aws-s3-client";
import type { ClientConfig } from "./client-factory.js";
import { create as createLogger } from "./logger.js";

const logger = createLogger("cache_json_awss3_storage", import.meta.url);

/**
 * Optional overrides in ClientConfig field naming.
 */
export interface AppConfigOverrides {
  bucketName?: string;
  regionName?: string;
  endpointUrl?: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  proxyUrl?: string;
  addressingStyle?: "path" | "virtual";
  connectionTimeout?: number;
  readTimeout?: number;
  retriesMaxAttempts?: number;
  verify?: boolean;
  ttl?: number;
}

/**
 * Create a ClientConfig by resolving configuration from three tiers:
 *   1. Explicit overrides (highest priority)
 *   2. YAML config from AppYamlConfig (storage.s3 section)
 *   3. Environment variables (lowest priority)
 *
 * @param yamlConfig - YAML storage.s3 dict from AppYamlConfig.getNested(['storage','s3']).
 *                     Pass null/undefined to skip YAML tier (CLI mode — env only).
 * @param overrides  - Explicit overrides in ClientConfig naming convention.
 * @returns ClientConfig ready for use with createAsyncClient.
 */
export function getClientFactoryFromAppConfig(
  yamlConfig?: Record<string, unknown> | null,
  overrides?: AppConfigOverrides,
): ClientConfig {
  // Map overrides from ClientConfig naming → SDKConfig naming
  const sdkOverrides: Record<string, unknown> = {};
  if (overrides?.bucketName) sdkOverrides.bucketName = overrides.bucketName;
  if (overrides?.regionName) sdkOverrides.region = overrides.regionName;
  if (overrides?.endpointUrl) sdkOverrides.endpointUrl = overrides.endpointUrl;
  if (overrides?.awsAccessKeyId) sdkOverrides.awsAccessKeyId = overrides.awsAccessKeyId;
  if (overrides?.awsSecretAccessKey) sdkOverrides.awsSecretAccessKey = overrides.awsSecretAccessKey;
  if (overrides?.proxyUrl) sdkOverrides.proxyUrl = overrides.proxyUrl;
  if (overrides?.addressingStyle != null) {
    sdkOverrides.forcePathStyle = overrides.addressingStyle === "path";
  }

  // Resolve via three-tier: overrides → YAML → env
  const resolved = configFromEnv(
    Object.keys(sdkOverrides).length > 0 ? sdkOverrides as any : undefined,
    yamlConfig as any,
  );

  const config: ClientConfig = {
    bucketName: resolved.bucketName,
    regionName: resolved.region,
    endpointUrl: resolved.endpointUrl,
    awsAccessKeyId: resolved.awsAccessKeyId,
    awsSecretAccessKey: resolved.awsSecretAccessKey,
    proxyUrl: resolved.proxyUrl,
    addressingStyle: resolved.forcePathStyle ? "path" : "virtual",
    connectionTimeout: overrides?.connectionTimeout ?? 20,
    readTimeout: overrides?.readTimeout ?? 60,
    retriesMaxAttempts: overrides?.retriesMaxAttempts ?? 3,
    type: "s3",
    verify: overrides?.verify ?? true,
    ttl: resolved.ttl ?? overrides?.ttl ?? 600,
  };

  logger.info(
    `getClientFactoryFromAppConfig: resolved bucket=${config.bucketName}, ` +
      `region=${config.regionName}, endpoint=${config.endpointUrl}, ttl=${config.ttl}`
  );

  return config;
}
