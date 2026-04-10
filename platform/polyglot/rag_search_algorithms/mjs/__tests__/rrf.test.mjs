import { describe, it, expect } from 'vitest';
import { reciprocalRankFusion } from '../src/rrf.mjs';

describe('reciprocalRankFusion', () => {
  it('should fuse vector and BM25 results', () => {
    const vector = [['a', 0.9], ['b', 0.8], ['c', 0.7]];
    const bm25 = [['b', 5.0], ['c', 4.0], ['d', 3.0]];
    const result = reciprocalRankFusion(vector, bm25, 0.5);

    expect(result).toBeInstanceOf(Array);
    expect(result.every(([, score]) => typeof score === 'number')).toBe(true);

    const hashes = new Set(result.map(([h]) => h));
    expect(hashes).toEqual(new Set(['a', 'b', 'c', 'd']));
  });

  it('should give zero BM25 weight when alpha=1.0', () => {
    const vector = [['a', 0.9], ['b', 0.8]];
    const bm25 = [['c', 5.0]];
    const result = reciprocalRankFusion(vector, bm25, 1.0);

    const scores = Object.fromEntries(result);
    expect(scores.c).toBe(0);
  });

  it('should give zero vector weight when alpha=0.0', () => {
    const vector = [['a', 0.9]];
    const bm25 = [['b', 5.0]];
    const result = reciprocalRankFusion(vector, bm25, 0.0);

    const scores = Object.fromEntries(result);
    expect(scores.a).toBe(0);
  });

  it('should return empty array for empty inputs', () => {
    expect(reciprocalRankFusion([], [], 0.5)).toEqual([]);
  });

  it('should return results in descending score order', () => {
    const vector = [['a', 0.9], ['b', 0.8]];
    const bm25 = [['b', 5.0], ['a', 4.0]];
    const result = reciprocalRankFusion(vector, bm25, 0.5);

    const scores = result.map(([, s]) => s);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it('should produce higher scores with lower kRrf', () => {
    const vector = [['a', 0.9]];
    const bm25 = [['a', 5.0]];
    const resultDefault = reciprocalRankFusion(vector, bm25, 0.5, 60);
    const resultCustom = reciprocalRankFusion(vector, bm25, 0.5, 10);

    expect(resultCustom[0][1]).toBeGreaterThan(resultDefault[0][1]);
  });
});
