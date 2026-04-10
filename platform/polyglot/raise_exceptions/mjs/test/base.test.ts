/**
 * Tests for base exception class.
 */

import {
  BaseHttpException,
  ErrorCode,
  NotFoundException,
  ValidationException,
} from '../src';

describe('BaseHttpException', () => {
  it('should instantiate with defaults', () => {
    const exc = new BaseHttpException({
      code: ErrorCode.NOT_FOUND,
      message: 'Resource not found',
    });

    expect(exc.code).toBe(ErrorCode.NOT_FOUND);
    expect(exc.message).toBe('Resource not found');
    expect(exc.status).toBe(404); // Derived from code
    expect(exc.details).toEqual({});
    expect(exc.requestId).toBeUndefined();
    expect(exc.timestamp).toBeDefined();
  });

  it('should instantiate with all params', () => {
    const exc = new BaseHttpException({
      code: ErrorCode.BAD_REQUEST,
      message: 'Invalid input',
      status: 400,
      details: { field: 'email' },
      requestId: 'req-123',
    });

    expect(exc.code).toBe(ErrorCode.BAD_REQUEST);
    expect(exc.status).toBe(400);
    expect(exc.details).toEqual({ field: 'email' });
    expect(exc.requestId).toBe('req-123');
  });

  it('should serialize to response format', () => {
    const exc = new BaseHttpException({
      code: ErrorCode.NOT_FOUND,
      message: 'User not found',
      details: { userId: '123' },
      requestId: 'req-abc',
    });

    const response = exc.toResponse();

    expect(response).toHaveProperty('error');
    expect(response.error.code).toBe('NOT_FOUND');
    expect(response.error.message).toBe('User not found');
    expect(response.error.status).toBe(404);
    expect(response.error.details).toEqual({ userId: '123' });
    expect(response.error.requestId).toBe('req-abc');
    expect(response.error.timestamp).toBeDefined();
  });

  it('should create log entry', () => {
    const exc = new BaseHttpException({
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: 'Something broke',
    });

    const entry = exc.toLogEntry();

    expect(entry.level).toBe('ERROR');
    expect(entry.category).toBe('exception');
    expect(entry.message).toBe('Something broke');
    expect(entry.error.type).toBe('BaseHttpException');
    expect(entry.error.code).toBe('INTERNAL_SERVER_ERROR');
  });

  it('should handle string code conversion', () => {
    const exc = new BaseHttpException({
      code: 'NOT_FOUND' as ErrorCode,
      message: 'Not found',
    });

    expect(exc.code).toBe(ErrorCode.NOT_FOUND);
    expect(exc.status).toBe(404);
  });
});

describe('NotFoundException', () => {
  it('should have correct defaults', () => {
    const exc = new NotFoundException({});

    expect(exc.code).toBe(ErrorCode.NOT_FOUND);
    expect(exc.message).toBe('Resource not found');
    expect(exc.status).toBe(404);
  });

  it('should accept custom message', () => {
    const exc = new NotFoundException({ message: 'User not found' });

    expect(exc.message).toBe('User not found');
  });
});

describe('ValidationException', () => {
  it('should include errors array', () => {
    const errors = [
      { field: 'email', message: 'Invalid email' },
      { field: 'age', message: 'Must be positive' },
    ];

    const exc = ValidationException.fromFieldErrors(errors);

    expect(exc.code).toBe(ErrorCode.VALIDATION_FAILED);
    expect(exc.status).toBe(422);
    expect(exc.errors).toHaveLength(2);
    expect(exc.details?.errors).toBeDefined();
  });
});
