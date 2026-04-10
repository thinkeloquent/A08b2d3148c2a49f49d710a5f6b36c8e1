/**
 * Unit tests for logger.mjs
 *
 * Tests cover:
 * - Statement coverage for all code paths
 * - Branch coverage for all conditionals
 * - Boundary value analysis
 * - Error handling verification
 * - Log verification (hyper-observability)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { create, SDKLogger, LEVELS, REDACT_KEYS } from '../src/logger.mjs';

// ── Helpers ──────────────────────────────────────────────────────────
function createLogSpy() {
  const entries = [];
  return {
    entries,
    logger: {
      debug: (msg) => entries.push({ level: 'debug', msg }),
      info: (msg) => entries.push({ level: 'info', msg }),
      warn: (msg) => entries.push({ level: 'warn', msg }),
      error: (msg) => entries.push({ level: 'error', msg }),
    },
  };
}

describe('Logger', () => {
  const ORIGINAL_LOG_LEVEL = process.env.LOG_LEVEL;

  afterEach(() => {
    if (ORIGINAL_LOG_LEVEL !== undefined) {
      process.env.LOG_LEVEL = ORIGINAL_LOG_LEVEL;
    } else {
      delete process.env.LOG_LEVEL;
    }
  });

  // =====================================================================
  // Statement Coverage
  // =====================================================================
  describe('Statement Coverage', () => {
    it('create() returns an SDKLogger instance', () => {
      const log = create('saucelabs-api', 'test-file.mjs');
      expect(log).toBeInstanceOf(SDKLogger);
    });

    it('SDKLogger has correct prefix from plain filename', () => {
      const log = create('saucelabs-api', 'my-module.mjs');
      expect(log.prefix).toBe('[saucelabs-api:my-module]');
    });

    it('SDKLogger resolves file:// URL to basename', () => {
      const log = create('saucelabs-api', 'file:///Users/demo/project/src/client.mjs');
      expect(log.prefix).toBe('[saucelabs-api:client]');
    });

    it('exports LEVELS constant with correct values', () => {
      expect(LEVELS).toEqual({ debug: 0, info: 1, warn: 2, error: 3, silent: 4 });
    });

    it('exports REDACT_KEYS regex', () => {
      expect(REDACT_KEYS).toBeInstanceOf(RegExp);
      expect(REDACT_KEYS.test('access_key')).toBe(true);
      expect(REDACT_KEYS.test('username')).toBe(false);
    });

    it('all log methods produce output', () => {
      process.env.LOG_LEVEL = 'debug';
      const { entries, logger } = createLogSpy();
      const log = create('saucelabs-api', 'test.mjs', logger);
      log.debug('d');
      log.info('i');
      log.warn('w');
      log.error('e');
      expect(entries).toHaveLength(4);
      expect(entries.map((e) => e.level)).toEqual(['debug', 'info', 'warn', 'error']);
    });
  });

  // =====================================================================
  // Branch Coverage
  // =====================================================================
  describe('Branch Coverage', () => {
    it('uses custom logger when provided', () => {
      process.env.LOG_LEVEL = 'debug';
      const { entries, logger } = createLogSpy();
      const log = create('pkg', 'test.mjs', logger);
      log.info('hello');
      expect(entries).toHaveLength(1);
      expect(entries[0].msg).toContain('hello');
    });

    it('falls back to console when no custom logger', () => {
      process.env.LOG_LEVEL = 'debug';
      const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      const log = create('pkg', 'test.mjs');
      log.debug('fallback test');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('respects LOG_LEVEL=error — filters out debug/info/warn', () => {
      process.env.LOG_LEVEL = 'error';
      const { entries, logger } = createLogSpy();
      const log = create('pkg', 'test.mjs', logger);
      log.debug('skip');
      log.info('skip');
      log.warn('skip');
      log.error('keep');
      expect(entries).toHaveLength(1);
      expect(entries[0].level).toBe('error');
    });

    it('LOG_LEVEL=silent suppresses all output', () => {
      process.env.LOG_LEVEL = 'silent';
      const { entries, logger } = createLogSpy();
      const log = create('pkg', 'test.mjs', logger);
      log.debug('a');
      log.info('b');
      log.warn('c');
      log.error('d');
      expect(entries).toHaveLength(0);
    });

    it('defaults to info level when LOG_LEVEL is unrecognized', () => {
      process.env.LOG_LEVEL = 'INVALID';
      const { entries, logger } = createLogSpy();
      const log = create('pkg', 'test.mjs', logger);
      log.debug('should be filtered');
      log.info('should appear');
      expect(entries).toHaveLength(1);
      expect(entries[0].msg).toContain('should appear');
    });

    it('redacts long sensitive values with partial mask', () => {
      process.env.LOG_LEVEL = 'debug';
      const { entries, logger } = createLogSpy();
      const log = create('pkg', 'test.mjs', logger);
      log.info('check', { access_key: 'supersecretkey12345' });
      expect(entries[0].msg).toContain('supersec***');
      expect(entries[0].msg).not.toContain('supersecretkey12345');
    });

    it('redacts short sensitive values completely', () => {
      process.env.LOG_LEVEL = 'debug';
      const { entries, logger } = createLogSpy();
      const log = create('pkg', 'test.mjs', logger);
      log.info('check', { api_key: 'short' });
      expect(entries[0].msg).toContain('***');
      expect(entries[0].msg).not.toContain('short');
    });

    it('passes through non-sensitive keys', () => {
      process.env.LOG_LEVEL = 'debug';
      const { entries, logger } = createLogSpy();
      const log = create('pkg', 'test.mjs', logger);
      log.info('check', { username: 'demo', region: 'us-west-1' });
      expect(entries[0].msg).toContain('demo');
      expect(entries[0].msg).toContain('us-west-1');
    });

    it('redacts nested objects', () => {
      process.env.LOG_LEVEL = 'debug';
      const { entries, logger } = createLogSpy();
      const log = create('pkg', 'test.mjs', logger);
      log.info('nested', { config: { password: 'deep_secret', host: 'localhost' } });
      expect(entries[0].msg).not.toContain('deep_secret');
      expect(entries[0].msg).toContain('localhost');
    });

    it('handles arrays in context', () => {
      process.env.LOG_LEVEL = 'debug';
      const { entries, logger } = createLogSpy();
      const log = create('pkg', 'test.mjs', logger);
      log.info('arr', [{ token: 'secret123456789' }]);
      expect(entries[0].msg).not.toContain('secret123456789');
    });
  });

  // =====================================================================
  // Boundary Values
  // =====================================================================
  describe('Boundary Values', () => {
    it('handles empty filename', () => {
      const log = create('pkg', '');
      expect(log.prefix).toBe('[pkg:unknown]');
    });

    it('handles null filename', () => {
      const log = create('pkg', null);
      expect(log.prefix).toBe('[pkg:unknown]');
    });

    it('handles undefined filename', () => {
      const log = create('pkg', undefined);
      expect(log.prefix).toBe('[pkg:unknown]');
    });

    it('handles null context', () => {
      process.env.LOG_LEVEL = 'debug';
      const { entries, logger } = createLogSpy();
      const log = create('pkg', 'test.mjs', logger);
      log.info('msg', null);
      expect(entries).toHaveLength(1);
    });

    it('handles undefined context', () => {
      process.env.LOG_LEVEL = 'debug';
      const { entries, logger } = createLogSpy();
      const log = create('pkg', 'test.mjs', logger);
      log.info('msg');
      expect(entries).toHaveLength(1);
    });

    it('handles empty object context', () => {
      process.env.LOG_LEVEL = 'debug';
      const { entries, logger } = createLogSpy();
      const log = create('pkg', 'test.mjs', logger);
      log.info('msg', {});
      expect(entries).toHaveLength(1);
      // Empty object should not add JSON to output
    });

    it('handles LOG_LEVEL not set (defaults to info)', () => {
      delete process.env.LOG_LEVEL;
      const { entries, logger } = createLogSpy();
      const log = create('pkg', 'test.mjs', logger);
      log.debug('filtered');
      log.info('visible');
      expect(entries).toHaveLength(1);
    });
  });

  // =====================================================================
  // Error Handling
  // =====================================================================
  describe('Error Handling', () => {
    it('handles invalid file:// URL gracefully', () => {
      const log = create('pkg', 'file://invalid\x00path');
      expect(log.prefix).toBe('[pkg:unknown]');
    });

    it('does not throw when custom logger method is missing', () => {
      process.env.LOG_LEVEL = 'debug';
      const partial = { info: vi.fn() };
      const log = create('pkg', 'test.mjs', partial);
      // debug method doesn't exist on custom logger, should fall back
      expect(() => log.debug('test')).not.toThrow();
    });
  });

  // =====================================================================
  // Log Verification
  // =====================================================================
  describe('Log Verification', () => {
    it('output includes prefix, level, message, and timestamp', () => {
      process.env.LOG_LEVEL = 'debug';
      const { entries, logger } = createLogSpy();
      const log = create('saucelabs-api', 'client.mjs', logger);
      log.info('connection established');
      const msg = entries[0].msg;
      expect(msg).toContain('[saucelabs-api:client]');
      expect(msg).toContain('connection established');
      // Timestamp pattern: YYYY-MM-DD HH:MM:SS
      expect(msg).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
    });

    it('context is JSON-serialized in output', () => {
      process.env.LOG_LEVEL = 'debug';
      const { entries, logger } = createLogSpy();
      const log = create('pkg', 'test.mjs', logger);
      log.info('data', { count: 42 });
      expect(entries[0].msg).toContain('"count":42');
    });
  });
});
