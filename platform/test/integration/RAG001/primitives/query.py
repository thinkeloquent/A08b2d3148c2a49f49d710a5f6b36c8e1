#!/usr/bin/env python3
"""
Interactive RAG Query Interface for Radix Primitives
Search components and ask LLM-powered questions against the indexed vector store.

Usage:
    python query.py
    PERSIST_DIRECTORY=db_primitives LLM_PROVIDER=anthropic python query.py

Environment variables:
    PERSIST_DIRECTORY   - ChromaDB path (default: db_primitives)
    EMBEDDINGS_MODEL_NAME - HuggingFace model (default: all-MiniLM-L6-v2)
    LLM_PROVIDER        - "openai", "anthropic", or "gemini" (default: openai)
    OPENAI_API_KEY       - Required if using OpenAI
    ANTHROPIC_API_KEY    - Required if using Anthropic
    OPENAI_MODEL         - OpenAI model name (default: gpt-4o)
    ANTHROPIC_MODEL      - Anthropic model name (default: claude-sonnet-4-5-20250514)
    GEMINI_API_KEY        - Required if using Gemini
    GEMINI_MODEL          - Gemini model name (default: gemini-2.0-flash)
    TOP_K                - Number of chunks to retrieve (default: 6)
"""
import os
import sys
import readline
from typing import List, Optional

from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document

LIBRARY_NAME = "Radix Primitives"
LIBRARY_SLUG = "primitives"

COLLECTION_NAME = "chromadb-rag-ingest-manager"

# --- CONFIGURATION ---
persist_directory = os.environ.get("PERSIST_DIRECTORY", "db_primitives")
embeddings_model_name = os.environ.get("EMBEDDINGS_MODEL_NAME", "all-MiniLM-L6-v2")
llm_provider = os.environ.get("LLM_PROVIDER", "openai")
openai_model = os.environ.get("OPENAI_MODEL", "gpt-4o")
anthropic_model = os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-5-20250514")
gemini_model = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
top_k = int(os.environ.get("TOP_K", "6"))

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


def format_metadata(meta: dict) -> str:
    parts = []
    if "component" in meta:
        parts.append(f"primitive={meta['component']}")
    if "file_name" in meta:
        parts.append(meta["file_name"])
    if "file_path" in meta:
        path = meta["file_path"]
        if LIBRARY_SLUG in path:
            path = path.split(LIBRARY_SLUG + "/", 1)[-1]
        parts.append(path)
    return " | ".join(parts)


def search_documents(db: Chroma, query: str, k: int) -> List[Document]:
    results = db.similarity_search_with_relevance_scores(query, k=k)
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
    context_parts = []
    for i, doc in enumerate(docs, 1):
        header = format_metadata(doc.metadata)
        context_parts.append(f"--- Source {i}: {header} ---\n{doc.page_content}")
    return "\n\n".join(context_parts)


SYSTEM_PROMPT = f"""You are an expert on the {LIBRARY_NAME} library (Radix UI). You answer questions
about headless, unstyled, accessible primitives based on the source code provided as context.

Rules:
- Only answer based on the provided context. If the context doesn't contain enough information, say so.
- When referencing primitives, mention the package name (e.g., @radix-ui/react-dialog) and file path.
- Emphasize accessibility features (ARIA attributes, keyboard navigation) when relevant.
- These are unstyled primitives — note composition patterns and slot-based APIs.
- Provide code examples when relevant.
- Be concise but thorough."""


def ask_openai(question: str, context: str) -> str:
    client = get_openai_client()
    response = client.chat.completions.create(
        model=openai_model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Context from {LIBRARY_NAME} source code:\n\n{context}\n\n---\n\nQuestion: {question}"},
        ],
        temperature=0.2,
    )
    return response.choices[0].message.content


def ask_anthropic(question: str, context: str) -> str:
    client = get_anthropic_client()
    response = client.messages.create(
        model=anthropic_model,
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[
            {"role": "user", "content": f"Context from {LIBRARY_NAME} source code:\n\n{context}\n\n---\n\nQuestion: {question}"},
        ],
        temperature=0.2,
    )
    return response.content[0].text


def ask_gemini(question: str, context: str) -> str:
    client = get_gemini_client()
    response = client.chat.completions.create(
        model=gemini_model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Context from {LIBRARY_NAME} source code:\n\n{context}\n\n---\n\nQuestion: {question}"},
        ],
        temperature=0.2,
    )
    return response.choices[0].message.content


def ask_llm(question: str, context: str) -> str:
    if llm_provider == "anthropic":
        return ask_anthropic(question, context)
    elif llm_provider == "gemini":
        return ask_gemini(question, context)
    return ask_openai(question, context)


def print_help():
    print(f"""
  {LIBRARY_NAME} RAG Interactive Query
  ====================================
  Commands:
    <query>              Search for primitives and get LLM answer
    /search <query>      Search only (no LLM call)
    /ask <question>      Ask LLM with retrieved context
    /provider <name>     Switch LLM provider: openai | anthropic | gemini
    /model <name>        Set model name for current provider
    /top <k>             Set number of retrieved chunks (current: {top_k})
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
""")


def main():
    global llm_provider, openai_model, anthropic_model, gemini_model, top_k

    if not os.path.exists(persist_directory):
        print(f"Error: Vector store not found at '{persist_directory}'.")
        print("Run ingest.py first to build the index.")
        sys.exit(1)

    print(f"Loading {LIBRARY_NAME} vector store from {persist_directory}...")
    embeddings = OpenAIEmbeddings(model=embeddings_model_name)
    db = Chroma(persist_directory=persist_directory, embedding_function=embeddings, collection_name=COLLECTION_NAME)

    collection = db.get()
    doc_count = len(collection["ids"])
    print(f"Loaded {doc_count} chunks. Type /help for commands.\n")

    while True:
        try:
            user_input = input(f"[{LIBRARY_SLUG}] > ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye!")
            break

        if not user_input:
            continue

        if user_input in ("/quit", "/exit"):
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
                docs = db.similarity_search(question, k=top_k)
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
            query = user_input
            print(f"  Retrieving context for: {query}")
            docs = db.similarity_search(query, k=top_k)
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
