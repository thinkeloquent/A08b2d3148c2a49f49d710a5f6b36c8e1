/**
 * @fileoverview Reciprocal Rank Fusion (RRF) algorithm.
 */

/**
 * Weighted Reciprocal Rank Fusion.
 *
 * Combines vector and BM25 search results using RRF scoring.
 *
 * @param {Array<[string, number]>} vectorResults - (contentHash, score) from vector search
 * @param {Array<[string, number]>} bm25Results - (contentHash, score) from BM25 search
 * @param {number} alpha - Weight for vector results (1-alpha for BM25). Range [0, 1].
 * @param {number} [kRrf=60] - RRF constant. Higher values flatten rank differences.
 * @returns {Array<[string, number]>} Sorted (contentHash, fusedScore) in descending order.
 */
export function reciprocalRankFusion(vectorResults, bm25Results, alpha, kRrf = 60) {
  /** @type {Map<string, number>} */
  const scores = new Map();

  for (let rank = 0; rank < vectorResults.length; rank++) {
    const [ch] = vectorResults[rank];
    const prev = scores.get(ch) || 0;
    scores.set(ch, prev + alpha * (1.0 / (kRrf + rank + 1)));
  }

  for (let rank = 0; rank < bm25Results.length; rank++) {
    const [ch] = bm25Results[rank];
    const prev = scores.get(ch) || 0;
    scores.set(ch, prev + (1.0 - alpha) * (1.0 / (kRrf + rank + 1)));
  }

  return [...scores.entries()].sort((a, b) => b[1] - a[1]);
}
