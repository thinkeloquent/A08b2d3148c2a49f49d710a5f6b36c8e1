"""Overridable HTTP method wrappers for the Gemini OpenAI SDK client.

Provides a base ``HttpMethods`` class that delegates to ``httpx``.
Cloud deployments can subclass to inject corporate headers, custom
error handling, or additional telemetry without modifying the core client.

Example::

    from gemini_openai_sdk.client_http_methods import HttpMethods

    class CustomHttpMethods(HttpMethods):
        async def apost(self, client, url, headers, payload, timeout):
            headers["X-Custom-Source"] = "ai-platform"
            return await super().apost(client, url, headers, payload, timeout)
"""

from __future__ import annotations

import json
import time
from typing import Any, AsyncGenerator, Dict, List, Optional

import httpx

from .logger import create

logger = create("gemini_openai_sdk", __file__)


class HttpMethods:
    """Base HTTP method wrappers for Gemini API communication."""

    # ------------------------------------------------------------------
    # Non-streaming POST
    # ------------------------------------------------------------------

    async def apost(
        self,
        url: str,
        headers: Dict[str, str],
        payload: Dict[str, Any],
        timeout: float,
    ) -> Dict[str, Any]:
        """Async POST — returns parsed JSON response.

        Raises:
            Exception: On API error with status code and message
        """
        start_time = time.time()

        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, headers=headers, json=payload)

            elapsed_ms = (time.time() - start_time) * 1000

            if response.status_code >= 400:
                error_text = response.text
                logger.error(
                    "apost: API error",
                    status=response.status_code,
                    error=error_text[:200],
                )
                raise Exception(f"{response.status_code}: {error_text}")

            result = response.json()
            usage = result.get("usage", {})

            logger.info(
                "apost: success",
                model=result.get("model"),
                tokens=usage.get("total_tokens"),
                elapsed_ms=round(elapsed_ms, 2),
            )

            return result

    # ------------------------------------------------------------------
    # Streaming POST
    # ------------------------------------------------------------------

    async def apost_stream(
        self,
        url: str,
        headers: Dict[str, str],
        payload: Dict[str, Any],
        timeout: float,
    ) -> AsyncGenerator[str, None]:
        """Async streaming POST — yields SSE data chunks.

        Raises:
            Exception: On API error with status code and message
        """
        start_time = time.time()
        chunk_count = 0

        logger.debug("apost_stream: opening stream")

        async with httpx.AsyncClient(timeout=timeout) as client:
            async with client.stream(
                "POST", url, headers=headers, json=payload,
            ) as response:
                if response.status_code >= 400:
                    error = await response.aread()
                    error_text = error.decode()
                    logger.error(
                        "apost_stream: API error",
                        status=response.status_code,
                        error=error_text[:200],
                    )
                    raise Exception(f"{response.status_code}: {error_text}")

                async for line in response.aiter_lines():
                    line = line.strip()
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            elapsed_ms = (time.time() - start_time) * 1000
                            logger.info(
                                "apost_stream: complete",
                                chunk_count=chunk_count,
                                elapsed_ms=round(elapsed_ms, 2),
                            )
                            return
                        if data:
                            chunk_count += 1
                            yield data
