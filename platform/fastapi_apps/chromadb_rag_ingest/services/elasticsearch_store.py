"""Elasticsearch kNN + BM25 backend for ChromaDB RAG Ingest."""

import logging
from typing import List, Optional, Tuple

from langchain_core.documents import Document

from rag_search_algorithms import content_hash as _content_hash, reciprocal_rank_fusion

logger = logging.getLogger(__name__)


def _index_body(dimension: int = 384) -> dict:
    return {
        "settings": {
            "index.knn": True,
            "index.knn.algo_param.ef_search": 100,
        },
        "mappings": {
            "properties": {
                "text": {"type": "text", "analyzer": "standard"},
                "embedding": {"type": "knn_vector", "dimension": dimension},
                "component": {"type": "keyword"},
                "file_name": {"type": "keyword"},
                "file_path": {"type": "keyword"},
                "library": {"type": "keyword"},
                "content_hash": {"type": "keyword"},
            }
        },
    }


def get_elasticsearch_client(config):
    """Get a synchronous Elasticsearch client via the shared connection package."""
    from db_connection_elasticsearch import get_sync_elasticsearch_client, ElasticsearchConfig
    cfg = ElasticsearchConfig(
        host=config.elasticsearch_host,
        port=config.elasticsearch_port,
        scheme=config.elasticsearch_scheme,
    )
    return get_sync_elasticsearch_client(cfg)


def ensure_index(client, config):
    """Create the index if it doesn't exist."""
    index_name = config.elasticsearch_index
    if not client.indices.exists(index=index_name):
        client.indices.create(index=index_name, body=_index_body())
        logger.info("Created index '%s'", index_name)
    else:
        logger.info("Index '%s' already exists", index_name)


def delete_by_file_path(client, config, file_path: str) -> int:
    """Delete all chunks for a given file path."""
    resp = client.delete_by_query(
        index=config.elasticsearch_index,
        body={"query": {"term": {"file_path": file_path}}},
        refresh=True,
    )
    deleted = resp.get("deleted", 0)
    if deleted:
        logger.info("Deleted %d chunks for %s", deleted, file_path)
    return deleted


