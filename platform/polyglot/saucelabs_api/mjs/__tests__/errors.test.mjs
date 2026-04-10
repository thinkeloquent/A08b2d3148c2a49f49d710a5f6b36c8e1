/**
 * Unit tests for errors.mjs
 *
 * Tests cover:
 * - Statement coverage for all error classes and factory
 * - Branch coverage for createErrorFromResponse status mapping
 * - Boundary value analysis
 * - Error handling verification
 */
import { describe, it, expect } from 'vitest';
import {
  SaucelabsError,
  SaucelabsAuthError,
  SaucelabsNotFoundError,
  SaucelabsRateLimitError,
  SaucelabsValidationError,
  SaucelabsServerError,
  SaucelabsConfigError,
  createErrorFromResponse,
} from '../src/errors.mjs';

describe('Error Hierarchy', () => {

  // =====================================================================
  // Statement Coverage
  // =====================================================================
  describe('Statement Coverage', () => {
    it('SaucelabsError extends Error with all fields', () => {
      const err = new SaucelabsError('test msg', {
        statusCode: 418,
        responseBody: { detail: 'teapot' },
        headers: { 'x-custom': '1' },
        endpoint: '/api/test',
        method: 'GET',
      });
      expect(err).toBeInstanceOf(Error);
      expect(err.name).toBe('SaucelabsError');
      expect(err.message).toBe('test msg');
      expect(err.statusCode).toBe(418);
      expect(err.responseBody).toEqual({ detail: 'teapot' });
      expect(err.headers).toEqual({ 'x-custom': '1' });
      expect(err.endpoint).toBe('/api/test');
      expect(err.method).toBe('GET');
      expect(err.timestamp).toBeTruthy();
    });

    it('SaucelabsError.toJSON() returns serializable object', () => {
      const err = new SaucelabsError('test', { statusCode: 418, endpoint: '/api', method: 'POST' });
      const json = err.toJSON();
      expect(json.error).toBe(true);
      expect(json.name).toBe('SaucelabsError');
      expect(json.message).toBe('test');
      expect(json.statusCode).toBe(418);
      expect(json.endpoint).toBe('/api');
      expect(json.method).toBe('POST');
      expect(json.timestamp).toBeTruthy();
    });

    it('SaucelabsAuthError defaults to 401', () => {
      const err = new SaucelabsAuthError();
      expect(err).toBeInstanceOf(SaucelabsError);
      expect(err.statusCode).toBe(401);
      expect(err.name).toBe('SaucelabsAuthError');
      expect(err.message).toContain('Authentication failed');
    });

    it('SaucelabsNotFoundError defaults to 404', () => {
      const err = new SaucelabsNotFoundError();
      expect(err).toBeInstanceOf(SaucelabsError);
      expect(err.statusCode).toBe(404);
      expect(err.name).toBe('SaucelabsNotFoundError');
    });

    it('SaucelabsRateLimitError defaults to 429 with retryAfter', () => {
      const err = new SaucelabsRateLimitError('limited', { retryAfter: 30 });
      expect(err).toBeInstanceOf(SaucelabsError);
      expect(err.statusCode).toBe(429);
      expect(err.retryAfter).toBe(30);
      expect(err.name).toBe('SaucelabsRateLimitError');
    });

    it('SaucelabsRateLimitError.toJSON() includes retryAfter', () => {
      const err = new SaucelabsRateLimitError('limited', { retryAfter: 15 });
      const json = err.toJSON();
      expect(json.retryAfter).toBe(15);
      expect(json.statusCode).toBe(429);
    });

    it('SaucelabsValidationError defaults to 400', () => {
      const err = new SaucelabsValidationError();
      expect(err).toBeInstanceOf(SaucelabsError);
      expect(err.statusCode).toBe(400);
      expect(err.name).toBe('SaucelabsValidationError');
    });

    it('SaucelabsServerError defaults to 500', () => {
      const err = new SaucelabsServerError();
      expect(err).toBeInstanceOf(SaucelabsError);
      expect(err.statusCode).toBe(500);
      expect(err.name).toBe('SaucelabsServerError');
    });

    it('SaucelabsConfigError defaults to statusCode 0', () => {
      const err = new SaucelabsConfigError('missing key');
      expect(err).toBeInstanceOf(SaucelabsError);
      expect(err.statusCode).toBe(0);
      expect(err.name).toBe('SaucelabsConfigError');
    });
  });

  // =====================================================================
  // Branch Coverage
  // =====================================================================
  describe('Branch Coverage', () => {
    it('SaucelabsError uses defaults when no options given', () => {
      const err = new SaucelabsError('msg');
      expect(err.statusCode).toBe(0);
      expect(err.responseBody).toBeNull();
      expect(err.headers).toEqual({});
      expect(err.endpoint).toBe('');
      expect(err.method).toBe('');
    });

    it('SaucelabsRateLimitError defaults retryAfter to 60', () => {
      const err = new SaucelabsRateLimitError('limited');
      expect(err.retryAfter).toBe(60);
    });

    it('SaucelabsValidationError accepts custom statusCode (422)', () => {
      const err = new SaucelabsValidationError('invalid', { statusCode: 422 });
      expect(err.statusCode).toBe(422);
    });

    it('SaucelabsServerError accepts custom statusCode (503)', () => {
      const err = new SaucelabsServerError('unavailable', { statusCode: 503 });
      expect(err.statusCode).toBe(503);
    });
  });

  // =====================================================================
  // Boundary Values
  // =====================================================================
  describe('Boundary Values', () => {
    it('SaucelabsError with empty message', () => {
      const err = new SaucelabsError('');
      expect(err.message).toBe('');
    });

    it('SaucelabsRateLimitError with retryAfter of 0', () => {
      const err = new SaucelabsRateLimitError('limited', { retryAfter: 0 });
      expect(err.retryAfter).toBe(0);
    });
  });
});

