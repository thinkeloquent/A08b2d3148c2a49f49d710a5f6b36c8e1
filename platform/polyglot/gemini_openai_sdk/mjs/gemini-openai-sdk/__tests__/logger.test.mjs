/**
 * Unit tests for logger module.
 *
 * Tests cover:
 * - Statement coverage for all code paths
 * - Branch coverage for all conditionals
 * - Boundary value analysis
 * - Error handling verification
 * - Log verification (hyper-observability)
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { create, SDKLogger } from '../logger.mjs';
import { createLoggerSpy, expectLogContains } from './helpers.mjs';

describe('Logger Module', () => {
  // ===========================================================================
  // Statement Coverage
  // ===========================================================================

  describe('Statement Coverage', () => {
    it('should create an SDKLogger instance', () => {
      const logger = create('test-package', import.meta.url);

      expect(logger).toBeInstanceOf(SDKLogger);
    });

    it('should store package name', () => {
      const logger = create('my-package', import.meta.url);

      expect(logger._packageName).toBe('my-package');
    });

    it('should store filename', () => {
      const logger = create('test', '/path/to/file.mjs');

      expect(logger._filename).toContain('file.mjs');
    });

    it('should have debug method', () => {
      const logger = create('test', import.meta.url);

      expect(typeof logger.debug).toBe('function');
    });

    it('should have info method', () => {
      const logger = create('test', import.meta.url);

      expect(typeof logger.info).toBe('function');
    });

    it('should have warn method', () => {
      const logger = create('test', import.meta.url);

      expect(typeof logger.warn).toBe('function');
    });

    it('should have error method', () => {
      const logger = create('test', import.meta.url);

      expect(typeof logger.error).toBe('function');
    });
  });

  // ===========================================================================
  // Branch Coverage
  // ===========================================================================

  describe('Branch Coverage', () => {
    it('should accept custom logger instance', () => {
      const { logs, mockLogger } = createLoggerSpy();
      const logger = create('test', import.meta.url, mockLogger);

      logger.info('test message');

      expect(expectLogContains(logs, 'info', 'test message')).toBe(true);
    });

    it('should use default logger when none provided', () => {
      const logger = create('test', import.meta.url);

      // Should not throw
      expect(() => logger.debug('test')).not.toThrow();
    });

    it('should handle extra data object', () => {
      const { logs, mockLogger } = createLoggerSpy();
      const logger = create('test', import.meta.url, mockLogger);

      logger.info('message', { key: 'value' });

      expect(logs.info.length).toBeGreaterThan(0);
    });

    it('should handle missing extra data', () => {
      const { logs, mockLogger } = createLoggerSpy();
      const logger = create('test', import.meta.url, mockLogger);

      logger.info('message');

      expect(logs.info.length).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // Boundary Values
  // ===========================================================================

  describe('Boundary Values', () => {
    it('should handle empty package name', () => {
      const logger = create('', import.meta.url);

      expect(logger._packageName).toBe('');
    });

    it('should handle empty filename', () => {
      const logger = create('test', '');

      expect(logger._filename).toBe('');
    });

    it('should handle very long messages', () => {
      const logger = create('test', import.meta.url);
      const longMsg = 'x'.repeat(10000);

      expect(() => logger.info(longMsg)).not.toThrow();
    });

    it('should handle unicode characters', () => {
      const logger = create('test', import.meta.url);

      expect(() => logger.info('Hello 世界 🌍')).not.toThrow();
    });

    it('should handle null extra data', () => {
      const logger = create('test', import.meta.url);

      expect(() => logger.info('message', null)).not.toThrow();
    });

    it('should handle undefined extra data', () => {
      const logger = create('test', import.meta.url);

      expect(() => logger.info('message', undefined)).not.toThrow();
    });
  });

  // ===========================================================================
  // Error Handling
  // ===========================================================================

  describe('Error Handling', () => {
    it('should handle error with exception object', () => {
      const { logs, mockLogger } = createLoggerSpy();
      const logger = create('test', import.meta.url, mockLogger);
      const err = new Error('test error');

      logger.error('Error occurred', { detail: 'info' }, err);

      expect(logs.error.length).toBeGreaterThan(0);
    });

    it('should handle error without exception object', () => {
      const { logs, mockLogger } = createLoggerSpy();
      const logger = create('test', import.meta.url, mockLogger);

      logger.error('Error message');

      expect(logs.error.length).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // Log Verification
  // ===========================================================================

  describe('Log Verification', () => {
    it('should log debug messages at DEBUG level', () => {
      // Set LOG_LEVEL to DEBUG to ensure debug logs are captured
      const origLevel = process.env.LOG_LEVEL;
      process.env.LOG_LEVEL = 'DEBUG';

      const { logs, mockLogger } = createLoggerSpy();
      const logger = create('test-pkg', import.meta.url, mockLogger);

      logger.debug('debug message');

      // Restore original level
      if (origLevel) {
        process.env.LOG_LEVEL = origLevel;
      } else {
        delete process.env.LOG_LEVEL;
      }

      // Custom logger receives formatted message, check logs array has entries
      expect(logs.debug.length).toBeGreaterThan(0);
    });

    it('should log info messages at INFO level', () => {
      const { logs, mockLogger } = createLoggerSpy();
      const logger = create('test-pkg', import.meta.url, mockLogger);

      logger.info('info message');

      expect(expectLogContains(logs, 'info', 'info message')).toBe(true);
    });

    it('should log warn messages at WARN level', () => {
      const { logs, mockLogger } = createLoggerSpy();
      const logger = create('test-pkg', import.meta.url, mockLogger);

      logger.warn('warning message');

      expect(expectLogContains(logs, 'warn', 'warning message')).toBe(true);
    });

    it('should log error messages at ERROR level', () => {
      const { logs, mockLogger } = createLoggerSpy();
      const logger = create('test-pkg', import.meta.url, mockLogger);

      logger.error('error message');

      expect(expectLogContains(logs, 'error', 'error message')).toBe(true);
    });
  });
});

describe('create() function', () => {
  it('should accept package_name, filename, and optional logger', () => {
    // All these should work
    expect(() => create('pkg', 'file.mjs')).not.toThrow();
    expect(() => create('pkg', 'file.mjs', null)).not.toThrow();

    const { mockLogger } = createLoggerSpy();
    expect(() => create('pkg', 'file.mjs', mockLogger)).not.toThrow();
  });

  it('should return consistent type', () => {
    const logger1 = create('pkg1', 'file1.mjs');
    const { mockLogger } = createLoggerSpy();
    const logger2 = create('pkg2', 'file2.mjs', mockLogger);

    expect(logger1.constructor.name).toBe(logger2.constructor.name);
  });
});
