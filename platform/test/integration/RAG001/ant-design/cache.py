#!/usr/bin/env python3
"""
Redis caching layer for ant-design RAG.
Caches search results and LLM responses for fast repeated queries.

Uses the existing db_connection_redis package which auto-detects
DigitalOcean and handles TLS.
"""
import hashlib
import json
import logging
from typing import Optional

logger = logging.getLogger(__name__)

SEARCH_TTL = 3600       # 1 hour
LLM_TTL = 86400         # 24 hours
SEARCH_PREFIX = "rag:search:"
LLM_PREFIX = "rag:llm:"

_redis_client = None
_redis_available = None  # None = unknown, True/False = tested


def get_redis_client():
    """Get a synchronous Redis client via the shared connection package."""
    global _redis_client, _redis_available
    if _redis_available is False:
        return None
    if _redis_client is not None:
        return _redis_client
    try:
        from db_connection_redis import get_sync_redis_client, RedisConfig
        cfg = RedisConfig()
        client = get_sync_redis_client(cfg)
        client.ping()
        _redis_client = client
        _redis_available = True
        logger.info("Redis cache connected")
        return client
    except Exception as e:
        _redis_available = False
        logger.warning(f"Redis unavailable, caching disabled: {e}")
        return None


def cache_key(prefix: str, query: str, **params) -> str:
    """Build a deterministic cache key from query + sorted params."""
    parts = [query]
    for k in sorted(params.keys()):
        v = params[k]
        if v is not None:
            parts.append(f"{k}={v}")
    raw = "|".join(parts)
    h = hashlib.sha256(raw.encode()).hexdigest()[:16]
    return f"{prefix}{h}"


def get_cached_search(query: str, top_k: int, alpha: float = None,
                      threshold: float = None, reranker: bool = None,
                      backend: str = None) -> Optional[dict]:
    """Check Redis for cached search results. Returns None on miss."""
    client = get_redis_client()
    if client is None:
        return None
    try:
        key = cache_key(SEARCH_PREFIX, query, top_k=top_k, alpha=alpha,
                        threshold=threshold, reranker=reranker, backend=backend)
        data = client.get(key)
        if data:
            return json.loads(data)
    except Exception as e:
        logger.warning(f"Cache read error: {e}")
    return None


def set_cached_search(query: str, results: dict, top_k: int,
                      alpha: float = None, threshold: float = None,
                      reranker: bool = None, backend: str = None) -> None:
    """Store search results in Redis with TTL."""
    client = get_redis_client()
    if client is None:
        return
    try:
        key = cache_key(SEARCH_PREFIX, query, top_k=top_k, alpha=alpha,
                        threshold=threshold, reranker=reranker, backend=backend)
        client.setex(key, SEARCH_TTL, json.dumps(results))
    except Exception as e:
        logger.warning(f"Cache write error: {e}")


def get_cached_llm(query: str, provider: str = None) -> Optional[str]:
    """Check for cached LLM answer. Returns None on miss."""
    client = get_redis_client()
    if client is None:
        return None
    try:
        key = cache_key(LLM_PREFIX, query, provider=provider)
        data = client.get(key)
        if data:
            return data if isinstance(data, str) else data.decode()
    except Exception as e:
        logger.warning(f"Cache read error: {e}")
    return None


def set_cached_llm(query: str, answer: str, provider: str = None) -> None:
    """Store LLM answer in Redis with TTL."""
    client = get_redis_client()
    if client is None:
        return
    try:
        key = cache_key(LLM_PREFIX, query, provider=provider)
        client.setex(key, LLM_TTL, answer)
    except Exception as e:
        logger.warning(f"Cache write error: {e}")


def invalidate_search_cache() -> int:
    """Delete all search cache keys. Returns number deleted."""
    client = get_redis_client()
    if client is None:
        return 0
    try:
        count = 0
        cursor = 0
        while True:
            cursor, keys = client.scan(cursor=cursor, match=f"{SEARCH_PREFIX}*", count=100)
            if keys:
                count += client.delete(*keys)
            if cursor == 0:
                break
        if count:
            logger.info(f"Invalidated {count} search cache entries")
        return count
    except Exception as e:
        logger.warning(f"Cache invalidation error: {e}")
        return 0
