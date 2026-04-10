#!/usr/bin/env python3
"""
FastAPI app exposing ingest, query, and LLM endpoints for this RAG library.

Usage:
    fastapi dev app.py --port 8000
    PERSIST_DIRECTORY=db_ant_design LLM_PROVIDER=openai fastapi dev app.py --port 8000
"""
import importlib.util
import inspect
import os
import sys
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

from query import (
    LIBRARY_NAME,
    LIBRARY_SLUG,
    persist_directory,
    embeddings_model_name,
    build_context,
    ask_llm,
    hybrid_search,
    hybrid_alpha,
    score_threshold,
    reranker_enabled,
    reranker_model,
    retrieve_n,
    vector_backend,
    _build_bm25_index,
    post_process_results,
)
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings

COLLECTION_NAME = "chromadb-rag-ingest-manager"

_db: Chroma | None = None
_os_client = None
_embeddings = None

EXAMPLES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "components-examples")


# ---------------------------------------------------------------------------
# Component Registry — scans components-examples/ for .md and .fnc.py files
# ---------------------------------------------------------------------------

class ComponentRegistry:
    """Registry of component example files (.md) and function modules (.fnc.py).

    Built once at startup by scanning EXAMPLES_DIR.

    Attributes:
        files:     {component_name: absolute_path_to_md}
        functions: {component_name: {fn_name: callable}}
    """

    def __init__(self, directory: str):
        self.directory = directory
        self.files: dict[str, str] = {}          # name -> .md path
        self.functions: dict[str, dict] = {}      # name -> {fn_name: callable}
        self._modules: dict[str, object] = {}     # name -> imported module
        self._scan()

    # -- scanning ----------------------------------------------------------

    def _scan(self):
        if not os.path.isdir(self.directory):
            return
        for fname in sorted(os.listdir(self.directory)):
            path = os.path.join(self.directory, fname)
            if not os.path.isfile(path):
                continue
            if fname.endswith(".md"):
                name = fname[:-3]  # breadcrumb.md -> breadcrumb
                self.files[name] = path
            elif fname.endswith(".fnc.py"):
                name = fname[:-7]  # breadcrumb.fnc.py -> breadcrumb
                self._load_function_module(name, path)

    def _load_function_module(self, name: str, path: str):
        spec = importlib.util.spec_from_file_location(f"component_fnc.{name}", path)
        if spec is None or spec.loader is None:
            return
        mod = importlib.util.module_from_spec(spec)
        try:
            spec.loader.exec_module(mod)
        except Exception as e:
            print(f"  WARNING: failed to load {path}: {e}")
            return
        self._modules[name] = mod
        fns = {}
        for attr_name, attr_val in inspect.getmembers(mod, inspect.isfunction):
            if attr_name.startswith("_"):
                continue
            if attr_val.__module__ != mod.__name__:
                continue
            fns[attr_name] = attr_val
        if fns:
            self.functions[name] = fns

    # -- public API --------------------------------------------------------

    def get_examples(self, components: list[str]) -> dict[str, str]:
        """Return {name: markdown_content} for components that have .md files."""
        out = {}
        for name in components:
            path = self.files.get(name)
            if path:
                try:
                    with open(path, encoding="utf-8") as f:
                        out[name] = f.read()
                except Exception:
                    pass
        return out

    def get_functions_meta(self, components: list[str]) -> dict[str, list[dict]]:
        """Return {name: [{fn, description}, ...]} for components that have .fnc.py."""
        out = {}
        for name in components:
            fns = self.functions.get(name)
            if fns:
                out[name] = [
                    {"fn": fn_name, "description": (fn.__doc__ or "").strip().split("\n")[0]}
                    for fn_name, fn in fns.items()
                ]
        return out

    def call_function(self, component: str, fn_name: str, params: dict | None = None):
        """Call a registered function by component name and function name."""
        fns = self.functions.get(component)
        if not fns:
            raise KeyError(f"No functions registered for component '{component}'")
        fn = fns.get(fn_name)
        if not fn:
            raise KeyError(f"Function '{fn_name}' not found for component '{component}'")
        return fn(params)

    def summary(self) -> dict:
        """Return a summary of all registered components."""
        components = sorted(set(list(self.files.keys()) + list(self.functions.keys())))
        return {
            name: {
                "has_examples": name in self.files,
                "functions": list(self.functions.get(name, {}).keys()),
            }
            for name in components
        }


_registry: ComponentRegistry | None = None


