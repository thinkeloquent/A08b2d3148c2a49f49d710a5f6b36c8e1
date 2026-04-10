import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { create, SDKLogger, LEVELS } from '../src/logger.mjs';
import { createLoggerSpy, expectLogContains } from './helpers/logger-spy.mjs';

describe('Logger', () => {
    const originalEnv = { ...process.env };

    afterEach(() => {
        process.env = { ...originalEnv };
        vi.restoreAllMocks();
    });

    describe('Statement Coverage', () => {
        it('should export create function', () => {
            expect(typeof create).toBe('function');
        });

        it('should export SDKLogger class', () => {
            expect(typeof SDKLogger).toBe('function');
        });

        it('should export LEVELS object', () => {
            expect(LEVELS).toBeDefined();
            expect(typeof LEVELS).toBe('object');
        });

        it('create() should return SDKLogger instance', () => {
            const logger = create('test-pkg', 'test-file.mjs');
            expect(logger).toBeInstanceOf(SDKLogger);
        });

        it('LEVELS should have correct values', () => {
            expect(LEVELS.TRACE).toBe(0);
            expect(LEVELS.DEBUG).toBe(1);
            expect(LEVELS.INFO).toBe(2);
            expect(LEVELS.WARN).toBe(3);
            expect(LEVELS.ERROR).toBe(4);
            expect(LEVELS.SILENT).toBe(100);
        });

        it('all log methods should execute without error', () => {
            process.env.LOG_LEVEL = 'TRACE';
            const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
            const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const logger = create('test', 'file.mjs');
            expect(() => logger.trace('trace msg')).not.toThrow();
            expect(() => logger.debug('debug msg')).not.toThrow();
            expect(() => logger.info('info msg')).not.toThrow();
            expect(() => logger.warn('warn msg')).not.toThrow();
            expect(() => logger.error('error msg')).not.toThrow();
        });
    });

    describe('Branch Coverage', () => {
        it('should delegate to customLogger when provided', () => {
            process.env.LOG_LEVEL = 'TRACE';
            const { logs, mockLogger } = createLoggerSpy();
            const logger = create('pkg', 'file.mjs', mockLogger);

            logger.trace('trace test');
            logger.debug('debug test');
            logger.info('info test');
            logger.warn('warn test');
            logger.error('error test');

            expect(logs.trace.length).toBe(1);
            expect(logs.debug.length).toBe(1);
            expect(logs.info.length).toBe(1);
            expect(logs.warn.length).toBe(1);
            expect(logs.error.length).toBe(1);
        });

        it('should use console when no customLogger provided', () => {
            process.env.LOG_LEVEL = 'INFO';
            const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
            const logger = create('pkg', 'file.mjs');
            logger.info('console test');
            expect(infoSpy).toHaveBeenCalledTimes(1);
        });

        it('should include context in formatted output', () => {
            process.env.LOG_LEVEL = 'INFO';
            const { logs, mockLogger } = createLoggerSpy();
            const logger = create('pkg', 'file.mjs', mockLogger);
            logger.info('with context', { key: 'value' });
            expect(logs.info[0].msg).toContain('key=');
            expect(logs.info[0].msg).toContain('"value"');
        });

        it('should format without context when none provided', () => {
            process.env.LOG_LEVEL = 'INFO';
            const { logs, mockLogger } = createLoggerSpy();
            const logger = create('pkg', 'file.mjs', mockLogger);
            logger.info('no context');
            expect(logs.info[0].msg).toContain('no context');
        });

        it('should handle file:// URL filename', () => {
            const logger = create('pkg', 'file:///some/path/to/module.mjs');
            expect(logger.filename).toBe('module');
            expect(logger.prefix).toBe('[pkg:module]');
        });

        it('should handle plain string filename', () => {
            const logger = create('pkg', '/path/to/myfile.mjs');
            expect(logger.filename).toBe('myfile');
        });

        it('should handle null filename', () => {
            const logger = create('pkg', null);
            expect(logger.filename).toBe('unknown');
        });

        it('should handle undefined filename', () => {
            const logger = create('pkg', undefined);
            expect(logger.filename).toBe('unknown');
        });

        it('should handle empty string filename', () => {
            const logger = create('pkg', '');
            expect(logger.filename).toBe('unknown');
        });

        it('should read LOG_LEVEL env var TRACE', () => {
            process.env.LOG_LEVEL = 'TRACE';
            const { logs, mockLogger } = createLoggerSpy();
            const logger = create('pkg', 'f.mjs', mockLogger);
            logger.trace('visible');
            expect(logs.trace.length).toBe(1);
        });

        it('should read LOG_LEVEL env var DEBUG', () => {
            process.env.LOG_LEVEL = 'DEBUG';
            const { logs, mockLogger } = createLoggerSpy();
            const logger = create('pkg', 'f.mjs', mockLogger);
            logger.trace('hidden');
            logger.debug('visible');
            expect(logs.trace.length).toBe(0);
            expect(logs.debug.length).toBe(1);
        });

        it('should read LOG_LEVEL env var WARN', () => {
            process.env.LOG_LEVEL = 'WARN';
            const { logs, mockLogger } = createLoggerSpy();
            const logger = create('pkg', 'f.mjs', mockLogger);
            logger.info('hidden');
            logger.warn('visible');
            expect(logs.info.length).toBe(0);
            expect(logs.warn.length).toBe(1);
        });

        it('should read LOG_LEVEL env var ERROR', () => {
            process.env.LOG_LEVEL = 'ERROR';
            const { logs, mockLogger } = createLoggerSpy();
            const logger = create('pkg', 'f.mjs', mockLogger);
            logger.warn('hidden');
            logger.error('visible');
            expect(logs.warn.length).toBe(0);
            expect(logs.error.length).toBe(1);
        });

        it('should read LOG_LEVEL env var SILENT (logs nothing)', () => {
            process.env.LOG_LEVEL = 'SILENT';
            const { logs, mockLogger } = createLoggerSpy();
            const logger = create('pkg', 'f.mjs', mockLogger);
            logger.error('hidden');
            expect(logs.error.length).toBe(0);
        });

        it('should default to INFO when LOG_LEVEL env var is missing', () => {
            delete process.env.LOG_LEVEL;
            const { logs, mockLogger } = createLoggerSpy();
            const logger = create('pkg', 'f.mjs', mockLogger);
            logger.debug('hidden');
            logger.info('visible');
            expect(logs.debug.length).toBe(0);
            expect(logs.info.length).toBe(1);
        });

        it('should default to INFO when LOG_LEVEL env var is invalid', () => {
            process.env.LOG_LEVEL = 'BANANA';
            const { logs, mockLogger } = createLoggerSpy();
            const logger = create('pkg', 'f.mjs', mockLogger);
            logger.debug('hidden');
            logger.info('visible');
            expect(logs.debug.length).toBe(0);
            expect(logs.info.length).toBe(1);
        });

        it('should not log when level < getLogLevel()', () => {
            process.env.LOG_LEVEL = 'ERROR';
            const { logs, mockLogger } = createLoggerSpy();
            const logger = create('pkg', 'f.mjs', mockLogger);
            logger.info('should not appear');
            expect(logs.info.length).toBe(0);
        });

        it('should log when level >= getLogLevel()', () => {
            process.env.LOG_LEVEL = 'INFO';
            const { logs, mockLogger } = createLoggerSpy();
            const logger = create('pkg', 'f.mjs', mockLogger);
            logger.error('should appear');
            expect(logs.error.length).toBe(1);
        });
    });

    describe('Boundary Values', () => {
        it('should handle empty context {}', () => {
            process.env.LOG_LEVEL = 'INFO';
            const { logs, mockLogger } = createLoggerSpy();
            const logger = create('pkg', 'f.mjs', mockLogger);
            logger.info('empty ctx', {});
            // Empty context should produce no trailing context text
            expect(logs.info[0].msg).toContain('empty ctx');
            // Should not contain key= pairs
            expect(logs.info[0].msg).not.toMatch(/\w+=/);
        });

        it('should handle null context', () => {
            process.env.LOG_LEVEL = 'INFO';
            const { logs, mockLogger } = createLoggerSpy();
            const logger = create('pkg', 'f.mjs', mockLogger);
            logger.info('null ctx', null);
            expect(logs.info[0].msg).toContain('null ctx');
        });

        it('should handle undefined context', () => {
            process.env.LOG_LEVEL = 'INFO';
            const { logs, mockLogger } = createLoggerSpy();
            const logger = create('pkg', 'f.mjs', mockLogger);
            logger.info('undef ctx', undefined);
            expect(logs.info[0].msg).toContain('undef ctx');
        });
    });

    describe('Error Handling', () => {
        it('should fallback filename to unknown for invalid URL', () => {
            // Passing something that is not a valid file:// URL and not a plain path
            // fileURLToPath would throw if given a non-file URL string starting with file://
            // but the catch block should handle it
            const logger = create('pkg', 'file://invalid\0path');
            expect(logger.filename).toBe('unknown');
        });
    });

    describe('Log Verification', () => {
        it('customLogger should receive formatted messages with prefix', () => {
            process.env.LOG_LEVEL = 'INFO';
            const { logs, mockLogger } = createLoggerSpy();
            const logger = create('my-sdk', 'component.mjs', mockLogger);
            logger.info('hello world');
            expect(logs.info[0].msg).toContain('[my-sdk:component]');
            expect(logs.info[0].msg).toContain('hello world');
        });

        it('should include timestamp in formatted message', () => {
            process.env.LOG_LEVEL = 'INFO';
            const { logs, mockLogger } = createLoggerSpy();
            const logger = create('pkg', 'f.mjs', mockLogger);
            logger.info('ts check');
            // Timestamp format: YYYY-MM-DD HH:MM:SS
            expect(logs.info[0].msg).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
        });

        it('should redact sensitive keys in context', () => {
            process.env.LOG_LEVEL = 'INFO';
            const { logs, mockLogger } = createLoggerSpy();
            const logger = create('pkg', 'f.mjs', mockLogger);
            logger.info('secret data', { token: 'my-secret-token-value', name: 'safe' });
            expect(logs.info[0].msg).toContain('my-secre***');
            expect(logs.info[0].msg).toContain('"safe"');
            expect(logs.info[0].msg).not.toContain('my-secret-token-value');
        });

        it('should redact short values (<=8 chars) to ***', () => {
            process.env.LOG_LEVEL = 'INFO';
            const { logs, mockLogger } = createLoggerSpy();
            const logger = create('pkg', 'f.mjs', mockLogger);
            logger.info('short secret', { password: 'abc' });
            expect(logs.info[0].msg).toContain('"***"');
            expect(logs.info[0].msg).not.toContain('abc');
        });

        it('should redact long values (>8 chars) to first8 + ***', () => {
            process.env.LOG_LEVEL = 'INFO';
            const { logs, mockLogger } = createLoggerSpy();
            const logger = create('pkg', 'f.mjs', mockLogger);
            logger.info('long secret', { secret: 'abcdefghijklmnop' });
            expect(logs.info[0].msg).toContain('abcdefgh***');
            expect(logs.info[0].msg).not.toContain('abcdefghijklmnop');
        });

        it('should redact multiple sensitive keys', () => {
            process.env.LOG_LEVEL = 'INFO';
            const { logs, mockLogger } = createLoggerSpy();
            const logger = create('pkg', 'f.mjs', mockLogger);
            logger.info('multi', {
                auth: 'short',
                credential: 'longervalue123',
                apikey: 'a'.repeat(20),
                api_key: 'tiny',
                accesstoken: 'x'.repeat(10),
                access_token: 'y'.repeat(5),
                authorization: 'Bearer longtoken12345',
            });
            const msg = logs.info[0].msg;
            // short values redacted to ***
            expect(msg).toContain('auth="***"');
            expect(msg).toContain('api_key="***"');
            expect(msg).toContain('access_token="***"');
            // long values get first 8 + ***
            expect(msg).toContain('longerva***');
            expect(msg).toContain('aaaaaaaa***');
            expect(msg).toContain('xxxxxxxx***');
            expect(msg).toContain('Bearer l***');
        });

        it('should not redact non-sensitive keys', () => {
            process.env.LOG_LEVEL = 'INFO';
            const { logs, mockLogger } = createLoggerSpy();
            const logger = create('pkg', 'f.mjs', mockLogger);
            logger.info('safe data', { url: 'https://api.figma.com', method: 'GET' });
            expect(logs.info[0].msg).toContain('"https://api.figma.com"');
            expect(logs.info[0].msg).toContain('"GET"');
        });
    });
});
