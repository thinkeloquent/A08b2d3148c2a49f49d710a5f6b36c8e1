/**
 * Error classes for fetch-auth-encoding
 */

/**
 * Base error class for auth encoding errors
 */
export class AuthEncodingError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthEncodingError';
    }
}

/**
 * Error thrown when required credentials are missing
 */
export class MissingCredentialError extends AuthEncodingError {
    public readonly authType: string;
    public readonly missingField: string;

    constructor(authType: string, missingField: string) {
        super(`Missing required credential '${missingField}' for auth type '${authType}'`);
        this.name = 'MissingCredentialError';
        this.authType = authType;
        this.missingField = missingField;
    }
}

/**
 * Error thrown when an invalid auth type is provided
 */
export class InvalidAuthTypeError extends AuthEncodingError {
    public readonly authType: string;

    constructor(authType: string) {
        super(`Unsupported auth type: '${authType}'`);
        this.name = 'InvalidAuthTypeError';
        this.authType = authType;
    }
}

/**
 * Error thrown when HMAC auth is attempted (not implemented)
 */
export class HMACNotImplementedError extends AuthEncodingError {
    constructor() {
        super('HMAC authentication is not implemented');
        this.name = 'HMACNotImplementedError';
    }
}
