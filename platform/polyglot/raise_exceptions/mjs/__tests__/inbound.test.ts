/**
 * Tests for inbound exception classes.
 *
 * These tests cover client-facing exceptions raised when processing incoming requests:
 * - NotAuthenticatedException (401)
 * - NotAuthorizedException (403)
 * - NotFoundException (404)
 * - BadRequestException (400)
 * - ValidationException (422)
 * - ConflictException (409)
 * - TooManyRequestsException (429)
 */

import {
  ErrorCode,
  NotAuthenticatedException,
  NotAuthorizedException,
  NotFoundException,
  BadRequestException,
  ValidationException,
  ConflictException,
  TooManyRequestsException,
} from '../src/index.js';

describe('NotAuthenticatedException', () => {
  it('should have default message', () => {
    const exc = new NotAuthenticatedException({});
    expect(exc.message).toBe('Authentication required');
    expect(exc.status).toBe(401);
    expect(exc.code).toBe(ErrorCode.AUTH_NOT_AUTHENTICATED);
  });

  it('should accept custom message', () => {
    const exc = new NotAuthenticatedException({ message: 'Token expired' });
    expect(exc.message).toBe('Token expired');
  });

  it('should include details in response', () => {
    const exc = new NotAuthenticatedException({
      message: 'Invalid token',
      details: { reason: 'expired', expiredAt: '2025-01-01' },
    });
    const response = exc.toResponse();
    expect(response.error.details?.reason).toBe('expired');
  });

  it('should include request ID', () => {
    const exc = new NotAuthenticatedException({ requestId: 'req-123' });
    expect(exc.requestId).toBe('req-123');
    const response = exc.toResponse();
    expect(response.error.requestId).toBe('req-123');
  });
});

describe('NotAuthorizedException', () => {
  it('should have default message', () => {
    const exc = new NotAuthorizedException({});
    expect(exc.message).toBe('Access denied');
    expect(exc.status).toBe(403);
    expect(exc.code).toBe(ErrorCode.AUTHZ_NOT_AUTHORIZED);
  });

  it('should handle permission denied scenario', () => {
    const exc = new NotAuthorizedException({
      message: 'Insufficient permissions',
      details: { required: 'admin', actual: 'viewer' },
    });
    const response = exc.toResponse();
    expect(response.error.status).toBe(403);
    expect(response.error.details?.required).toBe('admin');
  });
});

describe('NotFoundException', () => {
  it('should have default message', () => {
    const exc = new NotFoundException({});
    expect(exc.message).toBe('Resource not found');
    expect(exc.status).toBe(404);
    expect(exc.code).toBe(ErrorCode.NOT_FOUND);
  });

  it('should include resource details', () => {
    const exc = new NotFoundException({
      message: 'User not found',
      details: { userId: 'user-123', searchedIn: 'users_table' },
    });
    const response = exc.toResponse();
    expect(response.error.details?.userId).toBe('user-123');
  });
});

describe('BadRequestException', () => {
  it('should have default message', () => {
    const exc = new BadRequestException({});
    expect(exc.message).toBe('Bad request');
    expect(exc.status).toBe(400);
    expect(exc.code).toBe(ErrorCode.BAD_REQUEST);
  });

  it('should handle invalid input scenario', () => {
    const exc = new BadRequestException({
      message: 'Invalid JSON payload',
      details: { expected: 'object', received: 'array' },
    });
    expect(exc.status).toBe(400);
    expect(exc.message).toContain('Invalid JSON');
  });
});