def ingest_documents(client, config, docs: List[Document], embeddings_model) -> int:
    """Bulk-index LangChain Documents. Returns number indexed."""
    from opensearchpy import helpers

    if not docs:
        return 0

    texts = [doc.page_content for doc in docs]
    vectors = embeddings_model.embed_documents(texts)

    seen = set()
    actions = []
    for doc, vector in zip(docs, vectors):
        ch = _content_hash(doc.page_content)
        if ch in seen:
            continue
        seen.add(ch)
        meta = doc.metadata or {}
        actions.append({
            "_index": config.elasticsearch_index,
            "_id": ch,
            "_source": {
                "text": doc.page_content,
                "embedding": vector,
                "component": meta.get("component", ""),
                "file_name": meta.get("file_name", ""),
                "file_path": meta.get("file_path", ""),
                "library": meta.get("library", ""),
                "content_hash": ch,
            },
        })

    if not actions:
        return 0

    batch_size = 500
    total = 0
    for i in range(0, len(actions), batch_size):
        batch = actions[i : i + batch_size]
        success, errors = helpers.bulk(client, batch, raise_on_error=False)
        total += success
        if errors:
            logger.warning("Bulk indexing had %d errors in batch %d", len(errors), i // batch_size + 1)

    client.indices.refresh(index=config.elasticsearch_index)
    logger.info("Indexed %d documents into '%s'", total, config.elasticsearch_index)
    return total


def vector_search(client, config, query_embedding: List[float], k: int = 50) -> List[Tuple[Document, float]]:
    """kNN vector search."""
    body = {
        "size": k,
        "query": {
            "knn": {
                "embedding": {
                    "vector": query_embedding,
                    "k": k,
                }
            }
        },
    }
    resp = client.search(index=config.elasticsearch_index, body=body)
    results = []
    for hit in resp["hits"]["hits"]:
        src = hit["_source"]
        doc = Document(
            page_content=src["text"],
            metadata={
                "component": src.get("component", ""),
                "file_name": src.get("file_name", ""),
                "file_path": src.get("file_path", ""),
                "library": src.get("library", ""),
            },
        )
        results.append((doc, float(hit["_score"])))
    return results


def bm25_search(client, config, query_text: str, k: int = 50) -> List[Tuple[Document, float]]:
    """BM25 text search."""
    body = {
        "size": k,
        "query": {
            "match": {
                "text": {
                    "query": query_text,
                    "operator": "or",
                }
            }
        },
    }
    resp = client.search(index=config.elasticsearch_index, body=body)
    results = []
    for hit in resp["hits"]["hits"]:
        src = hit["_source"]
        doc = Document(
            page_content=src["text"],
            metadata={
                "component": src.get("component", ""),
                "file_name": src.get("file_name", ""),
                "file_path": src.get("file_path", ""),
                "library": src.get("library", ""),
            },
        )
        results.append((doc, float(hit["_score"])))
    return results


def hybrid_search_elasticsearch(
    client,
    config,
    query: str,
    embeddings_model,
    k: int = 6,
    alpha: float = None,
    threshold: float = None,
) -> List[Tuple[Document, float]]:
    """Hybrid kNN + BM25 search with RRF fusion."""
    # reciprocal_rank_fusion imported at module level from rag_search_algorithms

    _alpha = alpha if alpha is not None else config.hybrid_alpha
    _threshold = threshold if threshold is not None else config.score_threshold
    n = config.retrieve_n

    query_embedding = embeddings_model.embed_query(query)

    # Stage 1a: Vector search
    vector_raw = vector_search(client, config, query_embedding, k=n)

    vector_by_hash = {}
    vector_ranked = []
    for doc, score in vector_raw:
        ch = _content_hash(doc.page_content)
        vector_by_hash[ch] = (doc, score)
        vector_ranked.append((ch, score))

    # Normalize vector scores to 0-1
    if vector_ranked:
        max_v = max(s for _, s in vector_ranked)
        if max_v > 0:
            vector_norm = {ch: s / max_v for ch, s in vector_ranked}
        else:
            vector_norm = {ch: 0.0 for ch, _ in vector_ranked}
    else:
        vector_norm = {}

    # Apply threshold on normalized scores
    if _threshold > 0.0:
        vector_by_hash = {
            ch: (doc, s)
            for ch, (doc, s) in vector_by_hash.items()
            if vector_norm.get(ch, 0) >= _threshold
        }
        vector_ranked = [(ch, s) for ch, s in vector_ranked if ch in vector_by_hash]

    # Pure vector path
    if _alpha >= 1.0:
        results = list(vector_by_hash.values())
        results.sort(key=lambda x: x[1], reverse=True)
        return results[:k]

    # Stage 1b: BM25 search
    bm25_raw = bm25_search(client, config, query, k=n)

    bm25_by_hash = {}
    bm25_ranked = []
    for doc, score in bm25_raw:
        ch = _content_hash(doc.page_content)
        bm25_by_hash[ch] = (doc, score)
        bm25_ranked.append((ch, score))

    # Pure BM25 path
    if _alpha <= 0.0:
        results = list(bm25_by_hash.values())
        results.sort(key=lambda x: x[1], reverse=True)
        return results[:k]

    # Stage 2: RRF fusion
    fused = reciprocal_rank_fusion(vector_ranked, bm25_ranked, _alpha)

    all_docs = {**bm25_by_hash, **vector_by_hash}

    results = []
    seen = set()
    for ch, fused_score in fused:
        if ch in seen:
            continue
        seen.add(ch)
        if ch in all_docs:
            doc, _original_score = all_docs[ch]
            results.append((doc, fused_score))

    return results[:k]


def get_doc_count(client, config) -> int:
    """Get total document count in the index."""
    try:
        resp = client.count(index=config.elasticsearch_index)
        return resp["count"]
    except Exception:
        return 0
