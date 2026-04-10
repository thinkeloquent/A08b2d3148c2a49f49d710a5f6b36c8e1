/**
 * Unit tests for errors module.
 *
 * Tests cover:
 * - Statement coverage for all error classes and factory
 * - Branch coverage for createErrorFromResponse mapping
 * - Boundary values for retry-after parsing
 * - Error handling for inheritance chain
 */

import { describe, it, expect } from 'vitest';
import {
  StatsigError,
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  ValidationError,
  ServerError,
  createErrorFromResponse,
} from '../src/errors.mjs';

describe('StatsigError', () => {
  describe('Statement Coverage', () => {
    it('should create with message and defaults', () => {
      const err = new StatsigError('test error');
      expect(err.message).toBe('test error');
      expect(err.statusCode).toBe(0);
      expect(err.responseBody).toBeNull();
      expect(err.headers).toEqual({});
      expect(err.name).toBe('StatsigError');
      expect(err.timestamp).toBeDefined();
    });

    it('should create with all options', () => {
      const err = new StatsigError('test', {
        statusCode: 418,
        responseBody: { detail: 'teapot' },
        headers: { 'x-custom': 'val' },
      });
      expect(err.statusCode).toBe(418);
      expect(err.responseBody).toEqual({ detail: 'teapot' });
      expect(err.headers).toEqual({ 'x-custom': 'val' });
    });

    it('should serialize via toJSON()', () => {
      const err = new StatsigError('test', { statusCode: 500 });
      const json = err.toJSON();
      expect(json.error).toBe(true);
      expect(json.name).toBe('StatsigError');
      expect(json.message).toBe('test');
      expect(json.statusCode).toBe(500);
    });

    it('should be an instance of Error', () => {
      const err = new StatsigError('test');
      expect(err).toBeInstanceOf(Error);
    });
  });
});

describe('Error Subclasses', () => {
  describe('Statement Coverage', () => {
    it('should create AuthenticationError', () => {
      const err = new AuthenticationError();
      expect(err.name).toBe('AuthenticationError');
      expect(err.statusCode).toBe(401);
      expect(err).toBeInstanceOf(StatsigError);
    });

    it('should create NotFoundError', () => {
      const err = new NotFoundError();
      expect(err.name).toBe('NotFoundError');
      expect(err.statusCode).toBe(404);
      expect(err).toBeInstanceOf(StatsigError);
    });

    it('should create RateLimitError with retryAfter', () => {
      const err = new RateLimitError('limited', { retryAfter: 30 });
      expect(err.name).toBe('RateLimitError');
      expect(err.statusCode).toBe(429);
      expect(err.retryAfter).toBe(30);
    });

    it('should default retryAfter to 60', () => {
      const err = new RateLimitError();
      expect(err.retryAfter).toBe(60);
    });

    it('should include retryAfter in toJSON', () => {
      const err = new RateLimitError('test', { retryAfter: 15 });
      const json = err.toJSON();
      expect(json.retryAfter).toBe(15);
    });

    it('should create ValidationError', () => {
      const err = new ValidationError('bad input', { statusCode: 422 });
      expect(err.name).toBe('ValidationError');
      expect(err.statusCode).toBe(422);
    });

    it('should create ServerError', () => {
      const err = new ServerError('oops', { statusCode: 503 });
      expect(err.name).toBe('ServerError');
      expect(err.statusCode).toBe(503);
    });
  });
});

describe('createErrorFromResponse', () => {
  describe('Branch Coverage', () => {
    it('should return AuthenticationError for 401', () => {
      const err = createErrorFromResponse(401, { message: 'Unauthorized' });
      expect(err).toBeInstanceOf(AuthenticationError);
      expect(err.statusCode).toBe(401);
    });

    it('should return NotFoundError for 404', () => {
      const err = createErrorFromResponse(404, { message: 'Not found' });
      expect(err).toBeInstanceOf(NotFoundError);
    });

    it('should return RateLimitError for 429 with retry-after', () => {
      const err = createErrorFromResponse(429, { message: 'Too many' }, { 'retry-after': '5' });
      expect(err).toBeInstanceOf(RateLimitError);
      expect(err.retryAfter).toBe(5);
    });

    it('should return RateLimitError for 429 with Retry-After header', () => {
      const err = createErrorFromResponse(429, {}, { 'Retry-After': '10' });
      expect(err).toBeInstanceOf(RateLimitError);
      expect(err.retryAfter).toBe(10);
    });

    it('should default retryAfter to 60 when header missing', () => {
      const err = createErrorFromResponse(429, { message: 'limited' }, {});
      expect(err).toBeInstanceOf(RateLimitError);
      expect(err.retryAfter).toBe(60);
    });

    it('should return ValidationError for 400', () => {
      const err = createErrorFromResponse(400, { message: 'Bad request' });
      expect(err).toBeInstanceOf(ValidationError);
      expect(err.statusCode).toBe(400);
    });

    it('should return ValidationError for 422', () => {
      const err = createErrorFromResponse(422, { message: 'Invalid' });
      expect(err).toBeInstanceOf(ValidationError);
      expect(err.statusCode).toBe(422);
    });

    it('should return ServerError for 500', () => {
      const err = createErrorFromResponse(500, 'Internal error');
      expect(err).toBeInstanceOf(ServerError);
    });

    it('should return ServerError for 502', () => {
      const err = createErrorFromResponse(502, { message: 'Bad gateway' });
      expect(err).toBeInstanceOf(ServerError);
    });

    it('should return base StatsigError for unknown status', () => {
      const err = createErrorFromResponse(418, "I'm a teapot");
      expect(err).toBeInstanceOf(StatsigError);
      expect(err.statusCode).toBe(418);
    });
  });

  describe('Boundary Values', () => {
    it('should handle string body', () => {
      const err = createErrorFromResponse(500, 'error text');
      expect(err.message).toBe('error text');
    });

    it('should handle body with error key', () => {
      const err = createErrorFromResponse(500, { error: 'fail' });
      expect(err.message).toBe('fail');
    });

    it('should handle null body', () => {
      const err = createErrorFromResponse(500, null);
      expect(err).toBeInstanceOf(ServerError);
      expect(err.statusCode).toBe(500);
    });

    it('should handle empty object body', () => {
      const err = createErrorFromResponse(500, {});
      expect(err.message).toContain('500');
    });
  });
});
