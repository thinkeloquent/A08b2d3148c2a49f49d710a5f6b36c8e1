#!/usr/bin/env python3
"""
Example: OpenAI SSE ↔ Gemini NDJSON Bidirectional Translation

This example demonstrates:
1. Complete SSE-to-NDJSON translation (OpenAI → Gemini)
2. Complete NDJSON-to-SSE translation (Gemini → OpenAI)
3. Building a proxy that accepts OpenAI SSE and outputs Gemini NDJSON
4. Building a proxy that accepts Gemini NDJSON and outputs OpenAI SSE

Use cases:
- Create an OpenAI-compatible proxy for Gemini
- Migrate applications from OpenAI to Gemini without code changes
- Build polyglot streaming applications
"""
import os
import sys
import json
import asyncio
from pathlib import Path

# Add packages to path
ROOT_DIR = Path(__file__).parent.parent.parent
sys.path.insert(0, str(ROOT_DIR / "packages_py"))
sys.path.insert(0, str(ROOT_DIR / "packages_py/fetch_httpx_gemini_openai_constant"))

from fetch_httpx import AsyncClient, Timeout
from fetch_httpx_gemini_openai_constant import (
    GEMINI_ORIGIN,
    GEMINI_CONNECT_TIMEOUT_S,
    GEMINI_READ_TIMEOUT_S,
)
from fetch_httpx_gemini_openai_protocols import (
    gemini_stream_to_openai,
    openai_stream_to_gemini,
    translate_openai_request_to_gemini,
)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("ERROR: GEMINI_API_KEY environment variable not set")
    print("Set it with: export GEMINI_API_KEY=your_api_key")
    sys.exit(1)


