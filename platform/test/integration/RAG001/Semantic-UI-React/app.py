#!/usr/bin/env python3
"""
FastAPI app exposing ingest, query, and LLM endpoints for this RAG library.

Usage:
    fastapi dev app.py --port 8000
    PERSIST_DIRECTORY=db_ant_design LLM_PROVIDER=openai fastapi dev app.py --port 8000
"""
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
)
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings

COLLECTION_NAME = "chromadb-rag-ingest-manager"

_db: Chroma | None = None


@asynccontextmanager
async def lifespan(application: FastAPI):
    global _db
    print(f"Loading {LIBRARY_NAME} embeddings model ({embeddings_model_name})...")
    embeddings = OpenAIEmbeddings(model=embeddings_model_name)
    _db = Chroma(persist_directory=persist_directory, embedding_function=embeddings, collection_name=COLLECTION_NAME)
    count = len(_db.get()["ids"])
    print(f"Ready — {count} chunks loaded from {persist_directory}")
    yield
    _db = None


app = FastAPI(title=f"{LIBRARY_NAME} RAG API", version="1.0.0", lifespan=lifespan)


def get_db() -> Chroma:
    if _db is None:
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


class SearchRequest(BaseModel):
    query: str
    top_k: int = 6


class LLMRequest(BaseModel):
    question: str
    context: str
    provider: Optional[str] = None


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
  .options { display: flex; gap: 12px; align-items: center; margin-bottom: 20px; font-size: .85rem; color: #555; }
  .options label { display: flex; align-items: center; gap: 4px; }
  .options input[type=number] { width: 50px; padding: 4px 6px; border: 1px solid #ccc; border-radius: 4px; }
  #status { font-size: .85rem; color: #888; margin-bottom: 16px; min-height: 1.2em; }
  .answer-box { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; white-space: pre-wrap; line-height: 1.6; display: none; }
  .answer-box h3 { font-size: .85rem; text-transform: uppercase; letter-spacing: .05em; color: #888; margin-bottom: 10px; }
  .results { display: flex; flex-direction: column; gap: 10px; }
  .result-card { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 14px 18px; }
  .result-meta { font-size: .75rem; color: #888; margin-bottom: 6px; display: flex; gap: 8px; flex-wrap: wrap; }
  .result-meta .score { background: #e8f4e8; color: #2a7a2a; padding: 1px 6px; border-radius: 3px; }
  .result-content { font-size: .85rem; color: #333; line-height: 1.5; white-space: pre-wrap; word-break: break-word; }
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
  </div>

  <div id="status"></div>
  <div class="answer-box" id="answer-box"><h3>Answer</h3><div id="answer"></div></div>
  <div class="results" id="results"></div>

  <footer>
    <a href="/docs">API Docs</a> &middot; <a href="/openapi.json">OpenAPI</a>
  </footer>
</div>

<script>
const $ = s => document.querySelector(s);
const qEl = $('#q'), statusEl = $('#status'), answerBox = $('#answer-box'), answerEl = $('#answer'), resultsEl = $('#results'), goBtn = $('#go');

fetch('/info').then(r=>r.json()).then(d=>{
  $('#chunk-count').textContent = d.embeddings_model;
  document.title = d.library + ' RAG';
});

qEl.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });

async function run() {
  const q = qEl.value.trim();
  if (!q) return;
  const mode = $('#mode').value;
  const topk = parseInt($('#topk').value) || 6;
  const provider = $('#provider').value;

  goBtn.disabled = true;
  answerBox.style.display = 'none';
  resultsEl.innerHTML = '';
  statusEl.innerHTML = '<span class="spinner"></span>' + (mode === 'query' ? 'Searching + asking LLM...' : 'Searching...');

  try {
    const body = mode === 'query'
      ? { query: q, top_k: topk, ...(provider && { provider }) }
      : { query: q, top_k: topk };
    const res = await fetch('/' + mode, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();

    if (data.answer) {
      answerEl.textContent = data.answer;
      answerBox.style.display = 'block';
    }

    const results = data.results || [];
    statusEl.textContent = results.length + ' result' + (results.length !== 1 ? 's' : '');
    resultsEl.innerHTML = results.map((r, i) => {
      const meta = r.metadata || {};
      const comp = meta.component ? '<strong>' + esc(meta.component) + '</strong>' : '';
      const file = meta.file_name ? esc(meta.file_name) : '';
      const score = r.score != null ? '<span class="score">' + r.score.toFixed(4) + '</span>' : '';
      return '<div class="result-card"><div class="result-meta">' + [comp, file, score].filter(Boolean).join(' ') + '</div><div class="result-content">' + esc(r.content) + '</div></div>';
    }).join('');
  } catch (e) {
    statusEl.textContent = 'Error: ' + e.message;
  } finally {
    goBtn.disabled = false;
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
    }


@app.post("/ingest")
def ingest():
    """Run the ingestion pipeline (indexes source code into ChromaDB)."""
    try:
        from ingest import main as run_ingest

        run_ingest()
        reload_db()
        return {"status": "ok", "message": f"Ingestion complete for {LIBRARY_NAME}"}
    except SystemExit:
        reload_db()
        return {"status": "ok", "message": f"Ingestion complete for {LIBRARY_NAME}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/search")
def search(req: SearchRequest):
    """Similarity search only (no LLM call)."""
    db = get_db()
    results = db.similarity_search_with_relevance_scores(req.query, k=req.top_k)
    return {
        "query": req.query,
        "results": [
            {
                "content": doc.page_content[:500],
                "metadata": doc.metadata,
                "score": score,
            }
            for doc, score in results
        ],
    }


@app.post("/query")
def query(req: QueryRequest):
    """Search + LLM: retrieve relevant chunks then ask the LLM."""
    db = get_db()
    docs = db.similarity_search(req.query, k=req.top_k)
    if not docs:
        return {"query": req.query, "results": [], "answer": None}

    context = build_context(docs)

    # Allow per-request provider override
    if req.provider:
        import query as q

        original = q.llm_provider
        q.llm_provider = req.provider
        try:
            answer = ask_llm(req.query, context)
        finally:
            q.llm_provider = original
    else:
        answer = ask_llm(req.query, context)

    return {
        "query": req.query,
        "results": [
            {"content": doc.page_content[:500], "metadata": doc.metadata}
            for doc in docs
        ],
        "answer": answer,
    }


@app.post("/llm")
def llm(req: LLMRequest):
    """Direct LLM call with user-provided context."""
    if req.provider:
        import query as q

        original = q.llm_provider
        q.llm_provider = req.provider
        try:
            answer = ask_llm(req.question, req.context)
        finally:
            q.llm_provider = original
    else:
        answer = ask_llm(req.question, req.context)

    return {"question": req.question, "answer": answer}
