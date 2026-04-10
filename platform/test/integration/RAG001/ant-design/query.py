#!/usr/bin/env python3
"""
Interactive RAG Query Interface for ant-design
Search components and ask LLM-powered questions against the indexed vector store.

Usage:
    python query.py
    PERSIST_DIRECTORY=db_ant_design LLM_PROVIDER=anthropic python query.py

Environment variables:
    PERSIST_DIRECTORY   - ChromaDB path (default: db_ant_design)
    EMBEDDINGS_MODEL_NAME - HuggingFace model (default: all-MiniLM-L6-v2)
    LLM_PROVIDER        - "openai", "anthropic", or "gemini" (default: openai)
    OPENAI_API_KEY       - Required if using OpenAI
    ANTHROPIC_API_KEY    - Required if using Anthropic
    OPENAI_MODEL         - OpenAI model name (default: gpt-4o)
    ANTHROPIC_MODEL      - Anthropic model name (default: claude-sonnet-4-5-20250514)
    GEMINI_API_KEY        - Required if using Gemini
    GEMINI_MODEL          - Gemini model name (default: gemini-2.0-flash)
    TOP_K                - Number of chunks to retrieve (default: 6)
    HYBRID_ALPHA         - 0.0=pure BM25, 1.0=pure vector, 0.5=equal (default: 0.5)
    SCORE_THRESHOLD      - Minimum similarity score, 0.0=disabled (default: 0.0)
    RERANKER_ENABLED     - Enable Gemini Flash listwise reranker (default: false)
    RERANKER_MODEL       - Model for reranking step (default: gemini-2.0-flash)
    RETRIEVE_N           - Stage-1 retrieval count before rerank (default: 50)
"""
import os
import re
import sys
import json
import hashlib
import readline
from typing import List, Tuple, Optional

import numpy as np
from rank_bm25 import BM25Okapi

from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document

LIBRARY_NAME = "Ant Design"
LIBRARY_SLUG = "ant-design"

COLLECTION_NAME = "chromadb-rag-ingest-manager"

# --- CONFIGURATION ---
persist_directory = os.environ.get("PERSIST_DIRECTORY", "db_ant_design")
embeddings_model_name = os.environ.get("EMBEDDINGS_MODEL_NAME", "all-MiniLM-L6-v2")
llm_provider = os.environ.get("LLM_PROVIDER", "openai")
openai_model = os.environ.get("OPENAI_MODEL", "gpt-4o")
anthropic_model = os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-5-20250514")
gemini_model = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
top_k = int(os.environ.get("TOP_K", "6"))

# --- HYBRID SEARCH CONFIG ---
hybrid_alpha = float(os.environ.get("HYBRID_ALPHA", "0.5"))
score_threshold = float(os.environ.get("SCORE_THRESHOLD", "0.0"))
reranker_enabled = os.environ.get("RERANKER_ENABLED", "false").lower() in ("true", "1", "yes")
reranker_model = os.environ.get("RERANKER_MODEL", "gemini-2.0-flash")
retrieve_n = int(os.environ.get("RETRIEVE_N", "50"))

# --- BACKEND CONFIG ---
vector_backend = os.environ.get("VECTOR_BACKEND", "chroma")  # "chroma" | "opensearch"

# --- BM25 GLOBALS ---
_bm25_index: Optional[BM25Okapi] = None
_bm25_corpus: List[dict] = []  # [{id, text, metadata, content_hash}]


# --- LLM CLIENTS (lazy-loaded) ---
_openai_client = None
_anthropic_client = None
_gemini_client = None


def get_openai_client():
    global _openai_client
    if _openai_client is None:
        try:
            from openai import OpenAI
            _openai_client = OpenAI()
        except ImportError:
            print("Error: openai package not installed. Run: pip install openai")
            sys.exit(1)
        except Exception as e:
            print(f"Error initializing OpenAI client: {e}")
            sys.exit(1)
    return _openai_client


def get_anthropic_client():
    global _anthropic_client
    if _anthropic_client is None:
        try:
            import anthropic
            _anthropic_client = anthropic.Anthropic()
        except ImportError:
            print("Error: anthropic package not installed. Run: pip install anthropic")
            sys.exit(1)
        except Exception as e:
            print(f"Error initializing Anthropic client: {e}")
            sys.exit(1)
    return _anthropic_client


