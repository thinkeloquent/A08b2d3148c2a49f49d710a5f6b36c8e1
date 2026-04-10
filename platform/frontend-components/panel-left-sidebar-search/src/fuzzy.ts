import type { FuzzyResult } from './types';

/**
 * Fuzzy-match `query` against `text`.
 * Returns substring match (highest score), then character-spread match, then miss.
 */
export function fuzzy(text: string, query: string): FuzzyResult {
  if (!query) return { hit: true, score: 0, idx: [] };

  const t = text.toLowerCase();
  const q = query.toLowerCase();

  // Substring match — highest score
  const sub = t.indexOf(q);
  if (sub !== -1) {
    return {
      hit: true,
      score: 100 - sub,
      idx: Array.from({ length: q.length }, (_, i) => sub + i),
    };
  }

  // Character-spread match
  let qi = 0;
  const idx: number[] = [];
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) {
      idx.push(i);
      qi++;
    }
  }

  if (qi === q.length) {
    return { hit: true, score: 50 - (idx[idx.length - 1]! - idx[0]!), idx };
  }

  return { hit: false, score: -999, idx: [] };
}