async def main():
    # =========================================================================
    # Example 1: Gemini NDJSON → OpenAI SSE (Proxy Pattern)
    # =========================================================================

    print("=" * 60)
    print("Example 1: Gemini NDJSON → OpenAI SSE Translation")
    print("=" * 60)

    print("""
This pattern is used when you want to:
- Accept requests in OpenAI format
- Call Gemini's native API
- Return responses in OpenAI SSE format

Perfect for building an OpenAI-compatible proxy for Gemini.
""")

    # Simulate incoming OpenAI request
    openai_request = {
        "model": "gemini-2.0-flash",
        "messages": [
            {"role": "user", "content": "Count from 1 to 5, one number per line."},
        ],
        "stream": True,
    }

    print("Incoming OpenAI Request:")
    print(json.dumps(openai_request, indent=2))

    # Translate to Gemini format
    gemini_request = translate_openai_request_to_gemini(openai_request)
    print("\nTranslated to Gemini Request:")
    print(json.dumps(gemini_request.data, indent=2))

    # Make request to Gemini
    GEMINI_STREAM_URL = f"{GEMINI_ORIGIN}/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse"

    async with AsyncClient(timeout=Timeout(connect=GEMINI_CONNECT_TIMEOUT_S, read=GEMINI_READ_TIMEOUT_S)) as client:
        async with client.stream(
            "POST",
            GEMINI_STREAM_URL,
            headers={
                "Content-Type": "application/json",
                "x-goog-api-key": GEMINI_API_KEY,
            },
            json=gemini_request.data,
        ) as response:
            if not response.is_success:
                error_text = await response.aread()
                print(f"API Error: {response.status_code} {error_text.decode()}")
            else:
                print("\n--- Translating Gemini → OpenAI SSE ---")
                print("(This is what your proxy would send to clients)\n")

                # Collect Gemini chunks
                gemini_chunks = []
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        json_line = line[6:].strip()
                        if json_line:
                            gemini_chunks.append(json_line)

                # Create async iterator for translation
                async def iter_chunks(chunks):
                    for chunk in chunks:
                        yield chunk

                # Translate to OpenAI SSE format
                print("OpenAI SSE Output:")
                print("-" * 40)

                async for sse_chunk in gemini_stream_to_openai(
                    iter_chunks(gemini_chunks), "gemini-2.0-flash"
                ):
                    # This is exactly what you'd send to an OpenAI client
                    print(sse_chunk, end="")

                print("-" * 40)

    # =========================================================================
    # Example 2: OpenAI SSE → Gemini NDJSON
    # =========================================================================

    print("\n" + "=" * 60)
    print("Example 2: OpenAI SSE → Gemini NDJSON Translation")
    print("=" * 60)

    print("""
This pattern is used when you want to:
- Accept OpenAI SSE stream from an OpenAI-compatible API
- Convert it to Gemini NDJSON format for downstream processing

Useful for migration or compatibility scenarios.
""")

    # Simulated OpenAI SSE stream (as received from OpenAI API)
    simulated_openai_stream = [
        'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","model":"gpt-4","choices":[{"index":0,"delta":{"role":"assistant","content":"The "},"finish_reason":null}]}',
        "",  # Empty line between SSE messages
        'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","model":"gpt-4","choices":[{"index":0,"delta":{"content":"quick "},"finish_reason":null}]}',
        "",
        'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","model":"gpt-4","choices":[{"index":0,"delta":{"content":"brown "},"finish_reason":null}]}',
        "",
        'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","model":"gpt-4","choices":[{"index":0,"delta":{"content":"fox."},"finish_reason":null}]}',
        "",
        'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","model":"gpt-4","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}',
        "",
        "data: [DONE]",
    ]

    print("Simulated OpenAI SSE Input:")
    print("-" * 40)
    for line in simulated_openai_stream:
        if line:
            print(line)
    print("-" * 40)

    # Create async iterator for the simulated stream
    async def iter_openai_sse(lines):
        for line in lines:
            yield line

    # Translate to Gemini NDJSON format
    print("\nTranslated Gemini NDJSON Output:")
    print("-" * 40)

    async for ndjson_line in openai_stream_to_gemini(iter_openai_sse(simulated_openai_stream)):
        # This is Gemini NDJSON format
        print(ndjson_line.strip())

    print("-" * 40)

    # =========================================================================
    # Example 3: SSE Format Deep Dive
    # =========================================================================

    print("\n" + "=" * 60)
    print("Example 3: SSE Format Specification")
    print("=" * 60)

    print("""
┌─────────────────────────────────────────────────────────────────┐
│                  SERVER-SENT EVENTS (SSE) FORMAT                 │
├─────────────────────────────────────────────────────────────────┤
│ Content-Type: text/event-stream                                  │
│ Cache-Control: no-cache                                          │
│ Connection: keep-alive                                           │
├─────────────────────────────────────────────────────────────────┤
│ STRUCTURE:                                                       │
│                                                                  │
│   data: <JSON object>\\n                                          │
│   \\n                          ← Empty line between events        │
│   data: <JSON object>\\n                                          │
│   \\n                                                             │
│   data: [DONE]\\n              ← End marker (OpenAI specific)     │
│   \\n                                                             │
├─────────────────────────────────────────────────────────────────┤
│ RULES:                                                           │
│ - Each event starts with "data: " prefix                         │
│ - Events separated by blank lines                                │
│ - No trailing comma or array brackets                            │
│ - Stream ends with "data: [DONE]" (OpenAI convention)            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│               NEWLINE-DELIMITED JSON (NDJSON) FORMAT             │
├─────────────────────────────────────────────────────────────────┤
│ Content-Type: application/json (streaming)                       │
├─────────────────────────────────────────────────────────────────┤
│ STRUCTURE:                                                       │
│                                                                  │
│   <JSON object>\\n                                                │
│   <JSON object>\\n                                                │
│   <JSON object>\\n                                                │
├─────────────────────────────────────────────────────────────────┤
│ RULES:                                                           │
│ - One complete JSON object per line                              │
│ - Lines separated by single newline                              │
│ - No "data: " prefix                                             │
│ - No explicit end marker                                         │
└─────────────────────────────────────────────────────────────────┘
""")

    # =========================================================================
    # Example 4: Building a Simple Proxy
    # =========================================================================

    print("\n" + "=" * 60)
    print("Example 4: Proxy Implementation Pattern")
    print("=" * 60)

    print("""
Here's how to build an OpenAI-compatible proxy for Gemini in Python:

```python
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fetch_httpx import AsyncClient
from fetch_httpx_gemini_openai_protocols import (
    translate_openai_request_to_gemini,
    gemini_stream_to_openai,
)

app = FastAPI()

@app.post("/v1/chat/completions")
async def chat_completions(request: Request):
    openai_request = await request.json()

    # 1. Translate request
    gemini_request = translate_openai_request_to_gemini(openai_request)

    async def stream_response():
        async with AsyncClient() as client:
            # 2. Call Gemini
            async with client.stream(
                "POST",
                GEMINI_URL,
                headers={"x-goog-api-key": API_KEY},
                json=gemini_request.data,
            ) as response:
                # 3. Collect chunks
                chunks = []
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        chunks.append(line[6:])

                # 4. Translate and yield
                async for sse in gemini_stream_to_openai(
                    iter_chunks(chunks),
                    "gemini-2.0-flash"
                ):
                    yield sse

    return StreamingResponse(
        stream_response(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )
```

This allows any OpenAI client to use Gemini transparently!
""")

    # =========================================================================
    # Example 5: Live Demonstration
    # =========================================================================

    print("\n" + "=" * 60)
    print("Example 5: Live SSE Translation Demo")
    print("=" * 60)

    request_payload = translate_openai_request_to_gemini({
        "messages": [
            {"role": "user", "content": 'Say "Hello, SSE!" in 3 different languages, one per line.'},
        ],
    })

    print("\nSending request to Gemini...\n")

    async with AsyncClient(timeout=Timeout(connect=GEMINI_CONNECT_TIMEOUT_S, read=GEMINI_READ_TIMEOUT_S)) as client:
        async with client.stream(
            "POST",
            GEMINI_STREAM_URL,
            headers={
                "Content-Type": "application/json",
                "x-goog-api-key": GEMINI_API_KEY,
            },
            json=request_payload.data,
        ) as response:
            if response.is_success:
                print("Response (in OpenAI SSE format):")
                print("=" * 40)

                # Collect and translate
                chunks = []
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        json_line = line[6:].strip()
                        if json_line:
                            chunks.append(json_line)

                async def iter_arr(arr):
                    for item in arr:
                        yield item

                # Output in OpenAI SSE format
                async for sse in gemini_stream_to_openai(iter_arr(chunks), "gemini-2.0-flash"):
                    print(sse, end="")

                print("=" * 40)
            else:
                error_text = await response.aread()
                print(f"Error: {response.status_code} {error_text.decode()}")

    print("\n" + "=" * 60)
    print("SSE Translation Examples Complete")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
