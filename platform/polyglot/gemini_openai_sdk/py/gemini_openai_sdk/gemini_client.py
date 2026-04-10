"""
GeminiClient - High-Level SDK Interface

Provides a unified interface for all Gemini operations with
consistent response handling and defensive logging.
"""

import json
import time
from typing import Any, AsyncGenerator, Dict, List, Optional

from env_resolver import resolve_gemini_env

from .client import accumulate_stream, chat_completion, stream_chat_completion
from .constants import DEFAULT_MODEL, DEFAULTS, MODELS, SYSTEM_PROMPT
from .helpers import extract_json, get_api_key, get_model, normalize_messages, validate_schema
from .logger import SDKLogger, create
from .tools import DEFAULT_TOOLS, process_tool_calls
from .types import ChatResponse, ToolResult, UsageStats

logger = create("gemini_openai_sdk", __file__)

_gemini_env = resolve_gemini_env()


class GeminiClient:
    """
    High-level client for Gemini OpenAI-compatible API.

    Provides methods for chat, streaming, structured output,
    tool calling, and more with consistent response handling.

    Example:
        client = GeminiClient()
        result = await client.chat("What is the capital of France?")
        if result.success:
            print(result.content)
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = DEFAULT_MODEL,
        system_prompt: Optional[str] = None,
        logger_instance: Optional[SDKLogger] = None,
    ):
        """
        Initialize GeminiClient.

        Args:
            api_key: Optional API key (uses env var if not provided)
            model: Default model type ("flash" or "pro")
            system_prompt: Custom system prompt (uses default if not provided)
            logger_instance: Optional custom logger
        """
        self._api_key = api_key
        self._model = get_model(model)
        self._model_type = model
        self._system_prompt = system_prompt or SYSTEM_PROMPT
        self._logger = logger_instance or logger

        self._logger.debug(
            "GeminiClient: initialized",
            model=self._model_type,
            has_api_key=bool(api_key or _gemini_env.api_key),
        )

    async def chat(
        self,
        prompt: str,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        use_system_prompt: bool = True,
    ) -> ChatResponse:
        """
        Simple chat completion with a single prompt.

        Args:
            prompt: User prompt string
            model: Model type override
            temperature: Temperature override
            max_tokens: Max tokens override
            use_system_prompt: Whether to include system prompt

        Returns:
            ChatResponse with success status and content
        """
        start_time = time.time()
        self._logger.debug("chat: enter", prompt_length=len(prompt))

        try:
            messages = []
            if use_system_prompt:
                messages.append({"role": "system", "content": self._system_prompt})
            messages.append({"role": "user", "content": prompt})

            response = await chat_completion(
                messages=messages,
                model=get_model(model or self._model_type),
                temperature=temperature,
                max_tokens=max_tokens,
            )

            elapsed_ms = (time.time() - start_time) * 1000
            result = ChatResponse.from_api_response(response, elapsed_ms)

            self._logger.info("chat: success", elapsed_ms=round(elapsed_ms, 2))
            return result

        except Exception as e:
            elapsed_ms = (time.time() - start_time) * 1000
            self._logger.error("chat: failed", error=str(e))
            return ChatResponse.error_response(str(e), elapsed_ms)

    async def chat_messages(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> ChatResponse:
        """
        Chat completion with custom messages array.

        Args:
            messages: List of message dictionaries
            model: Model type override
            temperature: Temperature override
            max_tokens: Max tokens override

        Returns:
            ChatResponse with success status and content
        """
        start_time = time.time()
        self._logger.debug("chat_messages: enter", messages_count=len(messages))

        if not messages:
            return ChatResponse.error_response("messages array is required")

        try:
            response = await chat_completion(
                messages=messages,
                model=get_model(model or self._model_type),
                temperature=temperature,
                max_tokens=max_tokens,
            )

            elapsed_ms = (time.time() - start_time) * 1000
            return ChatResponse.from_api_response(response, elapsed_ms)

        except Exception as e:
            elapsed_ms = (time.time() - start_time) * 1000
            self._logger.error("chat_messages: failed", error=str(e))
            return ChatResponse.error_response(str(e), elapsed_ms)

    async def structure(
        self,
        prompt: str,
        schema: Dict[str, Any],
        model: Optional[str] = None,
    ) -> ChatResponse:
        """
        Structured output with JSON schema.

        Args:
            prompt: User prompt
            schema: JSON schema for response
            model: Model type override

        Returns:
            ChatResponse with parsed JSON in 'parsed' field
        """
        start_time = time.time()
        self._logger.debug("structure: enter")

        try:
            messages = [
                {"role": "system", "content": "Return ONLY valid JSON matching the schema."},
                {"role": "user", "content": prompt},
            ]

            response = await chat_completion(
                messages=messages,
                model=get_model(model or self._model_type),
                temperature=0,
                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name": "StructuredResponse",
                        "schema": schema,
                        "strict": True,
                    },
                },
            )

            elapsed_ms = (time.time() - start_time) * 1000
            content = response["choices"][0]["message"]["content"]
            parsed = extract_json(content)

            usage_data = response.get("usage", {})
            usage = UsageStats(
                prompt_tokens=usage_data.get("prompt_tokens", 0),
                completion_tokens=usage_data.get("completion_tokens", 0),
                total_tokens=usage_data.get("total_tokens", 0),
            )

            self._logger.info("structure: success", elapsed_ms=round(elapsed_ms, 2))

            return ChatResponse(
                success=True,
                content=content,
                model=response.get("model"),
                parsed=parsed,
                schema=schema,
                usage=usage,
                execution_time_ms=elapsed_ms,
            )

        except Exception as e:
            elapsed_ms = (time.time() - start_time) * 1000
            self._logger.error("structure: failed", error=str(e))
            return ChatResponse.error_response(str(e), elapsed_ms)

    async def stream(
        self,
        prompt: str,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
    ) -> ChatResponse:
        """
        Streaming chat completion (returns accumulated result).

        Args:
            prompt: User prompt
            model: Model type override
            temperature: Temperature override

        Returns:
            ChatResponse with accumulated content and chunk count
        """
        start_time = time.time()
        self._logger.debug("stream: enter")

        try:
            messages = [
                {"role": "system", "content": self._system_prompt},
                {"role": "user", "content": prompt},
            ]

            result = await accumulate_stream(
                messages=messages,
                model=get_model(model or self._model_type),
                temperature=temperature,
            )

            elapsed_ms = (time.time() - start_time) * 1000

            usage = None
            if result.get("usage"):
                usage_data = result["usage"]
                usage = UsageStats(
                    prompt_tokens=usage_data.get("prompt_tokens", 0),
                    completion_tokens=usage_data.get("completion_tokens", 0),
                    total_tokens=usage_data.get("total_tokens", 0),
                )

            self._logger.info(
                "stream: success",
                chunk_count=result["chunk_count"],
                elapsed_ms=round(elapsed_ms, 2),
            )

            return ChatResponse(
                success=True,
                content=result["content"],
                chunk_count=result["chunk_count"],
                usage=usage,
                execution_time_ms=elapsed_ms,
            )

        except Exception as e:
            elapsed_ms = (time.time() - start_time) * 1000
            self._logger.error("stream: failed", error=str(e))
            return ChatResponse.error_response(str(e), elapsed_ms)

    async def stream_generator(
        self,
        prompt: str,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
    ) -> AsyncGenerator[str, None]:
        """
        Streaming chat completion as async generator.

        Yields raw JSON chunks for client-side processing.

        Args:
            prompt: User prompt
            model: Model type override
            temperature: Temperature override

        Yields:
            JSON string chunks
        """
        self._logger.debug("stream_generator: enter")

        messages = [
            {"role": "system", "content": self._system_prompt},
            {"role": "user", "content": prompt},
        ]

        async for chunk in stream_chat_completion(
            messages=messages,
            model=get_model(model or self._model_type),
            temperature=temperature,
        ):
            yield chunk

    async def tool_call(
        self,
        prompt: str,
        tools: Optional[List[Dict[str, Any]]] = None,
        model: Optional[str] = None,
    ) -> ChatResponse:
        """
        Function calling (tool calls) with automatic execution.

        Args:
            prompt: User prompt
            tools: List of tool definitions (uses defaults if not provided)
            model: Model type override

        Returns:
            ChatResponse with tool_calls results
        """
        start_time = time.time()
        self._logger.debug("tool_call: enter")

        try:
            messages = [
                {"role": "system", "content": "You are a helpful assistant. Use the provided tools when appropriate."},
                {"role": "user", "content": prompt},
            ]

            response = await chat_completion(
                messages=messages,
                model=get_model(model or self._model_type),
                temperature=0,
                tools=tools or DEFAULT_TOOLS,
                tool_choice="auto",
            )

            elapsed_ms = (time.time() - start_time) * 1000
            choice = response["choices"][0]
            tool_calls_data = choice["message"].get("tool_calls", [])

            tool_results = []
            if tool_calls_data:
                processed = process_tool_calls(tool_calls_data)
                tool_results = [
                    ToolResult(
                        tool_call_id=r["id"],
                        function_name=r["function"],
                        arguments=r["arguments"],
                        result=r["result"],
                    )
                    for r in processed
                ]

            self._logger.info(
                "tool_call: success",
                tool_count=len(tool_results),
                elapsed_ms=round(elapsed_ms, 2),
            )

            return ChatResponse(
                success=True,
                model=response.get("model"),
                finish_reason=choice.get("finish_reason"),
                content=choice["message"].get("content"),
                tool_calls=tool_results,
                execution_time_ms=elapsed_ms,
            )

        except Exception as e:
            elapsed_ms = (time.time() - start_time) * 1000
            self._logger.error("tool_call: failed", error=str(e))
            return ChatResponse.error_response(str(e), elapsed_ms)

    async def schema_mapping(
        self,
        prompt: str,
        schema: Dict[str, Any],
        model: Optional[str] = None,
    ) -> ChatResponse:
        """
        JSON schema validation with structured outputs.

        Args:
            prompt: User prompt
            schema: JSON schema to validate against
            model: Model type override

        Returns:
            ChatResponse with parsed data and validation result
        """
        start_time = time.time()
        self._logger.debug("schema_mapping: enter")

        try:
            messages = [
                {"role": "system", "content": "Return ONLY valid JSON. No markdown, no explanation."},
                {"role": "user", "content": prompt},
            ]

            response = await chat_completion(
                messages=messages,
                model=get_model(model or self._model_type),
                temperature=0,
                response_format={"type": "json_object"},
            )

            elapsed_ms = (time.time() - start_time) * 1000
            content = response["choices"][0]["message"]["content"]
            parsed = extract_json(content)

            validation = (
                validate_schema(parsed, schema)
                if parsed
                else {"valid": False, "errors": ["Failed to parse JSON"]}
            )

            usage_data = response.get("usage", {})
            usage = UsageStats(
                prompt_tokens=usage_data.get("prompt_tokens", 0),
                completion_tokens=usage_data.get("completion_tokens", 0),
                total_tokens=usage_data.get("total_tokens", 0),
            )

            self._logger.info("schema_mapping: success", valid=validation["valid"])

            return ChatResponse(
                success=True,
                content=content,
                model=response.get("model"),
                parsed=parsed,
                schema=schema,
                validation=validation,
                usage=usage,
                execution_time_ms=elapsed_ms,
            )

        except Exception as e:
            elapsed_ms = (time.time() - start_time) * 1000
            self._logger.error("schema_mapping: failed", error=str(e))
            return ChatResponse.error_response(str(e), elapsed_ms)

    async def conversation(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> ChatResponse:
        """
        Multi-turn conversation.

        Automatically prepends system prompt if not present.

        Args:
            messages: Conversation messages array
            model: Model type override
            temperature: Temperature override
            max_tokens: Max tokens override

        Returns:
            ChatResponse with assistant message
        """
        start_time = time.time()

        if not messages:
            self._logger.debug("conversation: invalid messages")
            return ChatResponse.error_response("messages array is required")

        self._logger.debug("conversation: enter", turns=len(messages))

        try:
            normalized = normalize_messages(
                messages,
                include_system_prompt=True,
                system_prompt=self._system_prompt,
            )

            response = await chat_completion(
                messages=normalized,
                model=get_model(model or self._model_type),
                temperature=temperature,
                max_tokens=max_tokens,
            )

            elapsed_ms = (time.time() - start_time) * 1000
            choice = response["choices"][0]

            usage_data = response.get("usage", {})
            usage = UsageStats(
                prompt_tokens=usage_data.get("prompt_tokens", 0),
                completion_tokens=usage_data.get("completion_tokens", 0),
                total_tokens=usage_data.get("total_tokens", 0),
            )

            self._logger.info("conversation: success", elapsed_ms=round(elapsed_ms, 2))

            return ChatResponse(
                success=True,
                model=response.get("model"),
                assistant_message=choice["message"],
                finish_reason=choice.get("finish_reason"),
                usage=usage,
                execution_time_ms=elapsed_ms,
            )

        except Exception as e:
            elapsed_ms = (time.time() - start_time) * 1000
            self._logger.error("conversation: failed", error=str(e))
            return ChatResponse.error_response(str(e), elapsed_ms)

    async def json_mode(
        self,
        prompt: str,
        model: Optional[str] = None,
    ) -> ChatResponse:
        """
        JSON mode - request JSON object response.

        Args:
            prompt: User prompt
            model: Model type override

        Returns:
            ChatResponse with parsed JSON
        """
        start_time = time.time()
        self._logger.debug("json_mode: enter")

        try:
            messages = [{"role": "user", "content": prompt}]

            response = await chat_completion(
                messages=messages,
                model=get_model(model or self._model_type),
                temperature=0,
                response_format={"type": "json_object"},
            )

            elapsed_ms = (time.time() - start_time) * 1000
            content = response["choices"][0]["message"]["content"]
            parsed = extract_json(content)

            usage_data = response.get("usage", {})
            usage = UsageStats(
                prompt_tokens=usage_data.get("prompt_tokens", 0),
                completion_tokens=usage_data.get("completion_tokens", 0),
                total_tokens=usage_data.get("total_tokens", 0),
            )

            self._logger.info("json_mode: success", elapsed_ms=round(elapsed_ms, 2))

            return ChatResponse(
                success=True,
                content=content,
                model=response.get("model"),
                parsed=parsed,
                usage=usage,
                execution_time_ms=elapsed_ms,
            )

        except Exception as e:
            elapsed_ms = (time.time() - start_time) * 1000
            self._logger.error("json_mode: failed", error=str(e))
            return ChatResponse.error_response(str(e), elapsed_ms)

    async def stream_format(
        self,
        prompt: str,
        model: Optional[str] = None,
    ) -> ChatResponse:
        """
        Stream format analysis - detailed chunk-by-chunk analysis.

        Args:
            prompt: User prompt
            model: Model type override

        Returns:
            ChatResponse with chunks array and accumulated data
        """
        start_time = time.time()
        self._logger.debug("stream_format: enter")

        try:
            messages = [{"role": "user", "content": prompt}]

            chunks = []
            accumulated = {
                "id": None,
                "model": None,
                "role": None,
                "content": "",
                "finish_reason": None,
                "usage": None,
            }

            async for data in stream_chat_completion(
                messages=messages,
                model=get_model(model or self._model_type),
                max_tokens=50,
            ):
                try:
                    parsed = json.loads(data)
                    chunk_info: Dict[str, Any] = {"raw_length": len(data)}

                    if parsed.get("id"):
                        accumulated["id"] = parsed["id"]
                        chunk_info["id"] = parsed["id"]
                    if parsed.get("model"):
                        accumulated["model"] = parsed["model"]
                        chunk_info["model"] = parsed["model"]

                    choice = parsed.get("choices", [{}])[0]
                    delta = choice.get("delta", {})

                    if delta.get("role"):
                        accumulated["role"] = delta["role"]
                        chunk_info["role"] = delta["role"]
                    if delta.get("content"):
                        accumulated["content"] += delta["content"]
                        chunk_info["content"] = delta["content"]
                    if choice.get("finish_reason"):
                        accumulated["finish_reason"] = choice["finish_reason"]
                        chunk_info["finish_reason"] = choice["finish_reason"]
                    if parsed.get("usage"):
                        accumulated["usage"] = parsed["usage"]
                        chunk_info["usage"] = parsed["usage"]

                    chunks.append(chunk_info)
                except json.JSONDecodeError:
                    chunks.append({"error": "parse_error", "raw": data[:100]})

            elapsed_ms = (time.time() - start_time) * 1000

            self._logger.info(
                "stream_format: success",
                chunk_count=len(chunks),
                elapsed_ms=round(elapsed_ms, 2),
            )

            return ChatResponse(
                success=True,
                chunk_count=len(chunks),
                chunks=chunks,
                accumulated=accumulated,
                format_info={
                    "content_type": "text/event-stream",
                    "chunk_format": 'data: {"choices":[{"delta":{"content":"..."}}]}',
                    "end_marker": "data: [DONE]",
                },
                execution_time_ms=elapsed_ms,
            )

        except Exception as e:
            elapsed_ms = (time.time() - start_time) * 1000
            self._logger.error("stream_format: failed", error=str(e))
            return ChatResponse.error_response(str(e), elapsed_ms)

    async def pool(
        self,
        prompt: str,
        parallel: int = 3,
        model: Optional[str] = None,
    ) -> ChatResponse:
        """
        Connection pool demonstration with parallel requests.

        Args:
            prompt: User prompt
            parallel: Number of parallel requests (1-5)
            model: Model type override

        Returns:
            ChatResponse with responses array
        """
        import asyncio

        start_time = time.time()
        parallel = max(1, min(5, parallel))
        self._logger.debug("pool: enter", parallel=parallel)

        try:
            messages = [
                {"role": "system", "content": self._system_prompt},
                {"role": "user", "content": prompt},
            ]

            tasks = [
                chat_completion(
                    messages=messages,
                    model=get_model(model or self._model_type),
                    max_tokens=50,
                )
                for _ in range(parallel)
            ]

            results = await asyncio.gather(*tasks, return_exceptions=True)

            responses = []
            for i, r in enumerate(results):
                if isinstance(r, Exception):
                    responses.append({"index": i, "error": str(r)})
                else:
                    responses.append({
                        "index": i,
                        "content": r["choices"][0]["message"]["content"],
                        "model": r.get("model"),
                    })

            elapsed_ms = (time.time() - start_time) * 1000

            self._logger.info(
                "pool: success",
                parallel=parallel,
                elapsed_ms=round(elapsed_ms, 2),
            )

            return ChatResponse(
                success=True,
                parsed={"parallel_requests": parallel, "responses": responses},
                execution_time_ms=elapsed_ms,
            )

        except Exception as e:
            elapsed_ms = (time.time() - start_time) * 1000
            self._logger.error("pool: failed", error=str(e))
            return ChatResponse.error_response(str(e), elapsed_ms)

    async def health_check(self) -> Dict[str, Any]:
        """
        Check client health and configuration.
        Makes a minimal LLM call to verify connectivity.

        Returns:
            Health status dictionary with LLM connectivity check
        """
        from .health_check import health_check as perform_health_check

        return await perform_health_check(
            model_type=self._model_type,
            system_prompt=self._system_prompt,
        )
