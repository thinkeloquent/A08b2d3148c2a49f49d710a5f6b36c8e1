export class RedisConfigError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RedisConfigError';
    }
}

export class RedisConnectionError extends Error {
    public readonly originalError: Error | null;

    constructor(message: string, originalError: Error | null = null) {
        super(message);
        this.name = 'RedisConnectionError';
        this.originalError = originalError;
    }
}

export class RedisImportError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RedisImportError';
    }
}
