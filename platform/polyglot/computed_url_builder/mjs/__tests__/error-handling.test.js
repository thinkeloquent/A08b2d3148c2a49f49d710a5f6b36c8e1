/**
 * Tests for error handling.
 */

import createUrlBuilder, { createNullLogger } from '../src/index.mjs';

const nullLogger = createNullLogger();
const withLogger = { logger: nullLogger };

describe('Error Handling', () => {
  test('should throw error for non-existent environment key', () => {
    const builder = createUrlBuilder(
      { dev: 'https://dev.api.example.com' },
      '/v1',
      withLogger
    );

    expect(() => builder.build('prod')).toThrow('Environment key "prod" not found');
  });

  test('should throw error for undefined key', () => {
    const builder = createUrlBuilder(
      { dev: 'https://dev.api.example.com' },
      '/v1',
      withLogger
    );

    expect(() => builder.build('staging')).toThrow('Environment key "staging" not found');
  });

  test('should throw error when urlKeys is empty', () => {
    const builder = createUrlBuilder({}, '/v1', withLogger);

    expect(() => builder.build('any')).toThrow('Environment key "any" not found');
  });
});
