import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as logger from '../src/logger.js';

describe('logger', () => {
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
    debug: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('create', () => {
    it('should create a logger with correct prefix', () => {
      const log = logger.create('static-app-loader', 'plugin.ts');

      log.info('Test message');

      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[static-app-loader:plugin.ts] INFO: Test message'
      );
    });

    it('should output correct format for all log levels', () => {
      const log = logger.create('test-pkg', 'test.ts');

      log.info('Info message');
      log.warn('Warn message');
      log.error('Error message');
      log.debug('Debug message');
      log.trace('Trace message');

      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[test-pkg:test.ts] INFO: Info message'
      );
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        '[test-pkg:test.ts] WARN: Warn message'
      );
      expect(consoleSpy.error).toHaveBeenCalledWith(
        '[test-pkg:test.ts] ERROR: Error message'
      );
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        '[test-pkg:test.ts] DEBUG: Debug message'
      );
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        '[test-pkg:test.ts] TRACE: Trace message'
      );
    });

    it('should include context when provided', () => {
      const log = logger.create('static-app-loader', 'plugin.ts');

      log.info('Registering app', { appName: 'dashboard', path: '/var/www' });

      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[static-app-loader:plugin.ts] INFO: Registering app {"appName":"dashboard","path":"/var/www"}'
      );
    });
  });

  describe('createSilent', () => {
    it('should create a no-op logger', () => {
      const log = logger.createSilent();

      log.info('This should not appear');
      log.warn('This should not appear');
      log.error('This should not appear');
      log.debug('This should not appear');
      log.trace('This should not appear');

      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).not.toHaveBeenCalled();
      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });
  });
});
