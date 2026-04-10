/**
 * Type exports for fetch-auth-encoding
 */

export { AuthType, AUTH_TYPES, isValidAuthType } from './auth-type.js';
export type { AuthCredentials } from './credentials.js';
export {
    USERNAME_KEYS,
    PASSWORD_KEYS,
    EMAIL_KEYS,
    TOKEN_KEYS,
    API_KEY_KEYS,
    HEADER_KEY_KEYS,
    HEADER_VALUE_KEYS,
    extractCredential,
} from './credentials.js';
