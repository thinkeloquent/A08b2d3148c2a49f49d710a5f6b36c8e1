/**
 * Exception Hierarchy for AWS S3 Client
 *
 * Provides typed errors for specific error conditions.
 */

/**
 * Context information for errors.
 */
export interface ErrorContext {
  operation: string;
  key?: string | null;
  s3Key?: string | null;
  extra?: Record<string, unknown>;
}

/**
 * Base error for all storage errors.
 */
export class JsonS3StorageError extends Error {
  public readonly context: ErrorContext | null;

  constructor(message: string, context?: ErrorContext) {
    super(message);
    this.name = "JsonS3StorageError";
    this.context = context ?? null;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  override toString(): string {
    if (this.context) {
      return `${this.name}: ${this.message} (operation=${this.context.operation}, key=${this.context.key})`;
    }
    return `${this.name}: ${this.message}`;
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      context: this.context,
      stack: this.stack,
    };
  }
}

/**
 * Raised when configuration is invalid.
 */
export class JsonS3StorageConfigError extends JsonS3StorageError {
  constructor(message: string) {
    super(message);
    this.name = "JsonS3StorageConfigError";
  }
}

/**
 * Raised when access is denied (403).
 */
export class JsonS3StorageAuthError extends JsonS3StorageError {
  constructor(message: string, context?: ErrorContext) {
    super(message, context);
    this.name = "JsonS3StorageAuthError";
  }
}

/**
 * Raised when a read operation fails.
 */
export class JsonS3StorageReadError extends JsonS3StorageError {
  constructor(message: string, context?: ErrorContext) {
    super(message, context);
    this.name = "JsonS3StorageReadError";
  }
}

/**
 * Raised when a write operation fails.
 */
export class JsonS3StorageWriteError extends JsonS3StorageError {
  constructor(message: string, context?: ErrorContext) {
    super(message, context);
    this.name = "JsonS3StorageWriteError";
  }
}

/**
 * Raised when JSON serialization/deserialization fails.
 */
export class JsonS3StorageSerializationError extends JsonS3StorageError {
  constructor(message: string, context?: ErrorContext) {
    super(message, context);
    this.name = "JsonS3StorageSerializationError";
  }
}

/**
 * Raised when an operation is attempted on a closed storage instance.
 */
export class JsonS3StorageClosedError extends JsonS3StorageError {
  constructor(operation: string) {
    super(`Cannot perform '${operation}' on closed storage`, {
      operation,
    });
    this.name = "JsonS3StorageClosedError";
  }
}
