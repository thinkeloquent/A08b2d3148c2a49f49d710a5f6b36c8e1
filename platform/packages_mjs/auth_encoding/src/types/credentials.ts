/**
 * Credential key aliases for flexible credential extraction.
 * Keys are checked in priority order.
 */

/** Username aliases - checked in order */
export const USERNAME_KEYS = [
    'username',
    'user',
    'userName',
    'user_name',
    'login',
    'id',
    'userId',
] as const;

/** Password aliases - checked in order */
export const PASSWORD_KEYS = [
    'password',
    'pass',
    'pwd',
    'secret',
    'credential',
    'passwd',
    'passphrase',
    'password_hash',
] as const;

/** Email aliases - checked in order */
export const EMAIL_KEYS = [
    'email',
    'mail',
    'emailAddress',
    'email_address',
    'userEmail',
    'user_email',
] as const;

/** Token aliases - checked in order */
export const TOKEN_KEYS = [
    'token',
    'access_token',
    'accessToken',
    'auth_token',
    'authToken',
    'bearer_token',
    'bearerToken',
    'jwt',
    'api_token',
    'apiToken',
] as const;

/** API key aliases - checked in order */
export const API_KEY_KEYS = [
    'apiKey',
    'api_key',
    'key',
    'x-api-key',
    'xApiKey',
    'apikey',
    'api-key',
    'token',
    'access_key',
    'accessKey',
] as const;

/** Header key aliases - checked in order */
export const HEADER_KEY_KEYS = [
    'headerKey',
    'header_key',
    'headerName',
    'header_name',
    'name',
    'key',
] as const;

/** Header value aliases - checked in order */
export const HEADER_VALUE_KEYS = [
    'headerValue',
    'header_value',
    'value',
    'headerContent',
    'header_content',
] as const;

/**
 * Authentication credentials interface.
 * Supports flexible key aliases for credential extraction.
 */
export interface AuthCredentials {
    username?: string;
    user?: string;
    userName?: string;
    user_name?: string;
    login?: string;
    id?: string;
    userId?: string;

    password?: string;
    pass?: string;
    pwd?: string;
    secret?: string;
    credential?: string;
    passwd?: string;
    passphrase?: string;
    password_hash?: string;

    email?: string;
    mail?: string;
    emailAddress?: string;
    email_address?: string;
    userEmail?: string;
    user_email?: string;

    token?: string;
    access_token?: string;
    accessToken?: string;
    auth_token?: string;
    authToken?: string;
    bearer_token?: string;
    bearerToken?: string;
    jwt?: string;
    api_token?: string;
    apiToken?: string;

    apiKey?: string;
    api_key?: string;
    key?: string;
    'x-api-key'?: string;
    xApiKey?: string;
    apikey?: string;
    'api-key'?: string;
    access_key?: string;
    accessKey?: string;

    headerKey?: string;
    header_key?: string;
    headerName?: string;
    header_name?: string;
    name?: string;

    headerValue?: string;
    header_value?: string;
    value?: string;
    headerContent?: string;
    header_content?: string;

    [key: string]: string | undefined;
}

/**
 * Extract a value from credentials using key aliases in priority order.
 */
export function extractCredential(
    credentials: AuthCredentials,
    keys: readonly string[]
): string | undefined {
    for (const key of keys) {
        const value = credentials[key];
        if (value !== undefined && value !== '') {
            return value;
        }
    }
    return undefined;
}
