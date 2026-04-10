"""
Gemini OpenAI Integration Routes

Exposes all Gemini OpenAI-compatible functionality as API endpoints.
Based on integration examples from how-to-get-started/2.fetch/

Endpoints:
- /healthz/gemini-openai/chat - Basic chat completion
- /healthz/gemini-openai/structure - Structured output with JSON schema
- /healthz/gemini-openai/streaming - Streaming chat completion
- /healthz/gemini-openai/sse - Server-Sent Events streaming
- /healthz/gemini-openai/tool-calls - Function calling (tool calls)
- /healthz/gemini-openai/schema-mapping - JSON schema validation
- /healthz/gemini-openai/pool - Connection pool demonstration
- /healthz/gemini-openai/proxy-pool - Proxy pool demonstration
- /healthz/gemini-openai/stream-format - Stream format demonstration
"""
import ast
import asyncio
import json
import operator
import os
import re
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, Request, Query
from fastapi.responses import StreamingResponse, JSONResponse
from env_resolver import resolve_gemini_env

_gemini_env = resolve_gemini_env()

# =============================================================================
# CONSTANTS
# =============================================================================

# Model configurations
MODELS = {
    "flash": "gemini-2.0-flash",
    "pro": "gemini-2.0-pro-exp-02-05",
}
DEFAULT_MODEL = "flash"

# Common system prompt used across all endpoints
SYSTEM_PROMPT = "You are a helpful AI assistant powered by Gemini. Be concise, accurate, and helpful."

# Gemini OpenAI-compatible endpoints
BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai"
CHAT_ENDPOINT = f"{BASE_URL}/chat/completions"
MODELS_ENDPOINT = f"{BASE_URL}/models"

# Default settings
DEFAULT_TEMPERATURE = 0.7
DEFAULT_MAX_TOKENS = 1000
DEFAULT_TIMEOUT = 60.0

# =============================================================================
# HELPERS
# =============================================================================

def get_api_key() -> Optional[str]:
    """Get Gemini API key from environment."""
    return _gemini_env.api_key


def get_model(model_type: str) -> str:
    """Get model name from type (flash/pro)."""
    return MODELS.get(model_type, MODELS[DEFAULT_MODEL])


def get_headers(api_key: str) -> dict:
    """Build authorization headers."""
    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }


def extract_json(content: str) -> Optional[dict]:
    """Extract JSON from response content."""
    if not content:
        return None
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        pass
    # Try markdown code block
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", content)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            pass
    # Try finding JSON object
    match = re.search(r"\{[\s\S]*\}", content)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass
    return None


def validate_schema(data: dict, schema: dict) -> dict:
    """Simple schema validator."""
    errors = []
    if schema.get("type") == "object" and not isinstance(data, dict):
        return {"valid": False, "errors": ["Expected object"]}
    if "required" in schema:
        for field in schema["required"]:
            if field not in data:
                errors.append(f"Missing required field: {field}")
    if "properties" in schema:
        for key, prop_schema in schema["properties"].items():
            if key in data:
                value = data[key]
                prop_type = prop_schema.get("type")
                if prop_type == "string" and not isinstance(value, str):
                    errors.append(f"{key} should be string")
                if prop_type == "number" and not isinstance(value, (int, float)):
                    errors.append(f"{key} should be number")
                if prop_type == "boolean" and not isinstance(value, bool):
                    errors.append(f"{key} should be boolean")
                if prop_type == "array" and not isinstance(value, list):
                    errors.append(f"{key} should be array")
    return {"valid": len(errors) == 0, "errors": errors}


# =============================================================================
# HTTP CLIENT
# =============================================================================

async def chat_completion(
    messages: List[Dict[str, str]],
    model: str = None,
    temperature: float = DEFAULT_TEMPERATURE,
    max_tokens: int = DEFAULT_MAX_TOKENS,
    stream: bool = False,
    **kwargs
) -> dict:
    """Execute chat completion request."""
    import httpx

    api_key = get_api_key()
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is required")

    payload = {
        "model": model or MODELS[DEFAULT_MODEL],
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": stream,
        **kwargs,
    }

    async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
        response = await client.post(
            CHAT_ENDPOINT,
            headers=get_headers(api_key),
            json=payload,
        )
        if response.status_code >= 400:
            raise Exception(f"{response.status_code}: {response.text}")
        return response.json()