def get_gemini_client():
    global _gemini_client
    if _gemini_client is None:
        try:
            from openai import OpenAI
            api_key = os.environ.get("GEMINI_API_KEY")
            if not api_key:
                print("Error: GEMINI_API_KEY environment variable is required for Gemini provider.")
                sys.exit(1)
            _gemini_client = OpenAI(
                api_key=api_key,
                base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
            )
        except ImportError:
            print("Error: openai package not installed. Run: pip install openai")
            sys.exit(1)
        except Exception as e:
            print(f"Error initializing Gemini client: {e}")
            sys.exit(1)
    return _gemini_client


def _content_hash(text: str) -> str:
    return hashlib.md5(text.encode()).hexdigest()


# --- BM25 INDEX ---

def _build_bm25_index(db: Chroma):
    """Build BM25 index from all documents in the ChromaDB collection."""
    global _bm25_index, _bm25_corpus

    collection = db.get(include=["documents", "metadatas"])
    ids = collection["ids"]
    documents = collection["documents"]
    metadatas = collection["metadatas"]

    _bm25_corpus = []
    tokenized = []
    for i, (doc_id, text, meta) in enumerate(zip(ids, documents, metadatas)):
        if not text:
            continue
        ch = _content_hash(text)
        _bm25_corpus.append({"id": doc_id, "text": text, "metadata": meta or {}, "content_hash": ch})
        tokenized.append(text.lower().split())

    if tokenized:
        _bm25_index = BM25Okapi(tokenized)
    else:
        _bm25_index = None

    return len(_bm25_corpus)


# --- RRF FUSION ---

def reciprocal_rank_fusion(
    vector_results: List[Tuple[str, float]],
    bm25_results: List[Tuple[str, float]],
    alpha: float,
    k_rrf: int = 60,
) -> List[Tuple[str, float]]:
    """
    Weighted Reciprocal Rank Fusion.

    vector_results: [(content_hash, score), ...] sorted by score desc
    bm25_results:   [(content_hash, score), ...] sorted by score desc
    alpha: weight for vector (1-alpha for BM25)
    k_rrf: RRF constant (default 60)

    Returns: [(content_hash, fused_score), ...] sorted by fused_score desc
    """
    scores = {}

    for rank, (ch, _score) in enumerate(vector_results):
        scores[ch] = scores.get(ch, 0.0) + alpha * (1.0 / (k_rrf + rank + 1))

    for rank, (ch, _score) in enumerate(bm25_results):
        scores[ch] = scores.get(ch, 0.0) + (1.0 - alpha) * (1.0 / (k_rrf + rank + 1))

    return sorted(scores.items(), key=lambda x: x[1], reverse=True)


# --- GEMINI RERANKER ---

def gemini_rerank(query: str, candidates: List[Tuple[Document, float]], k: int) -> List[Tuple[Document, float]]:
    """
    Listwise reranking via Gemini Flash.
    Caps at 30 candidates, 600 chars each.
    Returns top-k reranked results. Falls back to original order on any error.
    """
    if not candidates:
        return candidates

    cap = min(len(candidates), 30)
    capped = candidates[:cap]

    chunks_text = ""
    for i, (doc, _score) in enumerate(capped):
        snippet = doc.page_content[:600].replace("\n", " ").strip()
        chunks_text += f"[{i}] {snippet}\n\n"

    prompt = (
        f"You are a relevance ranker. Given a query and {cap} text chunks, "
        f"rank them by relevance to the query. Return ONLY a JSON array of indices "
        f"from most relevant to least relevant. Example: [3, 0, 7, 1, ...]\n\n"
        f"Query: {query}\n\nChunks:\n{chunks_text}"
    )

    try:
        from openai import OpenAI
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            return candidates[:k]
        client = OpenAI(
            api_key=api_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        )
        response = client.chat.completions.create(
            model=reranker_model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
        )
        content = response.choices[0].message.content.strip()

        # Try direct JSON parse first
        try:
            indices = json.loads(content)
        except json.JSONDecodeError:
            # Regex fallback: find first JSON array in response
            match = re.search(r'\[[\d,\s]+\]', content)
            if match:
                indices = json.loads(match.group())
            else:
                return candidates[:k]

        # Validate and reorder
        if not isinstance(indices, list):
            return candidates[:k]

        reranked = []
        seen = set()
        for idx in indices:
            if isinstance(idx, int) and 0 <= idx < cap and idx not in seen:
                seen.add(idx)
                reranked.append(capped[idx])

        # Append any candidates not in the reranked list
        for i, c in enumerate(capped):
            if i not in seen:
                reranked.append(c)

        return reranked[:k]

    except SystemExit:
        return candidates[:k]
    except Exception:
        return candidates[:k]


