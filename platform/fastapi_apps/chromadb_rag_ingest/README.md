# ChromaDB RAG Ingest

Document ingestion and hybrid search API for the Ant Design component library. Indexes source code into ChromaDB (and optionally Elasticsearch), then exposes search and LLM-powered query endpoints.

Base URL: `http://localhost:52000/apps/chromadb_rag_ingest`

## Endpoints

### GET /

App info and current configuration.

**Response:**

```json
{
  "app": "chromadb_rag_ingest",
  "library": "Ant Design",
  "slug": "ant-design",
  "persist_directory": "fastapi_apps/chromadb_rag_ingest/data/chroma",
  "embeddings_model": "all-MiniLM-L6-v2",
  "vector_backend": "chroma",
  "elasticsearch_available": false,
  "redis_available": false,
  "chunk_count": 4200,
  "pipeline": {
    "alpha": 0.5,
    "threshold": 0.0,
    "reranker_enabled": false,
    "reranker_model": "gemini-2.0-flash",
    "retrieve_n": 50
  }
}
```

### POST /ingest

Run the ingestion pipeline. Indexes source documents into ChromaDB (and Elasticsearch if configured). Rebuilds the BM25 index and invalidates the search cache afterward.

**Request body** (optional):

| Field   | Type | Default | Description                |
|---------|------|---------|----------------------------|
| `force` | bool | `false` | Reserved for future use    |

**Response:**

```json
{
  "status": "ok",
  "message": "Ingestion complete for Ant Design",
  "chunks": 4200
}
```

### POST /search

Hybrid search combining vector similarity and BM25 text matching via Reciprocal Rank Fusion. Returns ranked results with code/text separation and component detection. No LLM call is made.

**Request body:**

| Field            | Type   | Default      | Description                                                                 |
|------------------|--------|--------------|-----------------------------------------------------------------------------|
| `query`          | string | *required*   | Search query text                                                           |
| `top_k`          | int    | `6`          | Number of results to return                                                 |
| `alpha`          | float  | config value | Hybrid weight: `0.0` = pure BM25, `1.0` = pure vector, `0.5` = equal blend |
| `threshold`      | float  | config value | Minimum similarity score (`0.0` = disabled)                                 |
| `reranker`       | bool   | config value | Enable Gemini Flash listwise reranker                                       |
| `code_mode`      | string | `"regex"`    | Code/text separation method: `"regex"` or `"llm"`                           |
| `component_mode` | string | `"metadata"` | Component detection: `"metadata"`, `"parse"`, or `"llm"`                    |
| `backend`        | string | config value | Vector backend override: `"chroma"` or `"elasticsearch"`                    |

**Example:**

```bash
curl -X POST http://localhost:52000/apps/chromadb_rag_ingest/search \
  -H 'Content-Type: application/json' \
  -d '{"query": "button component", "top_k": 5}'
```

**Response:**

```json
{
  "query": "button component",
  "components": ["button", "space"],
  "results": [
    {
      "content": "truncated chunk text...",
      "code_parts": ["import { Button } from 'antd';"],
      "text_parts": ["The Button component supports..."],
      "metadata": {
        "component": "button",
        "file_name": "index.tsx",
        "file_path": "/path/to/button/index.tsx",
        "library": "ant-design"
      },
      "score": 0.0163
    }
  ],
  "_cached": false
}
```

### POST /query

Search + LLM: retrieves relevant chunks via hybrid search, then asks an LLM to synthesize an answer from the context.

**Request body:**

All fields from `/search`, plus:

| Field      | Type   | Default      | Description                                          |
|------------|--------|--------------|------------------------------------------------------|
| `provider` | string | config value | LLM provider: `"openai"`, `"anthropic"`, or `"gemini"` |

**Example:**

```bash
curl -X POST http://localhost:52000/apps/chromadb_rag_ingest/query \
  -H 'Content-Type: application/json' \
  -d '{"query": "how to use the Button component with icons", "provider": "openai"}'
```

**Response:**

Same as `/search`, with an additional `"answer"` field containing the LLM-generated response.

### POST /llm

Direct LLM call with user-provided context. Does not perform any search.

**Request body:**

| Field           | Type   | Default      | Description                                          |
|-----------------|--------|--------------|------------------------------------------------------|
| `question`      | string | *required*   | Question to ask the LLM                              |
| `context`       | string | *required*   | Context text to provide to the LLM                   |
| `provider`      | string | config value | LLM provider: `"openai"`, `"anthropic"`, or `"gemini"` |
| `system_prompt` | string | `null`       | Custom system prompt (overrides the default)          |

**Response:**

```json
{
  "question": "What props does Button accept?",
  "answer": "Based on the provided context..."
}
```

## Environment Variables

### Core

