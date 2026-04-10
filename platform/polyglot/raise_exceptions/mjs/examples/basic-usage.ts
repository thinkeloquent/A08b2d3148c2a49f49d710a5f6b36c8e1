#!/usr/bin/env npx tsx
/**
 * Common Exceptions - Basic Usage Examples (TypeScript)
 *
 * This script demonstrates the core features of the common-exceptions package:
 * - Creating and raising exceptions
 * - Serializing exceptions to API responses
 * - Using the SDK for CLI and agent integration
 * - Logging with the built-in logger
 *
 * Run with: npx tsx basic-usage.ts
 */

import {
  // Logger
  createLogger,
  // Error codes
  ErrorCode,
  getStatusForCode,
  // Base exception
  BaseHttpException,
  // Inbound exceptions
  NotFoundException,
  ValidationException,
  BadRequestException,
  NotAuthenticatedException,
  NotAuthorizedException,
  ConflictException,
  TooManyRequestsException,
  // Outbound exceptions
  ConnectTimeoutException,
  UpstreamServiceException,
  NetworkException,
  // Internal exceptions
  InternalServerException,
  // SDK
  createException,
  parseErrorResponse,
  isCommonException,
  formatForCli,
  toAgentContext,
  // Types
  ErrorResponse,
} from '../src/index.js';

// Create logger for this module
const logger = createLogger('examples', __filename);

// =============================================================================
// Example 1: Basic Exception Creation
// =============================================================================
function example1_basicExceptionCreation(): void {
  /**
   * Demonstrates creating basic HTTP exceptions with different error codes.
   * Each exception automatically derives its HTTP status from the error code.
   */
  logger.info('Example 1: Basic Exception Creation');

  // NotFoundException (404)
  const notFound = new NotFoundException({
    message: 'User not found',
    details: { userId: 'user-123' },
    requestId: 'req-abc-123',
  });
  console.log(`  NotFoundException: status=${notFound.status}, code=${notFound.code}`);

  // BadRequestException (400)
  const badRequest = new BadRequestException({
    message: 'Invalid input provided',
    details: { field: 'email', reason: 'invalid format' },
  });
  console.log(`  BadRequestException: status=${badRequest.status}, code=${badRequest.code}`);

  // NotAuthenticatedException (401)
  const notAuth = new NotAuthenticatedException({ message: 'Token expired' });
  console.log(`  NotAuthenticatedException: status=${notAuth.status}`);

  // NotAuthorizedException (403)
  const forbidden = new NotAuthorizedException({
    message: 'Insufficient permissions',
    details: { required_role: 'admin', user_role: 'viewer' },
  });
  console.log(`  NotAuthorizedException: status=${forbidden.status}`);

  console.log();
}

// =============================================================================
// Example 2: Validation Errors
// =============================================================================
function example2_validationErrors(): void {
  /**
   * Demonstrates creating validation exceptions with field-level errors.
   * Useful for form validation and input validation in API endpoints.
   */
  logger.info('Example 2: Validation Errors');

  // Create validation exception with field errors
  const errors = [
    { field: 'body.email', message: 'Invalid email format', code: 'invalid_email' },
    { field: 'body.age', message: 'Must be a positive number', code: 'min_value' },
    { field: 'body.name', message: 'Required field', code: 'required' },
  ];

  const validationExc = ValidationException.fromFieldErrors(errors, {
    message: 'Validation failed for 3 fields',
    requestId: 'req-validation-001',
  });

  console.log(`  ValidationException: status=${validationExc.status}`);
  console.log(`  Error count: ${validationExc.errors.length}`);
  for (const error of validationExc.errors) {
    console.log(`    - ${error.field}: ${error.message}`);
  }

  console.log();
}