# --- HYBRID SEARCH ---

def hybrid_search(
    db,
    query: str,
    k: int,
    alpha: Optional[float] = None,
    threshold: Optional[float] = None,
    use_reranker: Optional[bool] = None,
    backend: Optional[str] = None,
    os_client=None,
    embeddings_model=None,
) -> List[Tuple[Document, float]]:
    """
    Main hybrid search pipeline.

    1. Vector search (top-N) + BM25 search (top-N)
    2. RRF fusion (weighted by alpha)
    3. Score threshold filter (on vector scores)
    4. Optional Gemini reranker
    5. Return top-K results

    Dispatches to OpenSearch or ChromaDB based on backend parameter or VECTOR_BACKEND env.
    """
    _backend = backend or vector_backend
    if _backend == "opensearch" and os_client is not None and embeddings_model is not None:
        from opensearch_store import hybrid_search_opensearch
        return hybrid_search_opensearch(os_client, query, embeddings_model, k, alpha, threshold)

    _alpha = alpha if alpha is not None else hybrid_alpha
    _threshold = threshold if threshold is not None else score_threshold
    _reranker = use_reranker if use_reranker is not None else reranker_enabled
    n = retrieve_n

    # --- Stage 1a: Vector search ---
    vector_raw = db.similarity_search_with_relevance_scores(query, k=n)

    # Build content_hash -> (Document, score) lookup + ordered list
    vector_by_hash = {}
    vector_ranked = []
    for doc, score in vector_raw:
        ch = _content_hash(doc.page_content)
        vector_by_hash[ch] = (doc, score)
        vector_ranked.append((ch, score))

    # Apply score threshold to vector candidates
    if _threshold > 0.0:
        vector_by_hash = {ch: (doc, s) for ch, (doc, s) in vector_by_hash.items() if s >= _threshold}
        vector_ranked = [(ch, s) for ch, s in vector_ranked if ch in vector_by_hash]

    # --- Pure vector path (alpha=1.0) ---
    if _alpha >= 1.0 or _bm25_index is None:
        results = [(doc, score) for doc, score in vector_by_hash.values()]
        results.sort(key=lambda x: x[1], reverse=True)
        if _reranker:
            return gemini_rerank(query, results, k)
        return results[:k]

    # --- Stage 1b: BM25 search ---
    query_tokens = query.lower().split()
    bm25_scores = _bm25_index.get_scores(query_tokens)
    top_bm25_idx = np.argsort(bm25_scores)[::-1][:n]

    bm25_by_hash = {}
    bm25_ranked = []
    for idx in top_bm25_idx:
        idx = int(idx)
        if bm25_scores[idx] <= 0:
            break
        entry = _bm25_corpus[idx]
        ch = entry["content_hash"]
        doc = Document(page_content=entry["text"], metadata=entry["metadata"])
        bm25_by_hash[ch] = (doc, float(bm25_scores[idx]))
        bm25_ranked.append((ch, float(bm25_scores[idx])))

    # --- Pure BM25 path (alpha=0.0) ---
    if _alpha <= 0.0:
        results = [(doc, score) for doc, score in bm25_by_hash.values()]
        results.sort(key=lambda x: x[1], reverse=True)
        if _reranker:
            return gemini_rerank(query, results, k)
        return results[:k]

    # --- Stage 2: RRF Fusion ---
    fused = reciprocal_rank_fusion(vector_ranked, bm25_ranked, _alpha)

    # Merge doc lookups (prefer vector version for score accuracy)
    all_docs = {**bm25_by_hash, **vector_by_hash}

    results = []
    seen = set()
    for ch, fused_score in fused:
        if ch in seen:
            continue
        seen.add(ch)
        if ch in all_docs:
            doc, original_score = all_docs[ch]
            results.append((doc, fused_score))

    # --- Stage 3: Optional reranker ---
    if _reranker:
        return gemini_rerank(query, results, k)

    return results[:k]


# ---------------------------------------------------------------------------
# Post-processing pipeline: code/text separation + component detection
# ---------------------------------------------------------------------------

import markdown
from html import unescape as _html_unescape

# --- Code/Text Separation (3-tier: File Extension → Markdown → Regex) ---

_CODE_FILE_EXTENSIONS = frozenset({
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
    ".css", ".less", ".scss", ".sass",
    ".json", ".yaml", ".yml",
    ".sh", ".bash", ".zsh",
    ".py", ".rb", ".java", ".go", ".rs", ".c", ".cpp", ".h", ".hpp",
    ".vue", ".svelte", ".astro",
})

