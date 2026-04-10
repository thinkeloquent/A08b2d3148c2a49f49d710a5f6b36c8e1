/**
 * Common Exceptions - Standardized exception handling for Fastify.
 *
 * Provides a unified interface for raising, catching, and serializing exceptions
 * across Python (FastAPI/HTTPX) and Node.js (Fastify/Undici) applications.
 *
 * @example
 * import Fastify from 'fastify';
 * import {
 *   NotFoundException,
 *   ValidationException,
 *   registerExceptionHandlers,
 * } from '@internal/common-exceptions';
 *
 * const app = Fastify();
 * registerExceptionHandlers(app);
 *
 * // Raise exceptions
 * throw new NotFoundException({ message: 'User not found', details: { userId: '123' } });
 */

// Core
export { create as createLogger, Logger, LogLevel } from './logger.js';
export { ErrorCode, getStatusForCode, getCodeCategory, isValidErrorCode } from './codes.js';
export {
  ErrorResponse,
  ErrorDetail,
  ValidationErrorDetail,
  UpstreamErrorDetail,
  serializeErrorResponse,
  createValidationErrorResponse,
  ErrorResponseSchema,
  ErrorDetailSchema,
  ValidationErrorDetailSchema,
  UpstreamErrorDetailSchema,
} from './response.js';
export { BaseHttpException, BaseHttpExceptionOptions, LogEntry } from './base.js';

// Inbound exceptions
export {
  NotAuthenticatedException,
  NotAuthorizedException,
  NotFoundException,
  BadRequestException,
  ValidationException,
  ConflictException,
  TooManyRequestsException,
  InboundExceptionOptions,
  ValidationExceptionOptions,
  TooManyRequestsExceptionOptions,
} from './inbound.js';

// Outbound exceptions
export {
  ConnectTimeoutException,
  ReadTimeoutException,
  WriteTimeoutException,
  NetworkException,
  UpstreamServiceException,
  UpstreamTimeoutException,
  OutboundExceptionOptions,
  TimeoutExceptionOptions,
  NetworkExceptionOptions,
  UpstreamServiceExceptionOptions,
  UpstreamTimeoutExceptionOptions,
} from './outbound.js';

// Internal exceptions
export {
  InternalServerException,
  ServiceUnavailableException,
  BadGatewayException,
  InternalExceptionOptions,
  InternalServerExceptionOptions,
  ServiceUnavailableExceptionOptions,
} from './internal.js';

// Fastify adapter
export { registerExceptionHandlers, createErrorHandler, createSchemaErrorFormatter } from './fastify/index.js';
export { requestIdPlugin, RequestIdPluginOptions } from './fastify/middleware.js';
export { normalizeAjvErrors, normalizeZodErrors, NormalizedFieldError, AjvError, ZodIssue } from './fastify/normalizers.js';

// Undici adapter
export {
  wrapUndiciErrors,
  undiciErrorToException,
  checkUpstreamStatus,
  extractServiceFromUrl,
  WrapUndiciErrorsOptions,
} from './undici/index.js';

// SDK
export { createException, parseErrorResponse, isCommonException } from './sdk/factory.js';
export { formatForCli, printError, FormatCliOptions } from './sdk/cli.js';
export { toAgentContext, AgentErrorContext } from './sdk/agent.js';

export const VERSION = '1.0.0';