// =============================================================================
// Example 3: Exception Serialization
// =============================================================================
function example3_exceptionSerialization(): void {
  /**
   * Demonstrates serializing exceptions to standard API response format.
   * The toResponse() method produces a consistent JSON structure.
   */
  logger.info('Example 3: Exception Serialization');

  const exc = new NotFoundException({
    message: 'Product not found',
    details: { productId: 'prod-456', catalog: 'electronics' },
    requestId: 'req-serialize-001',
  });

  // Serialize to response format
  const response = exc.toResponse();

  console.log('  Serialized response:');
  console.log(`    code: ${response.error.code}`);
  console.log(`    message: ${response.error.message}`);
  console.log(`    status: ${response.error.status}`);
  console.log(`    details: ${JSON.stringify(response.error.details)}`);
  console.log(`    requestId: ${response.error.requestId}`);
  console.log(`    timestamp: ${response.error.timestamp}`);

  console.log();
}

// =============================================================================
// Example 4: Log Entry Generation
// =============================================================================
function example4_logEntryGeneration(): void {
  /**
   * Demonstrates generating structured log entries from exceptions.
   * Useful for observability and debugging in production systems.
   */
  logger.info('Example 4: Log Entry Generation');

  const exc = new InternalServerException({
    message: 'Database connection failed',
    details: { database: 'users_db', host: 'db.example.com' },
    requestId: 'req-log-001',
  });

  // Generate log entry
  const logEntry = exc.toLogEntry();

  console.log('  Log entry:');
  console.log(`    level: ${logEntry.level}`);
  console.log(`    category: ${logEntry.category}`);
  console.log(`    message: ${logEntry.message}`);
  console.log(`    error.type: ${logEntry.error.type}`);
  console.log(`    error.code: ${logEntry.error.code}`);
  console.log(`    error.status: ${logEntry.error.status}`);

  console.log();
}

// =============================================================================
// Example 5: SDK Factory Functions
// =============================================================================
function example5_sdkFactory(): void {
  /**
   * Demonstrates using SDK factory functions to create exceptions dynamically.
   * Useful for parsing error responses from upstream services.
   */
  logger.info('Example 5: SDK Factory Functions');

  // Create exception from error code
  const exc1 = createException({
    code: ErrorCode.NOT_FOUND,
    message: 'Resource not found',
    details: { resource: 'user' },
  });
  console.log(`  Created from code: ${exc1.constructor.name} (status=${exc1.status})`);

  // Create exception from string code
  const exc2 = createException({
    code: 'VALIDATION_FAILED',
    message: 'Invalid input',
  });
  console.log(`  Created from string: ${exc2.constructor.name} (status=${exc2.status})`);

  // Parse error response from JSON
  const errorJson: ErrorResponse = {
    error: {
      code: 'AUTH_NOT_AUTHENTICATED',
      message: 'Token expired',
      status: 401,
      timestamp: '2025-01-19T10:00:00Z',
    },
  };

  const exc3 = parseErrorResponse(errorJson);
  if (exc3) {
    console.log(`  Parsed from JSON: ${exc3.constructor.name}`);
  }

  // Check if exception is a common exception
  console.log(`  isCommonException(exc1): ${isCommonException(exc1)}`);
  console.log(`  isCommonException(new Error()): ${isCommonException(new Error())}`);

  console.log();
}

// =============================================================================
// Example 6: CLI Formatting
// =============================================================================
function example6_cliFormatting(): void {
  /**
   * Demonstrates formatting exceptions for CLI output.
   * Provides color-coded, human-readable error messages.
   */
  logger.info('Example 6: CLI Formatting');

  const exc = ValidationException.fromFieldErrors(
    [
      { field: 'config.port', message: 'Must be between 1 and 65535' },
      { field: 'config.host', message: 'Invalid hostname' },
    ],
    { message: 'Configuration validation failed' }
  );

  // Format for CLI
  const cliOutput = formatForCli(exc, { useColors: false });

  console.log('  CLI Output:');
  console.log(cliOutput);

  console.log();
}

