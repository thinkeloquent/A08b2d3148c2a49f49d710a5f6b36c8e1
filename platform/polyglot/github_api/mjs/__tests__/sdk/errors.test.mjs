/**
 * Tests for GitHub API SDK error hierarchy and mapResponseToError.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  GitHubError,
  AuthError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ConflictError,
  ForbiddenError,
  ServerError,
  mapResponseToError,
} from '../../src/sdk/errors.mjs';

describe('errors', () => {
  // ---------------------------------------------------------------------------
  // Statement Coverage
  // ---------------------------------------------------------------------------
  describe('Statement Coverage', () => {
    describe('GitHubError', () => {
      it('should set name to GitHubError', () => {
        const err = new GitHubError('test message');
        expect(err.name).toBe('GitHubError');
      });

      it('should store status, requestId, and documentationUrl', () => {
        const err = new GitHubError('msg', 418, 'req-123', 'https://docs.github.com');
        expect(err.message).toBe('msg');
        expect(err.status).toBe(418);
        expect(err.requestId).toBe('req-123');
        expect(err.documentationUrl).toBe('https://docs.github.com');
      });

      it('should extend Error', () => {
        const err = new GitHubError('test');
        expect(err).toBeInstanceOf(Error);
        expect(err).toBeInstanceOf(GitHubError);
      });
    });

    describe('AuthError', () => {
      it('should have name AuthError and status 401', () => {
        const err = new AuthError('Bad credentials');
        expect(err.name).toBe('AuthError');
        expect(err.status).toBe(401);
        expect(err.message).toBe('Bad credentials');
      });

      it('should pass requestId and documentationUrl through', () => {
        const err = new AuthError('msg', 'req-1', 'https://docs');
        expect(err.requestId).toBe('req-1');
        expect(err.documentationUrl).toBe('https://docs');
      });
    });

    describe('NotFoundError', () => {
      it('should have name NotFoundError and status 404', () => {
        const err = new NotFoundError('Not found');
        expect(err.name).toBe('NotFoundError');
        expect(err.status).toBe(404);
      });
    });

    describe('ValidationError', () => {
      it('should have name ValidationError and status 422', () => {
        const err = new ValidationError('Invalid input');
        expect(err.name).toBe('ValidationError');
        expect(err.status).toBe(422);
      });
    });

    describe('RateLimitError', () => {
      it('should have name RateLimitError and status 429', () => {
        const resetAt = new Date('2025-01-01T00:00:00Z');
        const err = new RateLimitError('Rate limit exceeded', resetAt, 60, 'req-2', 'https://docs');
        expect(err.name).toBe('RateLimitError');
        expect(err.status).toBe(429);
        expect(err.resetAt).toBe(resetAt);
        expect(err.retryAfter).toBe(60);
        expect(err.requestId).toBe('req-2');
        expect(err.documentationUrl).toBe('https://docs');
      });
    });

    describe('ConflictError', () => {
      it('should have name ConflictError and status 409', () => {
        const err = new ConflictError('Conflict');
        expect(err.name).toBe('ConflictError');
        expect(err.status).toBe(409);
      });
    });

    describe('ForbiddenError', () => {
      it('should have name ForbiddenError and status 403', () => {
        const err = new ForbiddenError('Forbidden');
        expect(err.name).toBe('ForbiddenError');
        expect(err.status).toBe(403);
      });
    });

    describe('ServerError', () => {
      it('should have name ServerError and default status 500', () => {
        const err = new ServerError('Internal error');
        expect(err.name).toBe('ServerError');
        expect(err.status).toBe(500);
      });

      it('should accept a custom status code', () => {
        const err = new ServerError('Bad Gateway', 502);
        expect(err.status).toBe(502);
      });
    });

    describe('mapResponseToError', () => {
      it('should return AuthError for status 401', () => {
        const err = mapResponseToError(401, { message: 'Bad credentials' }, {});
        expect(err).toBeInstanceOf(AuthError);
        expect(err.status).toBe(401);
        expect(err.message).toBe('Bad credentials');
      });

      it('should return NotFoundError for status 404', () => {
        const err = mapResponseToError(404, { message: 'Not Found' }, {});
        expect(err).toBeInstanceOf(NotFoundError);
        expect(err.status).toBe(404);
      });

      it('should return ConflictError for status 409', () => {
        const err = mapResponseToError(409, { message: 'Conflict' }, {});
        expect(err).toBeInstanceOf(ConflictError);
        expect(err.status).toBe(409);
      });

      it('should return ValidationError for status 422', () => {
        const err = mapResponseToError(422, { message: 'Validation Failed' }, {});
        expect(err).toBeInstanceOf(ValidationError);
        expect(err.status).toBe(422);
      });

      it('should return RateLimitError for status 429', () => {
        const resetTs = Math.floor(Date.now() / 1000) + 3600;
        const headers = {
          'x-ratelimit-reset': String(resetTs),
          'retry-after': '120',
        };
        const err = mapResponseToError(429, { message: 'Rate limit' }, headers);
        expect(err).toBeInstanceOf(RateLimitError);
        expect(err.status).toBe(429);
        expect(err.resetAt).toBeInstanceOf(Date);
        expect(err.retryAfter).toBe(120);
      });

      it('should return ServerError for status 500', () => {
        const err = mapResponseToError(500, { message: 'Server Error' }, {});
        expect(err).toBeInstanceOf(ServerError);
        expect(err.status).toBe(500);
      });

      it('should return ServerError for status 502', () => {
        const err = mapResponseToError(502, { message: 'Bad Gateway' }, {});
        expect(err).toBeInstanceOf(ServerError);
        expect(err.status).toBe(502);
      });

      it('should return ServerError for status 503', () => {
        const err = mapResponseToError(503, { message: 'Service Unavailable' }, {});
        expect(err).toBeInstanceOf(ServerError);
        expect(err.status).toBe(503);
      });

      it('should return generic GitHubError for unknown status codes', () => {
        const err = mapResponseToError(418, { message: 'Teapot' }, {});
        expect(err).toBeInstanceOf(GitHubError);
        expect(err.status).toBe(418);
        expect(err.message).toBe('Teapot');
      });

      it('should extract requestId from headers with .get() method (Headers object)', () => {
        const headers = new Headers({ 'x-github-request-id': 'ABC-123' });
        const err = mapResponseToError(404, { message: 'Not Found' }, headers);
        expect(err.requestId).toBe('ABC-123');
      });

      it('should extract requestId from plain header object', () => {
        const headers = { 'x-github-request-id': 'DEF-456' };
        const err = mapResponseToError(404, { message: 'Not Found' }, headers);
        expect(err.requestId).toBe('DEF-456');
      });

      it('should extract documentationUrl from body', () => {
        const err = mapResponseToError(404, {
          message: 'Not Found',
          documentation_url: 'https://docs.github.com/rest/repos',
        }, {});
        expect(err.documentationUrl).toBe('https://docs.github.com/rest/repos');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Branch Coverage
  // ---------------------------------------------------------------------------
  describe('Branch Coverage', () => {
    describe('mapResponseToError 403 branches', () => {
      it('should return RateLimitError when x-ratelimit-remaining is 0', () => {
        const headers = { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': '1700000000' };
        const err = mapResponseToError(403, { message: 'Forbidden' }, headers);
        expect(err).toBeInstanceOf(RateLimitError);
        expect(err.resetAt).toBeInstanceOf(Date);
      });

      it('should return RateLimitError when retry-after header is present', () => {
        const headers = { 'retry-after': '60' };
        const err = mapResponseToError(403, { message: 'Forbidden' }, headers);
        expect(err).toBeInstanceOf(RateLimitError);
        expect(err.retryAfter).toBe(60);
      });

      it('should return RateLimitError when body message contains "rate limit"', () => {
        const err = mapResponseToError(403, { message: 'API rate limit exceeded' }, {});
        expect(err).toBeInstanceOf(RateLimitError);
      });

      it('should return ForbiddenError for 403 without rate limit indicators', () => {
        const err = mapResponseToError(403, { message: 'Resource not accessible' }, {});
        expect(err).toBeInstanceOf(ForbiddenError);
        expect(err.status).toBe(403);
      });

      it('should handle 403 rate limit with Headers object (.get method)', () => {
        const headers = new Headers({
          'x-ratelimit-remaining': '0',
          'x-ratelimit-reset': '1700000000',
        });
        const err = mapResponseToError(403, { message: 'Forbidden' }, headers);
        expect(err).toBeInstanceOf(RateLimitError);
      });

      it('should handle 403 rate limit without reset header (resetAt undefined)', () => {
        const headers = { 'x-ratelimit-remaining': '0' };
        const err = mapResponseToError(403, { message: 'limit' }, headers);
        expect(err).toBeInstanceOf(RateLimitError);
        expect(err.resetAt).toBeUndefined();
      });

      it('should handle 403 rate limit without retry-after header (retryAfter undefined)', () => {
        const headers = { 'x-ratelimit-remaining': '0' };
        const err = mapResponseToError(403, { message: 'limit' }, headers);
        expect(err).toBeInstanceOf(RateLimitError);
        expect(err.retryAfter).toBeUndefined();
      });
    });

    describe('mapResponseToError 429 branches', () => {
      it('should parse reset header and retry-after for 429', () => {
        const resetTs = 1700000000;
        const headers = {
          'x-ratelimit-reset': String(resetTs),
          'retry-after': '30',
        };
        const err = mapResponseToError(429, { message: 'Too Many Requests' }, headers);
        expect(err).toBeInstanceOf(RateLimitError);
        expect(err.resetAt).toEqual(new Date(resetTs * 1000));
        expect(err.retryAfter).toBe(30);
      });

      it('should handle 429 without reset header', () => {
        const err = mapResponseToError(429, { message: 'Too Many Requests' }, {});
        expect(err).toBeInstanceOf(RateLimitError);
        expect(err.resetAt).toBeUndefined();
        expect(err.retryAfter).toBeUndefined();
      });

      it('should handle 429 with Headers object (.get method)', () => {
        const headers = new Headers({
          'x-ratelimit-reset': '1700000000',
          'retry-after': '45',
        });
        const err = mapResponseToError(429, { message: 'Too Many Requests' }, headers);
        expect(err).toBeInstanceOf(RateLimitError);
        expect(err.retryAfter).toBe(45);
      });
    });

    describe('message fallback', () => {
      it('should generate default message when body has no message', () => {
        const err = mapResponseToError(500, {}, {});
        expect(err.message).toBe('GitHub API error: 500');
      });

      it('should generate default message when body is null', () => {
        const err = mapResponseToError(500, null, {});
        expect(err.message).toBe('GitHub API error: 500');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Boundary Values
  // ---------------------------------------------------------------------------
  describe('Boundary Values', () => {
    it('should handle mapResponseToError with null body', () => {
      const err = mapResponseToError(404, null, {});
      expect(err).toBeInstanceOf(NotFoundError);
      expect(err.message).toBe('GitHub API error: 404');
    });

    it('should handle mapResponseToError with undefined body', () => {
      const err = mapResponseToError(404, undefined, {});
      expect(err).toBeInstanceOf(NotFoundError);
      expect(err.message).toBe('GitHub API error: 404');
    });

    it('should handle mapResponseToError with empty headers object', () => {
      const err = mapResponseToError(401, { message: 'Unauthorized' }, {});
      expect(err).toBeInstanceOf(AuthError);
      expect(err.requestId).toBeUndefined();
    });

    it('should handle mapResponseToError with status 0', () => {
      const err = mapResponseToError(0, { message: 'Unknown' }, {});
      expect(err).toBeInstanceOf(GitHubError);
      expect(err.status).toBe(0);
    });

    it('should handle RateLimitError with no resetAt and no retryAfter', () => {
      const err = new RateLimitError('Rate limited');
      expect(err.resetAt).toBeUndefined();
      expect(err.retryAfter).toBeUndefined();
      expect(err.status).toBe(429);
    });

    it('should handle ServerError with various 5xx codes', () => {
      for (const code of [500, 502, 503, 504, 599]) {
        const err = mapResponseToError(code, { message: `Error ${code}` }, {});
        expect(err).toBeInstanceOf(ServerError);
        expect(err.status).toBe(code);
      }
    });

    it('should handle status just below 500 as generic GitHubError', () => {
      const err = mapResponseToError(499, { message: 'Unknown' }, {});
      expect(err).toBeInstanceOf(GitHubError);
      expect(err).not.toBeInstanceOf(ServerError);
    });

    it('should handle null headers gracefully', () => {
      const err = mapResponseToError(404, { message: 'Not Found' }, null);
      expect(err).toBeInstanceOf(NotFoundError);
      expect(err.requestId).toBeUndefined();
    });

    it('should handle undefined headers gracefully', () => {
      const err = mapResponseToError(401, { message: 'Unauthorized' }, undefined);
      expect(err).toBeInstanceOf(AuthError);
      expect(err.requestId).toBeUndefined();
    });
  });

  // ---------------------------------------------------------------------------
  // Error Handling
  // ---------------------------------------------------------------------------
  describe('Error Handling', () => {
    it('should produce proper Error instances for all error classes', () => {
      const classes = [
        new GitHubError('a'),
        new AuthError('b'),
        new NotFoundError('c'),
        new ValidationError('d'),
        new RateLimitError('e'),
        new ConflictError('f'),
        new ForbiddenError('g'),
        new ServerError('h'),
      ];
      for (const err of classes) {
        expect(err).toBeInstanceOf(Error);
        expect(err).toBeInstanceOf(GitHubError);
        expect(typeof err.message).toBe('string');
        expect(typeof err.name).toBe('string');
      }
    });

    it('should propagate error message correctly through hierarchy', () => {
      const err = new AuthError('Token expired');
      expect(err.message).toBe('Token expired');
      expect(err.stack).toBeDefined();
      expect(err.stack).toContain('Token expired');
    });

    it('should default ServerError status to 500 when not provided', () => {
      const err = new ServerError('Internal error');
      expect(err.status).toBe(500);
    });

    it('should allow mapResponseToError errors to be caught by instanceof', () => {
      const err = mapResponseToError(401, { message: 'Bad' }, {});
      expect(err).toBeInstanceOf(AuthError);
      expect(err).toBeInstanceOf(GitHubError);
      expect(err).toBeInstanceOf(Error);
    });

    it('should have a stack trace on all mapped errors', () => {
      const err = mapResponseToError(500, { message: 'fail' }, {});
      expect(err.stack).toBeDefined();
      expect(err.stack.length).toBeGreaterThan(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Log Verification
  // ---------------------------------------------------------------------------
  describe('Log Verification', () => {
    it('should include error name in toString output', () => {
      const err = new AuthError('Bad credentials');
      const str = err.toString();
      expect(str).toContain('AuthError');
      expect(str).toContain('Bad credentials');
    });

    it('should include error name in toString for all subclasses', () => {
      const errors = [
        new GitHubError('a'),
        new NotFoundError('b'),
        new ValidationError('c'),
        new RateLimitError('d'),
        new ConflictError('e'),
        new ForbiddenError('f'),
        new ServerError('g'),
      ];
      for (const err of errors) {
        expect(err.toString()).toContain(err.name);
      }
    });
  });
});