_HEURISTIC_CODE_RE = re.compile(
    r"^("
    r"import\s+.+\s+from\s+['\"]"              # import … from '…'
    r"|export\s+(?:default\s+)?(?:function|const|class|interface|type)\b"
    r"|(?:const|let|var)\s+\w+\s*="             # const foo =
    r"|function\s+\w+\s*\("                     # function foo(
    r"|return\s*[\(\<]"                          # return ( or return <
    r"|<[A-Z][a-zA-Z0-9]*"                      # <ComponentName
    r"|</[A-Z][a-zA-Z0-9]*"                     # </ComponentName
    r"|(?:interface|type)\s+[A-Z]\w*"           # interface Foo / type Foo
    r"|[}\])];\s*$"                              # closing braces/brackets
    r"|[}\])]\s*$"                               # closing braces/brackets (no semi)
    r"|\w+\.\w+\("                              # something.method(
    r"|@\w+"                                     # @decorator
    r"|(?:props|state|this)\."                   # props./state./this.
    r")",
    re.MULTILINE,
)

_PRE_CODE_RE = re.compile(r"<pre><code[^>]*>([\s\S]*?)</code></pre>")


def _heuristic_split_lines(text: str) -> dict:
    """Tier 3: apply heuristic regex line-by-line to split code from prose."""
    lines = text.split("\n")
    code_parts: list[str] = []
    text_parts: list[str] = []
    cur_code: list[str] = []
    cur_text: list[str] = []
    in_code = False

    def flush_code():
        nonlocal cur_code
        if cur_code:
            while cur_code and not cur_code[-1].strip():
                cur_code.pop()
            if cur_code:
                code_parts.append("\n".join(cur_code))
            cur_code = []

    def flush_text():
        nonlocal cur_text
        if cur_text:
            text_parts.append("\n".join(cur_text))
            cur_text = []

    for line in lines:
        stripped = line.strip()
        if _HEURISTIC_CODE_RE.match(stripped):
            if not in_code:
                flush_text()
                in_code = True
            cur_code.append(line.rstrip())
        elif in_code and stripped == "":
            cur_code.append("")
        elif in_code:
            flush_code()
            in_code = False
            cur_text.append(line.rstrip())
        else:
            cur_text.append(line.rstrip())

    if in_code:
        flush_code()
    flush_text()
    return {"code_parts": code_parts, "text_parts": text_parts}


def separate_code_text_regex(content: str, file_name: str = "") -> dict:
    """
    3-tier code/text separation:
      1. File extension — code files → entire content is code
      2. Markdown — parse fenced & indented code blocks via `markdown` package
      3. Regex heuristics — catch remaining code patterns in prose blocks
    """
    content = content.strip()
    if not content:
        return {"code_parts": [], "text_parts": []}

    # --- Tier 1: File extension ---
    if file_name:
        _, ext = os.path.splitext(file_name)
        if ext.lower() in _CODE_FILE_EXTENSIONS:
            return {"code_parts": [content], "text_parts": []}

    # --- Tier 2: Markdown fenced / indented code blocks ---
    md = markdown.Markdown(extensions=["fenced_code"])
    html_out = md.convert(content)

    code_parts: list[str] = []
    text_parts: list[str] = []

    # Split HTML into <pre><code> segments vs everything else
    segments = re.split(r"(<pre><code[^>]*>[\s\S]*?</code></pre>)", html_out)

    for seg in segments:
        seg = seg.strip()
        if not seg:
            continue

        m = _PRE_CODE_RE.match(seg)
        if m:
            code = _html_unescape(m.group(1)).strip()
            if code:
                code_parts.append(code)
        else:
            # Convert block-level HTML tags to newlines, strip inline tags
            plain = re.sub(
                r"</(?:p|div|h[1-6]|li|blockquote|ul|ol|tr|td|th)>", "\n", seg
            )
            plain = re.sub(r"<(?:br|hr)\s*/?>", "\n", plain)
            plain = re.sub(r"<[^>]+>", "", plain)
            plain = _html_unescape(plain).strip()
            if not plain:
                continue

            # --- Tier 3: Heuristic regex on remaining text ---
            sub = _heuristic_split_lines(plain)
            code_parts.extend(sub["code_parts"])
            text_parts.extend(sub["text_parts"])

    return {"code_parts": code_parts, "text_parts": text_parts}


