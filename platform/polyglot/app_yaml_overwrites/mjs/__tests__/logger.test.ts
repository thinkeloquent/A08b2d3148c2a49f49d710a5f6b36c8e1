
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { create, ILogger } from '../src/logger.js';

describe('Logger', () => {
    let consoleSpy: any;

    beforeEach(() => {
        consoleSpy = {
            log: vi.spyOn(console, 'log').mockImplementation(() => { }),
            error: vi.spyOn(console, 'error').mockImplementation(() => { }),
            warn: vi.spyOn(console, 'warn').mockImplementation(() => { }),
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should create logger with correct prefix', () => {
        const log = create('test-pkg', 'test-file.ts');

        log.info('Test message');

        expect(consoleSpy.log).toHaveBeenCalledWith(
            expect.stringContaining('[test-pkg:test-file.ts] INFO: Test message')
        );
    });

    it('should include data in log output', () => {
        const log = create('test-pkg', 'test-file.ts');
        const data = { key: 'value' };

        log.info('Test message', data);

        expect(consoleSpy.log).toHaveBeenCalledWith(
            expect.stringContaining('{"key":"value"}')
        );
    });

    it('should respect log levels', () => {
        process.env.LOG_LEVEL = 'warn';
        const log = create('test-pkg', 'test-file.ts');

        log.info('Should not appear');
        log.error('Should appear');

        expect(consoleSpy.log).not.toHaveBeenCalled();
        expect(consoleSpy.error).toHaveBeenCalledWith(
            expect.stringContaining('ERROR: Should appear')
        );

        delete process.env.LOG_LEVEL;
    });

    it('should use correct console methods', () => {
        const log = create('test-pkg', 'test-file.ts');

        log.info('info');
        log.warn('warn');
        log.error('error');

        expect(consoleSpy.log).toHaveBeenCalledTimes(1);
        expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
        expect(consoleSpy.error).toHaveBeenCalledTimes(1);
    });
});
