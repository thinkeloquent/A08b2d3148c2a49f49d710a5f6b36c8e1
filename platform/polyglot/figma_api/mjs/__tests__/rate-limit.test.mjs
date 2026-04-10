import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseRateLimitHeaders, waitForRetryAfter, shouldAutoWait, handleRateLimit } from '../src/sdk/rate-limit.mjs';

describe('RateLimit', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('parseRateLimitHeaders', () => {
        describe('Statement Coverage', () => {
            it('should parse all headers', () => {
                const info = parseRateLimitHeaders({
                    'retry-after': '30',
                    'x-figma-plan-tier': 'professional',
                    'x-figma-rate-limit-type': 'files',
                    'x-figma-upgrade-link': 'https://figma.com/upgrade',
                });
                expect(info.retryAfter).toBe(30);
                expect(info.planTier).toBe('professional');
                expect(info.rateLimitType).toBe('files');
                expect(info.upgradeLink).toBe('https://figma.com/upgrade');
                expect(info.timestamp).toBeInstanceOf(Date);
            });
        });

        describe('Branch Coverage', () => {
            it('should default retryAfter to 60 when header missing', () => {
                const info = parseRateLimitHeaders({});
                expect(info.retryAfter).toBe(60);
            });

            it('should set optional headers to null when missing', () => {
                const info = parseRateLimitHeaders({ 'retry-after': '10' });
                expect(info.planTier).toBeNull();
                expect(info.rateLimitType).toBeNull();
                expect(info.upgradeLink).toBeNull();
            });

            it('should handle non-numeric retry-after defaulting to 60', () => {
                const info = parseRateLimitHeaders({ 'retry-after': 'invalid' });
                expect(info.retryAfter).toBe(60);
            });

            it('should parse float retry-after values', () => {
                const info = parseRateLimitHeaders({ 'retry-after': '10.5' });
                expect(info.retryAfter).toBe(10.5);
            });
        });

        describe('Boundary Values', () => {
            it('should handle retry-after of 0', () => {
                const info = parseRateLimitHeaders({ 'retry-after': '0' });
                // parseFloat('0') is 0, which is falsy, so it defaults to 60
                expect(info.retryAfter).toBe(60);
            });

            it('should handle very large retry-after', () => {
                const info = parseRateLimitHeaders({ 'retry-after': '9999' });
                expect(info.retryAfter).toBe(9999);
            });
        });
    });

    describe('waitForRetryAfter', () => {
        it('should wait for specified seconds', async () => {
            const promise = waitForRetryAfter(5);
            vi.advanceTimersByTime(5000);
            await promise;
        });

        it('should wait for fractional seconds', async () => {
            const promise = waitForRetryAfter(1.5);
            vi.advanceTimersByTime(1500);
            await promise;
        });
    });

    describe('shouldAutoWait', () => {
        describe('Statement Coverage', () => {
            it('should return true by default', () => {
                expect(shouldAutoWait({}, {})).toBe(true);
            });
        });

        describe('Branch Coverage', () => {
            it('should return false when rateLimitAutoWait is false', () => {
                expect(shouldAutoWait({}, { rateLimitAutoWait: false })).toBe(false);
            });

            it('should return true when rateLimitAutoWait is true', () => {
                expect(shouldAutoWait({}, { rateLimitAutoWait: true })).toBe(true);
            });

            it('should call onRateLimit callback and respect false return', () => {
                const onRateLimit = vi.fn().mockReturnValue(false);
                expect(shouldAutoWait({}, { onRateLimit })).toBe(false);
                expect(onRateLimit).toHaveBeenCalledTimes(1);
            });

            it('should call onRateLimit callback and continue when not false', () => {
                const onRateLimit = vi.fn().mockReturnValue(undefined);
                expect(shouldAutoWait({}, { rateLimitAutoWait: true, onRateLimit })).toBe(true);
            });

            it('should pass rateLimitInfo to onRateLimit callback', () => {
                const info = { retryAfter: 30 };
                const onRateLimit = vi.fn().mockReturnValue(undefined);
                shouldAutoWait(info, { onRateLimit });
                expect(onRateLimit).toHaveBeenCalledWith(info);
            });

            it('should return true with default options', () => {
                expect(shouldAutoWait({})).toBe(true);
            });

            it('should return false when onRateLimit returns false even with autoWait true', () => {
                const onRateLimit = vi.fn().mockReturnValue(false);
                expect(shouldAutoWait({}, { rateLimitAutoWait: true, onRateLimit })).toBe(false);
            });
        });
    });

    describe('handleRateLimit', () => {
        describe('Statement Coverage', () => {
            it('should return retry=true and wait when auto-wait enabled', async () => {
                const promise = handleRateLimit({ 'retry-after': '1' }, { rateLimitAutoWait: true });
                vi.advanceTimersByTime(1000);
                const result = await promise;
                expect(result.retry).toBe(true);
                expect(result.rateLimitInfo).toBeDefined();
                expect(result.rateLimitInfo.retryAfter).toBe(1);
            });
        });

        describe('Branch Coverage', () => {
            it('should return retry=false when auto-wait disabled', async () => {
                const result = await handleRateLimit({ 'retry-after': '10' }, { rateLimitAutoWait: false });
                expect(result.retry).toBe(false);
                expect(result.rateLimitInfo.retryAfter).toBe(10);
            });

            it('should return retry=false when onRateLimit returns false', async () => {
                const onRateLimit = vi.fn().mockReturnValue(false);
                const result = await handleRateLimit({ 'retry-after': '5' }, { onRateLimit });
                expect(result.retry).toBe(false);
            });

            it('should parse and include all rate limit info', async () => {
                const headers = {
                    'retry-after': '15',
                    'x-figma-plan-tier': 'starter',
                    'x-figma-rate-limit-type': 'variables',
                    'x-figma-upgrade-link': 'https://figma.com/upgrade',
                };
                const result = await handleRateLimit(headers, { rateLimitAutoWait: false });
                expect(result.rateLimitInfo.retryAfter).toBe(15);
                expect(result.rateLimitInfo.planTier).toBe('starter');
                expect(result.rateLimitInfo.rateLimitType).toBe('variables');
                expect(result.rateLimitInfo.upgradeLink).toBe('https://figma.com/upgrade');
            });
        });

        describe('Integration', () => {
            it('should combine parsing, waiting, and auto-wait decision', async () => {
                const onRateLimit = vi.fn().mockReturnValue(true);
                const promise = handleRateLimit(
                    { 'retry-after': '2', 'x-figma-plan-tier': 'pro' },
                    { rateLimitAutoWait: true, onRateLimit }
                );
                vi.advanceTimersByTime(2000);
                const result = await promise;
                expect(result.retry).toBe(true);
                expect(onRateLimit).toHaveBeenCalledTimes(1);
                expect(result.rateLimitInfo.planTier).toBe('pro');
            });
        });
    });
});
