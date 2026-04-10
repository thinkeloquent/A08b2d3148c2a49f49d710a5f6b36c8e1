import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLogger, nullLogger } from '../src/logger.mjs';

describe('createLogger', () => {
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
    vi.restoreAllMocks();
  });

  it('produces structured JSON with ts, pkg, file, level, msg', () => {
    process.env.LOG_LEVEL = 'trace';
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const log = createLogger('fmt-sdk', 'schemas.mjs');
    log.info('test message');

    expect(spy).toHaveBeenCalledOnce();
    const entry = JSON.parse(spy.mock.calls[0][0]);
    expect(entry).toHaveProperty('ts');
    expect(entry.pkg).toBe('fmt-sdk');
    expect(entry.file).toBe('schemas.mjs');
    expect(entry.level).toBe('info');
    expect(entry.msg).toBe('test message');
  });

  it('includes context in the log entry', () => {
    process.env.LOG_LEVEL = 'trace';
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const log = createLogger('fmt-sdk', 'config.mjs');
    log.info('loading config', { path: '/some/path.toml' });

    const entry = JSON.parse(spy.mock.calls[0][0]);
    expect(entry.ctx).toEqual({ path: '/some/path.toml' });
  });

  it('redacts sensitive keys', () => {
    process.env.LOG_LEVEL = 'trace';
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const log = createLogger('fmt-sdk', 'test.mjs');
    log.info('auth attempt', {
      token: 'secret-token-123',
      password: 'my-password',
      api_key: 'key-456',
      username: 'user1',
    });

    const entry = JSON.parse(spy.mock.calls[0][0]);
    expect(entry.ctx.token).toBe('***REDACTED***');
    expect(entry.ctx.password).toBe('***REDACTED***');
    expect(entry.ctx.api_key).toBe('***REDACTED***');
    expect(entry.ctx.username).toBe('user1');
  });

  it('extracts filename from import.meta.url format', () => {
    process.env.LOG_LEVEL = 'trace';
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const log = createLogger('fmt-sdk', 'file:///Users/test/project/src/schemas.mjs');
    log.info('test');

    const entry = JSON.parse(spy.mock.calls[0][0]);
    expect(entry.file).toBe('schemas.mjs');
  });

  it('respects LOG_LEVEL threshold', () => {
    process.env.LOG_LEVEL = 'warn';
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const log = createLogger('fmt-sdk', 'test.mjs');

    log.info('should be suppressed');
    log.warn('should appear');

    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledOnce();
  });

  it('all log levels work', () => {
    process.env.LOG_LEVEL = 'trace';
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const log = createLogger('fmt-sdk', 'test.mjs');
    log.trace('t');
    log.debug('d');
    log.info('i');
    log.warn('w');
    log.error('e');

    // trace and debug both use console.debug
    expect(debugSpy).toHaveBeenCalledTimes(2);
    expect(infoSpy).toHaveBeenCalledOnce();
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(errorSpy).toHaveBeenCalledOnce();
  });
});

describe('nullLogger', () => {
  it('has all standard log methods', () => {
    expect(typeof nullLogger.trace).toBe('function');
    expect(typeof nullLogger.debug).toBe('function');
    expect(typeof nullLogger.info).toBe('function');
    expect(typeof nullLogger.warn).toBe('function');
    expect(typeof nullLogger.error).toBe('function');
  });

  it('methods do not throw', () => {
    expect(() => nullLogger.trace('msg')).not.toThrow();
    expect(() => nullLogger.debug('msg')).not.toThrow();
    expect(() => nullLogger.info('msg')).not.toThrow();
    expect(() => nullLogger.warn('msg')).not.toThrow();
    expect(() => nullLogger.error('msg')).not.toThrow();
  });

  it('methods accept context argument without error', () => {
    expect(() => nullLogger.info('msg', { key: 'value' })).not.toThrow();
  });
});
