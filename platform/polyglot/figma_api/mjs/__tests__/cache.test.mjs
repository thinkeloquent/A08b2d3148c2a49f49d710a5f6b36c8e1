import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RequestCache } from '../src/sdk/cache.mjs';

describe('RequestCache', () => {
    describe('Statement Coverage', () => {
        it('should create with defaults', () => {
            const cache = new RequestCache();
            expect(cache.maxSize).toBe(100);
            expect(cache.ttl).toBe(300000); // 300s in ms
            expect(cache.stats.size).toBe(0);
        });

        it('should set and get values', () => {
            const cache = new RequestCache();
            cache.set('key1', { data: 'value1' });
            expect(cache.get('key1')).toEqual({ data: 'value1' });
        });

        it('should return undefined for missing key', () => {
            const cache = new RequestCache();
            expect(cache.get('nonexistent')).toBeUndefined();
        });

        it('should track stats', () => {
            const cache = new RequestCache();
            cache.set('key1', 'val');
            cache.get('key1'); // hit
            cache.get('miss'); // miss
            expect(cache.stats.hits).toBe(1);
            expect(cache.stats.misses).toBe(1);
            expect(cache.stats.size).toBe(1);
        });

        it('should clear all entries', () => {
            const cache = new RequestCache();
            cache.set('a', 1);
            cache.set('b', 2);
            cache.clear();
            expect(cache.stats.size).toBe(0);
            expect(cache.get('a')).toBeUndefined();
        });

        it('should create with custom maxSize and ttl', () => {
            const cache = new RequestCache({ maxSize: 50, ttl: 120 });
            expect(cache.maxSize).toBe(50);
            expect(cache.ttl).toBe(120000); // 120s in ms
        });

        it('should store different value types', () => {
            const cache = new RequestCache();
            cache.set('string', 'hello');
            cache.set('number', 42);
            cache.set('object', { key: 'val' });
            cache.set('array', [1, 2, 3]);
            cache.set('null', null);
            expect(cache.get('string')).toBe('hello');
            expect(cache.get('number')).toBe(42);
            expect(cache.get('object')).toEqual({ key: 'val' });
            expect(cache.get('array')).toEqual([1, 2, 3]);
            expect(cache.get('null')).toBeNull();
        });
    });

    describe('Branch Coverage', () => {
        it('should handle has() for existing key', () => {
            const cache = new RequestCache();
            cache.set('k', 'v');
            expect(cache.has('k')).toBe(true);
        });

        it('should handle has() for missing key', () => {
            const cache = new RequestCache();
            expect(cache.has('missing')).toBe(false);
        });

        it('should update existing key when set again', () => {
            const cache = new RequestCache();
            cache.set('key', 'old');
            cache.set('key', 'new');
            expect(cache.get('key')).toBe('new');
            expect(cache.stats.size).toBe(1);
        });

        it('should increment misses on get for missing key', () => {
            const cache = new RequestCache();
            cache.get('a');
            cache.get('b');
            cache.get('c');
            expect(cache.stats.misses).toBe(3);
        });

        it('should increment hits on get for existing key', () => {
            const cache = new RequestCache();
            cache.set('x', 1);
            cache.get('x');
            cache.get('x');
            expect(cache.stats.hits).toBe(2);
        });
    });

    describe('Boundary Values', () => {
        it('should evict oldest when maxSize reached', () => {
            const cache = new RequestCache({ maxSize: 2, ttl: 300 });
            cache.set('a', 1);
            cache.set('b', 2);
            cache.set('c', 3); // should evict 'a'
            expect(cache.get('a')).toBeUndefined();
            expect(cache.get('b')).toBe(2);
            expect(cache.get('c')).toBe(3);
        });

        it('should expire entries after TTL', () => {
            vi.useFakeTimers();
            const cache = new RequestCache({ maxSize: 100, ttl: 1 }); // 1s TTL
            cache.set('key', 'value');
            expect(cache.get('key')).toBe('value');

            vi.advanceTimersByTime(1100); // advance past TTL (1s = 1000ms)
            expect(cache.get('key')).toBeUndefined();
            vi.useRealTimers();
        });

        it('should handle has() returning false for expired entry', () => {
            vi.useFakeTimers();
            const cache = new RequestCache({ maxSize: 100, ttl: 1 });
            cache.set('key', 'value');
            vi.advanceTimersByTime(1100);
            expect(cache.has('key')).toBe(false);
            vi.useRealTimers();
        });

        it('should handle maxSize of 1', () => {
            const cache = new RequestCache({ maxSize: 1, ttl: 300 });
            cache.set('a', 1);
            cache.set('b', 2);
            expect(cache.get('a')).toBeUndefined();
            expect(cache.get('b')).toBe(2);
        });

        it('should not expire entry just before TTL', () => {
            vi.useFakeTimers();
            const cache = new RequestCache({ maxSize: 100, ttl: 10 }); // 10s TTL
            cache.set('key', 'value');
            vi.advanceTimersByTime(9500); // 9.5s, just before 10s
            expect(cache.get('key')).toBe('value');
            vi.useRealTimers();
        });

        it('should expire entry right at TTL boundary', () => {
            vi.useFakeTimers();
            const cache = new RequestCache({ maxSize: 100, ttl: 1 }); // 1s TTL
            cache.set('key', 'value');
            vi.advanceTimersByTime(1001); // just past 1000ms
            expect(cache.get('key')).toBeUndefined();
            vi.useRealTimers();
        });

        it('should handle empty string keys', () => {
            const cache = new RequestCache();
            cache.set('', 'empty-key-value');
            expect(cache.get('')).toBe('empty-key-value');
        });

        it('should evict in correct order with many entries', () => {
            const cache = new RequestCache({ maxSize: 3, ttl: 300 });
            cache.set('a', 1);
            cache.set('b', 2);
            cache.set('c', 3);
            cache.set('d', 4); // evicts 'a'
            cache.set('e', 5); // evicts 'b'
            expect(cache.get('a')).toBeUndefined();
            expect(cache.get('b')).toBeUndefined();
            expect(cache.get('c')).toBe(3);
            expect(cache.get('d')).toBe(4);
            expect(cache.get('e')).toBe(5);
        });
    });

    describe('Integration', () => {
        it('LRU: accessed entries should not be evicted first', () => {
            const cache = new RequestCache({ maxSize: 3, ttl: 300 });
            cache.set('a', 1);
            cache.set('b', 2);
            cache.set('c', 3);
            cache.get('a'); // access 'a' -- moves it to end
            cache.set('d', 4); // should evict 'b' (oldest untouched)
            expect(cache.get('a')).toBe(1);
            expect(cache.get('b')).toBeUndefined();
            expect(cache.get('c')).toBe(3);
            expect(cache.get('d')).toBe(4);
        });

        it('should maintain correct stats through mixed operations', () => {
            const cache = new RequestCache({ maxSize: 2, ttl: 300 });
            cache.set('a', 1);
            cache.set('b', 2);
            cache.get('a');    // hit
            cache.get('miss'); // miss
            cache.set('c', 3); // evicts 'b' (since 'a' was accessed)
            cache.get('b');    // miss (evicted)
            cache.get('c');    // hit

            expect(cache.stats.hits).toBe(2);
            expect(cache.stats.misses).toBe(2);
            expect(cache.stats.size).toBe(2);
        });

        it('should handle set-get-clear-set-get cycle', () => {
            const cache = new RequestCache();
            cache.set('key', 'first');
            expect(cache.get('key')).toBe('first');
            cache.clear();
            expect(cache.get('key')).toBeUndefined();
            cache.set('key', 'second');
            expect(cache.get('key')).toBe('second');
        });
    });
});
