"""Document ingestion pipeline for ChromaDB RAG Ingest.

Adapted from test/integration/RAG001/ant-design/ingest.py.
All configuration comes from the RagIngestConfig dataclass.
"""

import logging
import os
import time
import traceback
from typing import List

from fetch_httpx import HTTPStatusError
from langchain_text_splitters import RecursiveCharacterTextSplitter, Language
from langchain_chroma import Chroma
from langchain_core.documents import Document
from rag_embedding_client.exceptions import EmbeddingBatchRejectedError

from .executor import load_documents

_TAG = "[ingest]"
logger = logging.getLogger("chromadb_rag_ingest")


def process_documents(config, ignored_files: List[str] = None) -> List[Document]:
    print(f"{_TAG} Loading {config.library_slug} components from {config.source_directory}")
    documents = load_documents(
        source_dir=config.source_directory,
        library_slug=config.library_slug,
        ignored_files=ignored_files,
    )
    if not documents:
        print(f"{_TAG} No new components found.")
        return []

    print(f"{_TAG} Splitting {len(documents)} documents (chunk_size={config.chunk_size}, overlap={config.chunk_overlap})")
    split_start = time.perf_counter()

    text_splitter = RecursiveCharacterTextSplitter.from_language(
        language=Language.MARKDOWN,
        chunk_size=config.chunk_size,
        chunk_overlap=config.chunk_overlap,
    )

    texts = text_splitter.split_documents(documents)
    split_elapsed = time.perf_counter() - split_start

    total_chars = sum(len(t.page_content) for t in texts)
    avg_chunk_size = total_chars // len(texts) if texts else 0

    print(f"{_TAG} Split complete ({split_elapsed:.2f}s)")
    print(f"{_TAG}   chunks created:    {len(texts)}")
    print(f"{_TAG}   total characters:  {total_chars:,}")
    print(f"{_TAG}   avg chunk size:    {avg_chunk_size} chars")
    print(f"{_TAG}   est. tokens:       ~{total_chars // 4:,}")

    return texts


def does_vectorstore_exist(persist_dir: str) -> bool:
    return os.path.exists(os.path.join(persist_dir, "chroma.sqlite3")) or os.path.exists(
        os.path.join(persist_dir, "index")
    )


def _print_forbidden_hint(batch_num: int, n_batches: int, exc: Exception) -> None:
    """Print 403 Forbidden SRE hint and log the rejection."""
    print(f"{_TAG}   batch {batch_num}/{n_batches} REJECTED (HTTP 403 Forbidden)")
    print(f"{_TAG}     SRE HINT: Check upstream policy rules for false positives.")
    print(f"{_TAG}     This batch will be skipped — remaining batches continue.")
    logger.exception(
        "HTTP 403 Forbidden in ingest batch %d/%d. "
        "SRE HINT: Review upstream policy rules for false positives.",
        batch_num, n_batches,
    )


def _is_forbidden_rejection(exc: Exception) -> bool:
    """Return True if the exception is a 403 Forbidden rejection."""
    if isinstance(exc, EmbeddingBatchRejectedError):
        return True
    if isinstance(exc, HTTPStatusError) and exc.response.status_code == 403:
        return True
    return False


