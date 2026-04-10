"""
Streaming Format Translation

Handles translation between OpenAI SSE streaming format and Gemini streaming format.
Provides async iterators for real-time translation of streaming responses.
"""

from __future__ import annotations

import json
import random
import time
from collections.abc import AsyncIterator, Callable
from dataclasses import dataclass, field
from typing import Any

from fetch_httpx import create_logger

from .messages import map_gemini_role_to_openai
from .response import map_gemini_finish_reason
from .tools import generate_tool_call_id, is_gemini_function_call_part
from .types import (
    GeminiCandidate,
    GeminiGenerateResponse,
    OpenAIDelta,
    OpenAIStreamChoice,
    OpenAIStreamChunk,
    TranslationResult,
)

logger = create_logger("fetch_httpx_gemini_openai_protocols.streaming", __file__)


# =============================================================================
# Stream Accumulator
# =============================================================================


@dataclass
class StreamAccumulator:
    """State for accumulating streamed content."""

    id: str = ""
    model: str = ""
    content: str = ""
    tool_calls: dict[int, dict[str, Any]] = field(default_factory=dict)
    role: str | None = None
    finish_reason: str | None = None


# =============================================================================
# Gemini → OpenAI Streaming Translation
# =============================================================================


def gemini_chunk_to_openai(
    chunk: GeminiGenerateResponse,
    id: str | None = None,
    model: str = "gemini-model",
    is_first: bool = False,
    id_generator: Callable[[], str] | None = None,
) -> TranslationResult[OpenAIStreamChunk]:
    """Convert a single Gemini streaming chunk to OpenAI format."""
    warnings: list[str] = []

    if id is None:
        id = f"chatcmpl-{int(time.time())}"

    if id_generator is None:
        id_generator = generate_tool_call_id

    choices: list[OpenAIStreamChoice] = []

    for candidate in chunk.get("candidates", []):
        delta: OpenAIDelta = {}

        content = candidate.get("content", {})

        # On first chunk, include the role
        if is_first:
            delta["role"] = map_gemini_role_to_openai(content.get("role", "model"))

        parts = content.get("parts", [])

        # Extract text content
        text_parts = [p for p in parts if "text" in p]
        if text_parts:
            delta["content"] = "".join(p["text"] for p in text_parts)

        # Extract function calls
        function_call_parts = [p for p in parts if is_gemini_function_call_part(p)]
        if function_call_parts:
            delta["tool_calls"] = [
                {
                    "index": idx,
                    "id": id_generator(),
                    "type": "function",
                    "function": {
                        "name": part["functionCall"]["name"],
                        "arguments": json.dumps(part["functionCall"]["args"]),
                    },
                }
                for idx, part in enumerate(function_call_parts)
            ]

        finish_reason = candidate.get("finishReason")
        choices.append({
            "index": candidate.get("index", 0),
            "delta": delta,
            "finish_reason": map_gemini_finish_reason(finish_reason) if finish_reason else None,
        })

    return TranslationResult(
        data={
            "id": id,
            "object": "chat.completion.chunk",
            "created": int(time.time()),
            "model": model,
            "choices": choices,
        },
        warnings=warnings,
    )


async def gemini_stream_to_openai(
    stream: AsyncIterator[str],
    model: str = "gemini-model",
    id_generator: Callable[[], str] | None = None,
) -> AsyncIterator[str]:
    """
    Async iterator that converts Gemini NDJSON stream to OpenAI SSE format.

    Args:
        stream: Async iterator yielding Gemini NDJSON lines
        model: Model name to use in response
        id_generator: Optional function to generate tool call IDs

    Yields:
        OpenAI SSE formatted strings (data: {...}\n\n)
    """
    logger.debug("Starting Gemini to OpenAI stream translation")

    random_suffix = "".join(random.choices("abcdefghijklmnopqrstuvwxyz0123456789", k=7))
    stream_id = f"chatcmpl-{int(time.time())}-{random_suffix}"

    is_first = True
    chunk_count = 0

    async for line in stream:
        trimmed = line.strip()
        if not trimmed:
            continue

        try:
            gemini_chunk = json.loads(trimmed)
            result = gemini_chunk_to_openai(
                gemini_chunk,
                id=stream_id,
                model=model,
                is_first=is_first,
                id_generator=id_generator,
            )

            chunk_count += 1
            is_first = False

            # Yield in SSE format
            yield f"data: {json.dumps(result.data)}\n\n"

        except json.JSONDecodeError as e:
            logger.warn(
                "Failed to parse Gemini streaming chunk",
                context={"error": str(e), "line": trimmed[:100]},
            )

    # Send [DONE] marker
    yield "data: [DONE]\n\n"

    logger.debug("Gemini to OpenAI stream translation complete", context={"chunk_count": chunk_count})


