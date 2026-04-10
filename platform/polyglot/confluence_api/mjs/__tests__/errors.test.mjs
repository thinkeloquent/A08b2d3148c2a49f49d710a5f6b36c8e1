/**
 * Tests for the confluence_api errors module.
 */

import { describe, it, expect } from 'vitest';
import {
  ConfluenceApiError,
  ConfluenceAuthenticationError,
  ConfluencePermissionError,
  ConfluenceNotFoundError,
  ConfluenceValidationError,
  ConfluenceConflictError,
  ConfluenceRateLimitError,
  ConfluenceServerError,
  ConfluenceNetworkError,
  ConfluenceTimeoutError,
  ConfluenceConfigurationError,
  SDKError,
  ErrorCode,
  createErrorFromResponse,
} from '../src/errors.mjs';

describe('error hierarchy', () => {
  it('all errors inherit from ConfluenceApiError', () => {
    expect(new ConfluenceAuthenticationError()).toBeInstanceOf(ConfluenceApiError);
    expect(new ConfluencePermissionError()).toBeInstanceOf(ConfluenceApiError);
    expect(new ConfluenceNotFoundError()).toBeInstanceOf(ConfluenceApiError);
    expect(new ConfluenceValidationError()).toBeInstanceOf(ConfluenceApiError);
    expect(new ConfluenceConflictError()).toBeInstanceOf(ConfluenceApiError);
    expect(new ConfluenceRateLimitError()).toBeInstanceOf(ConfluenceApiError);
    expect(new ConfluenceServerError()).toBeInstanceOf(ConfluenceApiError);
    expect(new ConfluenceNetworkError()).toBeInstanceOf(ConfluenceApiError);
    expect(new ConfluenceTimeoutError()).toBeInstanceOf(ConfluenceApiError);
    expect(new ConfluenceConfigurationError()).toBeInstanceOf(ConfluenceApiError);
    expect(new SDKError()).toBeInstanceOf(ConfluenceApiError);
  });

  it('ConfluenceApiError extends Error', () => {
    expect(new ConfluenceApiError()).toBeInstanceOf(Error);
  });

  it('base error has default message', () => {
    const err = new ConfluenceApiError();
    expect(err.message).toBe('');
  });

  it('errors accept custom messages', () => {
    const err = new ConfluenceNotFoundError('Page 12345 not found');
    expect(err.message).toBe('Page 12345 not found');
    expect(err.status).toBe(404);
  });
});

describe('default status codes', () => {
  it('ConfluenceAuthenticationError has status 401', () => {
    expect(new ConfluenceAuthenticationError().status).toBe(401);
  });

  it('ConfluencePermissionError has status 403', () => {
    expect(new ConfluencePermissionError().status).toBe(403);
  });

  it('ConfluenceNotFoundError has status 404', () => {
    expect(new ConfluenceNotFoundError().status).toBe(404);
  });

  it('ConfluenceValidationError has status 400', () => {
    expect(new ConfluenceValidationError().status).toBe(400);
  });

  it('ConfluenceConflictError has status 409', () => {
    expect(new ConfluenceConflictError().status).toBe(409);
  });

  it('ConfluenceRateLimitError has status 429', () => {
    expect(new ConfluenceRateLimitError().status).toBe(429);
  });

  it('ConfluenceServerError has status 500 by default', () => {
    expect(new ConfluenceServerError().status).toBe(500);
  });

  it('ConfluenceServerError accepts custom status', () => {
    expect(new ConfluenceServerError('Bad gateway', { status: 502 }).status).toBe(502);
  });

  it('ConfluenceRateLimitError stores retryAfter', () => {
    const err = new ConfluenceRateLimitError('Rate limited', { retryAfter: 30 });
    expect(err.retryAfter).toBe(30);
  });
});

describe('ErrorCode enum', () => {
  it('has expected values', () => {
    expect(ErrorCode.NETWORK).toBe('NETWORK');
    expect(ErrorCode.RESPONSE).toBe('RESPONSE');
    expect(ErrorCode.TIMEOUT).toBe('TIMEOUT');
    expect(ErrorCode.CONFIGURATION).toBe('CONFIGURATION');
    expect(ErrorCode.RATE_LIMIT).toBe('RATE_LIMIT');
  });

  it('is frozen', () => {
    expect(Object.isFrozen(ErrorCode)).toBe(true);
  });
});

