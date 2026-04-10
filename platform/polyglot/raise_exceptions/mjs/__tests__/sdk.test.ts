/**
 * Tests for SDK functions.
 *
 * These tests cover the SDK functionality:
 * - Factory functions (createException, parseErrorResponse)
 * - CLI formatting (formatForCli)
 * - Agent context (toAgentContext)
 */

import {
  ErrorCode,
  createException,
  parseErrorResponse,
  isCommonException,
  formatForCli,
  toAgentContext,
  NotFoundException,
  ValidationException,
  InternalServerException,
  UpstreamServiceException,
  BadRequestException,
  BaseHttpException,
  ErrorResponse,
  NotAuthenticatedException,
  NotAuthorizedException,
} from '../src/index.js';

describe('createException', () => {
  it('should create exception from ErrorCode enum', () => {
    const exc = createException({
      code: ErrorCode.NOT_FOUND,
      message: 'Resource not found',
    });
    expect(exc).toBeInstanceOf(NotFoundException);
    expect(exc.status).toBe(404);
  });

  it('should create exception from string code', () => {
    const exc = createException({
      code: 'VALIDATION_FAILED',
      message: 'Invalid input',
    });
    expect(exc).toBeInstanceOf(ValidationException);
    expect(exc.status).toBe(422);
  });

  it('should include details in created exception', () => {
    const exc = createException({
      code: ErrorCode.BAD_REQUEST,
      message: 'Invalid format',
      details: { field: 'email' },
    });
    expect(exc.details).toEqual({ field: 'email' });
  });

  it('should include request ID in created exception', () => {
    const exc = createException({
      code: ErrorCode.NOT_FOUND,
      message: 'Not found',
      requestId: 'req-123',
    });
    expect(exc.requestId).toBe('req-123');
  });

  const codeToTypeMapping: Array<[string, string]> = [
    [ErrorCode.AUTH_NOT_AUTHENTICATED, 'NotAuthenticatedException'],
    [ErrorCode.AUTHZ_NOT_AUTHORIZED, 'NotAuthorizedException'],
    [ErrorCode.NOT_FOUND, 'NotFoundException'],
    [ErrorCode.BAD_REQUEST, 'BadRequestException'],
    [ErrorCode.VALIDATION_FAILED, 'ValidationException'],
    [ErrorCode.INTERNAL_SERVER_ERROR, 'InternalServerException'],
    [ErrorCode.UPSTREAM_SERVICE_ERROR, 'UpstreamServiceException'],
  ];

  test.each(codeToTypeMapping)('should create %s for code %s', (code, expectedType) => {
    const exc = createException({ code, message: 'Test' });
    expect(exc.constructor.name).toBe(expectedType);
  });

  it('should create BaseHttpException for unknown codes', () => {
    const exc = createException({
      code: 'UNKNOWN_CODE',
      message: 'Unknown error',
    });
    expect(exc).toBeInstanceOf(BaseHttpException);
  });
});

describe('parseErrorResponse', () => {
  it('should parse valid error response', () => {
    const response: ErrorResponse = {
      error: {
        code: 'NOT_FOUND',
        message: 'User not found',
        status: 404,
        timestamp: '2025-01-19T10:00:00Z',
      },
    };
    const exc = parseErrorResponse(response);
    expect(exc).not.toBeNull();
    expect(exc).toBeInstanceOf(NotFoundException);
    expect(exc?.message).toBe('User not found');
  });

  it('should include details from response', () => {
    const response: ErrorResponse = {
      error: {
        code: 'BAD_REQUEST',
        message: 'Invalid input',
        status: 400,
        timestamp: '2025-01-19T10:00:00Z',
        details: { field: 'email', reason: 'invalid format' },
      },
    };
    const exc = parseErrorResponse(response);
    expect(exc).not.toBeNull();
    expect(exc?.details?.field).toBe('email');
  });

  it('should include request ID from response', () => {
    const response: ErrorResponse = {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Server error',
        status: 500,
        timestamp: '2025-01-19T10:00:00Z',
        requestId: 'req-abc-123',
      },
    };
    const exc = parseErrorResponse(response);
    expect(exc).not.toBeNull();
    expect(exc?.requestId).toBe('req-abc-123');
  });

  it('should return null for invalid response', () => {
    const invalidResponses = [
      {},
      { error: {} },
      { error: { message: 'test' } }, // missing code
    ];
    for (const response of invalidResponses) {
      const exc = parseErrorResponse(response as any);
      expect(exc).toBeNull();
    }
  });

  it('should parse validation error with field errors', () => {
    const response: ErrorResponse = {
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Validation failed',
        status: 422,
        timestamp: '2025-01-19T10:00:00Z',
        details: {
          errors: [
            { field: 'email', message: 'Invalid' },
            { field: 'age', message: 'Required' },
          ],
        },
      },
    };
    const exc = parseErrorResponse(response);
    expect(exc).not.toBeNull();
    expect(exc).toBeInstanceOf(ValidationException);
  });
});