async def stream_chat_completion(
    messages: List[Dict[str, str]],
    model: str = None,
    temperature: float = DEFAULT_TEMPERATURE,
    max_tokens: int = DEFAULT_MAX_TOKENS,
    **kwargs
):
    """Stream chat completion request as async generator."""
    import httpx

    api_key = get_api_key()
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is required")

    payload = {
        "model": model or MODELS[DEFAULT_MODEL],
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": True,
        **kwargs,
    }

    async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
        async with client.stream(
            "POST",
            CHAT_ENDPOINT,
            headers=get_headers(api_key),
            json=payload,
        ) as response:
            if response.status_code >= 400:
                error = await response.aread()
                raise Exception(f"{response.status_code}: {error.decode()}")
            async for line in response.aiter_lines():
                line = line.strip()
                if line.startswith("data: "):
                    data = line[6:]
                    if data == "[DONE]":
                        return
                    if data:
                        yield data


# =============================================================================
# TOOL DEFINITIONS
# =============================================================================

WEATHER_TOOL = {
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get the current weather for a location",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "The city and state, e.g., San Francisco, CA",
                },
                "unit": {
                    "type": "string",
                    "enum": ["celsius", "fahrenheit"],
                    "description": "Temperature unit",
                },
            },
            "required": ["location"],
        },
    },
}

CALCULATOR_TOOL = {
    "type": "function",
    "function": {
        "name": "calculate",
        "description": "Perform a mathematical calculation",
        "parameters": {
            "type": "object",
            "properties": {
                "expression": {
                    "type": "string",
                    "description": "The mathematical expression to evaluate",
                },
            },
            "required": ["expression"],
        },
    },
}


def execute_weather(args: dict) -> dict:
    """Simulated weather tool implementation."""
    location = args.get("location")
    unit = args.get("unit", "celsius")
    return {
        "location": location,
        "temperature": 22 if unit == "celsius" else 72,
        "unit": unit,
        "conditions": "sunny",
        "humidity": 45,
    }


_SAFE_OPS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}


def _eval_math_node(node):
    """Recursively evaluate an AST node containing only arithmetic."""
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return node.value
    if isinstance(node, ast.BinOp):
        op = _SAFE_OPS.get(type(node.op))
        if op is None:
            raise ValueError(f"Unsupported operator: {type(node.op).__name__}")
        return op(_eval_math_node(node.left), _eval_math_node(node.right))
    if isinstance(node, ast.UnaryOp):
        op = _SAFE_OPS.get(type(node.op))
        if op is None:
            raise ValueError(f"Unsupported operator: {type(node.op).__name__}")
        return op(_eval_math_node(node.operand))
    raise ValueError(f"Unsupported expression: {type(node).__name__}")


def safe_eval_math(expression: str):
    """Safely evaluate a mathematical expression using AST parsing."""
    tree = ast.parse(expression.strip(), mode="eval")
    return _eval_math_node(tree.body)


def execute_calculate(args: dict) -> dict:
    """Simulated calculator tool implementation."""
    expression = args.get("expression")
    try:
        result = safe_eval_math(expression)
        return {"expression": expression, "result": result}
    except Exception:
        return {"expression": expression, "error": "Invalid expression"}


# =============================================================================
# ROUTE MOUNTING
# =============================================================================