| Variable                  | Default                  | Description                              |
|---------------------------|--------------------------|------------------------------------------|
| `CHROMADB_RAG_INGEST_ENABLED`  | `true`                   | Enable/disable the app at startup        |
| `RAG_VECTOR_BACKEND`      | `chroma`                 | `chroma` or `elasticsearch`              |
| `RAG_PERSIST_DIRECTORY`   | `<app>/data/chroma`      | ChromaDB persistence path                |
| `RAG_SOURCE_DIRECTORY`    | `<DATASET_ROOT>/ant-design/components` | Source directory to ingest |
| `DATASET_ROOT`            | `/Users/Shared/autoload/mta-v800/dataset/repos` | Root for source repos |
| `EMBEDDINGS_MODEL_NAME`   | `all-MiniLM-L6-v2`      | HuggingFace sentence-transformers model  |

### Chunking

| Variable       | Default | Description            |
|----------------|---------|------------------------|
| `CHUNK_SIZE`   | `1200`  | Text splitter chunk size   |
| `CHUNK_OVERLAP`| `150`   | Text splitter chunk overlap |

### Search Pipeline

| Variable           | Default | Description                                              |
|--------------------|---------|----------------------------------------------------------|
| `HYBRID_ALPHA`     | `0.5`   | Vector/BM25 blend: `0.0` = BM25 only, `1.0` = vector only |
| `SCORE_THRESHOLD`  | `0.0`   | Minimum similarity score (`0.0` = disabled)              |
| `RERANKER_ENABLED` | `false` | Enable Gemini Flash listwise reranker                    |
| `RERANKER_MODEL`   | `gemini-2.0-flash` | Model for reranking step                     |
| `RETRIEVE_N`       | `50`    | Stage-1 retrieval count before rerank/fusion             |
| `TOP_K`            | `6`     | Default number of results returned                       |

### LLM

| Variable           | Default                        | Description             |
|--------------------|--------------------------------|-------------------------|
| `LLM_PROVIDER`     | `openai`                       | `openai`, `anthropic`, or `gemini` |
| `OPENAI_MODEL`     | `gpt-4o`                       | OpenAI model name       |
| `ANTHROPIC_MODEL`  | `claude-sonnet-4-5-20250514`   | Anthropic model name    |
| `GEMINI_MODEL`     | `gemini-2.0-flash`             | Gemini model name       |
| `OPENAI_API_KEY`   | -                              | Required for OpenAI     |
| `ANTHROPIC_API_KEY`| -                              | Required for Anthropic  |
| `GEMINI_API_KEY`   | -                              | Required for Gemini     |

### Elasticsearch (optional)

| Variable            | Default     | Description                |
|---------------------|-------------|----------------------------|
| `ELASTIC_DB_HOST`   | `localhost` | Elasticsearch host         |
| `ELASTIC_DB_PORT`   | `53300`     | Elasticsearch port         |
| `ELASTIC_DB_SCHEME` | `https`     | Connection scheme          |
| `RAG_ES_INDEX`      | `rag-ant-design` | Index name            |

### Redis Cache (optional)

| Variable     | Default     | Description   |
|--------------|-------------|---------------|
| `REDIS_HOST` | `localhost` | Redis host    |
| `REDIS_PORT` | `53200`     | Redis port    |

Cache TTLs: search results = 1 hour, LLM answers = 24 hours. Cache keys are prefixed with `chromadb_rag_ingest:`.

## Architecture

```
fastapi_apps/chromadb_rag_ingest/
├── __init__.py              # Lazy exports: RagIngestConfig, create_router
├── config.py                # RagIngestConfig dataclass (env var resolution)
├── models.py                # Pydantic request models
├── router.py                # create_router() factory — all endpoints
├── services/
│   ├── ingest.py            # run_ingest() — document loading + chunking + indexing
│   ├── query.py             # RagQueryEngine class + pure utility functions
│   ├── elasticsearch_store.py  # Elasticsearch kNN + BM25 backend
│   └── cache.py             # CacheService class (Redis)
└── data/                    # Runtime — ChromaDB persistence (gitignored)

fastapi_server/config/lifecycle/
└── 600_chromadb_rag_ingest.lifecycle.py  # onStartup/onShutdown hooks
```

The lifecycle hook (`600_chromadb_rag_ingest.lifecycle.py`) initializes all services at startup and mounts the router at `/apps/chromadb_rag_ingest`. Dependencies are injected into the router via closure — no module-level globals.

## Search Pipeline

1. **Vector search** (ChromaDB similarity or Elasticsearch kNN) retrieves top-N candidates
2. **BM25 search** (in-memory rank_bm25 or Elasticsearch text match) retrieves top-N candidates
3. **Reciprocal Rank Fusion** blends both result sets weighted by `alpha`
4. **Score threshold** filters low-confidence results (optional)
5. **Gemini reranker** re-orders results via LLM listwise ranking (optional)
6. **Post-processing** separates code from text (3-tier: file extension, markdown, regex) and detects components from metadata/code parsing
