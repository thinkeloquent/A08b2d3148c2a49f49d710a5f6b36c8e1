/**
 * Core authentication encoding functionality.
 * Encodes credentials into HTTP headers for various auth types.
 */

import { AuthType } from './types/auth-type.js';
import {
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
import {
    MissingCredentialError,
    InvalidAuthTypeError,
    HMACNotImplementedError,
} from './errors.js';

/**
 * Encode a string to Base64
 */
function toBase64(str: string): string {
    return Buffer.from(str, 'utf-8').toString('base64');
}

/**
 * Encode basic authentication (username:password) to Base64
 */
function encodeBasicAuth(username: string, password: string): string {
    return toBase64(`${username}:${password}`);
}

/**
 * Encode authentication credentials into HTTP headers.
 *
 * @param authType - The authentication type
 * @param credentials - The credentials to encode
 * @returns Record of header name to header value
 * @throws MissingCredentialError if required credentials are missing
 * @throws InvalidAuthTypeError if auth type is not supported
 * @throws HMACNotImplementedError if HMAC auth is attempted
 */
export function encodeAuth(
    authType: string,
    credentials: AuthCredentials
): Record<string, string> {
    const normalizedType = authType.toLowerCase();

    switch (normalizedType) {
        // Basic authentication types
        case AuthType.BASIC: {
            const username = extractCredential(credentials, USERNAME_KEYS);
            const password = extractCredential(credentials, PASSWORD_KEYS);
            if (!username) {
                throw new MissingCredentialError(normalizedType, 'username');
            }
            if (!password) {
                throw new MissingCredentialError(normalizedType, 'password');
            }
            return {
                Authorization: `Basic ${encodeBasicAuth(username, password)}`,
            };
        }

        case AuthType.BASIC_EMAIL: {
            const email = extractCredential(credentials, EMAIL_KEYS);
            const password = extractCredential(credentials, PASSWORD_KEYS);
            if (!email) {
                throw new MissingCredentialError(normalizedType, 'email');
            }
            if (!password) {
                throw new MissingCredentialError(normalizedType, 'password');
            }
            return {
                Authorization: `Basic ${encodeBasicAuth(email, password)}`,
            };
        }

        case AuthType.BASIC_TOKEN: {
            const username = extractCredential(credentials, USERNAME_KEYS);
            const token = extractCredential(credentials, TOKEN_KEYS);
            if (!username) {
                throw new MissingCredentialError(normalizedType, 'username');
            }
            if (!token) {
                throw new MissingCredentialError(normalizedType, 'token');
            }
            return {
                Authorization: `Basic ${encodeBasicAuth(username, token)}`,
            };
        }

        case AuthType.BASIC_EMAIL_TOKEN: {
            const email = extractCredential(credentials, EMAIL_KEYS);
            const token = extractCredential(credentials, TOKEN_KEYS);
            if (!email) {
                throw new MissingCredentialError(normalizedType, 'email');
            }
            if (!token) {
                throw new MissingCredentialError(normalizedType, 'token');
            }
            return {
                Authorization: `Basic ${encodeBasicAuth(email, token)}`,
            };
        }

        // Bearer token types - raw token
        case AuthType.BEARER:
        case AuthType.BEARER_OAUTH:
        case AuthType.BEARER_JWT: {
            const token = extractCredential(credentials, TOKEN_KEYS);
            if (!token) {
                throw new MissingCredentialError(normalizedType, 'token');
            }
            return {
                Authorization: `Bearer ${token}`,
            };
        }

        // Bearer token types - compound (Base64 encoded)
        case AuthType.BEARER_USERNAME_TOKEN: {
            const username = extractCredential(credentials, USERNAME_KEYS);
            const token = extractCredential(credentials, TOKEN_KEYS);
            if (!username) {
                throw new MissingCredentialError(normalizedType, 'username');
            }
            if (!token) {
                throw new MissingCredentialError(normalizedType, 'token');
            }
            return {
                Authorization: `Bearer ${encodeBasicAuth(username, token)}`,
            };
        }

        case AuthType.BEARER_USERNAME_PASSWORD: {
            const username = extractCredential(credentials, USERNAME_KEYS);
            const password = extractCredential(credentials, PASSWORD_KEYS);
            if (!username) {
                throw new MissingCredentialError(normalizedType, 'username');
            }
            if (!password) {
                throw new MissingCredentialError(normalizedType, 'password');
            }
            return {
                Authorization: `Bearer ${encodeBasicAuth(username, password)}`,
            };
        }

        case AuthType.BEARER_EMAIL_TOKEN: {
            const email = extractCredential(credentials, EMAIL_KEYS);
            const token = extractCredential(credentials, TOKEN_KEYS);
            if (!email) {
                throw new MissingCredentialError(normalizedType, 'email');
            }
            if (!token) {
                throw new MissingCredentialError(normalizedType, 'token');
            }
            return {
                Authorization: `Bearer ${encodeBasicAuth(email, token)}`,
            };
        }

        case AuthType.BEARER_EMAIL_PASSWORD: {
            const email = extractCredential(credentials, EMAIL_KEYS);
            const password = extractCredential(credentials, PASSWORD_KEYS);
            if (!email) {
                throw new MissingCredentialError(normalizedType, 'email');
            }
            if (!password) {
                throw new MissingCredentialError(normalizedType, 'password');
            }
            return {
                Authorization: `Bearer ${encodeBasicAuth(email, password)}`,
            };
        }

        // API key authentication
        case AuthType.X_API_KEY: {
            const apiKey = extractCredential(credentials, API_KEY_KEYS);
            if (!apiKey) {
                throw new MissingCredentialError(normalizedType, 'apiKey');
            }
            return {
                'X-API-Key': apiKey,
            };
        }

        // Custom header authentication
        case AuthType.CUSTOM:
        case AuthType.CUSTOM_HEADER: {
            const headerKey = extractCredential(credentials, HEADER_KEY_KEYS);
            const headerValue = extractCredential(credentials, HEADER_VALUE_KEYS);
            if (!headerKey) {
                throw new MissingCredentialError(normalizedType, 'headerKey');
            }
            if (!headerValue) {
                throw new MissingCredentialError(normalizedType, 'headerValue');
            }
            return {
                [headerKey]: headerValue,
            };
        }

        // No authentication
        case AuthType.NONE: {
            return {};
        }

        // HMAC - reserved but not implemented
        case AuthType.HMAC: {
            throw new HMACNotImplementedError();
        }

        default: {
            throw new InvalidAuthTypeError(authType);
        }
    }
}

/**
 * Get header name for an auth type
 */
export function getHeaderName(authType: string): string {
    const normalizedType = authType.toLowerCase();

    switch (normalizedType) {
        case AuthType.X_API_KEY:
            return 'X-API-Key';
        case AuthType.CUSTOM:
        case AuthType.CUSTOM_HEADER:
            return 'custom';
        case AuthType.NONE:
            return 'none';
        default:
            return 'Authorization';
    }
}

/**
 * Check if an auth type uses Base64 encoding
 */
export function isEncodedAuthType(authType: string): boolean {
    const normalizedType = authType.toLowerCase();

    const encodedTypes: string[] = [
        AuthType.BASIC,
        AuthType.BASIC_EMAIL,
        AuthType.BASIC_TOKEN,
        AuthType.BASIC_EMAIL_TOKEN,
        AuthType.BEARER_USERNAME_TOKEN,
        AuthType.BEARER_USERNAME_PASSWORD,
        AuthType.BEARER_EMAIL_TOKEN,
        AuthType.BEARER_EMAIL_PASSWORD,
    ];

    return encodedTypes.includes(normalizedType);
}
