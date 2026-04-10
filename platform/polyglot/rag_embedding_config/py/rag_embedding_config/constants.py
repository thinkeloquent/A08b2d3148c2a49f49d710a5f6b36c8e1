"""Shared constants for the embedding client subsystem."""

DEFAULT_EMBEDDINGS_BASE_URL = "https://api.openai.com/v1"
EMBEDDINGS_PATH = "/embeddings"
# OpenAI allows up to 2048 inputs per request but enforces a total token
# limit (~300K for text-embedding-3-small).  With chunk_size=1200 chars
# (~300 tokens each), 2048 × 300 = ~614K tokens which exceeds the limit.
# 500 inputs × 300 tokens = ~150K tokens — safe headroom.
MAX_EMBEDDING_BATCH_SIZE = 500