// =============================================================================
// Example 7: Agent Context
// =============================================================================
function example7_agentContext(): void {
  /**
   * Demonstrates converting exceptions to agent-friendly context.
   * Useful for LLM agents that need to understand and handle errors.
   */
  logger.info('Example 7: Agent Context');

  const exc = new UpstreamServiceException({
    message: 'Payment service returned error',
    service: 'payment-api',
    operation: 'charge',
    upstreamStatus: 500,
    details: { transactionId: 'txn-789' },
  });

  // Convert to agent context
  const context = toAgentContext(exc);

  console.log('  Agent Context:');
  console.log(`    errorType: ${context.errorType}`);
  console.log(`    isRetryable: ${context.isRetryable}`);
  console.log(`    isClientError: ${context.isClientError}`);
  console.log(`    isServerError: ${context.isServerError}`);
  console.log(`    suggestedAction: ${context.suggestedAction}`);
  console.log(`    userMessage: ${context.userMessage}`);

  console.log();
}

// =============================================================================
// Example 8: Outbound Exceptions
// =============================================================================
function example8_outboundExceptions(): void {
  /**
   * Demonstrates outbound exceptions for HTTP client errors.
   * These are used when calling upstream services via Undici.
   */
  logger.info('Example 8: Outbound Exceptions');

  // Connection timeout
  const timeoutExc = new ConnectTimeoutException({
    message: 'Connection to payment service timed out',
    service: 'payment-api',
    timeoutMs: 5000,
  });
  console.log(`  ConnectTimeoutException: status=${timeoutExc.status}`);

  // Network error
  const networkExc = new NetworkException({
    message: 'DNS resolution failed',
    service: 'inventory-api',
    details: { hostname: 'inventory.internal' },
  });
  console.log(`  NetworkException: status=${networkExc.status}`);

  // Upstream service error
  const upstreamExc = new UpstreamServiceException({
    message: 'Inventory service returned 503',
    service: 'inventory-api',
    operation: 'getStock',
    upstreamStatus: 503,
  });
  console.log(`  UpstreamServiceException: status=${upstreamExc.status}`);

  console.log();
}

// =============================================================================
// Example 9: Error Code Utilities
// =============================================================================
function example9_errorCodeUtilities(): void {
  /**
   * Demonstrates error code utility functions.
   */
  logger.info('Example 9: Error Code Utilities');

  // Get status for code
  const codes = [
    ErrorCode.NOT_FOUND,
    ErrorCode.BAD_REQUEST,
    ErrorCode.AUTH_NOT_AUTHENTICATED,
    ErrorCode.INTERNAL_SERVER_ERROR,
    ErrorCode.UPSTREAM_SERVICE_ERROR,
  ];

  console.log('  Error code to HTTP status mapping:');
  for (const code of codes) {
    const status = getStatusForCode(code);
    console.log(`    ${code} -> ${status}`);
  }

  console.log();
}

// =============================================================================
// Example 10: Rate Limiting
// =============================================================================
function example10_rateLimiting(): void {
  /**
   * Demonstrates rate limiting exception with retry-after support.
   */
  logger.info('Example 10: Rate Limiting');

  const exc = new TooManyRequestsException({
    message: 'Rate limit exceeded',
    retryAfter: 60,
    details: { limit: 100, window: '1m', current: 105 },
  });

  console.log(`  TooManyRequestsException: status=${exc.status}`);
  console.log(`  retryAfter: ${exc.retryAfter} seconds`);

  const response = exc.toResponse();
  console.log(`  Response details: ${JSON.stringify(response.error.details)}`);

  console.log();
}

// =============================================================================
// Main Runner
// =============================================================================
function main(): void {
  console.log('='.repeat(70));
  console.log('Common Exceptions - TypeScript Basic Usage Examples');
  console.log('='.repeat(70));
  console.log();

  // Set debug logging for examples
  process.env.LOG_LEVEL ??= 'info';

  const examples = [
    example1_basicExceptionCreation,
    example2_validationErrors,
    example3_exceptionSerialization,
    example4_logEntryGeneration,
    example5_sdkFactory,
    example6_cliFormatting,
    example7_agentContext,
    example8_outboundExceptions,
    example9_errorCodeUtilities,
    example10_rateLimiting,
  ];

  for (const exampleFn of examples) {
    try {
      exampleFn();
    } catch (e) {
      logger.error(`Example failed: ${e}`);
      console.log(`  ERROR: ${e}`);
      console.log();
    }
  }

  console.log('='.repeat(70));
  console.log('All examples completed!');
  console.log('='.repeat(70));
}

main();
