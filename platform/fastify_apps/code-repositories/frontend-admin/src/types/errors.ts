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

    // Maintains proper stack trace for where our error was thrown (V8 only)
    if ('captureStackTrace' in Error) {
      (Error as { captureStackTrace: (err: Error, constructor: unknown) => void }).captureStackTrace(this, ApiError);
    }
  }

  // Check if error is a specific HTTP status
  isStatus(status: number): boolean {
    return this.status === status;
  }

  // Check if error is client error (4xx)
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  // Check if error is server error (5xx)
  isServerError(): boolean {
    return this.status >= 500;
  }

  // Check if error is network-related
  isNetworkError(): boolean {
    return this.code === ApiErrorCode.NETWORK;
  }

  // Check if error is timeout
  isTimeoutError(): boolean {
    return this.code === ApiErrorCode.TIMEOUT;
  }

  // Get user-friendly message
  getUserMessage(): string {
    switch (this.code) {
      case ApiErrorCode.NETWORK:
        return 'Unable to connect to the server. Please check your connection.';
      case ApiErrorCode.TIMEOUT:
        return 'The request took too long. Please try again.';
      case ApiErrorCode.VALIDATION:
        return this.message || 'The submitted data is invalid.';
      case ApiErrorCode.RESPONSE:
        if (this.status === 404) {
          return 'The requested resource was not found.';
        }
        if (this.status === 409) {
          return this.message || 'A conflict occurred with existing data.';
        }
        if (this.status >= 500) {
          return 'A server error occurred. Please try again later.';
        }
        return this.message || 'An error occurred processing your request.';
      default:
        return this.message || 'An unexpected error occurred.';
    }
  }
}

// Type guard to check if an error is an ApiError
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

// Create error from fetch response
export async function createErrorFromResponse(response: Response): Promise<ApiError> {
  let message = `Request failed with status ${response.status}`;
  let details: unknown;

  try {
    const data = await response.json();
    if (data.message) {
      message = data.message;
    }
    details = data;
  } catch {
    // Response body is not JSON or empty
  }

  return new ApiError(
    ApiErrorCode.RESPONSE,
    message,
    response.status,
    details
  );
}

// Create network error
export function createNetworkError(error: Error): ApiError {
  return new ApiError(
    ApiErrorCode.NETWORK,
    error.message || 'Network request failed',
    0,
    error
  );
}

// Create timeout error
export function createTimeoutError(timeoutMs: number): ApiError {
  return new ApiError(
    ApiErrorCode.TIMEOUT,
    `Request timed out after ${timeoutMs}ms`,
    0
  );
}

// Create validation error
export function createValidationError(message: string, details?: unknown): ApiError {
  return new ApiError(
    ApiErrorCode.VALIDATION,
    message,
    400,
    details
  );
}
