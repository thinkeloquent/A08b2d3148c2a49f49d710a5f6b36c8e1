/**
 * Unit tests for healthz-diagnostics timestamp module.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TimestampFormatter } from '../src/timestamp.mjs';
import { createMockDateNow } from './helpers/test-utils.mjs';


describe('TimestampFormatter', () => {

    describe('StatementCoverage', () => {

        it('format() returns ISO8601 string', () => {
            const formatter = new TimestampFormatter();

            const result = formatter.format();

            expect(typeof result).toBe('string');
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
        });

        it('formatFromEpoch() converts epoch to ISO8601', () => {
            const formatter = new TimestampFormatter();
            // 2024-01-15T10:30:00Z in epoch ms
            const epochMs = 1705312200000;

            const result = formatter.formatFromEpoch(epochMs);

            expect(result).toBe('2024-01-15T10:30:00Z');
        });
    });

    describe('BoundaryValues', () => {

        it('epoch 0 (Unix epoch)', () => {
            const formatter = new TimestampFormatter();

            const result = formatter.formatFromEpoch(0);

            expect(result).toBe('1970-01-01T00:00:00Z');
        });

        it('year 2000 epoch', () => {
            const formatter = new TimestampFormatter();
            // 2000-01-01T00:00:00Z
            const y2k = 946684800000;

            const result = formatter.formatFromEpoch(y2k);

            expect(result).toBe('2000-01-01T00:00:00Z');
        });

        it('far future (year 2100)', () => {
            const formatter = new TimestampFormatter();
            // 2100-01-01T00:00:00Z
            const future = 4102444800000;

            const result = formatter.formatFromEpoch(future);

            expect(result).toBe('2100-01-01T00:00:00Z');
        });

        it('milliseconds are stripped', () => {
            const formatter = new TimestampFormatter();
            // 2024-01-15T10:30:00.500Z (with 500ms)
            const epochWithMs = 1705312200500;

            const result = formatter.formatFromEpoch(epochWithMs);

            expect(result).toBe('2024-01-15T10:30:00Z');
            expect(result).not.toContain('.500');
        });
    });

    describe('OutputFormat', () => {

        it('no milliseconds in output', () => {
            const formatter = new TimestampFormatter();

            const result = formatter.format();

            expect(result).not.toMatch(/\.\d{3}Z$/);
            expect(result).toMatch(/Z$/);
        });

        it('ends with Z (UTC indicator)', () => {
            const formatter = new TimestampFormatter();

            const result = formatter.format();

            expect(result.endsWith('Z')).toBe(true);
        });

        it('contains T separator', () => {
            const formatter = new TimestampFormatter();

            const result = formatter.format();

            expect(result).toContain('T');
        });
    });

    describe('ParityVectors', () => {

        it.each([
            [1705312200000, '2024-01-15T10:30:00Z'],
            [0, '1970-01-01T00:00:00Z'],
            [946684800000, '2000-01-01T00:00:00Z'],
            [1609459200000, '2021-01-01T00:00:00Z'],
            [1735689600000, '2025-01-01T00:00:00Z'],
        ])('epoch %d -> %s', (epochMs, expected) => {
            const formatter = new TimestampFormatter();

            const result = formatter.formatFromEpoch(epochMs);

            expect(result).toBe(expected);
        });
    });
});
