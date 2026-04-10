/**
 * Unit tests for healthz-diagnostics logger module.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { create, Logger, DEBUG, INFO, WARN, ERROR } from '../src/logger.mjs';
import { createLoggerSpy, expectLogContains } from './helpers/test-utils.mjs';


describe('Logger', () => {

    describe('StatementCoverage', () => {

        it('create() returns Logger instance', () => {
            const spy = createLoggerSpy();
            const logger = create('healthz-diagnostics', 'test.mjs', { output: spy.output });

            expect(logger).toBeDefined();
            expect(logger).toBeInstanceOf(Logger);
        });

        it('info() logs at INFO level', () => {
            const spy = createLoggerSpy();
            const logger = create('healthz-diagnostics', 'test.mjs', {
                level: INFO,
                output: spy.output
            });

            logger.info('Test message');

            expect(spy.messages.length).toBe(1);
            expect(spy.messages[0]).toContain('[INFO]');
        });

        it('debug() logs at DEBUG level', () => {
            const spy = createLoggerSpy();
            const logger = create('healthz-diagnostics', 'test.mjs', {
                level: DEBUG,
                output: spy.output
            });

            logger.debug('Debug message');

            expect(spy.messages.length).toBe(1);
            expect(spy.messages[0]).toContain('[DEBUG]');
        });

        it('warn() logs at WARN level', () => {
            const spy = createLoggerSpy();
            const logger = create('healthz-diagnostics', 'test.mjs', {
                level: WARN,
                output: spy.output
            });

            logger.warn('Warning message');

            expect(spy.messages.length).toBe(1);
            expect(spy.messages[0]).toContain('[WARN]');
        });

        it('error() logs at ERROR level', () => {
            const spy = createLoggerSpy();
            const logger = create('healthz-diagnostics', 'test.mjs', {
                level: ERROR,
                output: spy.output
            });

            logger.error('Error message');

            expect(spy.messages.length).toBe(1);
            expect(spy.messages[0]).toContain('[ERROR]');
        });
    });

    describe('BranchCoverage', () => {

        it('debug below threshold not logged', () => {
            const spy = createLoggerSpy();
            const logger = create('healthz-diagnostics', 'test.mjs', {
                level: INFO,
                output: spy.output
            });

            logger.debug('Should not appear');

            expect(spy.messages.length).toBe(0);
        });

        it('info at threshold is logged', () => {
            const spy = createLoggerSpy();
            const logger = create('healthz-diagnostics', 'test.mjs', {
                level: INFO,
                output: spy.output
            });

            logger.info('Should appear');

            expect(spy.messages.length).toBe(1);
        });

        it('error above threshold is logged', () => {
            const spy = createLoggerSpy();
            const logger = create('healthz-diagnostics', 'test.mjs', {
                level: INFO,
                output: spy.output
            });

            logger.error('Should appear');

            expect(spy.messages.length).toBe(1);
        });
    });

    describe('LogFormatVerification', () => {

        it('format matches [LEVEL] [pkg:file] message', () => {
            const spy = createLoggerSpy();
            const logger = create('healthz-diagnostics', 'test.mjs', {
                level: INFO,
                output: spy.output
            });

            logger.info('Operation completed');

            expect(spy.messages[0]).toBe('[INFO] [healthz-diagnostics:test] Operation completed');
        });

        it('filename extraction from file:// URL', () => {
            const spy = createLoggerSpy();
            const logger = create('healthz-diagnostics', 'file:///path/to/module.mjs', {
                level: INFO,
                output: spy.output
            });

            logger.info('Test');

            expect(spy.messages[0]).toContain('[healthz-diagnostics:module]');
        });

        it('filename extraction from path', () => {
            const spy = createLoggerSpy();
            const logger = create('healthz-diagnostics', '/path/to/module.mjs', {
                level: INFO,
                output: spy.output
            });

            logger.info('Test');

            expect(spy.messages[0]).toContain('[healthz-diagnostics:module]');
        });

        it('.js extension stripped', () => {
            const spy = createLoggerSpy();
            const logger = create('healthz-diagnostics', 'module.js', {
                level: INFO,
                output: spy.output
            });

            logger.info('Test');

            expect(spy.messages[0]).toContain('[healthz-diagnostics:module]');
        });
    });

    describe('BoundaryValues', () => {

        it('empty message logged', () => {
            const spy = createLoggerSpy();
            const logger = create('healthz-diagnostics', 'test.mjs', {
                level: INFO,
                output: spy.output
            });

            logger.info('');

            expect(spy.messages[0]).toBe('[INFO] [healthz-diagnostics:test] ');
        });

        it('message with special characters', () => {
            const spy = createLoggerSpy();
            const logger = create('healthz-diagnostics', 'test.mjs', {
                level: INFO,
                output: spy.output
            });

            logger.info('Test: key="value" {json: true}');

            expect(spy.messages[0]).toContain('key="value"');
        });

        it('very long message logged', () => {
            const spy = createLoggerSpy();
            const logger = create('healthz-diagnostics', 'test.mjs', {
                level: INFO,
                output: spy.output
            });
            const longMessage = 'x'.repeat(10000);

            logger.info(longMessage);

            expect(spy.messages[0]).toContain(longMessage);
        });
    });

    describe('LogLevelConstants', () => {

        it('DEBUG has correct value', () => {
            expect(DEBUG).toBe(10);
        });

        it('INFO has correct value', () => {
            expect(INFO).toBe(20);
        });

        it('WARN has correct value', () => {
            expect(WARN).toBe(30);
        });

        it('ERROR has correct value', () => {
            expect(ERROR).toBe(40);
        });
    });
});
