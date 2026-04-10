/**
 * Unit tests for errors.mjs
 */
import { describe, it, expect } from 'vitest';
import {
  JiraApiError,
  JiraAuthenticationError,
  JiraPermissionError,
  JiraNotFoundError,
  JiraValidationError,
  JiraRateLimitError,
  JiraServerError,
  JiraNetworkError,
  JiraTimeoutError,
  JiraConfigurationError,
  SDKError,
  ErrorCode,
  createErrorFromResponse,
} from '../src/errors.mjs';

describe('JiraApiError', () => {
  describe('Statement Coverage', () => {
    it('creates with defaults', () => {
      const err = new JiraApiError('test error');
      expect(err.message).toBe('test error');
      expect(err.name).toBe('JiraApiError');
      expect(err.code).toBe(ErrorCode.RESPONSE);
      expect(err.status).toBeUndefined();
    });

    it('creates with options', () => {
      const err = new JiraApiError('custom', {
        code: ErrorCode.NETWORK, status: 418,
        responseData: { x: 1 }, url: '/test', method: 'GET',
      });
      expect(err.status).toBe(418);
      expect(err.responseData).toEqual({ x: 1 });
      expect(err.url).toBe('/test');
      expect(err.method).toBe('GET');
    });

    it('serializes to JSON', () => {
      const err = new JiraApiError('json test', { status: 400 });
      const json = err.toJSON();
      expect(json.name).toBe('JiraApiError');
      expect(json.message).toBe('json test');
      expect(json.status).toBe(400);
    });

    it('isJiraApiError detects correctly', () => {
      expect(JiraApiError.isJiraApiError(new JiraApiError('x'))).toBe(true);
      expect(JiraApiError.isJiraApiError(new Error('x'))).toBe(false);
    });

    it('hasStatusCode detects correctly', () => {
      const err = new JiraApiError('x', { status: 404 });
      expect(JiraApiError.hasStatusCode(err, 404)).toBe(true);
      expect(JiraApiError.hasStatusCode(err, 500)).toBe(false);
    });
  });
});

describe('Error Subclasses', () => {
  describe('Statement Coverage', () => {
    it('JiraAuthenticationError has status 401', () => {
      const e = new JiraAuthenticationError();
      expect(e.status).toBe(401);
      expect(e.name).toBe('JiraAuthenticationError');
    });

    it('JiraPermissionError has status 403', () => {
      expect(new JiraPermissionError().status).toBe(403);
    });

    it('JiraNotFoundError has status 404', () => {
      expect(new JiraNotFoundError().status).toBe(404);
    });

    it('JiraValidationError has status 400', () => {
      expect(new JiraValidationError().status).toBe(400);
    });

    it('JiraRateLimitError has status 429 and retryAfter', () => {
      const e = new JiraRateLimitError('limited', { retryAfter: 30 });
      expect(e.status).toBe(429);
      expect(e.retryAfter).toBe(30);
      expect(e.code).toBe(ErrorCode.RATE_LIMIT);
    });

    it('JiraServerError has status 500 default', () => {
      expect(new JiraServerError().status).toBe(500);
    });

    it('JiraServerError accepts custom status', () => {
      expect(new JiraServerError('x', { status: 503 }).status).toBe(503);
    });

    it('JiraNetworkError has NETWORK code', () => {
      expect(new JiraNetworkError().code).toBe(ErrorCode.NETWORK);
    });

    it('JiraTimeoutError has TIMEOUT code', () => {
      expect(new JiraTimeoutError().code).toBe(ErrorCode.TIMEOUT);
    });

    it('JiraConfigurationError has CONFIGURATION code', () => {
      expect(new JiraConfigurationError().code).toBe(ErrorCode.CONFIGURATION);
    });

    it('SDKError creates correctly', () => {
      const e = new SDKError('sdk fail');
      expect(e.message).toBe('sdk fail');
      expect(e.name).toBe('SDKError');
    });
  });

  describe('Branch Coverage', () => {
    it('all subclasses inherit from JiraApiError', () => {
      const errors = [
        new JiraAuthenticationError(), new JiraPermissionError(),
        new JiraNotFoundError(), new JiraValidationError(),
        new JiraRateLimitError(), new JiraServerError(),
        new JiraNetworkError(), new JiraTimeoutError(),
        new JiraConfigurationError(), new SDKError(),
      ];
      for (const e of errors) {
        expect(e).toBeInstanceOf(JiraApiError);
        expect(e).toBeInstanceOf(Error);
      }
    });
  });
});

describe('createErrorFromResponse', () => {
  describe('Statement Coverage', () => {
    it('400 returns JiraValidationError', () => {
      const err = createErrorFromResponse(400, { message: 'bad' });
      expect(err).toBeInstanceOf(JiraValidationError);
      expect(err.message).toBe('bad');
    });

    it('401 returns JiraAuthenticationError', () => {
      expect(createErrorFromResponse(401, { message: 'unauth' })).toBeInstanceOf(JiraAuthenticationError);
    });

    it('403 returns JiraPermissionError', () => {
      expect(createErrorFromResponse(403, { message: 'forbidden' })).toBeInstanceOf(JiraPermissionError);
    });

    it('404 returns JiraNotFoundError', () => {
      expect(createErrorFromResponse(404, { message: 'gone' })).toBeInstanceOf(JiraNotFoundError);
    });

    it('429 returns JiraRateLimitError with retryAfter', () => {
      const err = createErrorFromResponse(429, { message: 'limited' }, '/u', 'GET', { retryAfter: 60 });
      expect(err).toBeInstanceOf(JiraRateLimitError);
      expect(err.retryAfter).toBe(60);
    });

    it('500 returns JiraServerError', () => {
      expect(createErrorFromResponse(500, { message: 'server' })).toBeInstanceOf(JiraServerError);
    });

    it('502 returns JiraServerError', () => {
      expect(createErrorFromResponse(502, { message: 'gateway' })).toBeInstanceOf(JiraServerError);
    });
  });

  describe('Branch Coverage', () => {
    it('uses errorMessages array', () => {
      const err = createErrorFromResponse(400, { errorMessages: ['a', 'b'] });
      expect(err.message).toBe('a; b');
    });

    it('falls back to HTTP status for null body', () => {
      const err = createErrorFromResponse(400, null);
      expect(err.message).toBe('HTTP 400');
    });

    it('falls back to HTTP status for empty object', () => {
      const err = createErrorFromResponse(418, {});
      expect(err.message).toBe('HTTP 418');
    });

    it('other 4xx returns base JiraApiError', () => {
      const err = createErrorFromResponse(418, { message: 'teapot' });
      expect(err).toBeInstanceOf(JiraApiError);
      expect(err.status).toBe(418);
    });
  });
});