describe('isCommonException', () => {
  it('should return true for common exceptions', () => {
    const exceptions = [
      new NotFoundException({}),
      new ValidationException({}),
      new InternalServerException({}),
      new UpstreamServiceException({}),
    ];
    for (const exc of exceptions) {
      expect(isCommonException(exc)).toBe(true);
    }
  });

  it('should return false for other exceptions', () => {
    const otherExceptions = [
      new Error('test'),
      new TypeError('test'),
    ];
    for (const exc of otherExceptions) {
      expect(isCommonException(exc)).toBe(false);
    }
  });

  it('should return false for non-exception objects', () => {
    const nonExceptions = [
      'string',
      123,
      { error: 'dict' },
      null,
      undefined,
    ];
    for (const obj of nonExceptions) {
      expect(isCommonException(obj)).toBe(false);
    }
  });
});

describe('formatForCli', () => {
  it('should format exception for CLI output', () => {
    const exc = new NotFoundException({ message: 'User not found' });
    const output = formatForCli(exc, { useColors: false });

    expect(output).toContain('NOT_FOUND');
    expect(output).toContain('User not found');
    expect(output).toContain('404');
  });

  it('should include details in CLI output', () => {
    const exc = new BadRequestException({
      message: 'Invalid input',
      details: { field: 'email' },
    });
    const output = formatForCli(exc, { useColors: false });

    expect(output).toContain('email');
  });

  it('should format validation errors as list', () => {
    const exc = ValidationException.fromFieldErrors([
      { field: 'email', message: 'Invalid format' },
      { field: 'name', message: 'Required' },
    ]);
    const output = formatForCli(exc, { useColors: false });

    expect(output).toContain('email');
    expect(output).toContain('Invalid format');
  });

  it('should include request ID in output', () => {
    const exc = new InternalServerException({
      message: 'Server error',
      requestId: 'req-123-abc',
    });
    const output = formatForCli(exc, { useColors: false });

    expect(output).toContain('req-123-abc');
  });
});

describe('toAgentContext', () => {
  it('should return basic agent context', () => {
    const exc = new NotFoundException({ message: 'User not found' });
    const context = toAgentContext(exc);

    expect(context.errorType).toBe('NotFoundException');
    expect(context.errorCode).toBe('NOT_FOUND');
    expect(context.httpStatus).toBe(404);
    expect(context.message).toBe('User not found');
  });

  it('should set client error flags correctly', () => {
    const exc = new BadRequestException({ message: 'Invalid input' });
    const context = toAgentContext(exc);

    expect(context.isClientError).toBe(true);
    expect(context.isServerError).toBe(false);
  });

  it('should set server error flags correctly', () => {
    const exc = new InternalServerException({ message: 'Server error' });
    const context = toAgentContext(exc);

    expect(context.isClientError).toBe(false);
    expect(context.isServerError).toBe(true);
  });

  it('should mark server errors as retryable', () => {
    const exc = new UpstreamServiceException({ message: 'Upstream error' });
    const context = toAgentContext(exc);

    expect(context.isRetryable).toBe(true);
  });

  it('should not mark client errors as retryable', () => {
    const exc = new BadRequestException({ message: 'Bad request' });
    const context = toAgentContext(exc);

    expect(context.isRetryable).toBe(false);
  });

  it('should include suggested action', () => {
    const exc = new NotFoundException({ message: 'User not found' });
    const context = toAgentContext(exc);

    expect(context.suggestedAction).toBeDefined();
    expect(context.suggestedAction.length).toBeGreaterThan(0);
  });

  it('should include user-friendly message', () => {
    const exc = new InternalServerException({ message: 'Database connection failed' });
    const context = toAgentContext(exc);

    expect(context.userMessage).toBeDefined();
    expect(context.userMessage.length).toBeGreaterThan(0);
  });

  it('should include exception details', () => {
    const exc = new NotFoundException({
      message: 'User not found',
      details: { userId: 'user-123' },
    });
    const context = toAgentContext(exc);

    expect(context.details?.userId).toBe('user-123');
  });

  it('should include request ID when present', () => {
    const exc = new BadRequestException({
      message: 'Invalid',
      requestId: 'req-xyz',
    });
    const context = toAgentContext(exc);

    expect(context.requestId).toBe('req-xyz');
  });
});