@asynccontextmanager
async def lifespan(application: FastAPI):
    global _db, _os_client, _embeddings, _registry

    # Build component registry
    _registry = ComponentRegistry(EXAMPLES_DIR)
    print(f"Component registry: {len(_registry.files)} example file(s), "
          f"{len(_registry.functions)} function module(s)")
    for name, fns in _registry.functions.items():
        print(f"  {name}.fnc.py: {', '.join(fns.keys())}")

    print(f"Loading {LIBRARY_NAME} embeddings model ({embeddings_model_name})...")
    _embeddings = OpenAIEmbeddings(model=embeddings_model_name)

    if vector_backend == "opensearch":
        try:
            from opensearch_store import get_opensearch_client, get_doc_count
            _os_client = get_opensearch_client()
            count = get_doc_count(_os_client)
            print(f"Ready — {count} chunks in OpenSearch index")
        except Exception as e:
            print(f"OpenSearch init failed: {e}")
            print("Falling back to ChromaDB...")
            _db = Chroma(persist_directory=persist_directory, embedding_function=_embeddings, collection_name=COLLECTION_NAME)
            count = len(_db.get()["ids"])
            print(f"Ready — {count} chunks loaded from {persist_directory}")
            print("Building BM25 index...")
            bm25_count = _build_bm25_index(_db)
            print(f"BM25 index: {bm25_count} documents")
    else:
        _db = Chroma(persist_directory=persist_directory, embedding_function=_embeddings, collection_name=COLLECTION_NAME)
        count = len(_db.get()["ids"])
        print(f"Ready — {count} chunks loaded from {persist_directory}")
        print("Building BM25 index...")
        bm25_count = _build_bm25_index(_db)
        print(f"BM25 index: {bm25_count} documents")

    # Try to initialize Redis cache (non-blocking)
    try:
        from cache import get_redis_client
        rc = get_redis_client()
        if rc:
            print("Redis cache: connected")
        else:
            print("Redis cache: unavailable (caching disabled)")
    except Exception:
        print("Redis cache: unavailable (caching disabled)")

    yield
    _db = None
    _os_client = None


app = FastAPI(title=f"{LIBRARY_NAME} RAG API", version="1.0.0", lifespan=lifespan)


def get_db():
    if _db is None and _os_client is None:
        raise HTTPException(status_code=503, detail="Vector store not loaded yet")
    return _db


def reload_db():
    global _db
    embeddings = OpenAIEmbeddings(model=embeddings_model_name)
    _db = Chroma(persist_directory=persist_directory, embedding_function=embeddings, collection_name=COLLECTION_NAME)


# --- Request / Response models ---


class QueryRequest(BaseModel):
    query: str
    top_k: int = 6
    provider: Optional[str] = None
    alpha: Optional[float] = None
    threshold: Optional[float] = None
    reranker: Optional[bool] = None
    code_mode: Optional[str] = "regex"
    component_mode: Optional[str] = "metadata"
    backend: Optional[str] = None


class SearchRequest(BaseModel):
    query: str
    top_k: int = 6
    alpha: Optional[float] = None
    threshold: Optional[float] = None
    reranker: Optional[bool] = None
    code_mode: Optional[str] = "regex"
    component_mode: Optional[str] = "metadata"
    backend: Optional[str] = None


class LLMRequest(BaseModel):
    question: str
    context: str
    provider: Optional[str] = None
    system_prompt: Optional[str] = None


# --- UI ---

