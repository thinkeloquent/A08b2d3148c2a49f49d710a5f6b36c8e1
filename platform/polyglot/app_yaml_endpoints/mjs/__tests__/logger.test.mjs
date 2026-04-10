/**
 * Unit tests for the Logger module.
 *
 * Coverage:
 * - Logger creation with package/file context
 * - Log level filtering
 * - JSON output mode
 * - Custom handlers
 * - LoggerFactory defaults
 */

import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { Logger, LoggerFactory } from '../src/logger.mjs';

describe('Logger', () => {
    describe('creation', () => {
        it('should create logger with package and file context', () => {
            const logger = new Logger('test-pkg', '/path/to/file.mjs');
            assert.equal(logger._pkg, 'test-pkg');
            assert.equal(logger._file, 'file.mjs');
        });

        it('should extract filename from full path', () => {
            const logger = new Logger('pkg', '/very/long/path/to/module.mjs');
            assert.equal(logger._file, 'module.mjs');
        });

        it('should handle file:// URLs (import.meta.url)', () => {
            const logger = new Logger('pkg', 'file:///path/to/module.mjs');
            assert.equal(logger._file, 'module.mjs');
        });
    });

    describe('log level filtering', () => {
        it('should filter messages below configured level', () => {
            const captured = [];
            const handler = (level, msg) => captured.push(msg);

            const logger = new Logger('pkg', 'file.mjs', handler, 'warn');
            logger.debug('should not appear');
            logger.info('should not appear');
            logger.warn('should appear');
            logger.error('should appear');

            assert.equal(captured.length, 2);
            assert.deepEqual(captured, ['should appear', 'should appear']);
        });

        it('should log all levels when set to trace', () => {
            const captured = [];
            const handler = (level) => captured.push(level);

            const logger = new Logger('pkg', 'file.mjs', handler, 'trace');
            logger.trace('t');
            logger.debug('d');
            logger.info('i');
            logger.warn('w');
            logger.error('e');

            assert.deepEqual(captured, ['trace', 'debug', 'info', 'warn', 'error']);
        });
    });

    describe('data handling', () => {
        it('should pass data dictionary to handler', () => {
            const captured = [];
            const handler = (level, msg, data) => captured.push(data);

            const logger = new Logger('pkg', 'file.mjs', handler, 'debug');
            logger.debug('message', { key: 'value', count: 42 });

            assert.equal(captured.length, 1);
            assert.deepEqual(captured[0], { key: 'value', count: 42 });
        });

        it('should handle null data', () => {
            const captured = [];
            const handler = (level, msg, data) => captured.push(data);

            const logger = new Logger('pkg', 'file.mjs', handler, 'info');
            logger.info('message');

            assert.equal(captured[0], null);
        });
    });

    describe('context', () => {
        it('should include pkg and file in context', () => {
            const captured = [];
            const handler = (level, msg, data, ctx) => captured.push(ctx);

            const logger = new Logger('my-package', '/src/my-file.mjs', handler);
            logger.info('test');

            assert.equal(captured[0].pkg, 'my-package');
            assert.equal(captured[0].file, 'my-file.mjs');
        });
    });

    describe('boundary values', () => {
        const testCases = [
            { level: 'trace', expectedCount: 5 },
            { level: 'debug', expectedCount: 4 },
            { level: 'info', expectedCount: 3 },
            { level: 'warn', expectedCount: 2 },
            { level: 'error', expectedCount: 1 },
        ];

        testCases.forEach(({ level, expectedCount }) => {
            it(`should filter correctly at ${level} level`, () => {
                const captured = [];
                const handler = (lvl) => captured.push(lvl);

                const logger = new Logger('pkg', 'file.mjs', handler, level);
                logger.trace('t');
                logger.debug('d');
                logger.info('i');
                logger.warn('w');
                logger.error('e');

                assert.equal(captured.length, expectedCount);
            });
        });
    });
});

describe('LoggerFactory', () => {
    it('should create a Logger instance', () => {
        const logger = LoggerFactory.create('pkg', 'file.mjs');
        assert.ok(logger instanceof Logger);
    });

    it('should allow level override', () => {
        const logger = LoggerFactory.create('pkg', 'file.mjs', null, 'error');
        assert.equal(logger._level, 40); // error level
    });

    it('should pass custom handler to Logger', () => {
        const calls = [];
        const myHandler = (level, msg) => calls.push(msg);

        const logger = LoggerFactory.create('pkg', 'file.mjs', myHandler);
        logger.info('test');

        assert.deepEqual(calls, ['test']);
    });

    it('should use JSON output when specified', () => {
        const logger = LoggerFactory.create('pkg', 'file.mjs', null, 'info', true);
        assert.equal(logger._json, true);
    });
});
