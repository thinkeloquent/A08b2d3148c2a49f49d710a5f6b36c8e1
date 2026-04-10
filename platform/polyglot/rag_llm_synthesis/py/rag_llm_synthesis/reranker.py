"""Gemini-based listwise reranker."""

import json
import os
import re
from typing import List, Tuple, Any, Optional


def gemini_rerank(
    query: str,
    candidates: List[Tuple[Any, float]],
    k: int,
    api_key: Optional[str] = None,
    model: str = "gemini-2.0-flash",
) -> List[Tuple[Any, float]]:
    """Rerank candidates using Gemini as a listwise reranker.

    Each candidate is a (document, score) tuple where document has a
    .page_content attribute.

    Args:
        query: The search query.
        candidates: List of (document, score) tuples to rerank.
        k: Number of top results to return.
        api_key: Gemini API key. Falls back to GEMINI_API_KEY env var.
        model: Gemini model name for reranking.

    Returns:
        Reranked list of (document, score) tuples, limited to k results.
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

        _api_key = api_key or os.environ.get("GEMINI_API_KEY")
        if not _api_key:
            return candidates[:k]

        client = OpenAI(
            api_key=_api_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        )
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
        )
        content = response.choices[0].message.content.strip()

        try:
            indices = json.loads(content)
        except json.JSONDecodeError:
            match = re.search(r'\[[\d,\s]+\]', content)
            if match:
                indices = json.loads(match.group())
            else:
                return candidates[:k]

        if not isinstance(indices, list):
            return candidates[:k]

        reranked = []
        seen = set()
        for idx in indices:
            if isinstance(idx, int) and 0 <= idx < cap and idx not in seen:
                seen.add(idx)
                reranked.append(capped[idx])
        for i, c in enumerate(capped):
            if i not in seen:
                reranked.append(c)

        return reranked[:k]

    except Exception:
        return candidates[:k]
