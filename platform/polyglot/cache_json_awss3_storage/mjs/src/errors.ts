/**
 * Exception Hierarchy for JSON S3 Storage
 *
 * Provides typed errors for S3 storage operations with context information.
 * All errors inherit from JsonS3StorageError for catch-all handling.
 */

/**
 * Context information for storage errors.
 */
export interface ErrorContext {
  operation?: string;
  key?: string;
  s3Key?: string;
}

/**
 * Base error for all S3 storage errors.
 */
export class JsonS3StorageError extends Error {
  readonly operation?: string;
  readonly key?: string;
  readonly s3Key?: string;

  constructor(message: string, context?: ErrorContext) {
    super(message);
    this.name = "JsonS3StorageError";
    this.operation = context?.operation;
    this.key = context?.key;
    this.s3Key = context?.s3Key;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace?.(this, this.constructor);
  }

  override toString(): string {
    const parts = [this.message];
    if (this.operation) parts.push(`operation=${this.operation}`);
    if (this.key) parts.push(`key=${this.key}`);
    if (this.s3Key) parts.push(`s3Key=${this.s3Key}`);
    return parts.join(" | ");
  }

  toJSON(): Record<string, string | undefined> {
    return {
      errorType: this.name,
      message: this.message,
      operation: this.operation,
      key: this.key,
      s3Key: this.s3Key,
    };
  }
}

/**
 * Failed to read from S3.
 *
 * Common causes:
 * - Object not found (404)
 * - Access denied (403)
 * - Network timeout
 */
export class JsonS3StorageReadError extends JsonS3StorageError {
  constructor(message: string, context?: ErrorContext) {
    super(message, context);
    this.name = "JsonS3StorageReadError";
  }
}

/**
 * Failed to write to S3.
 *
 * Common causes:
 * - Access denied (403)
 * - Bucket not found
 * - Storage quota exceeded
 */
export class JsonS3StorageWriteError extends JsonS3StorageError {
  constructor(message: string, context?: ErrorContext) {
    super(message, context);
    this.name = "JsonS3StorageWriteError";
  }
}

/**
 * Failed to serialize/deserialize JSON.
 *
 * Common causes:
 * - Non-serializable data type
 * - Corrupted stored data
 * - Encoding issues
 */
export class JsonS3StorageSerializationError extends JsonS3StorageError {
  constructor(message: string, context?: ErrorContext) {
    super(message, context);
    this.name = "JsonS3StorageSerializationError";
  }
}

/**
 * Authentication/authorization failure.
 *
 * Common causes:
 * - Invalid credentials
 * - Expired credentials
 * - Insufficient IAM permissions
 */
export class JsonS3StorageAuthError extends JsonS3StorageError {
  constructor(message: string, context?: ErrorContext) {
    super(message, context);
    this.name = "JsonS3StorageAuthError";
  }
}

/**
 * Configuration error.
 *
 * Common causes:
 * - Invalid bucket name
 * - Invalid region
 * - Missing required configuration
 */
export class JsonS3StorageConfigError extends JsonS3StorageError {
  constructor(message: string, context?: ErrorContext) {
    super(message, context);
    this.name = "JsonS3StorageConfigError";
  }
}

/**
 * Storage instance has been closed.
 *
 * Raised when attempting to use a storage instance after close() has been called.
 */
export class JsonS3StorageClosedError extends JsonS3StorageError {
  constructor(operation: string) {
    super(`Storage is closed, cannot perform operation: ${operation}`, {
      operation,
    });
    this.name = "JsonS3StorageClosedError";
  }
}