# --- Code/Text Separation (LLM) ---

def _ask_llm_json(prompt: str, system: str, provider: str = None) -> object:
    """Ask an LLM and parse the JSON response. Returns parsed JSON or raises."""
    prov = provider or llm_provider
    if prov == "anthropic":
        client = get_anthropic_client()
        resp = client.messages.create(
            model=anthropic_model, max_tokens=4096, system=system,
            messages=[{"role": "user", "content": prompt}], temperature=0.0,
        )
        raw = resp.content[0].text
    elif prov == "gemini":
        client = get_gemini_client()
        resp = client.chat.completions.create(
            model=gemini_model,
            messages=[{"role": "system", "content": system}, {"role": "user", "content": prompt}],
            temperature=0.0,
        )
        raw = resp.choices[0].message.content
    else:
        client = get_openai_client()
        resp = client.chat.completions.create(
            model=openai_model,
            messages=[{"role": "system", "content": system}, {"role": "user", "content": prompt}],
            temperature=0.0,
        )
        raw = resp.choices[0].message.content

    raw = raw.strip()
    # Try direct parse
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass
    # Extract JSON from markdown code block
    match = re.search(r"```(?:json)?\s*\n?([\s\S]*?)```", raw)
    if match:
        return json.loads(match.group(1).strip())
    raise ValueError(f"Could not parse JSON from LLM response: {raw[:200]}")


def separate_code_text_llm(
    contents: list[str], provider: str = None, file_names: list[str] = None,
) -> list[dict]:
    """
    Batch LLM code/text separation. Sends all chunks in one prompt.
    Returns list of {"code_parts": [...], "text_parts": [...]} per chunk.
    Code-file chunks (by extension) are short-circuited, only non-code files go to LLM.
    Falls back to regex on error.
    """
    if not contents:
        return []
    fnames = file_names or [""] * len(contents)

    # Short-circuit code files; collect non-code indices for LLM
    results: list[dict | None] = [None] * len(contents)
    llm_indices: list[int] = []
    llm_contents: list[str] = []
    for i, (c, fn) in enumerate(zip(contents, fnames)):
        if fn:
            _, ext = os.path.splitext(fn)
            if ext.lower() in _CODE_FILE_EXTENSIONS:
                ct = c.strip()
                results[i] = {"code_parts": [ct] if ct else [], "text_parts": []}
                continue
        llm_indices.append(i)
        llm_contents.append(c)

    # LLM call for non-code chunks
    if llm_contents:
        system = "You separate code from text in documentation chunks. Return valid JSON only."
        delimited = ""
        for j, c in enumerate(llm_contents):
            delimited += f"===CHUNK {j}===\n{c}\n\n"
        prompt = (
            "For each chunk below, separate code snippets from prose text.\n"
            "Return a JSON array where each element is {\"code_parts\": [...], \"text_parts\": [...]}.\n"
            "Code includes imports, function definitions, JSX, type annotations, etc.\n"
            "Text includes descriptions, explanations, documentation prose.\n"
            "Preserve the original text exactly — do not summarize.\n\n"
            + delimited
        )
        try:
            parsed = _ask_llm_json(prompt, system, provider)
            if isinstance(parsed, list) and len(parsed) == len(llm_contents):
                for j, idx in enumerate(llm_indices):
                    results[idx] = {
                        "code_parts": parsed[j].get("code_parts", []),
                        "text_parts": parsed[j].get("text_parts", []),
                    }
        except Exception:
            pass

    # Fallback: regex for any that didn't get filled
    for i in range(len(contents)):
        if results[i] is None:
            results[i] = separate_code_text_regex(contents[i], fnames[i])

    return results


def separate_code_text(
    content: str, mode: str = "regex", provider: str = None, file_name: str = "",
) -> dict:
    """Dispatcher: separate code from text using the chosen mode."""
    if mode == "llm":
        results = separate_code_text_llm([content], provider, [file_name])
        return results[0] if results else {"code_parts": [], "text_parts": []}
    return separate_code_text_regex(content, file_name)


# --- Component Detection (Metadata) ---

def detect_components_metadata(results: list) -> list[str]:
    """Extract unique component names from result metadata."""
    components = set()
    for doc, _score in results:
        comp = doc.metadata.get("component")
        if comp:
            components.add(comp.lower().strip())
    return sorted(components)


# --- Component Detection (Code Parsing) ---

