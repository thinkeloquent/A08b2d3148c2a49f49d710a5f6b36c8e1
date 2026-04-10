import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateBackoff, isRetryable, sleep, withRetry } from '../src/sdk/retry.mjs';

describe('Retry', () => {
    describe('calculateBackoff', () => {
        describe('Statement Coverage', () => {
            it('should return a number', () => {
                const result = calculateBackoff(0);
                expect(typeof result).toBe('number');
                expect(result).toBeGreaterThan(0);
            });
        });

        describe('Branch Coverage', () => {
            it('should increase with attempt number', () => {
                const first = calculateBackoff(0, 1000, 30000);
                // attempt 0: 1000 * 2^0 + jitter = ~1000-2000
                expect(first).toBeGreaterThanOrEqual(1000);
                expect(first).toBeLessThanOrEqual(2000);
            });

            it('should not exceed maxWait', () => {
                const result = calculateBackoff(100, 1000, 5000);
                expect(result).toBeLessThanOrEqual(5000);
            });

            it('should produce larger values for higher attempts', () => {
                // With high enough attempts, exponential part should be large
                // but capped by maxWait. Use a large maxWait to see growth.
                const attempt1 = calculateBackoff(1, 100, 100000);
                const attempt5 = calculateBackoff(5, 100, 100000);
                // attempt1: 100*2^1 + jitter = ~200-300
                // attempt5: 100*2^5 + jitter = ~3200-3300
                expect(attempt5).toBeGreaterThan(attempt1);
            });
        });

        describe('Boundary Values', () => {
            it('should handle attempt 0', () => {
                const result = calculateBackoff(0, 1000, 30000);
                expect(result).toBeGreaterThanOrEqual(1000);
            });

            it('should handle initialWait of 0', () => {
                const result = calculateBackoff(0, 0, 30000);
                // 0 * 2^0 + random()*0 = 0
                expect(result).toBe(0);
            });

            it('should handle maxWait of 0', () => {
                const result = calculateBackoff(0, 1000, 0);
                // Math.min(something, 0) = 0
                expect(result).toBe(0);
            });
        });
    });

    describe('isRetryable', () => {
        it('should return true for 500', () => {
            expect(isRetryable(500)).toBe(true);
        });

        it('should return true for 502', () => {
            expect(isRetryable(502)).toBe(true);
        });

        it('should return true for 503', () => {
            expect(isRetryable(503)).toBe(true);
        });

        it('should return true for 504', () => {
            expect(isRetryable(504)).toBe(true);
        });

        it('should return false for 400', () => {
            expect(isRetryable(400)).toBe(false);
        });

        it('should return false for 401', () => {
            expect(isRetryable(401)).toBe(false);
        });

        it('should return false for 429', () => {
            expect(isRetryable(429)).toBe(false);
        });

        it('should return false for 499', () => {
            expect(isRetryable(499)).toBe(false);
        });

        it('should return false for 200', () => {
            expect(isRetryable(200)).toBe(false);
        });

        it('should return true for 599', () => {
            expect(isRetryable(599)).toBe(true);
        });
    });

    describe('sleep', () => {
        it('should resolve after given ms', async () => {
            vi.useFakeTimers();
            const promise = sleep(100);
            vi.advanceTimersByTime(100);
            await promise;
            vi.useRealTimers();
        });

        it('should resolve immediately for 0ms', async () => {
            vi.useFakeTimers();
            const promise = sleep(0);
            vi.advanceTimersByTime(0);
            await promise;
            vi.useRealTimers();
        });
    });

    describe('withRetry', () => {
        describe('Statement Coverage', () => {
            it('should return result on first success', async () => {
                const fn = vi.fn().mockResolvedValue('success');
                const result = await withRetry(fn, { maxRetries: 3, initialWait: 1, maxWait: 10 });
                expect(result).toBe('success');
                expect(fn).toHaveBeenCalledTimes(1);
            });
        });

        describe('Branch Coverage', () => {
            it('should retry on retryable error and eventually succeed', async () => {
                let callCount = 0;
                const fn = vi.fn(async () => {
                    callCount++;
                    if (callCount < 3) {
                        const err = new Error('server error');
                        err.status = 500;
                        throw err;
                    }
                    return 'recovered';
                });

                const result = await withRetry(fn, { maxRetries: 3, initialWait: 1, maxWait: 10 });
                expect(result).toBe('recovered');
                expect(fn).toHaveBeenCalledTimes(3);
            });

            it('should throw immediately for non-retryable error', async () => {
                const fn = vi.fn(async () => {
                    const err = new Error('not found');
                    err.status = 404;
                    throw err;
                });

                await expect(withRetry(fn, { maxRetries: 3, initialWait: 1, maxWait: 10 })).rejects.toThrow('not found');
                expect(fn).toHaveBeenCalledTimes(1);
            });

            it('should throw after max retries exceeded', async () => {
                const fn = vi.fn(async () => {
                    const err = new Error('server down');
                    err.status = 500;
                    throw err;
                });

                await expect(withRetry(fn, { maxRetries: 2, initialWait: 1, maxWait: 10 })).rejects.toThrow('server down');
                expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
            });

            it('should retry 429 errors', async () => {
                let callCount = 0;
                const fn = vi.fn(async () => {
                    callCount++;
                    if (callCount === 1) {
                        const err = new Error('rate limited');
                        err.status = 429;
                        throw err;
                    }
                    return 'done';
                });

                const result = await withRetry(fn, { maxRetries: 3, initialWait: 1, maxWait: 10 });
                expect(result).toBe('done');
            });

            it('should retry errors without status', async () => {
                let callCount = 0;
                const fn = vi.fn(async () => {
                    callCount++;
                    if (callCount < 2) throw new Error('generic error');
                    return 'ok';
                });

                const result = await withRetry(fn, { maxRetries: 3, initialWait: 1, maxWait: 10 });
                expect(result).toBe('ok');
            });

            it('should not retry 401 errors', async () => {
                const fn = vi.fn(async () => {
                    const err = new Error('unauthorized');
                    err.status = 401;
                    throw err;
                });

                await expect(withRetry(fn, { maxRetries: 3, initialWait: 1, maxWait: 10 })).rejects.toThrow('unauthorized');
                expect(fn).toHaveBeenCalledTimes(1);
            });

            it('should not retry 403 errors', async () => {
                const fn = vi.fn(async () => {
                    const err = new Error('forbidden');
                    err.status = 403;
                    throw err;
                });

                await expect(withRetry(fn, { maxRetries: 3, initialWait: 1, maxWait: 10 })).rejects.toThrow('forbidden');
                expect(fn).toHaveBeenCalledTimes(1);
            });

            it('should not retry 422 errors', async () => {
                const fn = vi.fn(async () => {
                    const err = new Error('validation failed');
                    err.status = 422;
                    throw err;
                });

                await expect(withRetry(fn, { maxRetries: 3, initialWait: 1, maxWait: 10 })).rejects.toThrow('validation failed');
                expect(fn).toHaveBeenCalledTimes(1);
            });

            it('should pass attempt number to fn', async () => {
                const attempts = [];
                const fn = vi.fn(async (attempt) => {
                    attempts.push(attempt);
                    if (attempt < 2) {
                        const err = new Error('fail');
                        err.status = 500;
                        throw err;
                    }
                    return 'ok';
                });

                await withRetry(fn, { maxRetries: 3, initialWait: 1, maxWait: 10 });
                expect(attempts).toEqual([0, 1, 2]);
            });
        });

        describe('Error Handling', () => {
            it('should throw the last error after all retries exhausted', async () => {
                let callCount = 0;
                const fn = vi.fn(async () => {
                    callCount++;
                    const err = new Error(`fail #${callCount}`);
                    err.status = 500;
                    throw err;
                });

                await expect(withRetry(fn, { maxRetries: 1, initialWait: 1, maxWait: 10 })).rejects.toThrow('fail #2');
            });

            it('should work with maxRetries of 0 (single attempt)', async () => {
                const fn = vi.fn(async () => {
                    const err = new Error('immediate fail');
                    err.status = 500;
                    throw err;
                });

                await expect(withRetry(fn, { maxRetries: 0, initialWait: 1, maxWait: 10 })).rejects.toThrow('immediate fail');
                expect(fn).toHaveBeenCalledTimes(1);
            });
        });
    });
});
