"""
Gemini OpenAI SDK Router Routes (Alias)

Alias endpoints mirroring gemini_openai_sdk.route.py under a different base path.
Base path: /api/llm/gemini-openai-v1-router/
"""

from typing import Optional, List, Dict, Any
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from gemini_openai_sdk import GeminiClient


BASE_PATH = "/api/llm/gemini-openai-v1-router"

# Module-scoped client instance
client = GeminiClient()


class ChatRequest(BaseModel):
    """Request model for chat completion."""
    prompt: str
    model: str = Field(default="flash")
    temperature: float = Field(default=0.7)
    max_tokens: int = Field(default=1000)


class StructureRequest(BaseModel):
    """Request model for structured JSON output."""
    prompt: str
    schema_: Dict[str, Any] = Field(alias="schema")

    class Config:
        populate_by_name = True


class ToolCallRequest(BaseModel):
    """Request model for function calling."""
    prompt: str
    tools: Optional[List[Dict[str, Any]]] = None


class ConversationRequest(BaseModel):
    """Request model for multi-turn chat."""
    messages: List[Dict[str, str]]
    model: str = Field(default="flash")
    temperature: float = Field(default=0.7)
    max_tokens: int = Field(default=1000)


class JsonRequest(BaseModel):
    """Request model for JSON mode."""
    prompt: str
    model: str = Field(default="flash")


def mount(app: FastAPI):
    """
    Mount routes to the FastAPI application.
    This function is called by the server bootstrap process.
    """

    @app.get(f"{BASE_PATH}/health")
    async def health_router(request: Request):
        """SDK health check."""
        return await client.health_check()

    @app.post(f"{BASE_PATH}/chat")
    async def chat_router(request: Request, body: ChatRequest):
        """Chat completion."""
        result = await client.chat(
            prompt=body.prompt,
            model=body.model,
            temperature=body.temperature,
            max_tokens=body.max_tokens,
        )
        return result.to_dict()

    @app.post(f"{BASE_PATH}/stream")
    async def stream_router(request: Request, body: ChatRequest):
        """SSE streaming response."""
        async def generate():
            try:
                async for chunk in client.stream_generator(
                    prompt=body.prompt,
                    model=body.model,
                    temperature=body.temperature,
                ):
                    yield f"data: {chunk}\n\n"
                yield "data: [DONE]\n\n"
            except Exception as e:
                import json
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        )

    @app.post(f"{BASE_PATH}/structure")
    async def structure_router(request: Request, body: StructureRequest):
        """Structured JSON output."""
        result = await client.structure(
            prompt=body.prompt,
            schema=body.schema_,
        )
        return result.to_dict()

    @app.post(f"{BASE_PATH}/tool-call")
    async def tool_call_router(request: Request, body: ToolCallRequest):
        """Function calling."""
        result = await client.tool_call(
            prompt=body.prompt,
            tools=body.tools,
        )
        return result.to_dict()

    @app.post(f"{BASE_PATH}/json")
    async def json_mode_router(request: Request, body: JsonRequest):
        """JSON mode."""
        result = await client.json_mode(
            prompt=body.prompt,
            model=body.model,
        )
        return result.to_dict()

    @app.post(f"{BASE_PATH}/conversation")
    async def conversation_router(request: Request, body: ConversationRequest):
        """Multi-turn chat."""
        result = await client.conversation(
            messages=body.messages,
            model=body.model,
            temperature=body.temperature,
            max_tokens=body.max_tokens,
        )
        return result.to_dict()
