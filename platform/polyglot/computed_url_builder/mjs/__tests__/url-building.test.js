/**
 * Tests for URL building functionality.
 */

import createUrlBuilder, { createNullLogger } from '../src/index.mjs';

const nullLogger = createNullLogger();
const withLogger = { logger: nullLogger };

describe('URL Building', () => {
  describe('String-based URLs', () => {
    test('should build URL with host and basePath', () => {
      const builder = createUrlBuilder(
        {
          dev: 'https://dev.api.example.com',
          prod: 'https://api.example.com',
        },
        '/v1/users',
        withLogger
      );

      expect(builder.build('dev')).toBe('https://dev.api.example.com/v1/users');
      expect(builder.build('prod')).toBe('https://api.example.com/v1/users');
    });

    test('should build URL without basePath', () => {
      const builder = createUrlBuilder(
        { dev: 'https://dev.api.example.com' },
        undefined,
        withLogger
      );

      expect(builder.build('dev')).toBe('https://dev.api.example.com');
    });

    test('should build URL with empty basePath', () => {
      const builder = createUrlBuilder(
        { dev: 'https://dev.api.example.com' },
        '',
        withLogger
      );

      expect(builder.build('dev')).toBe('https://dev.api.example.com');
    });
  });

  describe('Array-based URLs', () => {
    test('should build URL from array by joining elements', () => {
      const builder = createUrlBuilder(
        {
          dev: ['https://dev.api.example.com', '/v2/special/endpoint'],
          prod: ['https://api.example.com', '/v2/special/endpoint'],
        },
        undefined,
        withLogger
      );

      expect(builder.build('dev')).toBe('https://dev.api.example.com/v2/special/endpoint');
      expect(builder.build('prod')).toBe('https://api.example.com/v2/special/endpoint');
    });

    test('should join array with multiple parts', () => {
      const builder = createUrlBuilder(
        { custom: ['https://api.example.com', '/v1', '/users', '/profile'] },
        undefined,
        withLogger
      );

      expect(builder.build('custom')).toBe('https://api.example.com/v1/users/profile');
    });

    test('should handle single element array', () => {
      const builder = createUrlBuilder(
        { single: ['https://api.example.com'] },
        undefined,
        withLogger
      );

      expect(builder.build('single')).toBe('https://api.example.com');
    });
  });

  describe('Mixed configurations', () => {
    test('should handle both string and array values in same config', () => {
      const builder = createUrlBuilder(
        {
          dev: 'https://dev.api.example.com',
          special: ['https://special.api.example.com', '/custom/path'],
        },
        '/v1',
        withLogger
      );

      expect(builder.build('dev')).toBe('https://dev.api.example.com/v1');
      expect(builder.build('special')).toBe('https://special.api.example.com/custom/path');
    });
  });
});
