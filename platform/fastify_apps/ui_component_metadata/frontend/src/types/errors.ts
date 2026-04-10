/**
 * Error types for API error handling
 */

// Error code categories
export enum ApiErrorCode {
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  RESPONSE = 'RESPONSE',
  VALIDATION = 'VALIDATION',
}

// Custom API error class with structured information
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(
    code: ApiErrorCode,
    message: string,
    status: number = 0,
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;

    if ('captureStackTrace' in Error) {
      (Error as { captureStackTrace: (err: Error, constructor: unknown) => void }).captureStackTrace(this, ApiError);
    }
  }

  isStatus(status: number): boolean {
    return this.status === status;
  }

  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  isServerError(): boolean {
    return this.status >= 500;
  }

  isNetworkError(): boolean {
    return this.code === ApiErrorCode.NETWORK;
  }

  isTimeoutError(): boolean {
    return this.code === ApiErrorCode.TIMEOUT;
  }

  getUserMessage(): string {
    switch (this.code) {
      case ApiErrorCode.NETWORK:
        return 'Unable to connect to the server. Please check your connection.';
      case ApiErrorCode.TIMEOUT:
        return 'The request took too long. Please try again.';
      case ApiErrorCode.VALIDATION:
        return this.message || 'The submitted data is invalid.';
      case ApiErrorCode.RESPONSE:
        if (this.status === 404) return 'The requested resource was not found.';
        if (this.status === 409) return this.message || 'A conflict occurred with existing data.';
        if (this.status === 503) return this.message || 'The service is temporarily unavailable. Please try again later.';
        if (this.status >= 500) return 'A server error occurred. Please try again later.';
        return this.message || 'An error occurred processing your request.';
      default:
        return this.message || 'An unexpected error occurred.';
    }
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export async function createErrorFromResponse(response: Response): Promise<ApiError> {
  let message = `Request failed with status ${response.status}`;
  let details: unknown;

  try {
    const data = await response.json();
    if (data.message) message = data.message;
    details = data;
  } catch {
    // Response body is not JSON or empty
  }

  return new ApiError(ApiErrorCode.RESPONSE, message, response.status, details);
}

export function createNetworkError(error: Error): ApiError {
  return new ApiError(ApiErrorCode.NETWORK, error.message || 'Network request failed', 0, error);
}

export function createTimeoutError(timeoutMs: number): ApiError {
  return new ApiError(ApiErrorCode.TIMEOUT, `Request timed out after ${timeoutMs}ms`, 0);
}

export function createValidationError(message: string, details?: unknown): ApiError {
  return new ApiError(ApiErrorCode.VALIDATION, message, 400, details);
}
