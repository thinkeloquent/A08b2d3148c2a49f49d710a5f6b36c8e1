/**
 * Tests for the confluence_api logger module.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLogger, nullLogger } from '../src/logger.mjs';

describe('createLogger', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = process.env.LOG_LEVEL;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.LOG_LEVEL = originalEnv;
    } else {
      delete process.env.LOG_LEVEL;
    }
    vi.restoreAllMocks();
  });

  it('creates a logger with all expected methods', () => {
    const log = createLogger('test', import.meta.url);
    expect(log).toBeDefined();
    expect(log.trace).toBeInstanceOf(Function);
    expect(log.debug).toBeInstanceOf(Function);
    expect(log.info).toBeInstanceOf(Function);
    expect(log.warn).toBeInstanceOf(Function);
    expect(log.error).toBeInstanceOf(Function);
  });

  it('emits structured JSON on info', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const log = createLogger('test-pkg', import.meta.url);
    log.info('test message', { key: 'value' });

    expect(spy).toHaveBeenCalledTimes(1);
    const entry = JSON.parse(spy.mock.calls[0][0]);
    expect(entry.msg).toBe('test message');
    expect(entry.pkg).toBe('test-pkg');
    expect(entry.level).toBe('info');
    expect(entry.ctx.key).toBe('value');
  });

  it('respects LOG_LEVEL environment variable', () => {
    process.env.LOG_LEVEL = 'error';
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const log = createLogger('test-pkg', import.meta.url);
    log.info('should not appear');
    log.error('should appear');

    expect(infoSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  it('redacts sensitive key values', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const log = createLogger('test-pkg', import.meta.url);
    log.info('auth check', { api_token: 'super-secret', user: 'admin' });

    const entry = JSON.parse(spy.mock.calls[0][0]);
    expect(entry.ctx.api_token).toBe('***REDACTED***');
    expect(entry.ctx.user).toBe('admin');
  });

  it('handles file:// URLs in filename', () => {
    const log = createLogger('test', 'file:///path/to/test_logger.mjs');
    expect(log).toBeDefined();
  });

  it('handles plain filenames', () => {
    const log = createLogger('test', '/path/to/test_logger.mjs');
    expect(log).toBeDefined();
  });
});

describe('nullLogger', () => {
  it('has all expected methods', () => {
    expect(nullLogger.trace).toBeInstanceOf(Function);
    expect(nullLogger.debug).toBeInstanceOf(Function);
    expect(nullLogger.info).toBeInstanceOf(Function);
    expect(nullLogger.warn).toBeInstanceOf(Function);
    expect(nullLogger.error).toBeInstanceOf(Function);
  });

  it('does not throw when called with arguments', () => {
    expect(() => nullLogger.info('test')).not.toThrow();
    expect(() => nullLogger.debug('test')).not.toThrow();
    expect(() => nullLogger.warn('test', { key: 'value' })).not.toThrow();
    expect(() => nullLogger.error('test')).not.toThrow();
    expect(() => nullLogger.trace('test')).not.toThrow();
  });

  it('does not produce any output', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    nullLogger.info('silent');
    nullLogger.error('silent');
    nullLogger.debug('silent');

    expect(infoSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    expect(debugSpy).not.toHaveBeenCalled();

    vi.restoreAllMocks();
  });
});
