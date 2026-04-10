/**
 * SDK entry point for fetch-auth-encoding.
 * Provides a structured wrapper around the core encodeAuth function
 * with optional debug tracing.
 */

import {
  encodeAuth,
  getHeaderName,
  isEncodedAuthType,
} from "../fetch-auth-encoding.js";
import type {
  SDKEncodeOptions,
  SDKEncodeResult,
  SDKEncodeOptionsWithDebug,
} from "./types.js";

/**
 * Mask a credential value for logging (never log full credentials)
 */
function maskCredential(value: string | undefined): string {
  if (!value) return "(empty)";
  if (value.length <= 4) return "****";
  return value.substring(0, 2) + "****" + value.substring(value.length - 2);
}

/**
 * Encode authentication credentials with SDK wrapper.
 * Provides structured input/output and optional debug logging.
 *
 * @param options - SDK encode options
 * @returns SDK encode result with headers and metadata
 *
 * @example
 * ```typescript
 * import { encodeAuthSDK } from '@internal/auth-encoding/sdk';
 *
 * const result = encodeAuthSDK({
 *     authType: 'basic',
 *     credentials: { username: 'user', password: 'pass' },
 * });
 *
 * console.log(result.headers); // { Authorization: 'Basic *************' }
 * console.log(result.metadata); // { authType: 'basic', headerName: 'Authorization', encoded: true }
 * ```
 */
export function encodeAuthSDK(options: SDKEncodeOptions): SDKEncodeResult {
  const { authType, credentials, logger } = options;
  const normalizedType = authType.toLowerCase();

  logger?.debug(`Encoding auth type: ${normalizedType}`);

  // Log credential keys (not values) for debugging
  const credentialKeys = Object.keys(credentials).filter(
    (key) => credentials[key] !== undefined && credentials[key] !== ""
  );
  logger?.debug(`Credential keys provided: ${credentialKeys.join(", ")}`);

  const headers = encodeAuth(normalizedType, credentials);

  const headerName = getHeaderName(normalizedType);
  const encoded = isEncodedAuthType(normalizedType);

  logger?.debug(`Header generated: ${headerName}`);

  return {
    headers,
    metadata: {
      authType: normalizedType,
      headerName,
      encoded,
    },
  };
}

/**
 * Encode authentication credentials with debug callback.
 * Use this variant when you need custom debug handling.
 *
 * @param options - SDK encode options with debug callback
 * @returns SDK encode result with headers and metadata
 */
export function encodeAuthSDKWithDebug(
  options: SDKEncodeOptionsWithDebug
): SDKEncodeResult {
  const { authType, credentials, onDebug } = options;
  const normalizedType = authType.toLowerCase();

  onDebug?.(`Encoding auth type: ${normalizedType}`);

  // Log credential keys for debugging
  const credentialKeys = Object.keys(credentials).filter(
    (key) => credentials[key] !== undefined && credentials[key] !== ""
  );
  onDebug?.(`Credential keys provided: ${credentialKeys.join(", ")}`, {
    keys: credentialKeys,
  });

  const headers = encodeAuth(normalizedType, credentials);

  const headerName = getHeaderName(normalizedType);
  const encoded = isEncodedAuthType(normalizedType);

  onDebug?.(`Header generated: ${headerName}`, {
    headerName,
    encoded,
  });

  return {
    headers,
    metadata: {
      authType: normalizedType,
      headerName,
      encoded,
    },
  };
}

// Re-export types
export type {
  SDKEncodeOptions,
  SDKEncodeResult,
  SDKEncodeMetadata,
  SDKEncodeOptionsWithDebug,
  OnDebugCallback,
} from "./types.js";
