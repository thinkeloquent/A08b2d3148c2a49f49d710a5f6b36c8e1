#!/usr/bin/env python3
"""
OpenSearch vector store for ant-design RAG.
Provides kNN + BM25 hybrid search as an alternative backend to ChromaDB.

Uses the existing db_connection_elasticsearch package which auto-detects
DigitalOcean and returns an OpenSearch client.
"""
import hashlib
import logging
from typing import List, Optional, Tuple

from langchain_core.documents import Document

logger = logging.getLogger(__name__)

INDEX_NAME = "rag-ant-design"

INDEX_BODY = {
    "settings": {
        "index.knn": True,
        "index.knn.algo_param.ef_search": 100,
    },
    "mappings": {
        "properties": {
            "text": {"type": "text", "analyzer": "standard"},
            "embedding": {"type": "knn_vector", "dimension": 384},
            "component": {"type": "keyword"},
            "file_name": {"type": "keyword"},
            "file_path": {"type": "keyword"},
            "library": {"type": "keyword"},
            "content_hash": {"type": "keyword"},
        }
    }
}


def _content_hash(text: str) -> str:
    return hashlib.md5(text.encode()).hexdigest()


def get_opensearch_client():
    """Get a synchronous OpenSearch client via the shared connection package."""
    try:
        from db_connection_elasticsearch import get_sync_elasticsearch_client, ElasticsearchConfig
        cfg = ElasticsearchConfig()
        return get_sync_elasticsearch_client(cfg)
    except Exception as e:
        logger.error(f"Failed to create OpenSearch client: {e}")
        raise


def ensure_index(client):
    """Create the index if it doesn't exist."""
    if not client.indices.exists(index=INDEX_NAME):
        client.indices.create(index=INDEX_NAME, body=INDEX_BODY)
        logger.info(f"Created index '{INDEX_NAME}'")
    else:
        logger.info(f"Index '{INDEX_NAME}' already exists")


def delete_by_file_path(client, file_path: str) -> int:
    """Delete all chunks for a given file path. Returns number deleted."""
    resp = client.delete_by_query(
        index=INDEX_NAME,
        body={"query": {"term": {"file_path": file_path}}},
        refresh=True,
    )
    deleted = resp.get("deleted", 0)
    if deleted:
        logger.info(f"Deleted {deleted} chunks for {file_path}")
    return deleted


def ingest_documents(client, docs: List[Document], embeddings_model) -> int:
    """
    Bulk-index LangChain Documents into OpenSearch.
    Computes embeddings, deduplicates by content_hash.
    Returns number of documents indexed.
    """
    from opensearchpy import helpers

    if not docs:
        return 0

    # Compute embeddings in batch
    texts = [doc.page_content for doc in docs]
    vectors = embeddings_model.embed_documents(texts)

    # Build bulk actions, deduplicate by content_hash
    seen = set()
    actions = []
    for doc, vector in zip(docs, vectors):
        ch = _content_hash(doc.page_content)
        if ch in seen:
            continue
        seen.add(ch)

        meta = doc.metadata or {}
        actions.append({
            "_index": INDEX_NAME,
            "_id": ch,
            "_source": {
                "text": doc.page_content,
                "embedding": vector,
                "component": meta.get("component", ""),
                "file_name": meta.get("file_name", ""),
                "file_path": meta.get("file_path", ""),
                "library": meta.get("library", ""),
                "content_hash": ch,
            }
        })

    if not actions:
        return 0

    # Bulk index in batches of 500
    batch_size = 500
    total = 0
    for i in range(0, len(actions), batch_size):
        batch = actions[i:i + batch_size]
        success, errors = helpers.bulk(client, batch, raise_on_error=False)
        total += success
        if errors:
            logger.warning(f"Bulk indexing had {len(errors)} errors in batch {i // batch_size + 1}")

    client.indices.refresh(index=INDEX_NAME)
    logger.info(f"Indexed {total} documents into '{INDEX_NAME}'")
    return total


def vector_search(client, query_embedding: List[float], k: int = 50) -> List[Tuple[Document, float]]:
    """kNN vector search on the embedding field."""
    body = {
        "size": k,
        "query": {
            "knn": {
                "embedding": {
                    "vector": query_embedding,
                    "k": k,
                }
            }
        }
    }
    resp = client.search(index=INDEX_NAME, body=body)
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
            }
        )
        results.append((doc, float(hit["_score"])))
    return results


def bm25_search(client, query_text: str, k: int = 50) -> List[Tuple[Document, float]]:
    """BM25 text search on the text field."""
    body = {
        "size": k,
        "query": {
            "match": {
                "text": {
                    "query": query_text,
                    "operator": "or",
                }
            }
        }
    }
    resp = client.search(index=INDEX_NAME, body=body)
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
            }
        )
        results.append((doc, float(hit["_score"])))
    return results


def hybrid_search_opensearch(
    client,
    query: str,
    embeddings_model,
    k: int = 6,
    alpha: Optional[float] = None,
    threshold: Optional[float] = None,
) -> List[Tuple[Document, float]]:
    """
    Hybrid search: kNN + BM25 with RRF fusion.
    Reuses reciprocal_rank_fusion() from query.py.
    """
    from query import reciprocal_rank_fusion, hybrid_alpha, score_threshold, retrieve_n, reranker_enabled, gemini_rerank

    _alpha = alpha if alpha is not None else hybrid_alpha
    _threshold = threshold if threshold is not None else score_threshold
    n = retrieve_n

    # Compute query embedding
    query_embedding = embeddings_model.embed_query(query)

    # Stage 1a: Vector search
    vector_raw = vector_search(client, query_embedding, k=n)

    vector_by_hash = {}
    vector_ranked = []
    for doc, score in vector_raw:
        ch = _content_hash(doc.page_content)
        vector_by_hash[ch] = (doc, score)
        vector_ranked.append((ch, score))

    # Normalize vector scores to 0-1 for threshold comparison
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
        vector_by_hash = {ch: (doc, s) for ch, (doc, s) in vector_by_hash.items() if vector_norm.get(ch, 0) >= _threshold}
        vector_ranked = [(ch, s) for ch, s in vector_ranked if ch in vector_by_hash]

    # Pure vector path
    if _alpha >= 1.0:
        results = list(vector_by_hash.values())
        results.sort(key=lambda x: x[1], reverse=True)
        if reranker_enabled:
            return gemini_rerank(query, results, k)
        return results[:k]

    # Stage 1b: BM25 search
    bm25_raw = bm25_search(client, query, k=n)

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
        if reranker_enabled:
            return gemini_rerank(query, results, k)
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

    if reranker_enabled:
        return gemini_rerank(query, results, k)

    return results[:k]


def get_doc_count(client) -> int:
    """Get total document count in the index."""
    try:
        resp = client.count(index=INDEX_NAME)
        return resp["count"]
    except Exception:
        return 0
