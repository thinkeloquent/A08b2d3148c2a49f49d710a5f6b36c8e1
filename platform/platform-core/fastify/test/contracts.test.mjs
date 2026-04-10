/**
 * Contract utilities tests
 */

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createLoaderReport,
  sortByNumericPrefix,
  validateBootstrapConfig,
  createDefaultConfig,
} from '../../contracts/bootstrap-contract.mjs';

describe('createLoaderReport', () => {
  test('creates report with loader name and zero counts', () => {
    const report = createLoaderReport('test-loader');
    assert.equal(report.loader, 'test-loader');
    assert.equal(report.discovered, 0);
    assert.equal(report.validated, 0);
    assert.equal(report.imported, 0);
    assert.equal(report.registered, 0);
    assert.equal(report.skipped, 0);
    assert.deepEqual(report.errors, []);
    assert.deepEqual(report.details, {});
  });
});

describe('sortByNumericPrefix', () => {
  test('sorts single-digit prefixes', () => {
    const input = ['03_c.mjs', '01_a.mjs', '02_b.mjs'];
    const result = sortByNumericPrefix(input);
    assert.deepEqual(result, ['01_a.mjs', '02_b.mjs', '03_c.mjs']);
  });

  test('sorts mixed single, double, triple digit prefixes', () => {
    const input = [
      '100_decorators.lifecycle.mjs',
      '01_config.lifecycle.mjs',
      '20_cache.lifecycle.mjs',
      '490_openapi.lifecycle.mjs',
      '05_state.lifecycle.mjs',
    ];
    const result = sortByNumericPrefix(input);
    assert.deepEqual(result, [
      '01_config.lifecycle.mjs',
      '05_state.lifecycle.mjs',
      '20_cache.lifecycle.mjs',
      '100_decorators.lifecycle.mjs',
      '490_openapi.lifecycle.mjs',
    ]);
  });

  test('handles dash-separated prefixes', () => {
    const input = ['06-cors.lifecycle.mjs', '01-app-yaml.lifecycle.mjs'];
    const result = sortByNumericPrefix(input);
    assert.deepEqual(result, ['01-app-yaml.lifecycle.mjs', '06-cors.lifecycle.mjs']);
  });

  test('sorts files without prefix to end', () => {
    const input = ['no_prefix.mjs', '01_first.mjs', 'also_no_prefix.mjs'];
    const result = sortByNumericPrefix(input);
    assert.equal(result[0], '01_first.mjs');
    // Files without prefix get 999 and then sorted alphabetically
    assert.equal(result[1], 'also_no_prefix.mjs');
    assert.equal(result[2], 'no_prefix.mjs');
  });

  test('handles full paths', () => {
    const input = [
      '/path/to/20_cache.lifecycle.mjs',
      '/path/to/01_config.lifecycle.mjs',
      '/other/path/05_state.lifecycle.mjs',
    ];
    const result = sortByNumericPrefix(input);
    assert.deepEqual(result, [
      '/path/to/01_config.lifecycle.mjs',
      '/other/path/05_state.lifecycle.mjs',
      '/path/to/20_cache.lifecycle.mjs',
    ]);
  });

  test('returns empty array for empty input', () => {
    assert.deepEqual(sortByNumericPrefix([]), []);
  });

  test('handles current lifecycle filenames', () => {
    const currentFiles = [
      '490_openapi_dynamic.lifecycle.mjs',
      '190-fastapi_proxy.lifecycle.mjs',
      '105-sequelize.lifecycle.mjs',
      '100-on-request-decorators.lifecycle.mjs',
      '20-cache-service.lifecycle.mjs',
      '09-feature-flags.lifecycle.mjs',
      '08-endpoint-config.lifecycle.mjs',
      '07-no-cache.lifecycle.mjs',
      '06-cors.lifecycle.mjs',
      '06-content-security-policy.lifecycle.mjs',
      '05-state-machine.lifecycle.mjs',
      '04-context-resolver.lifecycle.mjs',
      '03-external-compute.lifecycle.mjs',
      '02-create_shared_context.lifecycle.mjs',
      '01-app-yaml.lifecycle.mjs',
    ];
    const result = sortByNumericPrefix(currentFiles);
    assert.equal(result[0], '01-app-yaml.lifecycle.mjs');
    assert.equal(result[1], '02-create_shared_context.lifecycle.mjs');
    assert.equal(result[2], '03-external-compute.lifecycle.mjs');
    assert.equal(result[3], '04-context-resolver.lifecycle.mjs');
    assert.equal(result[4], '05-state-machine.lifecycle.mjs');
    // 06 prefixes sort together (alpha tiebreak)
    assert.ok(result[5].startsWith('06'));
    assert.ok(result[6].startsWith('06'));
    assert.equal(result[result.length - 1], '490_openapi_dynamic.lifecycle.mjs');
  });
});

describe('validateBootstrapConfig', () => {
  test('validates a valid config', () => {
    const { valid, errors } = validateBootstrapConfig({
      port: 51000,
      host: '0.0.0.0',
      logger: { level: 'info' },
    });
    assert.equal(valid, true);
    assert.equal(errors.length, 0);
  });

  test('rejects non-object config', () => {
    const { valid } = validateBootstrapConfig(null);
    assert.equal(valid, false);
  });

  test('rejects invalid port', () => {
    const { valid, errors } = validateBootstrapConfig({ port: 99999 });
    assert.equal(valid, false);
    assert.ok(errors.some(e => e.includes('port')));
  });

  test('rejects invalid log level', () => {
    const { valid, errors } = validateBootstrapConfig({
      port: 3000,
      logger: { level: 'invalid' },
    });
    assert.equal(valid, false);
    assert.ok(errors.some(e => e.includes('logger.level')));
  });

  test('rejects non-array corePlugins', () => {
    const { valid, errors } = validateBootstrapConfig({
      port: 3000,
      corePlugins: 'not-an-array',
    });
    assert.equal(valid, false);
    assert.ok(errors.some(e => e.includes('corePlugins')));
  });
});

describe('createDefaultConfig', () => {
  test('returns config with defaults', () => {
    const config = createDefaultConfig();
    assert.equal(config.port, 51000);
    assert.equal(config.host, '0.0.0.0');
    assert.ok(config.logger);
    assert.deepEqual(config.corePlugins, []);
  });

  test('applies overrides', () => {
    const config = createDefaultConfig({ port: 3000, title: 'test' });
    assert.equal(config.port, 3000);
    assert.equal(config.title, 'test');
    assert.equal(config.host, '0.0.0.0'); // default preserved
  });
});
