"""Unit tests for figma_api.sdk.cache."""
import time
from unittest.mock import patch

import pytest

from figma_api.sdk.cache import CacheStats, RequestCache


class TestRequestCache:
    class TestStatementCoverage:
        def test_create_with_defaults(self):
            cache = RequestCache()
            assert cache.max_size == 100
            assert cache.ttl == 300

        def test_set_and_get(self):
            cache = RequestCache()
            cache.set("key1", {"data": "value1"})
            assert cache.get("key1") == {"data": "value1"}

        def test_get_missing_key(self):
            cache = RequestCache()
            assert cache.get("missing") is None

        def test_stats(self):
            cache = RequestCache()
            cache.set("k", "v")
            cache.get("k")  # hit
            cache.get("miss")  # miss
            stats = cache.stats
            assert isinstance(stats, CacheStats)
            assert stats.hits == 1
            assert stats.misses == 1
            assert stats.size == 1

        def test_clear(self):
            cache = RequestCache()
            cache.set("a", 1)
            cache.set("b", 2)
            cache.clear()
            assert cache.stats.size == 0
            assert cache.get("a") is None

    class TestBranchCoverage:
        def test_has_existing_key(self):
            cache = RequestCache()
            cache.set("k", "v")
            assert cache.has("k") is True

        def test_has_missing_key(self):
            cache = RequestCache()
            assert cache.has("missing") is False

        def test_update_existing_key(self):
            cache = RequestCache()
            cache.set("key", "old")
            cache.set("key", "new")
            assert cache.get("key") == "new"
            assert cache.stats.size == 1

    class TestBoundaryValues:
        def test_evict_oldest_at_max_size(self):
            cache = RequestCache(max_size=2, ttl=300)
            cache.set("a", 1)
            cache.set("b", 2)
            cache.set("c", 3)  # evicts 'a'
            assert cache.get("a") is None
            assert cache.get("b") == 2
            assert cache.get("c") == 3

        def test_expired_entry_returns_none(self):
            cache = RequestCache(max_size=100, ttl=1)
            cache.set("key", "value")
            assert cache.get("key") == "value"

            with patch("figma_api.sdk.cache.time.time", return_value=time.time() + 2):
                assert cache.get("key") is None

        def test_has_returns_false_for_expired(self):
            cache = RequestCache(max_size=100, ttl=1)
            cache.set("key", "value")

            with patch("figma_api.sdk.cache.time.time", return_value=time.time() + 2):
                assert cache.has("key") is False

        def test_max_size_1(self):
            cache = RequestCache(max_size=1, ttl=300)
            cache.set("a", 1)
            cache.set("b", 2)
            assert cache.get("a") is None
            assert cache.get("b") == 2

    class TestIntegration:
        def test_lru_order_respected(self):
            cache = RequestCache(max_size=3, ttl=300)
            cache.set("a", 1)
            cache.set("b", 2)
            cache.set("c", 3)
            cache.get("a")  # access 'a' — moves to end
            cache.set("d", 4)  # evicts 'b' (oldest untouched)
            assert cache.get("a") == 1
            assert cache.get("b") is None
            assert cache.get("c") == 3
            assert cache.get("d") == 4