_JSX_TAG_RE = re.compile(r"<([A-Z][a-zA-Z0-9]*(?:\.[A-Z][a-zA-Z0-9]*)?)")
_ANTD_IMPORT_RE = re.compile(r"import\s*\{([^}]+)\}\s*from\s*['\"]antd['\"]")
_ANTD_SCOPE_RE = re.compile(r"import\s*\{([^}]+)\}\s*from\s*['\"]@ant-design/")


def detect_components_parse(results: list) -> list[str]:
    """Detect components from metadata + code parsing of chunk content."""
    components = set(detect_components_metadata(results))
    for doc, _score in results:
        text = doc.page_content
        for m in _JSX_TAG_RE.finditer(text):
            components.add(m.group(1).lower())
        for m in _ANTD_IMPORT_RE.finditer(text):
            for name in m.group(1).split(","):
                name = name.strip()
                if name:
                    components.add(name.lower())
        for m in _ANTD_SCOPE_RE.finditer(text):
            for name in m.group(1).split(","):
                name = name.strip()
                if name:
                    components.add(name.lower())
    return sorted(components)


# --- Component Detection (LLM) ---

def detect_components_llm(results: list, provider: str = None) -> list[str]:
    """Detect components via LLM analysis. Falls back to parse on error."""
    components = set(detect_components_parse(results))
    # Build context snippet (~3000 chars max)
    snippets = []
    total = 0
    for doc, _score in results:
        chunk = doc.page_content[:500]
        if total + len(chunk) > 3000:
            break
        snippets.append(chunk)
        total += len(chunk)
    combined = "\n---\n".join(snippets)
    system = "You identify Ant Design components. Return valid JSON only."
    prompt = (
        "Identify ALL Ant Design (antd) components referenced in the following text.\n"
        "Include components mentioned by name, imported, or used as JSX tags.\n"
        "Return a JSON array of lowercase component names. Example: [\"button\", \"form\", \"input\"]\n\n"
        + combined
    )
    try:
        result = _ask_llm_json(prompt, system, provider)
        if isinstance(result, list):
            for name in result:
                if isinstance(name, str):
                    components.add(name.lower().strip())
    except Exception:
        pass
    return sorted(components)


def detect_components(results: list, mode: str = "metadata", provider: str = None) -> list[str]:
    """Dispatcher: detect components using the chosen mode."""
    if mode == "llm":
        return detect_components_llm(results, provider)
    if mode == "parse":
        return detect_components_parse(results)
    return detect_components_metadata(results)


# --- Pipeline Orchestrator ---

def post_process_results(
    results: list,
    code_mode: str = "regex",
    component_mode: str = "metadata",
    provider: str = None,
) -> dict:
    """
    Post-process hybrid search results:
    1. Separate code from text in each chunk
    2. Detect components across all results
    Returns {"components": [...], "results": [{content, code_parts, text_parts, metadata, score}]}
    """
    # Component detection runs on full page_content for accuracy
    components = detect_components(results, mode=component_mode, provider=provider)

    # Code/text separation — use file extension + markdown + regex (or LLM)
    truncated_contents = [doc.page_content[:500] for doc, _score in results]
    file_names = [doc.metadata.get("file_name", "") for doc, _score in results]

    if code_mode == "llm":
        separations = separate_code_text_llm(truncated_contents, provider, file_names)
    else:
        separations = [
            separate_code_text_regex(c, fn)
            for c, fn in zip(truncated_contents, file_names)
        ]

    processed = []
    for i, (doc, score) in enumerate(results):
        sep = separations[i] if i < len(separations) else {"code_parts": [], "text_parts": []}
        processed.append({
            "content": truncated_contents[i],
            "code_parts": sep["code_parts"],
            "text_parts": sep["text_parts"],
            "metadata": doc.metadata,
            "score": score,
        })

    return {"components": components, "results": processed}


def format_metadata(meta: dict) -> str:
    """Format document metadata for display."""
    parts = []
    if "component" in meta:
        parts.append(f"component={meta['component']}")
    if "file_name" in meta:
        parts.append(meta["file_name"])
    if "file_path" in meta:
        # Show relative path from repo root
        path = meta["file_path"]
        if LIBRARY_SLUG in path:
            path = path.split(LIBRARY_SLUG + "/", 1)[-1]
        parts.append(path)
    return " | ".join(parts)


