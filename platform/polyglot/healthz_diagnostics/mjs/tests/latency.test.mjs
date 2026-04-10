/**
 * Unit tests for healthz-diagnostics latency module.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LatencyCalculator } from '../src/latency.mjs';
import { createMockTime } from './helpers/test-utils.mjs';


describe('LatencyCalculator', () => {
    let mockTime;

    beforeEach(() => {
        mockTime = createMockTime(0);
    });

    afterEach(() => {
        mockTime.restore();
    });

    describe('StatementCoverage', () => {

        it('start() captures timestamp', () => {
            const calc = new LatencyCalculator();

            calc.start();

            // Should not throw
            expect(() => calc.getMs()).not.toThrow();
        });

        it('stop() captures timestamp', () => {
            const calc = new LatencyCalculator();
            calc.start();
            mockTime.advance(100);

            calc.stop();

            expect(calc.getMs()).toBe(100);
        });

        it('getMs() returns milliseconds with 2 decimal precision', () => {
            const calc = new LatencyCalculator();
            calc.start();
            mockTime.advance(145.456);
            calc.stop();

            const result = calc.getMs();

            expect(result).toBe(145.46);
        });

        it('getSeconds() returns duration in seconds', () => {
            const calc = new LatencyCalculator();
            calc.start();
            mockTime.advance(1500);
            calc.stop();

            const result = calc.getSeconds();

            expect(result).toBe(1.5);
        });
    });

    describe('BranchCoverage', () => {

        it('getMs() before stop() uses current time', () => {
            const calc = new LatencyCalculator();
            calc.start();
            mockTime.advance(100);

            const result = calc.getMs();

            expect(result).toBe(100);
        });

        it('getMs() before start() returns 0.0', () => {
            const calc = new LatencyCalculator();

            const result = calc.getMs();

            expect(result).toBe(0.0);
        });

        it('getSeconds() before start() returns 0.0', () => {
            const calc = new LatencyCalculator();

            const result = calc.getSeconds();

            expect(result).toBe(0.0);
        });
    });

    describe('BoundaryValues', () => {

        it('zero duration when start and stop at same time', () => {
            const calc = new LatencyCalculator();
            calc.start();
            calc.stop();

            const result = calc.getMs();

            expect(result).toBe(0.0);
        });

        it('very small duration (1ms)', () => {
            const calc = new LatencyCalculator();
            calc.start();
            mockTime.advance(1);
            calc.stop();

            const result = calc.getMs();

            expect(result).toBe(1.0);
        });

        it('very large duration (1 hour)', () => {
            const calc = new LatencyCalculator();
            calc.start();
            mockTime.advance(3600000);
            calc.stop();

            const result = calc.getMs();

            expect(result).toBe(3600000.0);
        });
    });

    describe('ParityVectors', () => {

        it.each([
            [145, 145.0],
            [1, 1.0],
            [1000, 1000.0],
            [0.5, 0.5],
            [123.4, 123.4],
        ])('duration %dms -> %f', (durationMs, expectedMs) => {
            const calc = new LatencyCalculator();
            calc.start();
            mockTime.advance(durationMs);
            calc.stop();

            const result = calc.getMs();

            expect(result).toBe(expectedMs);
        });
    });
});