# =============================================================================
# OpenAI → Gemini Streaming Translation
# =============================================================================


def openai_chunk_to_gemini(
    chunk: OpenAIStreamChunk,
    accumulator: StreamAccumulator,
) -> TranslationResult[GeminiGenerateResponse | None]:
    """Convert OpenAI SSE chunk to Gemini format."""
    warnings: list[str] = []

    candidates: list[GeminiCandidate] = []

    for choice in chunk.get("choices", []):
        delta = choice.get("delta", {})
        finish_reason = choice.get("finish_reason")

        # Update accumulator
        if "role" in delta:
            accumulator.role = delta["role"]

        if "content" in delta:
            accumulator.content += delta["content"]

        # Handle tool calls (accumulated)
        tool_calls = delta.get("tool_calls", [])
        for tc in tool_calls:
            index = tc.get("index", 0)
            existing = accumulator.tool_calls.get(index)
            if existing:
                func = tc.get("function", {})
                if "arguments" in func:
                    existing["arguments"] += func["arguments"]
            else:
                func = tc.get("function", {})
                accumulator.tool_calls[index] = {
                    "id": tc.get("id", generate_tool_call_id()),
                    "name": func.get("name", ""),
                    "arguments": func.get("arguments", ""),
                }

        if finish_reason:
            accumulator.finish_reason = finish_reason

        # Build Gemini content from current delta
        parts: list[dict[str, Any]] = []

        if "content" in delta:
            parts.append({"text": delta["content"]})

        # Only emit function calls when complete (on finish)
        if finish_reason and accumulator.tool_calls:
            for tc in accumulator.tool_calls.values():
                try:
                    args = json.loads(tc["arguments"])
                except json.JSONDecodeError:
                    args = {}
                parts.append({
                    "functionCall": {
                        "name": tc["name"],
                        "args": args,
                    }
                })

        if parts or finish_reason:
            gemini_finish = None
            if finish_reason:
                if finish_reason in ("stop", "tool_calls", "function_call"):
                    gemini_finish = "STOP"
                else:
                    gemini_finish = "MAX_TOKENS"

            candidates.append({
                "content": {
                    "role": "model",
                    "parts": parts,
                },
                "finishReason": gemini_finish,
                "index": choice.get("index", 0),
            })

    if not candidates:
        return TranslationResult(data=None, warnings=warnings)

    return TranslationResult(
        data={"candidates": candidates},
        warnings=warnings,
    )


async def openai_stream_to_gemini(
    stream: AsyncIterator[str],
    model: str = "gemini-model",
) -> AsyncIterator[str]:
    """
    Async iterator that converts OpenAI SSE stream to Gemini NDJSON format.

    Args:
        stream: Async iterator yielding OpenAI SSE lines
        model: Model name (unused, for API consistency)

    Yields:
        Gemini NDJSON formatted strings
    """
    logger.debug("Starting OpenAI to Gemini stream translation")

    accumulator = StreamAccumulator()
    chunk_count = 0

    # Parse SSE format
    async for line in stream:
        line = line.strip()

        if line.startswith("data: "):
            data = line[6:]  # Remove "data: " prefix

            if data == "[DONE]":
                continue

            try:
                openai_chunk = json.loads(data)

                # Update accumulator metadata
                if not accumulator.id and openai_chunk.get("id"):
                    accumulator.id = openai_chunk["id"]
                if not accumulator.model and openai_chunk.get("model"):
                    accumulator.model = openai_chunk["model"]

                result = openai_chunk_to_gemini(openai_chunk, accumulator)

                if result.data:
                    chunk_count += 1
                    yield json.dumps(result.data) + "\n"

            except json.JSONDecodeError as e:
                logger.warn(
                    "Failed to parse OpenAI streaming chunk",
                    context={"error": str(e)},
                )

    logger.debug("OpenAI to Gemini stream translation complete", context={"chunk_count": chunk_count})