describe('createErrorFromResponse', () => {

  // =====================================================================
  // Statement Coverage
  // =====================================================================
  describe('Statement Coverage', () => {
    it('maps 401 to SaucelabsAuthError', () => {
      const err = createErrorFromResponse(401, { message: 'Unauthorized' }, {});
      expect(err).toBeInstanceOf(SaucelabsAuthError);
      expect(err.statusCode).toBe(401);
      expect(err.message).toBe('Unauthorized');
    });

    it('maps 404 to SaucelabsNotFoundError', () => {
      const err = createErrorFromResponse(404, { message: 'Not found' }, {});
      expect(err).toBeInstanceOf(SaucelabsNotFoundError);
    });

    it('maps 429 to SaucelabsRateLimitError', () => {
      const err = createErrorFromResponse(429, { message: 'Too many' }, { 'retry-after': '30' });
      expect(err).toBeInstanceOf(SaucelabsRateLimitError);
      expect(err.retryAfter).toBe(30);
    });

    it('maps 400 to SaucelabsValidationError', () => {
      const err = createErrorFromResponse(400, { message: 'Bad request' }, {});
      expect(err).toBeInstanceOf(SaucelabsValidationError);
      expect(err.statusCode).toBe(400);
    });

    it('maps 422 to SaucelabsValidationError', () => {
      const err = createErrorFromResponse(422, { message: 'Unprocessable' }, {});
      expect(err).toBeInstanceOf(SaucelabsValidationError);
      expect(err.statusCode).toBe(422);
    });

    it('maps 500 to SaucelabsServerError', () => {
      const err = createErrorFromResponse(500, { message: 'Internal error' }, {});
      expect(err).toBeInstanceOf(SaucelabsServerError);
    });

    it('maps 502 to SaucelabsServerError', () => {
      const err = createErrorFromResponse(502, { message: 'Bad gateway' }, {});
      expect(err).toBeInstanceOf(SaucelabsServerError);
      expect(err.statusCode).toBe(502);
    });

    it('maps unknown status codes to base SaucelabsError', () => {
      const err = createErrorFromResponse(418, { message: 'Teapot' }, {});
      expect(err).toBeInstanceOf(SaucelabsError);
      expect(err.statusCode).toBe(418);
    });
  });

  // =====================================================================
  // Branch Coverage
  // =====================================================================
  describe('Branch Coverage', () => {
    it('extracts message from body.message', () => {
      const err = createErrorFromResponse(400, { message: 'Bad input' }, {});
      expect(err.message).toBe('Bad input');
    });

    it('extracts message from body.error', () => {
      const err = createErrorFromResponse(400, { error: 'Validation failed' }, {});
      expect(err.message).toBe('Validation failed');
    });

    it('converts non-object body to string', () => {
      const err = createErrorFromResponse(400, 'raw text error', {});
      expect(err.message).toBe('raw text error');
    });

    it('generates default message when body has no message/error', () => {
      const err = createErrorFromResponse(400, {}, {});
      expect(err.message).toContain('HTTP 400');
    });

    it('uses Retry-After header (case-insensitive)', () => {
      const err = createErrorFromResponse(429, { message: 'rate limited' }, { 'Retry-After': '45' });
      expect(err.retryAfter).toBe(45);
    });

    it('defaults retryAfter to 60 when header is missing', () => {
      const err = createErrorFromResponse(429, { message: 'rate limited' }, {});
      expect(err.retryAfter).toBe(60);
    });

    it('stores responseBody and headers in error', () => {
      const body = { message: 'err', detail: 'info' };
      const headers = { 'x-request-id': 'abc123' };
      const err = createErrorFromResponse(500, body, headers);
      expect(err.responseBody).toEqual(body);
      expect(err.headers).toEqual(headers);
    });
  });

  // =====================================================================
  // Boundary Values
  // =====================================================================
  describe('Boundary Values', () => {
    it('handles null body', () => {
      const err = createErrorFromResponse(500, null, {});
      expect(err).toBeInstanceOf(SaucelabsServerError);
      expect(err.statusCode).toBe(500);
    });

    it('handles undefined body', () => {
      const err = createErrorFromResponse(500, undefined, {});
      expect(err).toBeInstanceOf(SaucelabsServerError);
      expect(err.statusCode).toBe(500);
    });

    it('handles status code at 5xx boundary (500)', () => {
      const err = createErrorFromResponse(500, { message: 'fail' }, {});
      expect(err).toBeInstanceOf(SaucelabsServerError);
    });

    it('handles status code just below 500 (499)', () => {
      const err = createErrorFromResponse(499, { message: 'fail' }, {});
      expect(err).toBeInstanceOf(SaucelabsError);
      expect(err).not.toBeInstanceOf(SaucelabsServerError);
    });
  });
});
