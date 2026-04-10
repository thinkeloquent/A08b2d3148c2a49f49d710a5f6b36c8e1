/**
 * Tests for builder instance behavior.
 */

import createUrlBuilder, { createNullLogger } from '../src/index.mjs';

const nullLogger = createNullLogger();
const withLogger = { logger: nullLogger };

describe('Builder Instance', () => {
  test('should maintain separate state for multiple instances', () => {
    const builder1 = createUrlBuilder(
      { dev: 'https://api1.example.com' },
      '/v1',
      withLogger
    );

    const builder2 = createUrlBuilder(
      { dev: 'https://api2.example.com' },
      '/v2',
      withLogger
    );

    expect(builder1.build('dev')).toBe('https://api1.example.com/v1');
    expect(builder2.build('dev')).toBe('https://api2.example.com/v2');
  });

  test('should have access to env property', () => {
    const urlKeys = { dev: 'https://dev.api.example.com' };
    const builder = createUrlBuilder(urlKeys, '/v1', withLogger);

    expect(builder.env).toEqual(urlKeys);
  });

  test('should have access to basePath property', () => {
    const builder = createUrlBuilder({}, '/v1/users', withLogger);

    expect(builder.basePath).toBe('/v1/users');
  });

  test('should handle empty urlKeys object', () => {
    const builder = createUrlBuilder({}, '/v1', withLogger);

    expect(() => builder.build('any')).toThrow('Environment key "any" not found');
  });

  test('should work without any parameters', () => {
    const builder = createUrlBuilder(undefined, undefined, withLogger);

    expect(builder.env).toEqual({});
    expect(builder.basePath).toBe('');
  });
});

describe('toJSON', () => {
  test('should return builder state as object', () => {
    const builder = createUrlBuilder(
      { dev: 'https://dev.api.example.com' },
      '/v1/users',
      withLogger
    );

    const result = builder.toJSON();

    expect(result).toHaveProperty('env');
    expect(result).toHaveProperty('basePath');
    expect(result.env.dev).toBe('https://dev.api.example.com');
    expect(result.basePath).toBe('/v1/users');
  });

  test('should return a copy, not the original', () => {
    const builder = createUrlBuilder(
      { dev: 'https://dev.api.example.com' },
      '/v1/users',
      withLogger
    );

    const result = builder.toJSON();
    result.env.newKey = 'test';

    // Original should not be modified
    expect(builder.env.newKey).toBeUndefined();
  });
});

describe('fromContext', () => {
  test('should create builder from context object', () => {
    const builder = createUrlBuilder.fromContext(
      { dev: 'https://dev.api.com', prod: 'https://api.com' },
      '',
      withLogger
    );

    expect(builder.build('dev')).toBe('https://dev.api.com');
    expect(builder.build('prod')).toBe('https://api.com');
  });

  test('should support base path', () => {
    const builder = createUrlBuilder.fromContext(
      { dev: 'https://dev.api.com' },
      '/v1',
      withLogger
    );

    expect(builder.build('dev')).toBe('https://dev.api.com/v1');
  });

  test('should support function-based URL values', () => {
    const builder = createUrlBuilder.fromContext(
      { dev: (ctx) => `https://${ctx.tenant}.api.com` },
      '',
      withLogger
    );

    expect(builder.build('dev', { tenant: 'acme' })).toBe('https://acme.api.com');
  });
});

describe('Function-based URLs', () => {
  test('function should receive context object', () => {
    let receivedContext = {};

    const captureContext = (ctx) => {
      receivedContext = { ...ctx };
      return 'https://api.com';
    };

    const builder = createUrlBuilder({ dev: captureContext }, '', withLogger);
    builder.build('dev', { key: 'value', num: 123 });

    expect(receivedContext).toEqual({ key: 'value', num: 123 });
  });

  test('function result should have base path appended', () => {
    const builder = createUrlBuilder(
      { dev: (ctx) => `https://${ctx.region}.api.com` },
      '/v1',
      withLogger
    );

    expect(builder.build('dev', { region: 'us-west' })).toBe('https://us-west.api.com/v1');
  });

  test('function should work with empty context', () => {
    const builder = createUrlBuilder(
      { dev: () => 'https://api.com' },
      '',
      withLogger
    );

    expect(builder.build('dev')).toBe('https://api.com');
    expect(builder.build('dev', {})).toBe('https://api.com');
  });

  test('should handle mix of string and function values', () => {
    const builder = createUrlBuilder(
      {
        static: 'https://static.api.com',
        dynamic: (ctx) => `https://${ctx.env}.api.com`,
      },
      '/v1',
      withLogger
    );

    expect(builder.build('static')).toBe('https://static.api.com/v1');
    expect(builder.build('dynamic', { env: 'dev' })).toBe('https://dev.api.com/v1');
  });
});