describe('ValidationException', () => {
  it('should have default message', () => {
    const exc = new ValidationException({});
    expect(exc.message).toBe('Validation failed');
    expect(exc.status).toBe(422);
    expect(exc.code).toBe(ErrorCode.VALIDATION_FAILED);
  });

  it('should create from field errors', () => {
    const errors = [
      { field: 'email', message: 'Invalid email' },
      { field: 'age', message: 'Must be positive' },
    ];
    const exc = ValidationException.fromFieldErrors(errors);

    expect(exc.errors).toHaveLength(2);
    expect(exc.errors[0].field).toBe('email');
    expect(exc.errors[1].field).toBe('age');
  });

  it('should include errors in response details', () => {
    const errors = [{ field: 'name', message: 'Required' }];
    const exc = ValidationException.fromFieldErrors(errors);

    const response = exc.toResponse();
    expect(response.error.details?.errors).toBeDefined();
    expect(response.error.details?.errors).toHaveLength(1);
  });

  it('should handle empty errors list', () => {
    const exc = ValidationException.fromFieldErrors([]);
    expect(exc.errors).toEqual([]);
  });

  it('should include error codes in field errors', () => {
    const errors = [
      { field: 'email', message: 'Invalid format', code: 'invalid_email' },
    ];
    const exc = ValidationException.fromFieldErrors(errors);
    expect(exc.errors[0].code).toBe('invalid_email');
  });
});

describe('ConflictException', () => {
  it('should have default message', () => {
    const exc = new ConflictException({});
    expect(exc.message).toBe('Resource conflict');
    expect(exc.status).toBe(409);
    expect(exc.code).toBe(ErrorCode.CONFLICT);
  });

  it('should handle duplicate resource scenario', () => {
    const exc = new ConflictException({
      message: 'User with this email already exists',
      details: { email: 'test@example.com', existingId: 'user-456' },
    });
    const response = exc.toResponse();
    expect(response.error.status).toBe(409);
    expect(response.error.details?.email).toBe('test@example.com');
  });
});

describe('TooManyRequestsException', () => {
  it('should have default message', () => {
    const exc = new TooManyRequestsException({});
    expect(exc.message).toBe('Too many requests');
    expect(exc.status).toBe(429);
    expect(exc.code).toBe(ErrorCode.TOO_MANY_REQUESTS);
  });

  it('should include retry-after in response', () => {
    const exc = new TooManyRequestsException({ retryAfter: 60 });
    expect(exc.retryAfter).toBe(60);

    const response = exc.toResponse();
    expect(response.error.details?.retryAfter).toBe(60);
  });

  it('should include rate limit details', () => {
    const exc = new TooManyRequestsException({
      message: 'Rate limit exceeded',
      retryAfter: 120,
      details: { limit: 100, window: '1m', current: 150 },
    });
    const response = exc.toResponse();
    expect(response.error.details?.limit).toBe(100);
    expect(response.error.details?.retryAfter).toBe(120);
  });
});

describe('Exception Serialization', () => {
  const testCases: Array<[new (opts: object) => unknown, number]> = [
    [NotAuthenticatedException, 401],
    [NotAuthorizedException, 403],
    [NotFoundException, 404],
    [BadRequestException, 400],
    [ValidationException, 422],
    [ConflictException, 409],
    [TooManyRequestsException, 429],
  ];

  test.each(testCases)('%p should have status %i', (ExcClass, expectedStatus) => {
    const exc = new ExcClass({});
    expect((exc as any).status).toBe(expectedStatus);
    const response = (exc as any).toResponse();
    expect(response.error.status).toBe(expectedStatus);
  });

  it('should have consistent response structure', () => {
    const exc = new NotFoundException({ message: 'Test', requestId: 'req-123' });
    const response = exc.toResponse();

    expect(response).toHaveProperty('error');
    expect(response.error).toHaveProperty('code');
    expect(response.error).toHaveProperty('message');
    expect(response.error).toHaveProperty('status');
    expect(response.error).toHaveProperty('timestamp');
    expect(response.error).toHaveProperty('requestId');
  });

  it('should have consistent log entry structure', () => {
    const exc = new BadRequestException({ message: 'Test error' });
    const logEntry = exc.toLogEntry();

    expect(logEntry.level).toBe('ERROR');
    expect(logEntry.category).toBe('exception');
    expect(logEntry).toHaveProperty('error');
    expect(logEntry.error.type).toBe('BadRequestException');
  });
});
