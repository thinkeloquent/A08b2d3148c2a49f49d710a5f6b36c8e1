/**
 * fetch-auth-encoding - Polyglot authentication encoding utilities.
 *
 * Provides encoding for 15 authentication types (Basic, Bearer, API Key, Custom)
 * with Base64-encoded output for compound auth types.
 * Zero production dependencies - uses platform built-ins only.
 */

// Logger
export { logger, createLogger, type LogLevel, type LoggerOptions, type ILogger } from './logger.js';

// Types
export { AuthType, AUTH_TYPES, isValidAuthType } from './types/auth-type.js';
export {
    type AuthCredentials,
    USERNAME_KEYS,
    PASSWORD_KEYS,
    EMAIL_KEYS,
    TOKEN_KEYS,
    API_KEY_KEYS,
    HEADER_KEY_KEYS,
    HEADER_VALUE_KEYS,
    extractCredential,
} from './types/credentials.js';

// Interfaces
export type {
    IAuthCredentials,
    IEncodingResult,
    IAuthEncoder,
    IEncodingMetadata,
    ISDKEncodingResult,
} from './interfaces/index.js';

// Core encoding
export { encodeAuth, getHeaderName, isEncodedAuthType } from './fetch-auth-encoding.js';

// Errors
export {
    AuthEncodingError,
    MissingCredentialError,
    InvalidAuthTypeError,
    HMACNotImplementedError,
} from './errors.js';

// SDK (namespace export)
export * as sdk from './sdk/index.js';
