"""Reciprocal Rank Fusion (RRF) algorithm."""

from typing import List, Tuple


def reciprocal_rank_fusion(
    vector_results: List[Tuple[str, float]],
    bm25_results: List[Tuple[str, float]],
    alpha: float,
    k_rrf: int = 60,
) -> List[Tuple[str, float]]:
    """Weighted Reciprocal Rank Fusion.

    Combines vector and BM25 search results using RRF scoring.

    Args:
        vector_results: List of (content_hash, score) from vector search.
        bm25_results: List of (content_hash, score) from BM25 search.
        alpha: Weight for vector results (1-alpha for BM25). Range [0, 1].
        k_rrf: RRF constant (default 60). Higher values flatten rank differences.

    Returns:
        Sorted list of (content_hash, fused_score) in descending score order.
    """
    scores: dict[str, float] = {}
    for rank, (ch, _score) in enumerate(vector_results):
        scores[ch] = scores.get(ch, 0.0) + alpha * (1.0 / (k_rrf + rank + 1))
    for rank, (ch, _score) in enumerate(bm25_results):
        scores[ch] = scores.get(ch, 0.0) + (1.0 - alpha) * (1.0 / (k_rrf + rank + 1))
    return sorted(scores.items(), key=lambda x: x[1], reverse=True)
