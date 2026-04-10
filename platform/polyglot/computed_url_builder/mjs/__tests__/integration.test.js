/**
 * Integration tests for realistic usage scenarios.
 */

import createUrlBuilder, { createNullLogger } from '../src/index.mjs';

const nullLogger = createNullLogger();
const withLogger = { logger: nullLogger };

describe('Integration Tests', () => {
  test('should work in realistic API scenario', () => {
    const api = createUrlBuilder(
      {
        dev: 'https://dev.api.example.com',
        staging: 'https://staging.api.example.com',
        prod: 'https://api.example.com',
      },
      '/api/v1',
      withLogger
    );

    const devUrl = api.build('dev');
    const stagingUrl = api.build('staging');
    const prodUrl = api.build('prod');

    expect(devUrl).toBe('https://dev.api.example.com/api/v1');
    expect(stagingUrl).toBe('https://staging.api.example.com/api/v1');
    expect(prodUrl).toBe('https://api.example.com/api/v1');
  });

  test('should work with array-based URLs', () => {
    const api = createUrlBuilder(
      { custom: ['https://custom.api.example.com', '/special/v2/endpoint'] },
      undefined,
      withLogger
    );

    const url = api.build('custom');

    expect(url).toBe('https://custom.api.example.com/special/v2/endpoint');
  });

  test('should support complete workflow', () => {
    const api = createUrlBuilder(
      {
        dev: 'https://dev.api.example.com',
        prod: 'https://api.example.com',
      },
      '/api/v1',
      withLogger
    );

    // Build URL
    const url = api.build('dev');
    expect(url).toBe('https://dev.api.example.com/api/v1');

    // Add endpoint
    const fullUrl = url + '/users';
    expect(fullUrl).toBe('https://dev.api.example.com/api/v1/users');

    // Serialize for debugging
    const state = api.toJSON();
    expect(state).toHaveProperty('env');
    expect(state).toHaveProperty('basePath');
  });

  test('should support environment switching', () => {
    const api = createUrlBuilder(
      {
        dev: 'https://dev.api.example.com',
        staging: 'https://staging.api.example.com',
        prod: 'https://api.example.com',
      },
      '/api/v1',
      withLogger
    );

    // Simulate environment switching
    const environments = ['dev', 'staging', 'prod'];
    const expectedHosts = [
      'https://dev.api.example.com',
      'https://staging.api.example.com',
      'https://api.example.com',
    ];

    environments.forEach((env, index) => {
      const url = api.build(env);
      expect(url).toBe(`${expectedHosts[index]}/api/v1`);
    });
  });
});