INDEX_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{library} RAG</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f5f5f5; color: #1a1a1a; }
  .container { max-width: 860px; margin: 0 auto; padding: 24px 16px; }
  header { display: flex; align-items: baseline; gap: 12px; margin-bottom: 24px; }
  header h1 { font-size: 1.5rem; }
  header .badge { font-size: .75rem; background: #e8e8e8; padding: 2px 8px; border-radius: 4px; color: #555; }
  .search-box { display: flex; gap: 8px; margin-bottom: 16px; }
  .search-box input { flex: 1; padding: 10px 14px; font-size: 1rem; border: 1px solid #ccc; border-radius: 6px; outline: none; }
  .search-box input:focus { border-color: #4a90d9; box-shadow: 0 0 0 2px rgba(74,144,217,.2); }
  .search-box select { padding: 10px; font-size: .9rem; border: 1px solid #ccc; border-radius: 6px; background: #fff; }
  .btn { padding: 10px 20px; font-size: .9rem; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; }
  .btn-primary { background: #4a90d9; color: #fff; }
  .btn-primary:hover { background: #3a7bc8; }
  .btn-secondary { background: #e8e8e8; color: #333; }
  .btn-secondary:hover { background: #d8d8d8; }
  .btn:disabled { opacity: .5; cursor: not-allowed; }
  .options { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; font-size: .85rem; color: #555; flex-wrap: wrap; }
  .options label { display: flex; align-items: center; gap: 4px; }
  .options input[type=number] { width: 50px; padding: 4px 6px; border: 1px solid #ccc; border-radius: 4px; }
  .options input[type=range] { width: 100px; }
  .options input[type=checkbox] { margin: 0; }
  .pipeline-controls { display: flex; gap: 16px; align-items: center; margin-bottom: 12px; font-size: .85rem; color: #555; flex-wrap: wrap; }
  .pipeline-controls label { display: flex; align-items: center; gap: 4px; }
  .pipeline-controls select { padding: 4px 8px; font-size: .85rem; border: 1px solid #ccc; border-radius: 4px; background: #fff; }
  .pipeline-info { font-size: .75rem; color: #888; margin-bottom: 16px; padding: 6px 10px; background: #eee; border-radius: 4px; }
  .components-bar { margin-bottom: 16px; display: none; }
  .components-bar h4 { font-size: .8rem; color: #666; margin-bottom: 6px; }
  .components-list { display: flex; flex-wrap: wrap; gap: 6px; }
  .comp-chip { display: inline-block; padding: 3px 10px; font-size: .78rem; background: #e6f0fa; color: #2a6cb6; border: 1px solid #b8d4f0; border-radius: 12px; cursor: pointer; transition: background .15s; }
  .comp-chip:hover { background: #cce0f5; }
  #status { font-size: .85rem; color: #888; margin-bottom: 16px; min-height: 1.2em; }
  .answer-box { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; white-space: pre-wrap; line-height: 1.6; display: none; }
  .answer-box h3 { font-size: .85rem; text-transform: uppercase; letter-spacing: .05em; color: #888; margin-bottom: 10px; }
  .results { display: flex; flex-direction: column; gap: 10px; }
  .result-card { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 14px 18px; }
  .result-meta { font-size: .75rem; color: #888; margin-bottom: 6px; display: flex; gap: 8px; flex-wrap: wrap; }
  .result-meta .score { background: #e8f4e8; color: #2a7a2a; padding: 1px 6px; border-radius: 3px; }
  .result-tabs { display: flex; gap: 0; border-bottom: 1px solid #e0e0e0; margin-bottom: 8px; }
  .result-tab { padding: 4px 12px; font-size: .78rem; color: #888; cursor: pointer; border-bottom: 2px solid transparent; transition: color .15s, border-color .15s; }
  .result-tab:hover { color: #4a90d9; }
  .result-tab.active { color: #4a90d9; border-bottom-color: #4a90d9; }
  .result-tab-content { display: none; }
  .result-tab-content.active { display: block; }
  .result-content { font-size: .85rem; color: #333; line-height: 1.5; white-space: pre-wrap; word-break: break-word; }
  .code-block { font-family: "SF Mono", "Fira Code", "Fira Mono", Menlo, Consolas, monospace; font-size: .8rem; background: #f8f8f8; border: 1px solid #e8e8e8; border-radius: 4px; padding: 8px 10px; margin-bottom: 6px; white-space: pre-wrap; word-break: break-word; overflow-x: auto; }
  .text-block { font-size: .85rem; color: #333; line-height: 1.5; margin-bottom: 6px; }
  .empty-tab { font-size: .8rem; color: #aaa; font-style: italic; }
  .ask-llm-box { display: none; background: #fff; border: 1px solid #d4d4d4; border-radius: 8px; padding: 16px 18px; margin-bottom: 20px; }
  .ask-llm-box h3 { font-size: .85rem; text-transform: uppercase; letter-spacing: .05em; color: #888; margin-bottom: 10px; }
  .ask-llm-box textarea { width: 100%; min-height: 60px; padding: 10px 12px; font-size: .9rem; border: 1px solid #ccc; border-radius: 6px; font-family: inherit; resize: vertical; outline: none; }
  .ask-llm-box textarea:focus { border-color: #4a90d9; box-shadow: 0 0 0 2px rgba(74,144,217,.2); }
  .ask-llm-box .ask-llm-row { display: flex; gap: 8px; align-items: center; margin-top: 10px; }
  .examples-btn { display: none; margin-bottom: 16px; }
  .examples-btn button { padding: 8px 16px; font-size: .85rem; border: 1px solid #4a90d9; border-radius: 6px; background: #e6f0fa; color: #2a6cb6; cursor: pointer; font-weight: 500; transition: background .15s; }
  .examples-btn button:hover { background: #cce0f5; }
  .modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 1000; justify-content: center; align-items: start; padding: 40px 16px; overflow-y: auto; }
  .modal-overlay.open { display: flex; }
  .modal-window { background: #fff; border-radius: 10px; box-shadow: 0 8px 32px rgba(0,0,0,.2); width: 100%; max-width: 780px; max-height: calc(100vh - 80px); display: flex; flex-direction: column; }
  .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #e0e0e0; }
  .modal-header h3 { font-size: 1rem; color: #333; }
  .modal-header .file-badge { font-size: .75rem; background: #e8f4e8; color: #2a7a2a; padding: 2px 8px; border-radius: 4px; margin-left: 8px; }
  .modal-close { background: none; border: none; font-size: 1.4rem; color: #888; cursor: pointer; padding: 4px 8px; border-radius: 4px; line-height: 1; }
  .modal-close:hover { background: #f0f0f0; color: #333; }
  .modal-body { padding: 20px; overflow-y: auto; }
  .example-file { margin-bottom: 20px; }
  .example-file-header { font-size: .8rem; color: #888; background: #f5f5f5; padding: 6px 12px; border-radius: 4px 4px 0 0; border: 1px solid #e0e0e0; border-bottom: none; font-family: "SF Mono", "Fira Code", Menlo, monospace; }
  .example-card { background: #fff; border: 1px solid #d4e8d4; border-radius: 0 0 8px 8px; padding: 14px 18px; margin-bottom: 10px; }
  .example-card:first-child { border-radius: 0; }
  .example-card:last-child { border-radius: 0 0 8px 8px; }
  .example-card h4 { font-size: .9rem; color: #2a6cb6; margin-bottom: 8px; }
  .example-card pre { font-family: "SF Mono", "Fira Code", "Fira Mono", Menlo, Consolas, monospace; font-size: .8rem; background: #f8f8f8; border: 1px solid #e8e8e8; border-radius: 4px; padding: 8px 10px; margin-bottom: 8px; white-space: pre-wrap; word-break: break-word; overflow-x: auto; }
  .example-card .example-desc { font-size: .85rem; color: #555; margin-bottom: 6px; }
  .fnc-section { margin-bottom: 20px; }
  .fnc-section h4 { font-size: .85rem; color: #555; margin-bottom: 8px; }
  .fnc-file-header { font-size: .8rem; color: #888; background: #f5f0fa; padding: 6px 12px; border-radius: 4px 4px 0 0; border: 1px solid #d8cce8; border-bottom: none; font-family: "SF Mono", "Fira Code", Menlo, monospace; }
  .fnc-card { background: #fff; border: 1px solid #d8cce8; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .fnc-card:last-child { border-radius: 0 0 8px 8px; }
  .fnc-card .fnc-name { font-family: "SF Mono", "Fira Code", Menlo, monospace; font-size: .85rem; color: #6a3daa; font-weight: 500; }
  .fnc-card .fnc-desc { font-size: .8rem; color: #777; flex: 1; }
  .fnc-card .fnc-run { padding: 4px 12px; font-size: .78rem; border: 1px solid #6a3daa; border-radius: 4px; background: #f5f0fa; color: #6a3daa; cursor: pointer; white-space: nowrap; }
  .fnc-card .fnc-run:hover { background: #e8ddf5; }
  .fnc-result { margin-top: 8px; font-size: .8rem; background: #f8f8f8; border: 1px solid #e8e8e8; border-radius: 4px; padding: 8px 10px; white-space: pre-wrap; word-break: break-word; overflow-x: auto; font-family: "SF Mono", "Fira Code", Menlo, monospace; display: none; }
  .spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid #ccc; border-top-color: #4a90d9; border-radius: 50%; animation: spin .6s linear infinite; vertical-align: middle; margin-right: 6px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #ddd; font-size: .75rem; color: #aaa; text-align: center; }
  footer a { color: #4a90d9; text-decoration: none; }
</style>
</head>
<body>
<div class="container">
  <header>
    <h1>{library} RAG</h1>
    <span class="badge" id="chunk-count"></span>
  </header>

  <div class="search-box">
    <input type="text" id="q" placeholder="Search components..." autofocus>
    <select id="mode">
      <option value="query">Search + LLM</option>
      <option value="search">Search Only</option>
    </select>
    <button class="btn btn-primary" id="go" onclick="run()">Go</button>
  </div>

  <div class="options">
    <label>Top-K <input type="number" id="topk" value="6" min="1" max="20"></label>
    <label>Provider
      <select id="provider">
        <option value="">default</option>
        <option value="openai">openai</option>
        <option value="anthropic">anthropic</option>
        <option value="gemini">gemini</option>
      </select>
    </label>
    <label>Alpha <input type="range" id="alpha" min="0" max="1" step="0.1" value="0.5"> <span id="alpha-val">0.5</span></label>
    <label>Threshold <input type="number" id="threshold" value="0" min="0" max="1" step="0.05" style="width:60px"></label>
    <label>Reranker <input type="checkbox" id="reranker"></label>
    <label>Backend
      <select id="backend">
        <option value="">default</option>
        <option value="chroma">ChromaDB</option>
        <option value="opensearch">OpenSearch</option>
      </select>
    </label>
  </div>

  <div class="pipeline-controls">
    <label>Code Separation
      <select id="code-mode">
        <option value="regex">Regex (fast)</option>
        <option value="llm">LLM</option>
      </select>
    </label>
    <label>Component Detection
      <select id="component-mode">
        <option value="metadata">Metadata only</option>
        <option value="parse">Metadata + Code Parse</option>
        <option value="llm">Metadata + LLM</option>
      </select>
    </label>
  </div>

  <div class="pipeline-info" id="pipeline-info"></div>

  <div id="status"></div>

  <div class="components-bar" id="components-bar">
    <h4>Components</h4>
    <div class="components-list" id="components-list"></div>
  </div>

  <div class="answer-box" id="answer-box"><h3>Answer</h3><div id="answer"></div></div>
  <div class="examples-btn" id="examples-btn"><button onclick="openExamples()">External Example Files <span id="examples-count"></span></button></div>
  <div class="results" id="results"></div>

  <div class="ask-llm-box" id="ask-llm-box">
    <h3>Ask LLM about these results</h3>
    <label style="font-size:.8rem;color:#888;margin-bottom:4px;display:block;">System Instruction</label>
    <textarea id="llm-system" placeholder="Optional system instruction for the LLM..." style="min-height:40px;margin-bottom:10px;font-size:.85rem;color:#555;"></textarea>
    <label style="font-size:.8rem;color:#888;margin-bottom:4px;display:block;">Question</label>
    <textarea id="llm-question" placeholder="Type your question..."></textarea>
    <div class="ask-llm-row">
      <label style="font-size:.85rem;color:#555;display:flex;align-items:center;gap:4px;">Format
        <select id="llm-format" style="padding:4px 8px;font-size:.85rem;border:1px solid #ccc;border-radius:4px;background:#fff;">
          <option value="markdown">Markdown</option>
          <option value="json">JSON</option>
          <option value="yaml">YAML</option>
        </select>
      </label>
      <button class="btn btn-primary" id="ask-llm-btn" onclick="askLLM()">Ask LLM</button>
      <span id="llm-status" style="font-size:.85rem;color:#888;"></span>
    </div>
    <div class="llm-answer" id="llm-answer" style="display:none;margin-top:14px;white-space:pre-wrap;line-height:1.6;padding:14px;background:#f8fbff;border:1px solid #d4e2f0;border-radius:6px;font-size:.9rem;color:#222;"></div>
  </div>
</div>

<div class="modal-overlay" id="examples-modal">
  <div class="modal-window">
    <div class="modal-header">
      <div><h3>External Example Files</h3></div>
      <button class="modal-close" onclick="closeExamples()">&times;</button>
    </div>
    <div class="modal-body" id="examples"></div>
  </div>

  <footer>
    <a href="/docs">API Docs</a> &middot; <a href="/openapi.json">OpenAPI</a>
  </footer>
</div>

<script>
const $ = s => document.querySelector(s);
const qEl = $('#q'), statusEl = $('#status'), answerBox = $('#answer-box'), answerEl = $('#answer'), resultsEl = $('#results'), goBtn = $('#go');
const alphaEl = $('#alpha'), alphaValEl = $('#alpha-val'), thresholdEl = $('#threshold'), rerankerEl = $('#reranker'), pipelineEl = $('#pipeline-info');
const compBar = $('#components-bar'), compList = $('#components-list');
const exBtn = $('#examples-btn'), exCountEl = $('#examples-count'), exContainer = $('#examples'), exModal = $('#examples-modal');
const askLLMBox = $('#ask-llm-box'), llmQuestionEl = $('#llm-question'), askLLMBtn = $('#ask-llm-btn'), llmStatusEl = $('#llm-status');
let lastResults = [];

alphaEl.addEventListener('input', () => { alphaValEl.textContent = alphaEl.value; });

fetch('/info').then(r=>r.json()).then(d=>{
  $('#chunk-count').textContent = d.embeddings_model;
  document.title = d.library + ' RAG';
  if (d.pipeline) {
    alphaEl.value = d.pipeline.alpha; alphaValEl.textContent = d.pipeline.alpha;
    thresholdEl.value = d.pipeline.threshold;
    rerankerEl.checked = d.pipeline.reranker_enabled;
    pipelineEl.textContent = 'Pipeline: alpha=' + d.pipeline.alpha + ' threshold=' + d.pipeline.threshold
      + ' reranker=' + (d.pipeline.reranker_enabled ? 'on' : 'off')
      + ' retrieve_n=' + d.pipeline.retrieve_n + ' reranker_model=' + d.pipeline.reranker_model;
  }
});

qEl.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });

function searchComponent(name) {
  qEl.value = name;
  run();
}

function switchTab(tabEl) {
  const card = tabEl.closest('.result-card');
  card.querySelectorAll('.result-tab').forEach(t => t.classList.remove('active'));
  card.querySelectorAll('.result-tab-content').forEach(c => c.classList.remove('active'));
  tabEl.classList.add('active');
  const target = tabEl.getAttribute('data-tab');
  card.querySelector('.result-tab-content[data-tab="' + target + '"]').classList.add('active');
}

function renderParts(parts, cls) {
  if (!parts || parts.length === 0) return '<div class="empty-tab">None detected</div>';
  return parts.map(p => '<div class="' + cls + '">' + esc(p) + '</div>').join('');
}

async function run() {
  const q = qEl.value.trim();
  if (!q) return;
  const mode = $('#mode').value;
  const topk = parseInt($('#topk').value) || 6;
  const provider = $('#provider').value;
  const alpha = parseFloat(alphaEl.value);
  const threshold = parseFloat(thresholdEl.value);
  const reranker = rerankerEl.checked;
  const codeMode = $('#code-mode').value;
  const componentMode = $('#component-mode').value;
  const backend = $('#backend').value;

  goBtn.disabled = true;
  answerBox.style.display = 'none';
  compBar.style.display = 'none';
  exBtn.style.display = 'none';
  askLLMBox.style.display = 'none';
  $('#llm-answer').style.display = 'none';
  lastResults = [];
  exContainer.innerHTML = '';
  compList.innerHTML = '';
  resultsEl.innerHTML = '';
  statusEl.innerHTML = '<span class="spinner"></span>' + (mode === 'query' ? 'Searching + asking LLM...' : 'Searching...');

  try {
    const body = { query: q, top_k: topk, alpha, threshold, reranker, code_mode: codeMode, component_mode: componentMode };
    if (mode === 'query' && provider) body.provider = provider;
    if (backend) body.backend = backend;
    const res = await fetch('/' + mode, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();

    // Render components bar
    const comps = data.components || [];
    if (comps.length > 0) {
      compList.innerHTML = comps.map(c => '<span class="comp-chip" onclick="searchComponent(\\''+esc(c)+'\\')">' + esc(c) + '</span>').join('');
      compBar.style.display = 'block';
    }

    if (data.answer) {
      answerEl.textContent = data.answer;
      answerBox.style.display = 'block';
    }

    // Render component examples + functions into modal
    const examples = data.examples || {};
    const functions = data.functions || {};
    const exKeys = Object.keys(examples);
    const fnKeys = Object.keys(functions);
    var hasExternal = exKeys.length > 0 || fnKeys.length > 0;
    if (hasExternal) {
      var html = '';

      // --- Example files (.md) ---
      if (exKeys.length > 0) {
        var cbFence = String.fromCharCode(96,96,96);
        var totalExamples = 0;
        html += exKeys.map(function(name) {
          var md = examples[name];
          var sections = md.split(/(?=^\\d+\\.\\s)/m).filter(function(s){ return s.trim(); });
          totalExamples += sections.length;
          var cards = sections.map(function(sec) {
            var lines = sec.split('\\n');
            var title = lines[0].replace(/^\\d+\\.\\s*/, '').trim();
            var bodyText = lines.slice(1).join('\\n');
            var parts = bodyText.split(new RegExp(cbFence + '[a-z]*\\\\n?'));
            var h = '';
            for (var i = 0; i < parts.length; i++) {
              var p = parts[i].trim();
              if (!p) continue;
              if (i % 2 === 0) {
                h += '<div class="example-desc">' + esc(p) + '</div>';
              } else {
                h += '<pre>' + esc(p) + '</pre>';
              }
            }
            return '<div class="example-card"><h4>' + esc(title) + '</h4>' + h + '</div>';
          }).join('');
          return '<div class="example-file"><div class="example-file-header">' + esc(name) + '.md</div>' + cards + '</div>';
        }).join('');
      }

      // --- Function modules (.fnc.py) ---
      if (fnKeys.length > 0) {
        html += fnKeys.map(function(name) {
          var fns = functions[name];
          var cards = fns.map(function(f) {
            var id = 'fnc-result-' + name + '-' + f.fn;
            return '<div class="fnc-card">'
              + '<span class="fnc-name">' + esc(f.fn) + '()</span>'
              + '<span class="fnc-desc">' + esc(f.description) + '</span>'
              + '<button class="fnc-run" onclick="runComponentFn(\\'' + esc(name) + '\\',\\'' + esc(f.fn) + '\\',\\'' + id + '\\')">Run</button>'
              + '</div>'
              + '<div class="fnc-result" id="' + id + '"></div>';
          }).join('');
          return '<div class="fnc-section"><div class="fnc-file-header">' + esc(name) + '.fnc.py</div>' + cards + '</div>';
        }).join('');
      }

      exContainer.innerHTML = html;
      var count = exKeys.length + fnKeys.length;
      exCountEl.textContent = '(' + count + ' file' + (count !== 1 ? 's' : '') + ')';
      exBtn.style.display = 'block';
    }

    const results = data.results || [];
    const cached = data._cached ? ' (cached)' : '';
    statusEl.textContent = results.length + ' result' + (results.length !== 1 ? 's' : '') + cached;
    resultsEl.innerHTML = results.map((r, i) => {
      const meta = r.metadata || {};
      const comp = meta.component ? '<strong>' + esc(meta.component) + '</strong>' : '';
      const file = meta.file_name ? esc(meta.file_name) : '';
      const score = r.score != null ? '<span class="score">' + r.score.toFixed(4) + '</span>' : '';
      const codeParts = r.code_parts || [];
      const textParts = r.text_parts || [];
      return '<div class="result-card">'
        + '<div class="result-meta">' + [comp, file, score].filter(Boolean).join(' ') + '</div>'
        + '<div class="result-tabs">'
        +   '<div class="result-tab active" data-tab="all" onclick="switchTab(this)">All</div>'
        +   '<div class="result-tab" data-tab="text" onclick="switchTab(this)">Text (' + textParts.length + ')</div>'
        +   '<div class="result-tab" data-tab="code" onclick="switchTab(this)">Code (' + codeParts.length + ')</div>'
        + '</div>'
        + '<div class="result-tab-content active" data-tab="all"><div class="result-content">' + esc(r.content) + '</div></div>'
        + '<div class="result-tab-content" data-tab="text">' + renderParts(textParts, 'text-block') + '</div>'
        + '<div class="result-tab-content" data-tab="code">' + renderParts(codeParts, 'code-block') + '</div>'
        + '</div>';
    }).join('');

    // Show "Ask LLM" box if we have results
    lastResults = results;
    if (results.length > 0) {
      llmQuestionEl.value = q;
      llmStatusEl.textContent = '';
      askLLMBox.style.display = 'block';
    }
  } catch (e) {
    statusEl.textContent = 'Error: ' + e.message;
  } finally {
    goBtn.disabled = false;
  }
}

async function askLLM() {
  const question = llmQuestionEl.value.trim();
  if (!question || lastResults.length === 0) return;
  const provider = $('#provider').value;
  const fmt = $('#llm-format').value;
  const fmtInstruction = '\\nRespond in ' + fmt + ' format.';
  const context = lastResults.map(r => r.content).join('\\n\\n---\\n\\n');

  askLLMBtn.disabled = true;
  llmStatusEl.innerHTML = '<span class="spinner"></span>Asking LLM...';

  try {
    const sysPrompt = $('#llm-system').value.trim();
    const body = { question: question + fmtInstruction, context };
    if (provider) body.provider = provider;
    if (sysPrompt) body.system_prompt = sysPrompt;
    const res = await fetch('/llm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const llmAnswerEl = $('#llm-answer');
    llmAnswerEl.textContent = data.answer;
    llmAnswerEl.style.display = 'block';
    llmStatusEl.textContent = '';
    llmAnswerEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (e) {
    llmStatusEl.textContent = 'Error: ' + e.message;
  } finally {
    askLLMBtn.disabled = false;
  }
}

function openExamples() { exModal.classList.add('open'); }
function closeExamples() { exModal.classList.remove('open'); }
exModal.addEventListener('click', function(e) { if (e.target === exModal) closeExamples(); });
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeExamples(); });

async function runComponentFn(component, fnName, resultId) {
  var el = document.getElementById(resultId);
  el.style.display = 'block';
  el.textContent = 'Running...';
  try {
    var res = await fetch('/components/' + encodeURIComponent(component) + '/run/' + encodeURIComponent(fnName), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    var data = await res.json();
    if (!res.ok) { el.textContent = 'Error: ' + (data.detail || res.status); return; }
    el.textContent = JSON.stringify(data.result, null, 2);
  } catch (e) {
    el.textContent = 'Error: ' + e.message;
  }
}

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
</script>
</body>
</html>"""


# --- Endpoints ---


@app.get("/", response_class=HTMLResponse)
def ui():
    return INDEX_HTML.replace("{library}", LIBRARY_NAME)


@app.get("/info")
def info():
    return {
        "library": LIBRARY_NAME,
        "slug": LIBRARY_SLUG,
        "persist_directory": persist_directory,
        "embeddings_model": embeddings_model_name,
        "vector_backend": vector_backend,
        "opensearch_available": _os_client is not None,
        "pipeline": {
            "alpha": hybrid_alpha,
            "threshold": score_threshold,
            "reranker_enabled": reranker_enabled,
            "reranker_model": reranker_model,
            "retrieve_n": retrieve_n,
        },
    }


@app.post("/ingest")
def ingest():
    """Run the ingestion pipeline (indexes source code into ChromaDB)."""
    try:
        from ingest import main as run_ingest

        run_ingest()
        reload_db()
        db = get_db()
        if db:
            _build_bm25_index(db)

        # Invalidate search cache after ingest
        try:
            from cache import invalidate_search_cache
            invalidate_search_cache()
        except Exception:
            pass

        return {"status": "ok", "message": f"Ingestion complete for {LIBRARY_NAME}"}
    except SystemExit:
        reload_db()
        db = get_db()
        if db:
            _build_bm25_index(db)
        return {"status": "ok", "message": f"Ingestion complete for {LIBRARY_NAME}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/search")
def search(req: SearchRequest):
    """Hybrid search (no LLM call)."""
    _backend = req.backend or vector_backend

    # Check cache
    try:
        from cache import get_cached_search, set_cached_search
        cached = get_cached_search(
            req.query, req.top_k, alpha=req.alpha,
            threshold=req.threshold, reranker=req.reranker, backend=_backend,
        )
        if cached:
            return {**cached, "_cached": True}
    except Exception:
        pass

    get_db()  # ensure something is loaded
    results = hybrid_search(
        _db, req.query, req.top_k,
        alpha=req.alpha,
        threshold=req.threshold,
        use_reranker=req.reranker,
        backend=_backend,
        os_client=_os_client,
        embeddings_model=_embeddings,
    )
    processed = post_process_results(
        results,
        code_mode=req.code_mode or "regex",
        component_mode=req.component_mode or "metadata",
    )
    comps = processed.get("components", [])
    examples = _registry.get_examples(comps) if _registry else {}
    functions = _registry.get_functions_meta(comps) if _registry else {}
    response = {"query": req.query, **processed, "examples": examples, "functions": functions}

    # Store in cache
    try:
        from cache import set_cached_search
        set_cached_search(
            req.query, response, req.top_k, alpha=req.alpha,
            threshold=req.threshold, reranker=req.reranker, backend=_backend,
        )
    except Exception:
        pass

    return response


@app.post("/query")
def query(req: QueryRequest):
    """Search + LLM: retrieve relevant chunks then ask the LLM."""
    _backend = req.backend or vector_backend

    # Check LLM cache (full query+answer)
    cached_answer = None
    try:
        from cache import get_cached_llm
        cached_answer = get_cached_llm(req.query, provider=req.provider)
    except Exception:
        pass

    # Check search cache
    cached_search = None
    try:
        from cache import get_cached_search
        cached_search = get_cached_search(
            req.query, req.top_k, alpha=req.alpha,
            threshold=req.threshold, reranker=req.reranker, backend=_backend,
        )
    except Exception:
        pass

    if cached_search and cached_answer:
        return {**cached_search, "answer": cached_answer, "_cached": True}

    get_db()  # ensure something is loaded
    results = hybrid_search(
        _db, req.query, req.top_k,
        alpha=req.alpha,
        threshold=req.threshold,
        use_reranker=req.reranker,
        backend=_backend,
        os_client=_os_client,
        embeddings_model=_embeddings,
    )
    docs = [doc for doc, _score in results]
    if not docs:
        return {"query": req.query, "components": [], "results": [], "answer": None}

    context = build_context(docs)

    # Use cached LLM answer if available, otherwise call LLM
    if cached_answer:
        answer = cached_answer
    elif req.provider:
        import query as q

        original = q.llm_provider
        q.llm_provider = req.provider
        try:
            answer = ask_llm(req.query, context)
        finally:
            q.llm_provider = original
    else:
        answer = ask_llm(req.query, context)

    processed = post_process_results(
        results,
        code_mode=req.code_mode or "regex",
        component_mode=req.component_mode or "metadata",
        provider=req.provider,
    )
    comps = processed.get("components", [])
    examples = _registry.get_examples(comps) if _registry else {}
    functions = _registry.get_functions_meta(comps) if _registry else {}
    response = {"query": req.query, **processed, "examples": examples, "functions": functions, "answer": answer}

    # Cache search results
    try:
        from cache import set_cached_search
        search_only = {"query": req.query, **processed, "examples": examples, "functions": functions}
        set_cached_search(
            req.query, search_only, req.top_k, alpha=req.alpha,
            threshold=req.threshold, reranker=req.reranker, backend=_backend,
        )
    except Exception:
        pass

    # Cache LLM answer
    if not cached_answer:
        try:
            from cache import set_cached_llm
            set_cached_llm(req.query, answer, provider=req.provider)
        except Exception:
            pass

    return response


@app.post("/llm")
def llm(req: LLMRequest):
    """Direct LLM call with user-provided context."""
    sp = req.system_prompt if req.system_prompt and req.system_prompt.strip() else None
    if req.provider:
        import query as q

        original = q.llm_provider
        q.llm_provider = req.provider
        try:
            answer = ask_llm(req.question, req.context, system_prompt=sp)
        finally:
            q.llm_provider = original
    else:
        answer = ask_llm(req.question, req.context, system_prompt=sp)

    return {"question": req.question, "answer": answer}


# --- Component Registry Endpoints ---


@app.get("/components")
def list_components():
    """List all registered components with their example files and functions."""
    if not _registry:
        return {"components": {}}
    return {"components": _registry.summary()}


class RunFunctionRequest(BaseModel):
    params: Optional[dict] = None


@app.post("/components/{component}/run/{fn_name}")
def run_component_function(component: str, fn_name: str, req: RunFunctionRequest = None):
    """Call a registered function for a component."""
    if not _registry:
        raise HTTPException(status_code=503, detail="Registry not initialised")
    try:
        result = _registry.call_function(component, fn_name, req.params if req else None)
        return {"component": component, "function": fn_name, "result": result}
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
