/**
 * Error response schema definitions for common-exceptions.
 *
 * Provides types and Zod schemas for standardized error response envelope:
 * - ErrorResponse: Top-level envelope {"error": ErrorDetail}
 * - ErrorDetail: Error details {code, message, status, details?, requestId?, timestamp}
 * - ValidationErrorDetail: Field-level validation errors
 * - UpstreamErrorDetail: Upstream service error context
 */

import { z } from 'zod';
import { ErrorCode } from './codes.js';
import { create } from './logger.js';

const logger = create('common-exceptions', __filename);

/**
 * Validation error detail schema.
 */
export const ValidationErrorDetailSchema = z.object({
  field: z.string().describe('Field path (e.g., "body.user.email")'),
  message: z.string().describe('Validation failure message'),
  code: z.string().optional().describe('Validation rule that failed'),
});

export type ValidationErrorDetail = z.infer<typeof ValidationErrorDetailSchema>;

/**
 * Upstream error detail schema.
 */
export const UpstreamErrorDetailSchema = z.object({
  service: z.string().describe('Name of upstream service'),
  operation: z.string().optional().describe('Operation being performed'),
  statusCode: z.number().optional().describe('Upstream HTTP status code'),
  timeoutMs: z.number().optional().describe('Timeout duration in milliseconds'),
});

export type UpstreamErrorDetail = z.infer<typeof UpstreamErrorDetailSchema>;

/**
 * Error detail schema.
 */
export const ErrorDetailSchema = z.object({
  code: z.string().describe('Machine-readable error code'),
  message: z.string().describe('Human-readable error message'),
  status: z.number().min(400).max(599).describe('HTTP status code'),
  details: z.record(z.unknown()).optional().describe('Additional context'),
  requestId: z.string().optional().describe('Correlation ID for tracing'),
  timestamp: z.string().describe('Error occurrence timestamp'),
});

export type ErrorDetail = z.infer<typeof ErrorDetailSchema>;

/**
 * Error response schema.
 */
export const ErrorResponseSchema = z.object({
  error: ErrorDetailSchema,
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

/**
 * Get current ISO8601 timestamp.
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Serialize an error to the standardized response format.
 *
 * @param code - Error code (ErrorCode or string)
 * @param message - Human-readable message
 * @param status - HTTP status code
 * @param details - Optional additional context
 * @param requestId - Optional correlation ID
 * @returns Object matching ErrorResponse schema
 *
 * @example
 * const response = serializeErrorResponse(
 *   ErrorCode.NOT_FOUND,
 *   'User not found',
 *   404,
 *   { userId: '123' },
 *   'req-abc'
 * );
 */
export function serializeErrorResponse(
  code: ErrorCode | string,
  message: string,
  status: number,
  details?: Record<string, unknown>,
  requestId?: string
): ErrorResponse {
  const response: ErrorResponse = {
    error: {
      code,
      message,
      status,
      timestamp: getTimestamp(),
    },
  };

  if (details && Object.keys(details).length > 0) {
    response.error.details = details;
  }

  if (requestId) {
    response.error.requestId = requestId;
  }

  logger.debug(`Serialized error response: ${code} (${status})`);

  return response;
}

/**
 * Create a validation error response with field-level errors.
 *
 * @param errors - Array of ValidationErrorDetail objects
 * @param message - Optional custom message
 * @param requestId - Optional correlation ID
 * @returns Object matching ErrorResponse schema with validation details
 */
export function createValidationErrorResponse(
  errors: ValidationErrorDetail[],
  message: string = 'Validation failed',
  requestId?: string
): ErrorResponse {
  return serializeErrorResponse(
    ErrorCode.VALIDATION_FAILED,
    message,
    422,
    { errors },
    requestId
  );
}

logger.debug('Response schemas initialized');
