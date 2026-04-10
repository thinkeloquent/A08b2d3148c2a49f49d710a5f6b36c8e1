/**
 * Authentication types supported by the encoding library.
 * 15 auth types with Base64-encoded output for compound types.
 */
export const AuthType = {
    // Basic authentication types
    BASIC: 'basic',
    BASIC_EMAIL: 'basic_email',
    BASIC_TOKEN: 'basic_token',
    BASIC_EMAIL_TOKEN: 'basic_email_token',

    // Bearer token types
    BEARER: 'bearer',
    BEARER_OAUTH: 'bearer_oauth',
    BEARER_JWT: 'bearer_jwt',
    BEARER_USERNAME_TOKEN: 'bearer_username_token',
    BEARER_USERNAME_PASSWORD: 'bearer_username_password',
    BEARER_EMAIL_TOKEN: 'bearer_email_token',
    BEARER_EMAIL_PASSWORD: 'bearer_email_password',

    // API key authentication
    X_API_KEY: 'x-api-key',

    // Custom header authentication
    CUSTOM: 'custom',
    CUSTOM_HEADER: 'custom_header',

    // No authentication
    NONE: 'none',

    // Reserved - not implemented
    HMAC: 'hmac',
} as const;

export type AuthType = (typeof AuthType)[keyof typeof AuthType];

/**
 * Array of all valid auth types for validation
 */
export const AUTH_TYPES = Object.values(AuthType);

/**
 * Check if a string is a valid auth type
 */
export function isValidAuthType(value: string): value is AuthType {
    return AUTH_TYPES.includes(value as AuthType);
}