def search_documents(db: Chroma, query: str, k: int) -> List[Document]:
    """Perform hybrid search and display results."""
    results = hybrid_search(db, query, k)
    if not results:
        print("  No results found.")
        return []

    docs = []
    for i, (doc, score) in enumerate(results, 1):
        print(f"\n  [{i}] (score: {score:.4f}) {format_metadata(doc.metadata)}")
        preview = doc.page_content[:200].replace("\n", " ").strip()
        print(f"      {preview}...")
        docs.append(doc)
    return docs


def build_context(docs: List[Document]) -> str:
    """Build context string from retrieved documents."""
    context_parts = []
    for i, doc in enumerate(docs, 1):
        header = format_metadata(doc.metadata)
        context_parts.append(f"--- Source {i}: {header} ---\n{doc.page_content}")
    return "\n\n".join(context_parts)


SYSTEM_PROMPT = f"""You are an expert on the {LIBRARY_NAME} component library. You answer questions
about components, props, patterns, and usage based on the source code provided as context.

Rules:
- Only answer based on the provided context. If the context doesn't contain enough information, say so.
- When referencing components, mention the file path so the user can find it.
- Provide code examples when relevant.
- Be concise but thorough."""


def ask_openai(question: str, context: str, system_prompt: str | None = None) -> str:
    client = get_openai_client()
    sys_msg = system_prompt or SYSTEM_PROMPT
    response = client.chat.completions.create(
        model=openai_model,
        messages=[
            {"role": "system", "content": sys_msg},
            {"role": "user", "content": f"Context from {LIBRARY_NAME} source code:\n\n{context}\n\n---\n\nQuestion: {question}"},
        ],
        temperature=0.2,
    )
    return response.choices[0].message.content


def ask_anthropic(question: str, context: str, system_prompt: str | None = None) -> str:
    client = get_anthropic_client()
    sys_msg = system_prompt or SYSTEM_PROMPT
    response = client.messages.create(
        model=anthropic_model,
        max_tokens=4096,
        system=sys_msg,
        messages=[
            {"role": "user", "content": f"Context from {LIBRARY_NAME} source code:\n\n{context}\n\n---\n\nQuestion: {question}"},
        ],
        temperature=0.2,
    )
    return response.content[0].text


def ask_gemini(question: str, context: str, system_prompt: str | None = None) -> str:
    client = get_gemini_client()
    sys_msg = system_prompt or SYSTEM_PROMPT
    response = client.chat.completions.create(
        model=gemini_model,
        messages=[
            {"role": "system", "content": sys_msg},
            {"role": "user", "content": f"Context from {LIBRARY_NAME} source code:\n\n{context}\n\n---\n\nQuestion: {question}"},
        ],
        temperature=0.2,
    )
    return response.choices[0].message.content


def ask_llm(question: str, context: str, system_prompt: str | None = None) -> str:
    if llm_provider == "anthropic":
        return ask_anthropic(question, context, system_prompt)
    elif llm_provider == "gemini":
        return ask_gemini(question, context, system_prompt)
    return ask_openai(question, context, system_prompt)


def print_help():
    print(f"""
  {LIBRARY_NAME} RAG Interactive Query
  ====================================
  Commands:
    <query>              Search for components and get LLM answer
    /search <query>      Search only (no LLM call)
    /ask <question>      Ask LLM with retrieved context
    /provider <name>     Switch LLM provider: openai | anthropic | gemini
    /model <name>        Set model name for current provider
    /top <k>             Set number of retrieved chunks (current: {top_k})
    /alpha <float>       Set hybrid alpha: 0.0=BM25, 1.0=vector (current: {hybrid_alpha})
    /threshold <float>   Set score threshold: 0.0=disabled (current: {score_threshold})
    /reranker on|off     Toggle Gemini reranker (current: {'on' if reranker_enabled else 'off'})
    /info                Show current settings
    /help                Show this help
    /quit                Exit
""")


def print_info():
    print(f"""
  Library:    {LIBRARY_NAME}
  DB:         {persist_directory}
  Embeddings: {embeddings_model_name}
  Provider:   {llm_provider}
  Model:      {gemini_model if llm_provider == 'gemini' else anthropic_model if llm_provider == 'anthropic' else openai_model}
  Top-K:      {top_k}
  Pipeline:   alpha={hybrid_alpha} threshold={score_threshold} reranker={'on' if reranker_enabled else 'off'} retrieve_n={retrieve_n}
  Reranker:   {reranker_model}
  BM25:       {len(_bm25_corpus)} docs indexed
""")


