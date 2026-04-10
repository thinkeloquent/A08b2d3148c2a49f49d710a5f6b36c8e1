
import { describe, it, expect } from 'vitest';
import { deepMerge } from '../src/utils.js';

describe('Deep Merge Utility', () => {
    it('should merge nested objects', () => {
        const target = { a: 1, b: { c: 2 } };
        const source = { b: { d: 3 } };
        const result = deepMerge(target, source);

        expect(result).toEqual({ a: 1, b: { c: 2, d: 3 } });
    });

    it('should replace arrays', () => {
        const target = { a: [1, 2] };
        const source = { a: [3, 4] };
        const result = deepMerge(target, source);

        expect(result.a).toEqual([3, 4]); // Not [1, 2, 3, 4]
    });

    it('should overwrite primitives', () => {
        const target = { a: 1 };
        const source = { a: 2 };
        const result = deepMerge(target, source);

        expect(result.a).toBe(2);
    });

    it('should handle null/undefined', () => {
        const target = { a: 1 };
        const result = deepMerge(target, null);
        expect(result).toBe(null);
    });
});
