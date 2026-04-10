/**
 * Configuration Management for AWS S3 Client SDK
 *
 * Provides configuration types, validation, and environment variable support.
 */

import { JsonS3StorageConfigError } from "./errors.js";
import { create as createLogger } from "./logger.js";
import { resolveAwsS3Env } from "@internal/env-resolver";

const logger = createLogger("aws_s3_client", import.meta.url);

/**
 * SDK configuration with environment variable fallback.
 */
export interface SDKConfig {
  /** S3 bucket name (required) */
  bucketName: string;
  /** AWS region (default: us-east-1) */
  region?: string;
  /** Object key prefix (default: jss3:) */
  keyPrefix?: string;
  /** Default TTL in seconds (undefined = no expiration) */
  ttl?: number;
  /** Enable debug logging */
  debug?: boolean;
  /** Specific fields for key generation */
  hashKeys?: string[];
  /** AWS access key ID */
  awsAccessKeyId?: string;
  /** AWS secret access key */
  awsSecretAccessKey?: string;
  /** Custom S3 endpoint URL (for LocalStack, etc.) */
  endpointUrl?: string;
  /** HTTP/HTTPS proxy URL */
  proxyUrl?: string;
  /** Force path-style addressing (e.g. for LocalStack, MinIO) */
  forcePathStyle?: boolean;
}

/**
 * YAML storage.s3 configuration shape (from server.dev.yaml → storage.s3).
 */
export interface YamlStorageS3Config {
  endpoint_url?: string | null;
  region_name?: string | null;
  access_key_id?: string | null;
  secret_access_key?: string | null;
  bucket_name?: string | null;
  force_path_style?: boolean | null;
  proxy_url?: string | null;
  verify_ssl?: boolean | null;
}

/** Treat null as unset so YAML nulls fall through the ?? chain. */
function y<T>(v: T | null | undefined): T | undefined {
  return v != null ? v : undefined;
}

/**
 * Create configuration with three-tier resolution: ARG → YamlConfig → ENV.
 *
 * Resolution order (highest priority first):
 *   1. Explicit overrides (function arguments)
 *   2. YAML config (yamlConfig.storage.s3)
 *   3. Environment variables
 *   4. Defaults
 *
 * Environment variables:
 *   AWS_S3_BUCKET / AWS_S3_BUCKETNAME: Bucket name
 *   AWS_S3_REGION / AWS_REGION / AWS_DEFAULT_REGION: AWS region
 *   AWS_S3_KEY_PREFIX: Key prefix
 *   AWS_S3_TTL: Default TTL in seconds
 *   AWS_S3_DEBUG: Enable debug logging (true/false)
 *   AWS_S3_ACCESS_KEY / AWS_ACCESS_KEY_ID: AWS access key
 *   AWS_S3_SECRET_KEY / AWS_SECRET_ACCESS_KEY: AWS secret key
 *   AWS_S3_ENDPOINT / AWS_ENDPOINT_URL: Custom endpoint URL
 */
export function configFromEnv(
  overrides?: Partial<SDKConfig>,
  yamlConfig?: YamlStorageS3Config | null,
): SDKConfig {
  const yaml = yamlConfig ?? {};
  const env = resolveAwsS3Env();

  const bucketName =
    overrides?.bucketName ??
    y(yaml.bucket_name) ??
    env.bucket ??
    "";

  const region =
    overrides?.region ??
    y(yaml.region_name) ??
    env.region;

  const keyPrefix = overrides?.keyPrefix ?? env.keyPrefix;

  const ttl = overrides?.ttl ?? (env.ttl ? parseInt(env.ttl, 10) : undefined);

  const debug = overrides?.debug ?? env.debug;

  logger.debug(`configFromEnv: bucket=${bucketName}, region=${region}, debug=${debug}`);

  return {
    bucketName,
    region,
    keyPrefix,
    ttl,
    debug,
    hashKeys: overrides?.hashKeys,
    awsAccessKeyId:
      overrides?.awsAccessKeyId ??
      y(yaml.access_key_id) ??
      env.accessKey,
    awsSecretAccessKey:
      overrides?.awsSecretAccessKey ??
      y(yaml.secret_access_key) ??
      env.secretKey,
    endpointUrl:
      overrides?.endpointUrl ??
      y(yaml.endpoint_url) ??
      env.endpoint,
    proxyUrl:
      overrides?.proxyUrl ??
      // When yamlConfig is explicitly provided, its proxy_url (even null) takes
      // precedence — do NOT fall through to system env vars.  This lets
      // AppYamlConfig `proxy_url: null` mean "no proxy".
      (yamlConfig != null && 'proxy_url' in yaml
        ? y(yaml.proxy_url)
        : env.proxy),
    forcePathStyle:
      overrides?.forcePathStyle ??
      y(yaml.force_path_style) ??
      env.forcePathStyle,
  };
}

/**
 * Validate configuration and return list of issues.
 */
export function validateConfig(config: SDKConfig): string[] {
  const issues: string[] = [];

  if (!config.bucketName) {
    issues.push("bucketName is required");
  }

  if (!config.region) {
    issues.push("region is required");
  }

  if (config.ttl !== undefined && config.ttl < 0) {
    issues.push("ttl must be non-negative");
  }

  return issues;
}

/**
 * Assert configuration is valid, throw if not.
 */
export function assertValidConfig(config: SDKConfig): void {
  const issues = validateConfig(config);
  if (issues.length > 0) {
    throw new JsonS3StorageConfigError(issues.join("; "));
  }
}