def run_ingest_sync(config, embeddings):
    """Run the full ingestion pipeline (synchronous).

    Requires a pre-built embeddings instance.
    Returns a result dict with status and counts.
    """
    persist_dir = config.persist_directory
    batch_size = 5000
    rejected_batches = 0

    print(f"\n{_TAG} {'=' * 40}")
    print(f"{_TAG} run_ingest_sync: {config.library_name} ({config.library_slug})")
    print(f"{_TAG} {'=' * 40}")
    print(f"{_TAG}   embeddings type:  {type(embeddings).__qualname__}")
    print(f"{_TAG}   persist_dir:      {persist_dir}")
    print(f"{_TAG}   source_dir:       {config.source_directory}")
    print(f"{_TAG}   batch_size:       {batch_size}")

    t_start = time.monotonic()

    if does_vectorstore_exist(persist_dir):
        print(f"{_TAG} Updating existing index at {persist_dir}")
        try:
            db = Chroma(persist_directory=persist_dir, embedding_function=embeddings, collection_name=config.collection_name)
        except Exception as e:
            print(f"{_TAG} CHROMA OPEN ERROR: {type(e).__name__}: {e}")
            traceback.print_exc()
            raise

        # Fetch existing file paths in batches to avoid ChromaDB SQL variable limit
        print(f"{_TAG} Fetching existing file paths from ChromaDB...")
        try:
            total = db._collection.count()
            print(f"{_TAG}   existing documents in collection: {total}")
        except Exception as e:
            print(f"{_TAG} CHROMA COUNT ERROR: {type(e).__name__}: {e}")
            traceback.print_exc()
            raise

        existing_files = []
        for offset in range(0, total, batch_size):
            try:
                batch_meta = db._collection.get(
                    include=["metadatas"], limit=batch_size, offset=offset,
                )
                for m in (batch_meta["metadatas"] or []):
                    if m and "file_path" in m:
                        existing_files.append(m["file_path"])
            except Exception as e:
                print(f"{_TAG} CHROMA GET ERROR at offset={offset}: {type(e).__name__}: {e}")
                traceback.print_exc()
                raise

        print(f"{_TAG}   existing file paths retrieved: {len(existing_files)}")
        unique_files = len(set(existing_files))
        print(f"{_TAG}   unique file paths: {unique_files}")

        texts = process_documents(config, existing_files)
        if texts:
            total_batches = (len(texts) + batch_size - 1) // batch_size
            print(f"{_TAG} Creating embeddings for new components ({len(texts)} chunks, {total_batches} batch(es))...")
            for i in range(0, len(texts), batch_size):
                batch = texts[i : i + batch_size]
                batch_num = i // batch_size + 1
                pct = batch_num * 100 // total_batches
                elapsed = time.monotonic() - t_start
                print(f"{_TAG}   [{pct:3d}%] Batch {batch_num}/{total_batches} ({len(batch)} chunks) — {elapsed:.1f}s elapsed")
                try:
                    db.add_documents(batch)
                except Exception as e:
                    if _is_forbidden_rejection(e):
                        _print_forbidden_hint(batch_num, total_batches, e)
                        _print_batch_debug(batch, e)
                        rejected_batches += 1
                        continue
                    print(f"{_TAG} EMBEDDING BATCH ERROR (batch {batch_num}): {type(e).__name__}: {e}")
                    _print_batch_debug(batch, e)
                    traceback.print_exc()
                    raise
    else:
        print(f"{_TAG} Creating new {config.library_slug} vector store")
        texts = process_documents(config)
        if not texts:
            return {"status": "ok", "message": "No documents found to ingest", "chunks": 0}
        total_batches = (len(texts) + batch_size - 1) // batch_size
        print(f"{_TAG} Embedding {len(texts)} chunks in {total_batches} batch(es)...")
        elapsed = time.monotonic() - t_start
        print(f"{_TAG}   [  0%] Batch 1/{total_batches} ({min(batch_size, len(texts))} chunks) — {elapsed:.1f}s elapsed")
        try:
            db = Chroma.from_documents(
                texts[:batch_size], embeddings, persist_directory=persist_dir,
                collection_name=config.collection_name,
            )
        except Exception as e:
            if _is_forbidden_rejection(e):
                _print_forbidden_hint(1, total_batches, e)
                _print_batch_debug(texts[:batch_size], e)
                rejected_batches += 1
                # Must still create the empty store for subsequent batches
                db = Chroma(persist_directory=persist_dir, embedding_function=embeddings, collection_name=config.collection_name)
            else:
                print(f"{_TAG} CHROMA CREATE ERROR (initial batch): {type(e).__name__}: {e}")
                _print_batch_debug(texts[:batch_size], e)
                traceback.print_exc()
                raise

        for i in range(batch_size, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            batch_num = i // batch_size + 1
            pct = batch_num * 100 // total_batches
            elapsed = time.monotonic() - t_start
            print(f"{_TAG}   [{pct:3d}%] Batch {batch_num}/{total_batches} ({len(batch)} chunks) — {elapsed:.1f}s elapsed")
            try:
                db.add_documents(batch)
            except Exception as e:
                if _is_forbidden_rejection(e):
                    _print_forbidden_hint(batch_num, total_batches, e)
                    _print_batch_debug(batch, e)
                    rejected_batches += 1
                    continue
                print(f"{_TAG} EMBEDDING BATCH ERROR (batch {batch_num}): {type(e).__name__}: {e}")
                _print_batch_debug(batch, e)
                traceback.print_exc()
                raise

    elapsed_total = time.monotonic() - t_start
    print(f"{_TAG}   [100%] Embedding complete — {elapsed_total:.1f}s total")

    chunk_count = len(texts) if texts else 0
    # Estimate embedding token usage and cost
    total_chars = sum(len(doc.page_content) for doc in texts) if texts else 0
    est_tokens = total_chars // 4  # ~4 chars per token
    cost_per_million = 0.02  # text-embedding-3-small: $0.02 / 1M tokens
    est_cost = est_tokens * cost_per_million / 1_000_000
    result = {
        "status": "ok",
        "message": f"Ingestion complete for {config.library_name}",
        "chunks": chunk_count,
        "est_tokens": est_tokens,
        "est_cost_usd": est_cost,
        "rejected_batches": rejected_batches,
    }

    # Verify final state
    try:
        final_count = db._collection.count()
        print(f"{_TAG}   final collection count: {final_count}")
        result["collection_count"] = final_count
    except Exception:
        pass

    # Elasticsearch ingest path
    if config.vector_backend == "elasticsearch":
        print(f"\n{_TAG} Ingesting into Elasticsearch...")
        try:
            from .elasticsearch_store import (
                get_elasticsearch_client, ensure_index, ingest_documents,
                delete_by_file_path, get_doc_count,
            )
            client = get_elasticsearch_client(config)
            ensure_index(client, config)

            if texts:
                file_paths_seen = set()
                for doc in texts:
                    fp = doc.metadata.get("file_path", "")
                    if fp and fp not in file_paths_seen:
                        file_paths_seen.add(fp)
                        delete_by_file_path(client, config, fp)

                count = ingest_documents(client, config, texts, embeddings)
                total = get_doc_count(client, config)
                print(f"{_TAG} Elasticsearch: indexed {count} chunks ({total} total in index)")
                result["elasticsearch_indexed"] = count
                result["elasticsearch_total"] = total
        except Exception as e:
            print(f"{_TAG} ELASTICSEARCH ERROR: {type(e).__name__}: {e}")
            traceback.print_exc()
            result["elasticsearch_error"] = str(e)

    print(f"\n{_TAG} --- Embedding Cost Summary ({config.library_slug}) ---")
    print(f"{_TAG}   Model:            {config.embeddings_model_name}")
    print(f"{_TAG}   Chunks embedded:  {chunk_count:,}")
    print(f"{_TAG}   Est. tokens:      {est_tokens:,}")
    print(f"{_TAG}   Est. cost:        ${est_cost:.4f}")
    print(f"{_TAG}   Wall time:        {elapsed_total:.1f}s")
    if rejected_batches:
        print(f"{_TAG}   Rejected batches: {rejected_batches} (403 Forbidden)")
    if chunk_count > 0:
        print(f"{_TAG}   Throughput:       {chunk_count / elapsed_total:.1f} chunks/s")
    print(f"{_TAG} Ingestion complete!")
    return result


def _print_batch_debug(batch: List[Document], exc: Exception) -> None:
    """Print diagnostic info about the failing batch."""
    exc_str = str(exc).lower()
    print(f"{_TAG}   batch debug:")
    print(f"{_TAG}     batch size:        {len(batch)} chunks")
    total_chars = sum(len(d.page_content) for d in batch)
    print(f"{_TAG}     total chars:       {total_chars:,}")
    print(f"{_TAG}     est tokens:        ~{total_chars // 4:,}")
    if batch:
        sizes = [len(d.page_content) for d in batch]
        print(f"{_TAG}     min chunk size:    {min(sizes)}")
        print(f"{_TAG}     max chunk size:    {max(sizes)}")
        print(f"{_TAG}     avg chunk size:    {sum(sizes) // len(sizes)}")
    if "rate" in exc_str or "limit" in exc_str or "429" in str(exc):
        print(f"{_TAG}     HINT: rate limit hit — consider reducing batch_size or adding delay")
    if "token" in exc_str or "too large" in exc_str or "413" in str(exc):
        print(f"{_TAG}     HINT: payload too large — total chars={total_chars:,}, try smaller batch_size")
    if "timeout" in exc_str:
        print(f"{_TAG}     HINT: timeout — batch may be too large or endpoint too slow")


async def run_ingest(config, embeddings=None):
    """Async wrapper for CLI usage — resolves embeddings if needed, then
    delegates to run_ingest_sync."""
    if embeddings is None:
        from chromadb_rag_ingest.embedding_client import get_embeddings
        embeddings = await get_embeddings(config)
    return run_ingest_sync(config, embeddings)
