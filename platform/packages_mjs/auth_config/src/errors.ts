import { AuthType } from '@internal/auth-encoding';

export class AuthConfigError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthConfigError';
    }
}

export class MissingCredentialError extends AuthConfigError {
    constructor(public authType: AuthType, public missingFields: string[]) {
        super(`Missing required credentials for '${authType}': ${missingFields.join(', ')}`);
        this.name = 'MissingCredentialError';
    }
}

export class InvalidAuthTypeError extends AuthConfigError {
    constructor(public invalidType: string) {
        super(`Invalid auth type: '${invalidType}'`);
        this.name = 'InvalidAuthTypeError';
    }
}
