"""Tests for reciprocal rank fusion."""

import pytest
from rag_search_algorithms.rrf import reciprocal_rank_fusion


class TestReciprocalRankFusion:
    def test_basic_fusion(self):
        vector = [("a", 0.9), ("b", 0.8), ("c", 0.7)]
        bm25 = [("b", 5.0), ("c", 4.0), ("d", 3.0)]
        result = reciprocal_rank_fusion(vector, bm25, alpha=0.5)

        # Result should be list of (hash, score) tuples
        assert isinstance(result, list)
        assert all(isinstance(r, tuple) and len(r) == 2 for r in result)

        # "b" appears in both lists, should have highest fused score
        hashes = [h for h, _ in result]
        assert "b" in hashes

        # All unique hashes should be present
        all_hashes = {"a", "b", "c", "d"}
        assert set(hashes) == all_hashes

    def test_pure_vector(self):
        vector = [("a", 0.9), ("b", 0.8)]
        bm25 = [("c", 5.0)]
        result = reciprocal_rank_fusion(vector, bm25, alpha=1.0)

        # With alpha=1.0, BM25 has zero weight
        scores = {h: s for h, s in result}
        assert scores["c"] == 0.0  # BM25-only result gets 0 score

    def test_pure_bm25(self):
        vector = [("a", 0.9)]
        bm25 = [("b", 5.0)]
        result = reciprocal_rank_fusion(vector, bm25, alpha=0.0)

        scores = {h: s for h, s in result}
        assert scores["a"] == 0.0  # Vector-only result gets 0 score

    def test_empty_inputs(self):
        result = reciprocal_rank_fusion([], [], alpha=0.5)
        assert result == []

    def test_descending_order(self):
        vector = [("a", 0.9), ("b", 0.8)]
        bm25 = [("b", 5.0), ("a", 4.0)]
        result = reciprocal_rank_fusion(vector, bm25, alpha=0.5)

        scores = [s for _, s in result]
        assert scores == sorted(scores, reverse=True)

    def test_custom_k_rrf(self):
        vector = [("a", 0.9)]
        bm25 = [("a", 5.0)]
        result_default = reciprocal_rank_fusion(vector, bm25, alpha=0.5, k_rrf=60)
        result_custom = reciprocal_rank_fusion(vector, bm25, alpha=0.5, k_rrf=10)

        # Lower k_rrf gives higher scores
        assert result_custom[0][1] > result_default[0][1]
