/**
 * Exception hierarchy for fetch-http-cache-response.
 */

export class FetchCacheError extends Error {
  cause?: Error;
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = "FetchCacheError";
    this.cause = cause;
  }
}

export class FetchCacheConfigError extends FetchCacheError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = "FetchCacheConfigError";
  }
}

export class FetchCacheAuthError extends FetchCacheError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = "FetchCacheAuthError";
  }
}

export class FetchCacheNetworkError extends FetchCacheError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = "FetchCacheNetworkError";
  }
}

export class FetchCacheStorageError extends FetchCacheError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = "FetchCacheStorageError";
  }
}

export class FetchCacheTimeoutError extends FetchCacheError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = "FetchCacheTimeoutError";
  }
}