describe('toJSON', () => {
  it('serializes error to a JSON-safe object', () => {
    const err = new ConfluenceNotFoundError('Page not found', {
      responseData: { statusCode: 404 },
      url: '/rest/api/content/123',
      method: 'GET',
    });
    const json = err.toJSON();
    expect(json.name).toBe('ConfluenceNotFoundError');
    expect(json.message).toBe('Page not found');
    expect(json.status).toBe(404);
    expect(json.url).toBe('/rest/api/content/123');
    expect(json.method).toBe('GET');
  });
});

describe('static type guards', () => {
  it('isConfluenceApiError returns true for instances', () => {
    const err = new ConfluenceNotFoundError();
    expect(ConfluenceApiError.isConfluenceApiError(err)).toBe(true);
  });

  it('isConfluenceApiError returns false for plain errors', () => {
    expect(ConfluenceApiError.isConfluenceApiError(new Error())).toBe(false);
  });

  it('hasStatusCode checks both type and status', () => {
    const err = new ConfluenceNotFoundError();
    expect(ConfluenceApiError.hasStatusCode(err, 404)).toBe(true);
    expect(ConfluenceApiError.hasStatusCode(err, 500)).toBe(false);
  });
});

describe('createErrorFromResponse', () => {
  it('creates typed error from 400', () => {
    const err = createErrorFromResponse(400, { message: 'Invalid request' }, '/api/test', 'POST');
    expect(err).toBeInstanceOf(ConfluenceValidationError);
    expect(err.status).toBe(400);
    expect(err.message).toBe('Invalid request');
  });

  it('creates typed error from 401', () => {
    const err = createErrorFromResponse(401, { message: 'Unauthorized' }, '/api/test', 'GET');
    expect(err).toBeInstanceOf(ConfluenceAuthenticationError);
    expect(err.status).toBe(401);
  });

  it('creates typed error from 403', () => {
    const err = createErrorFromResponse(403, { message: 'Forbidden' }, '/api/test', 'GET');
    expect(err).toBeInstanceOf(ConfluencePermissionError);
    expect(err.status).toBe(403);
  });

  it('creates typed error from 404', () => {
    const err = createErrorFromResponse(404, { message: 'Not found' }, '/api/test', 'GET');
    expect(err).toBeInstanceOf(ConfluenceNotFoundError);
    expect(err.status).toBe(404);
  });

  it('creates typed error from 409', () => {
    const err = createErrorFromResponse(409, { message: 'Version conflict' }, '/api/test', 'PUT');
    expect(err).toBeInstanceOf(ConfluenceConflictError);
    expect(err.status).toBe(409);
  });

  it('creates typed error from 429 with retryAfter', () => {
    const err = createErrorFromResponse(429, { message: 'Too many requests' }, '/api/test', 'GET', { retryAfter: 60 });
    expect(err).toBeInstanceOf(ConfluenceRateLimitError);
    expect(err.status).toBe(429);
    expect(err.retryAfter).toBe(60);
  });

  it('creates typed error from 500', () => {
    const err = createErrorFromResponse(500, { message: 'Internal error' }, '/api/test', 'GET');
    expect(err).toBeInstanceOf(ConfluenceServerError);
    expect(err.status).toBe(500);
  });

  it('creates typed error from 502', () => {
    const err = createErrorFromResponse(502, { message: 'Bad gateway' }, '/api/test', 'GET');
    expect(err).toBeInstanceOf(ConfluenceServerError);
    expect(err.status).toBe(502);
  });

  it('creates base error for unknown status', () => {
    const err = createErrorFromResponse(418, { message: "I'm a teapot" }, '/api/test', 'GET');
    expect(err).toBeInstanceOf(ConfluenceApiError);
    expect(err.status).toBe(418);
  });

  it('handles null body gracefully', () => {
    const err = createErrorFromResponse(404, null, '/api/test', 'GET');
    expect(err).toBeInstanceOf(ConfluenceNotFoundError);
    expect(err.message).toContain('HTTP 404');
  });

  it('extracts message from data.message', () => {
    const err = createErrorFromResponse(500, { data: { message: 'Nested error' } }, '/api/test', 'GET');
    expect(err.message).toBe('Nested error');
  });

  it('stores URL and method', () => {
    const err = createErrorFromResponse(404, { message: 'Not found' }, '/rest/api/content/123', 'DELETE');
    expect(err.url).toBe('/rest/api/content/123');
    expect(err.method).toBe('DELETE');
  });
});
