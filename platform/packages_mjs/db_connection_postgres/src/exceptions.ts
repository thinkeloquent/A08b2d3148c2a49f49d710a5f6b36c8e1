export class DatabaseConfigError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DatabaseConfigError';
    }
}

export class DatabaseConnectionError extends Error {
    public readonly originalError: Error | null;

    constructor(message: string, originalError: Error | null = null) {
        super(message);
        this.name = 'DatabaseConnectionError';
        this.originalError = originalError;
    }
}

export class DatabaseImportError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DatabaseImportError';
    }
}
