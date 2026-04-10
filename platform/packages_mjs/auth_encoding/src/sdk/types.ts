/**
 * SDK type definitions for fetch-auth-encoding
 */

import type { ILogger } from '../logger.js';
import type { AuthCredentials } from '../types/credentials.js';

/**
 * Options for SDK encode function
 */
export interface SDKEncodeOptions {
    /** The authentication type */
    authType: string;
    /** The credentials to encode */
    credentials: AuthCredentials;
    /** Optional logger for debug output */
    logger?: ILogger;
}

/**
 * Metadata about the encoding operation
 */
export interface SDKEncodeMetadata {
    /** The normalized auth type used */
    authType: string;
    /** The header name generated */
    headerName: string;
    /** Whether the value was Base64 encoded */
    encoded: boolean;
}

/**
 * Result from SDK encode function
 */
export interface SDKEncodeResult {
    /** The generated headers */
    headers: Record<string, string>;
    /** Metadata about the encoding */
    metadata: SDKEncodeMetadata;
}

/**
 * Debug callback function type
 */
export type OnDebugCallback = (message: string, data?: Record<string, unknown>) => void;

/**
 * SDK options with debug callback
 */
export interface SDKEncodeOptionsWithDebug extends SDKEncodeOptions {
    /** Optional debug callback */
    onDebug?: OnDebugCallback;
}
