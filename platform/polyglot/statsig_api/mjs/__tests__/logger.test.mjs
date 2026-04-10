/**
 * Unit tests for logger module.
 *
 * Tests cover:
 * - Statement coverage for logger creation and emission
 * - Branch coverage for log level filtering and redaction
 * - Boundary values for edge cases in context handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { create, SDKLogger, LEVELS } from '../src/logger.mjs';

describe('Logger', () => {
  let originalLogLevel;

  beforeEach(() => {
    originalLogLevel = process.env.LOG_LEVEL;
  });

  afterEach(() => {
    if (originalLogLevel === undefined) {
      delete process.env.LOG_LEVEL;
    } else {
      process.env.LOG_LEVEL = originalLogLevel;
    }
  });

  describe('Statement Coverage', () => {
    it('should create a logger instance', () => {
      const log = create('test-pkg', 'test-file');
      expect(log).toBeInstanceOf(SDKLogger);
    });

    it('should have all log methods', () => {
      const log = create('test-pkg', 'test-file');
      expect(typeof log.debug).toBe('function');
      expect(typeof log.info).toBe('function');
      expect(typeof log.warn).toBe('function');
      expect(typeof log.error).toBe('function');
    });

    it('should emit info-level messages', () => {
      process.env.LOG_LEVEL = 'info';
      const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const log = create('test-pkg', 'test-file');
      log.info('test message');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should include prefix in output', () => {
      process.env.LOG_LEVEL = 'info';
      const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const log = create('my-sdk', 'my-file');
      log.info('hello');
      const output = spy.mock.calls[0][0];
      expect(output).toContain('[my-sdk:my-file]');
      spy.mockRestore();
    });
  });

  describe('Branch Coverage', () => {
    it('should suppress debug at info level', () => {
      process.env.LOG_LEVEL = 'info';
      const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      const log = create('pkg', 'file');
      log.debug('should not appear');
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should emit debug at debug level', () => {
      process.env.LOG_LEVEL = 'debug';
      const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      const log = create('pkg', 'file');
      log.debug('should appear');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should emit error at all levels', () => {
      process.env.LOG_LEVEL = 'error';
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const log = create('pkg', 'file');
      log.error('error message');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should default to info when LOG_LEVEL is invalid', () => {
      process.env.LOG_LEVEL = 'INVALID';
      const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const log = create('pkg', 'file');
      log.info('should appear');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should use custom logger if provided', () => {
      const customLogger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
      process.env.LOG_LEVEL = 'debug';
      const log = create('pkg', 'file', customLogger);
      log.info('test');
      expect(customLogger.info).toHaveBeenCalled();
    });

    it('should redact sensitive keys in context', () => {
      process.env.LOG_LEVEL = 'info';
      const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const log = create('pkg', 'file');
      log.info('msg', { apiKey: 'super-secret-key-1234' });
      const output = spy.mock.calls[0][0];
      expect(output).not.toContain('super-secret-key-1234');
      expect(output).toContain('***');
      spy.mockRestore();
    });

    it('should preserve non-sensitive keys', () => {
      process.env.LOG_LEVEL = 'info';
      const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const log = create('pkg', 'file');
      log.info('msg', { name: 'test' });
      const output = spy.mock.calls[0][0];
      expect(output).toContain('test');
      spy.mockRestore();
    });
  });

  describe('Boundary Values', () => {
    it('should handle null context', () => {
      process.env.LOG_LEVEL = 'info';
      const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const log = create('pkg', 'file');
      log.info('msg', null);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should handle empty context object', () => {
      process.env.LOG_LEVEL = 'info';
      const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const log = create('pkg', 'file');
      log.info('msg', {});
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should handle undefined context', () => {
      process.env.LOG_LEVEL = 'info';
      const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const log = create('pkg', 'file');
      log.info('msg');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should resolve import.meta.url style filenames', () => {
      const log = create('pkg', 'file:///path/to/module.mjs');
      expect(log.filename).toBe('module');
    });

    it('should handle empty filename', () => {
      const log = create('pkg', '');
      expect(log.filename).toBe('unknown');
    });
  });
});

describe('LEVELS', () => {
  it('should export expected level constants', () => {
    expect(LEVELS.debug).toBe(0);
    expect(LEVELS.info).toBe(1);
    expect(LEVELS.warn).toBe(2);
    expect(LEVELS.error).toBe(3);
    expect(LEVELS.silent).toBe(4);
  });
});