def mount(app: FastAPI):
    """Mount all Gemini OpenAI routes."""

    # -------------------------------------------------------------------------
    # Health Check
    # -------------------------------------------------------------------------
    @app.get("/healthz/gemini-openai")
    async def healthz_gemini_openai():
        """Health check for Gemini OpenAI integration."""
        api_key = get_api_key()
        return {
            "status": "healthy" if api_key else "unhealthy",
            "api_key_configured": bool(api_key),
            "models": MODELS,
            "default_model": DEFAULT_MODEL,
            "system_prompt": SYSTEM_PROMPT,
            "endpoints": {
                "chat": "/healthz/gemini-openai/chat",
                "structure": "/healthz/gemini-openai/structure",
                "streaming": "/healthz/gemini-openai/streaming",
                "sse": "/healthz/gemini-openai/sse",
                "tool_calls": "/healthz/gemini-openai/tool-calls",
                "schema_mapping": "/healthz/gemini-openai/schema-mapping",
                "pool": "/healthz/gemini-openai/pool",
                "proxy_pool": "/healthz/gemini-openai/proxy-pool",
                "stream_format": "/healthz/gemini-openai/stream-format",
            },
        }

    # -------------------------------------------------------------------------
    # Basic Chat Completion
    # -------------------------------------------------------------------------
    @app.get("/healthz/gemini-openai/chat")
    async def healthz_chat(
        prompt: str = Query("What is the capital of France? Reply in one word.", description="User prompt"),
        model: str = Query(DEFAULT_MODEL, description="Model type: flash or pro"),
        temperature: float = Query(DEFAULT_TEMPERATURE, description="Temperature (0.0-2.0)"),
        max_tokens: int = Query(DEFAULT_MAX_TOKENS, description="Maximum tokens"),
        use_system_prompt: bool = Query(True, description="Include system prompt"),
    ):
        """Basic chat completion endpoint."""
        try:
            messages = []
            if use_system_prompt:
                messages.append({"role": "system", "content": SYSTEM_PROMPT})
            messages.append({"role": "user", "content": prompt})

            response = await chat_completion(
                messages=messages,
                model=get_model(model),
                temperature=temperature,
                max_tokens=max_tokens,
            )

            return {
                "success": True,
                "model": response.get("model"),
                "content": response["choices"][0]["message"]["content"],
                "finish_reason": response["choices"][0].get("finish_reason"),
                "usage": response.get("usage"),
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    @app.post("/healthz/gemini-openai/chat")
    async def healthz_chat_post(
        request: Request,
        model: str = Query(DEFAULT_MODEL, description="Model type: flash or pro"),
    ):
        """Chat completion with custom messages (POST)."""
        try:
            body = await request.json()
            messages = body.get("messages", [])

            if not messages:
                return {"success": False, "error": "messages array is required"}

            response = await chat_completion(
                messages=messages,
                model=get_model(model),
                temperature=body.get("temperature", DEFAULT_TEMPERATURE),
                max_tokens=body.get("max_tokens", DEFAULT_MAX_TOKENS),
            )

            return {
                "success": True,
                "model": response.get("model"),
                "content": response["choices"][0]["message"]["content"],
                "finish_reason": response["choices"][0].get("finish_reason"),
                "usage": response.get("usage"),
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    # -------------------------------------------------------------------------
    # Structured Output
    # -------------------------------------------------------------------------
    @app.get("/healthz/gemini-openai/structure")
    async def healthz_structure(
        prompt: str = Query("Generate a sample weather report for Boston.", description="User prompt"),
        model: str = Query(DEFAULT_MODEL, description="Model type: flash or pro"),
    ):
        """Structured output with JSON schema."""
        try:
            schema = {
                "type": "object",
                "properties": {
                    "city": {"type": "string"},
                    "tempF": {"type": "number"},
                    "summary": {"type": "string"},
                },
                "required": ["city", "tempF", "summary"],
                "additionalProperties": False,
            }

            messages = [
                {"role": "system", "content": "Return ONLY valid JSON matching the schema."},
                {"role": "user", "content": prompt},
            ]

            response = await chat_completion(
                messages=messages,
                model=get_model(model),
                temperature=0,
                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name": "WeatherReport",
                        "schema": schema,
                        "strict": True,
                    },
                },
            )

            content = response["choices"][0]["message"]["content"]
            parsed = extract_json(content)

            return {
                "success": True,
                "model": response.get("model"),
                "raw_content": content,
                "parsed": parsed,
                "schema": schema,
                "usage": response.get("usage"),
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    # -------------------------------------------------------------------------
    # Streaming
    # -------------------------------------------------------------------------
    @app.get("/healthz/gemini-openai/streaming")
    async def healthz_streaming(
        prompt: str = Query("Write a haiku about programming.", description="User prompt"),
        model: str = Query(DEFAULT_MODEL, description="Model type: flash or pro"),
        temperature: float = Query(0.8, description="Temperature"),
    ):
        """Streaming chat completion (returns accumulated result)."""
        try:
            messages = [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ]

            chunks = []
            full_content = ""
            usage = None

            async for data in stream_chat_completion(
                messages=messages,
                model=get_model(model),
                temperature=temperature,
            ):
                try:
                    parsed = json.loads(data)
                    content = parsed.get("choices", [{}])[0].get("delta", {}).get("content")
                    if content:
                        full_content += content
                        chunks.append(content)
                    if "usage" in parsed:
                        usage = parsed["usage"]
                except json.JSONDecodeError:
                    pass

            return {
                "success": True,
                "content": full_content,
                "chunk_count": len(chunks),
                "usage": usage,
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    # -------------------------------------------------------------------------
    # Server-Sent Events
    # -------------------------------------------------------------------------
    @app.get("/healthz/gemini-openai/sse")
    async def healthz_sse(
        prompt: str = Query("Count from 1 to 5, one number per line.", description="User prompt"),
        model: str = Query(DEFAULT_MODEL, description="Model type: flash or pro"),
    ):
        """Server-Sent Events streaming endpoint."""
        async def generate():
            try:
                messages = [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ]

                async for data in stream_chat_completion(
                    messages=messages,
                    model=get_model(model),
                ):
                    yield f"data: {data}\n\n"

                yield "data: [DONE]\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        )

    # -------------------------------------------------------------------------
    # Tool Calls
    # -------------------------------------------------------------------------
    @app.get("/healthz/gemini-openai/tool-calls")
    async def healthz_tool_calls(
        prompt: str = Query("What is the weather in Tokyo?", description="User prompt"),
        model: str = Query(DEFAULT_MODEL, description="Model type: flash or pro"),
    ):
        """Function calling (tool calls) demonstration."""
        try:
            messages = [
                {"role": "system", "content": "You are a helpful assistant. Use the provided tools when appropriate."},
                {"role": "user", "content": prompt},
            ]

            response = await chat_completion(
                messages=messages,
                model=get_model(model),
                temperature=0,
                tools=[WEATHER_TOOL, CALCULATOR_TOOL],
                tool_choice="auto",
            )

            choice = response["choices"][0]
            tool_calls = choice["message"].get("tool_calls")

            result = {
                "success": True,
                "model": response.get("model"),
                "finish_reason": choice.get("finish_reason"),
                "tool_calls": [],
                "content": choice["message"].get("content"),
            }

            if tool_calls:
                for tool_call in tool_calls:
                    func_name = tool_call["function"]["name"]
                    func_args = json.loads(tool_call["function"]["arguments"])

                    # Execute tool
                    if func_name == "get_weather":
                        tool_result = execute_weather(func_args)
                    elif func_name == "calculate":
                        tool_result = execute_calculate(func_args)
                    else:
                        tool_result = {"error": f"Unknown function: {func_name}"}

                    result["tool_calls"].append({
                        "id": tool_call.get("id"),
                        "function": func_name,
                        "arguments": func_args,
                        "result": tool_result,
                    })

            return result
        except Exception as e:
            return {"success": False, "error": str(e)}

    # -------------------------------------------------------------------------
    # Schema Mapping
    # -------------------------------------------------------------------------
    @app.get("/healthz/gemini-openai/schema-mapping")
    async def healthz_schema_mapping(
        prompt: str = Query("Generate a user profile with name, email, and age in JSON format.", description="User prompt"),
        model: str = Query(DEFAULT_MODEL, description="Model type: flash or pro"),
    ):
        """JSON schema validation and structured outputs."""
        try:
            user_schema = {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "email": {"type": "string"},
                    "age": {"type": "number"},
                },
                "required": ["name", "email", "age"],
            }

            messages = [
                {"role": "system", "content": "Return ONLY valid JSON. No markdown, no explanation."},
                {"role": "user", "content": prompt},
            ]

            response = await chat_completion(
                messages=messages,
                model=get_model(model),
                temperature=0,
                response_format={"type": "json_object"},
            )

            content = response["choices"][0]["message"]["content"]
            parsed = extract_json(content)
            validation = validate_schema(parsed, user_schema) if parsed else {"valid": False, "errors": ["Failed to parse JSON"]}

            return {
                "success": True,
                "model": response.get("model"),
                "raw_content": content,
                "parsed": parsed,
                "schema": user_schema,
                "validation": validation,
                "usage": response.get("usage"),
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    # -------------------------------------------------------------------------
    # Connection Pool
    # -------------------------------------------------------------------------
    @app.get("/healthz/gemini-openai/pool")
    async def healthz_pool(
        prompt: str = Query("What is 2+2?", description="User prompt"),
        model: str = Query(DEFAULT_MODEL, description="Model type: flash or pro"),
        parallel: int = Query(3, description="Number of parallel requests (1-5)", ge=1, le=5),
    ):
        """Connection pool demonstration with parallel requests."""
        try:
            messages = [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ]

            # Execute parallel requests
            tasks = [
                chat_completion(
                    messages=messages,
                    model=get_model(model),
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

            return {
                "success": True,
                "parallel_requests": parallel,
                "responses": responses,
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    # -------------------------------------------------------------------------
    # Proxy Pool
    # -------------------------------------------------------------------------
    @app.get("/healthz/gemini-openai/proxy-pool")
    async def healthz_proxy_pool(
        prompt: str = Query("Say hello!", description="User prompt"),
        model: str = Query(DEFAULT_MODEL, description="Model type: flash or pro"),
    ):
        """Proxy pool demonstration (uses env proxy if configured)."""
        try:
            import httpx

            api_key = get_api_key()
            if not api_key:
                raise ValueError("GEMINI_API_KEY environment variable is required")

            # Check for proxy configuration
            proxy_url = os.environ.get("HTTPS_PROXY") or os.environ.get("HTTP_PROXY")

            messages = [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ]

            payload = {
                "model": get_model(model),
                "messages": messages,
                "temperature": DEFAULT_TEMPERATURE,
                "max_tokens": DEFAULT_MAX_TOKENS,
            }

            async with httpx.AsyncClient(
                timeout=DEFAULT_TIMEOUT,
                proxy=proxy_url,
            ) as client:
                response = await client.post(
                    CHAT_ENDPOINT,
                    headers=get_headers(api_key),
                    json=payload,
                )
                if response.status_code >= 400:
                    raise Exception(f"{response.status_code}: {response.text}")
                data = response.json()

            return {
                "success": True,
                "proxy_configured": bool(proxy_url),
                "proxy_url": proxy_url[:20] + "..." if proxy_url else None,
                "model": data.get("model"),
                "content": data["choices"][0]["message"]["content"],
                "usage": data.get("usage"),
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    # -------------------------------------------------------------------------
    # Stream Format
    # -------------------------------------------------------------------------
    @app.get("/healthz/gemini-openai/stream-format")
    async def healthz_stream_format(
        prompt: str = Query("Say Hi in one word.", description="User prompt"),
        model: str = Query(DEFAULT_MODEL, description="Model type: flash or pro"),
    ):
        """Stream format demonstration with detailed chunk analysis."""
        try:
            messages = [
                {"role": "user", "content": prompt},
            ]

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
                model=get_model(model),
                max_tokens=50,
            ):
                try:
                    parsed = json.loads(data)
                    chunk_info = {"raw_length": len(data)}

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

            return {
                "success": True,
                "chunk_count": len(chunks),
                "chunks": chunks,
                "accumulated": accumulated,
                "format_info": {
                    "content_type": "text/event-stream",
                    "chunk_format": 'data: {"choices":[{"delta":{"content":"..."}}]}',
                    "end_marker": "data: [DONE]",
                },
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    # -------------------------------------------------------------------------
    # Multi-turn Conversation
    # -------------------------------------------------------------------------
    @app.post("/healthz/gemini-openai/conversation")
    async def healthz_conversation(
        request: Request,
        model: str = Query(DEFAULT_MODEL, description="Model type: flash or pro"),
    ):
        """Multi-turn conversation endpoint."""
        try:
            body = await request.json()
            messages = body.get("messages", [])

            if not messages:
                return {"success": False, "error": "messages array is required"}

            # Prepend system prompt if not present
            if messages[0].get("role") != "system":
                messages.insert(0, {"role": "system", "content": SYSTEM_PROMPT})

            response = await chat_completion(
                messages=messages,
                model=get_model(model),
                temperature=body.get("temperature", DEFAULT_TEMPERATURE),
                max_tokens=body.get("max_tokens", DEFAULT_MAX_TOKENS),
            )

            return {
                "success": True,
                "model": response.get("model"),
                "assistant_message": response["choices"][0]["message"],
                "finish_reason": response["choices"][0].get("finish_reason"),
                "usage": response.get("usage"),
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    # -------------------------------------------------------------------------
    # JSON Mode
    # -------------------------------------------------------------------------
    @app.get("/healthz/gemini-openai/json-mode")
    async def healthz_json_mode(
        prompt: str = Query("Return a JSON object with keys: name, age, city", description="User prompt"),
        model: str = Query(DEFAULT_MODEL, description="Model type: flash or pro"),
    ):
        """JSON mode demonstration."""
        try:
            messages = [
                {"role": "user", "content": prompt},
            ]

            response = await chat_completion(
                messages=messages,
                model=get_model(model),
                temperature=0,
                response_format={"type": "json_object"},
            )

            content = response["choices"][0]["message"]["content"]
            parsed = extract_json(content)

            return {
                "success": True,
                "model": response.get("model"),
                "raw_content": content,
                "parsed": parsed,
                "usage": response.get("usage"),
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    # -------------------------------------------------------------------------
    # Models List
    # -------------------------------------------------------------------------
    @app.get("/healthz/gemini-openai/models")
    async def healthz_models():
        """List available models via OpenAI-compatible endpoint."""
        try:
            import httpx

            api_key = get_api_key()
            if not api_key:
                raise ValueError("GEMINI_API_KEY environment variable is required")

            async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
                response = await client.get(
                    MODELS_ENDPOINT,
                    headers={"Authorization": f"Bearer {api_key}"},
                )
                if response.status_code >= 400:
                    raise Exception(f"{response.status_code}: {response.text}")
                data = response.json()

            return {
                "success": True,
                "available_models": MODELS,
                "openai_compatible_models": data.get("data", [])[:10],
                "total_count": len(data.get("data", [])),
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
