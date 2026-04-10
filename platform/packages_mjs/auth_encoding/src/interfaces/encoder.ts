/**
 * Polyglot interface definitions for auth encoding.
 * These interfaces ensure identical contracts between TypeScript and Python.
 */

/**
 * Authentication credentials interface.
 * Supports flexible key aliases for credential extraction.
 */
export interface IAuthCredentials {
    username?: string;
    password?: string;
    email?: string;
    token?: string;
    headerKey?: string;
    headerValue?: string;
    value?: string;
    key?: string;
    apiKey?: string;
    [key: string]: string | undefined;
}

/**
 * Result of encoding operation
 */
export interface IEncodingResult {
    headers: Record<string, string>;
}

/**
 * Auth encoder interface.
 * Implemented by encoding functions and SDK wrappers.
 */
export interface IAuthEncoder {
    encode(authType: string, credentials: IAuthCredentials): IEncodingResult;
}

/**
 * Encoding metadata for SDK result
 */
export interface IEncodingMetadata {
    authType: string;
    headerName: string;
    encoded: boolean;
}

/**
 * SDK encoding result with headers and metadata
 */
export interface ISDKEncodingResult extends IEncodingResult {
    metadata: IEncodingMetadata;
}