def main():
    global llm_provider, openai_model, anthropic_model, gemini_model, top_k
    global hybrid_alpha, score_threshold, reranker_enabled

    if not os.path.exists(persist_directory):
        print(f"Error: Vector store not found at '{persist_directory}'.")
        print("Run ingest.py first to build the index.")
        sys.exit(1)

    print(f"Loading {LIBRARY_NAME} vector store from {persist_directory}...")
    embeddings = OpenAIEmbeddings(model=embeddings_model_name)
    db = Chroma(persist_directory=persist_directory, embedding_function=embeddings, collection_name=COLLECTION_NAME)

    collection = db.get()
    doc_count = len(collection["ids"])
    print(f"Loaded {doc_count} chunks.")

    print("Building BM25 index...")
    bm25_count = _build_bm25_index(db)
    print(f"BM25 index: {bm25_count} documents. Type /help for commands.\n")

    while True:
        try:
            user_input = input(f"[{LIBRARY_SLUG}] > ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye!")
            break

        if not user_input:
            continue

        if user_input == "/quit" or user_input == "/exit":
            print("Goodbye!")
            break
        elif user_input == "/help":
            print_help()
        elif user_input == "/info":
            print_info()
        elif user_input.startswith("/provider "):
            p = user_input.split(None, 1)[1].strip().lower()
            if p in ("openai", "anthropic", "gemini"):
                llm_provider = p
                model = gemini_model if p == "gemini" else anthropic_model if p == "anthropic" else openai_model
                print(f"  Switched to {p} (model: {model})")
            else:
                print("  Valid providers: openai, anthropic, gemini")
        elif user_input.startswith("/model "):
            m = user_input.split(None, 1)[1].strip()
            if llm_provider == "anthropic":
                anthropic_model = m
            elif llm_provider == "gemini":
                gemini_model = m
            else:
                openai_model = m
            print(f"  Model set to: {m}")
        elif user_input.startswith("/top "):
            try:
                top_k = int(user_input.split(None, 1)[1].strip())
                print(f"  Top-K set to: {top_k}")
            except ValueError:
                print("  Invalid number.")
        elif user_input.startswith("/alpha "):
            try:
                val = float(user_input.split(None, 1)[1].strip())
                if 0.0 <= val <= 1.0:
                    hybrid_alpha = val
                    print(f"  Hybrid alpha set to: {hybrid_alpha}")
                else:
                    print("  Alpha must be between 0.0 and 1.0")
            except ValueError:
                print("  Invalid number.")
        elif user_input.startswith("/threshold "):
            try:
                val = float(user_input.split(None, 1)[1].strip())
                if 0.0 <= val <= 1.0:
                    score_threshold = val
                    print(f"  Score threshold set to: {score_threshold}")
                else:
                    print("  Threshold must be between 0.0 and 1.0")
            except ValueError:
                print("  Invalid number.")
        elif user_input.startswith("/reranker "):
            arg = user_input.split(None, 1)[1].strip().lower()
            if arg in ("on", "true", "1", "yes"):
                reranker_enabled = True
                print(f"  Reranker enabled (model: {reranker_model})")
            elif arg in ("off", "false", "0", "no"):
                reranker_enabled = False
                print("  Reranker disabled")
            else:
                print("  Usage: /reranker on|off")
        elif user_input.startswith("/search "):
            query = user_input.split(None, 1)[1].strip()
            if query:
                print(f"  Searching for: {query}")
                search_documents(db, query, top_k)
            print()
        elif user_input.startswith("/ask "):
            question = user_input.split(None, 1)[1].strip()
            if question:
                print(f"  Retrieving context...")
                results = hybrid_search(db, question, top_k)
                docs = [doc for doc, _score in results]
                if docs:
                    context = build_context(docs)
                    print(f"  Asking {llm_provider}...\n")
                    try:
                        answer = ask_llm(question, context)
                        print(answer)
                    except Exception as e:
                        print(f"  LLM error: {e}")
                else:
                    print("  No relevant documents found.")
            print()
        else:
            # Default: search + ask
            query = user_input
            print(f"  Retrieving context for: {query}")
            results = hybrid_search(db, query, top_k)
            docs = [doc for doc, _score in results]
            if docs:
                print(f"  Found {len(docs)} relevant chunks. Asking {llm_provider}...\n")
                context = build_context(docs)
                try:
                    answer = ask_llm(query, context)
                    print(answer)
                except Exception as e:
                    print(f"  LLM error: {e}")
            else:
                print("  No relevant documents found.")
            print()


if __name__ == "__main__":
    main()