# =============================================================================
# Stream Aggregation Utilities
# =============================================================================


async def aggregate_openai_stream(
    stream: AsyncIterator[str],
) -> TranslationResult[OpenAIStreamChunk]:
    """Aggregate OpenAI streaming chunks into a complete response."""
    logger.debug("Aggregating OpenAI stream")

    warnings: list[str] = []
    id = ""
    model = ""
    created = 0
    content: list[str] = []
    tool_calls: dict[int, dict[str, Any]] = {}
    finish_reason: str | None = None
    role: str | None = None

    async for line in stream:
        line = line.strip()

        if not line.startswith("data: "):
            continue

        data = line[6:]
        if data == "[DONE]":
            continue

        try:
            chunk = json.loads(data)

            # Capture metadata
            if not id:
                id = chunk.get("id", "")
            if not model:
                model = chunk.get("model", "")
            if not created:
                created = chunk.get("created", 0)

            for choice in chunk.get("choices", []):
                delta = choice.get("delta", {})

                if "role" in delta and not role:
                    role = delta["role"]

                if "content" in delta:
                    content.append(delta["content"])

                for tc in delta.get("tool_calls", []):
                    index = tc.get("index", 0)
                    existing = tool_calls.get(index)
                    if existing:
                        func = tc.get("function", {})
                        if "arguments" in func:
                            existing["function"]["arguments"] += func["arguments"]
                    else:
                        tool_calls[index] = {
                            "id": tc.get("id", generate_tool_call_id()),
                            "type": "function",
                            "function": {
                                "name": tc.get("function", {}).get("name", ""),
                                "arguments": tc.get("function", {}).get("arguments", ""),
                            },
                        }

                if choice.get("finish_reason"):
                    finish_reason = choice["finish_reason"]

        except json.JSONDecodeError as e:
            warnings.append(f"Failed to parse chunk: {e}")

    # Build final aggregated chunk
    delta: OpenAIDelta = {}
    if role:
        delta["role"] = role
    if content:
        delta["content"] = "".join(content)
    if tool_calls:
        delta["tool_calls"] = [
            tool_calls[idx] for idx in sorted(tool_calls.keys())
        ]

    return TranslationResult(
        data={
            "id": id,
            "object": "chat.completion.chunk",
            "created": created,
            "model": model,
            "choices": [{
                "index": 0,
                "delta": delta,
                "finish_reason": finish_reason,
            }],
        },
        warnings=warnings,
    )


async def aggregate_gemini_stream(
    stream: AsyncIterator[str],
) -> TranslationResult[GeminiGenerateResponse]:
    """Aggregate Gemini NDJSON stream into a complete response."""
    logger.debug("Aggregating Gemini stream")

    warnings: list[str] = []
    candidates: dict[int, dict[str, Any]] = {}
    usage_metadata: dict[str, int] | None = None

    async for line in stream:
        trimmed = line.strip()
        if not trimmed:
            continue

        try:
            chunk = json.loads(trimmed)

            # Aggregate candidates
            for candidate in chunk.get("candidates", []):
                index = candidate.get("index", 0)
                existing = candidates.get(index)

                if existing:
                    # Merge parts
                    content = candidate.get("content", {})
                    if content.get("parts"):
                        existing["content"]["parts"].extend(content["parts"])
                    if candidate.get("finishReason"):
                        existing["finishReason"] = candidate["finishReason"]
                else:
                    candidates[index] = {
                        "content": candidate.get("content", {"role": "model", "parts": []}),
                        "finishReason": candidate.get("finishReason"),
                        "index": index,
                    }

            # Capture usage (usually in last chunk)
            if chunk.get("usageMetadata"):
                usage_metadata = chunk["usageMetadata"]

        except json.JSONDecodeError as e:
            warnings.append(f"Failed to parse chunk: {e}")

    # Build final response
    final_candidates = [
        candidates[idx] for idx in sorted(candidates.keys())
    ]

    result: GeminiGenerateResponse = {
        "candidates": final_candidates,
    }

    if usage_metadata:
        result["usageMetadata"] = usage_metadata

    return TranslationResult(data=result, warnings=warnings)
