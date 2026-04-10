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
import { create } from '../src/logger.ts';

describe('Logger', () => {
    // Store original env
    let originalLogLevel;

    beforeEach(() => {
        originalLogLevel = process.env.LOG_LEVEL;
        vi.spyOn(console, 'log').mockImplementation(() => { });
        vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        if (originalLogLevel !== undefined) {
            process.env.LOG_LEVEL = originalLogLevel;
        } else {
            delete process.env.LOG_LEVEL;
        }
        vi.restoreAllMocks();
    });

    // =========================================================================
    // Statement Coverage
    // =========================================================================

    describe('Statement Coverage', () => {
        it('should create logger with create() factory method', () => {
            const logger = create('test-package', 'test-file.ts');

            expect(logger).toBeDefined();
            expect(typeof logger.debug).toBe('function');
        });

        it('should have debug method', () => {
            const logger = create('test', 'test.ts');

            expect(typeof logger.debug).toBe('function');
        });

        it('should have info method', () => {
            const logger = create('test', 'test.ts');

            expect(typeof logger.info).toBe('function');
        });

        it('should have warn method', () => {
            const logger = create('test', 'test.ts');

            expect(typeof logger.warn).toBe('function');
        });

        it('should have error method', () => {
            const logger = create('test', 'test.ts');

            expect(typeof logger.error).toBe('function');
        });

        it('should call console.log when logging debug', () => {
            process.env.LOG_LEVEL = 'debug';
            const logger = create('test', 'test.ts');

            logger.debug('Test message');

            expect(console.log).toHaveBeenCalled();
        });

        it('should call console.log when logging info', () => {
            process.env.LOG_LEVEL = 'debug';
            const logger = create('test', 'test.ts');

            logger.info('Test message');

            expect(console.log).toHaveBeenCalled();
        });

        it('should call console.log when logging warn', () => {
            process.env.LOG_LEVEL = 'debug';
            const logger = create('test', 'test.ts');

            logger.warn('Test message');

            expect(console.log).toHaveBeenCalled();
        });

        it('should call console.error when logging error', () => {
            process.env.LOG_LEVEL = 'debug';
            const logger = create('test', 'test.ts');

            logger.error('Test message');

            expect(console.error).toHaveBeenCalled();
        });
    });

    // =========================================================================
    // Branch Coverage
    // =========================================================================

    describe('Branch Coverage', () => {
        it('should default to debug level when LOG_LEVEL not set', () => {
            delete process.env.LOG_LEVEL;
            const logger = create('test', 'test.ts');

            logger.debug('Debug message');

            expect(console.log).toHaveBeenCalled();
        });

        it('should respect LOG_LEVEL=info and suppress debug', () => {
            process.env.LOG_LEVEL = 'info';
            const logger = create('test', 'test.ts');

            logger.debug('Debug message');

            expect(console.log).not.toHaveBeenCalled();
        });

        it('should respect LOG_LEVEL=info and allow info', () => {
            process.env.LOG_LEVEL = 'info';
            const logger = create('test', 'test.ts');

            logger.info('Info message');

            expect(console.log).toHaveBeenCalled();
        });

        it('should respect LOG_LEVEL=warn and suppress info', () => {
            process.env.LOG_LEVEL = 'warn';
            const logger = create('test', 'test.ts');

            logger.info('Info message');

            expect(console.log).not.toHaveBeenCalled();
        });

        it('should respect LOG_LEVEL=error and only allow error', () => {
            process.env.LOG_LEVEL = 'error';
            const logger = create('test', 'test.ts');

            logger.warn('Warn message');
            expect(console.log).not.toHaveBeenCalled();

            logger.error('Error message');
            expect(console.error).toHaveBeenCalled();
        });

        it('should handle case-insensitive LOG_LEVEL', () => {
            process.env.LOG_LEVEL = 'INFO';
            const logger = create('test', 'test.ts');

            logger.debug('Debug message');
            expect(console.log).not.toHaveBeenCalled();

            logger.info('Info message');
            expect(console.log).toHaveBeenCalled();
        });
    });

    // =========================================================================
    // Boundary Values
    // =========================================================================

    describe('Boundary Values', () => {
        it('should handle empty package name', () => {
            const logger = create('', 'test.ts');

            expect(() => logger.debug('Test')).not.toThrow();
        });

        it('should handle empty filename', () => {
            const logger = create('test', '');

            expect(() => logger.debug('Test')).not.toThrow();
        });

        it('should handle empty message', () => {
            const logger = create('test', 'test.ts');

            expect(() => logger.debug('')).not.toThrow();
        });

        it('should handle very long message', () => {
            const logger = create('test', 'test.ts');
            const longMessage = 'x'.repeat(10000);

            expect(() => logger.debug(longMessage)).not.toThrow();
        });

        it('should handle undefined data', () => {
            const logger = create('test', 'test.ts');

            expect(() => logger.debug('Message', undefined)).not.toThrow();
        });

        it('should handle null data', () => {
            const logger = create('test', 'test.ts');

            expect(() => logger.debug('Message', null)).not.toThrow();
        });
    });

    // =========================================================================
    // Error Handling
    // =========================================================================

    describe('Error Handling', () => {
        it('should handle invalid LOG_LEVEL gracefully', () => {
            process.env.LOG_LEVEL = 'invalid_level';
            const logger = create('test', 'test.ts');

            // Should default to allowing INFO+ when level is invalid
            logger.info('Info message');

            expect(console.log).toHaveBeenCalled();
        });

        it('should handle complex data objects', () => {
            const logger = create('test', 'test.ts');
            const complexData = {
                nested: { deep: { value: 'test' } },
                array: [1, 2, 3],
                null: null,
                undefined: undefined
            };

            expect(() => logger.debug('Message', complexData)).not.toThrow();
        });
    });

    // =========================================================================
    // Log Verification
    // =========================================================================

    describe('Log Verification', () => {
        it('should output formatted text logs', () => {
            process.env.LOG_LEVEL = 'debug';
            const logger = create('test-pkg', 'test.ts');

            logger.info('Test message', { key: 'value' });

            expect(console.log).toHaveBeenCalled();
            const call = console.log.mock.calls[0][0];

            // output: [test-pkg:test.ts] INFO: Test message {"key":"value"}
            expect(call).toContain('[test-pkg:test.ts]');
            expect(call).toContain('INFO:');
            expect(call).toContain('Test message');
            expect(call).toContain('{"key":"value"}');
        });

        it('should include package:filename in output', () => {
            process.env.LOG_LEVEL = 'debug';
            const logger = create('my-package', 'my-file.ts');

            logger.debug('Context test');

            const call = console.log.mock.calls[0][0];
            expect(call).toContain('[my-package:my-file.ts]');
        });

        it('should include correct level in output', () => {
            process.env.LOG_LEVEL = 'debug';
            const logger = create('test', 'test.ts');

            logger.info('Test');

            const call = console.log.mock.calls[0][0];
            expect(call).toContain('INFO:');
        });

        it('should include data in output', () => {
            process.env.LOG_LEVEL = 'debug';
            const logger = create('test', 'test.ts');

            logger.debug('Test', { myKey: 'myValue' });

            const call = console.log.mock.calls[0][0];
            expect(call).toContain('{"myKey":"myValue"}');
        });
    });
});
