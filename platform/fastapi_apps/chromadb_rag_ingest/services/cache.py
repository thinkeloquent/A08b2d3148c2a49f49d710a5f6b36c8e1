"""Redis caching layer for ChromaDB RAG Ingest."""

import hashlib
import json
import logging
from typing import Optional

logger = logging.getLogger(__name__)

SEARCH_TTL = 3600       # 1 hour
LLM_TTL = 86400         # 24 hours
SEARCH_PREFIX = "chromadb_rag_ingest:search:"
LLM_PREFIX = "chromadb_rag_ingest:llm:"


class CacheService:
    """Redis-backed cache for search results and LLM responses."""

    def __init__(self, config):
        self._client = None
        self._available = None  # None = unknown
        self._config = config

    def _get_client(self):
        if self._available is False:
            return None
        if self._client is not None:
            return self._client
        try:
            from db_connection_redis import get_sync_redis_client, RedisConfig
            cfg = RedisConfig(host=self._config.redis_host, port=self._config.redis_port)
            client = get_sync_redis_client(cfg)
            client.ping()
            self._client = client
            self._available = True
            logger.info("Redis cache connected (%s:%s)", self._config.redis_host, self._config.redis_port)
            return client
        except Exception as e:
            self._available = False
            logger.warning("Redis unavailable, caching disabled: %s", e)
            return None

    @property
    def available(self) -> bool:
        if self._available is None:
            self._get_client()
        return bool(self._available)

    @staticmethod
    def _cache_key(prefix: str, query: str, **params) -> str:
        parts = [query]
        for k in sorted(params.keys()):
            v = params[k]
            if v is not None:
                parts.append(f"{k}={v}")
        raw = "|".join(parts)
        h = hashlib.sha256(raw.encode()).hexdigest()[:16]
        return f"{prefix}{h}"

    # -- search cache --

    def get_cached_search(
        self, query: str, top_k: int, alpha: float = None,
        threshold: float = None, reranker: bool = None, backend: str = None,
    ) -> Optional[dict]:
        client = self._get_client()
        if client is None:
            return None
        try:
            key = self._cache_key(
                SEARCH_PREFIX, query, top_k=top_k, alpha=alpha,
                threshold=threshold, reranker=reranker, backend=backend,
            )
            data = client.get(key)
            if data:
                return json.loads(data)
        except Exception as e:
            logger.warning("Cache read error: %s", e)
        return None

    def set_cached_search(
        self, query: str, results: dict, top_k: int,
        alpha: float = None, threshold: float = None,
        reranker: bool = None, backend: str = None,
    ) -> None:
        client = self._get_client()
        if client is None:
            return
        try:
            key = self._cache_key(
                SEARCH_PREFIX, query, top_k=top_k, alpha=alpha,
                threshold=threshold, reranker=reranker, backend=backend,
            )
            client.setex(key, SEARCH_TTL, json.dumps(results))
        except Exception as e:
            logger.warning("Cache write error: %s", e)

    # -- LLM cache --

    def get_cached_llm(self, query: str, provider: str = None) -> Optional[str]:
        client = self._get_client()
        if client is None:
            return None
        try:
            key = self._cache_key(LLM_PREFIX, query, provider=provider)
            data = client.get(key)
            if data:
                return data if isinstance(data, str) else data.decode()
        except Exception as e:
            logger.warning("Cache read error: %s", e)
        return None

    def set_cached_llm(self, query: str, answer: str, provider: str = None) -> None:
        client = self._get_client()
        if client is None:
            return
        try:
            key = self._cache_key(LLM_PREFIX, query, provider=provider)
            client.setex(key, LLM_TTL, answer)
        except Exception as e:
            logger.warning("Cache write error: %s", e)

    # -- invalidation --

    def invalidate_search_cache(self) -> int:
        client = self._get_client()
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
                logger.info("Invalidated %d search cache entries", count)
            return count
        except Exception as e:
            logger.warning("Cache invalidation error: %s", e)
            return 0
