#!/usr/bin/env python3
"""
Gemini OpenAI SDK - FastAPI Integration Example

This script demonstrates how to integrate the gemini-openai-sdk
with a FastAPI application using dependency injection and lifespan.

Requirements:
    - GEMINI_API_KEY environment variable set
    - Python 3.11+
    - gemini-openai-sdk package installed
    - uvicorn installed

Usage:
    uvicorn fastapi_app:app --reload
    # Or: python fastapi_app.py
"""

import os
import sys
from contextlib import asynccontextmanager
from typing import Annotated

# Add parent directory for development
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import Depends, FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from gemini_openai_sdk import GeminiClient
from gemini_openai_sdk.logger import create

# Create logger
logger = create("fastapi-example", __file__)

# Global client instance (initialized at startup)
_client: GeminiClient | None = None


# =============================================================================
# Lifespan Context Manager
# =============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.

    Initializes the SDK client at startup and cleans up at shutdown.
    """
    global _client

    logger.info("Starting FastAPI application...")

    # Initialize client
    _client = GeminiClient()
    health = _client.health_check()

    if health["status"] == "healthy":
        logger.info("Gemini SDK initialized successfully")
    else:
        logger.warn("Gemini SDK initialized but API key not configured")

    yield  # Application runs here

    # Cleanup
    logger.info("Shutting down FastAPI application...")
    _client = None


# =============================================================================
# FastAPI App
# =============================================================================

app = FastAPI(
    title="Gemini OpenAI SDK Example",
    description="FastAPI integration example for gemini-openai-sdk",
    version="0.1.0",
    lifespan=lifespan,
)


# =============================================================================
# Dependencies
# =============================================================================

def get_gemini_client() -> GeminiClient:
    """Dependency to get the Gemini client instance."""
    if _client is None:
        raise HTTPException(status_code=503, detail="SDK not initialized")
    return _client


GeminiClientDep = Annotated[GeminiClient, Depends(get_gemini_client)]


# =============================================================================
# Request/Response Models
# =============================================================================

class ChatRequest(BaseModel):
    prompt: str
    model: str = "flash"
    temperature: float = 0.7
    max_tokens: int = 1000


class ChatResponse(BaseModel):
    success: bool
    content: str | None = None
    model: str | None = None
    error: str | None = None


class StructureRequest(BaseModel):
    prompt: str
    schema: dict


class ToolCallRequest(BaseModel):
    prompt: str


# =============================================================================
# Routes
# =============================================================================

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "gemini-openai-sdk-fastapi-example"}


@app.get("/api/llm/gemini-openai-v1/health")
async def sdk_health(client: GeminiClientDep):
    """SDK health check endpoint."""
    return client.health_check()


@app.post("/api/llm/gemini-openai-v1/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, client: GeminiClientDep):
    """
    Chat completion endpoint.

    Send a prompt and get a response from the Gemini model.
    """
    logger.info("chat: received request", {"prompt_length": len(request.prompt)})

    result = await client.chat(
        request.prompt,
        model=request.model,
        temperature=request.temperature,
        max_tokens=request.max_tokens,
    )

    return ChatResponse(
        success=result["success"],
        content=result.get("content"),
        model=result.get("model"),
        error=result.get("error"),
    )


@app.post("/api/llm/gemini-openai-v1/structure")
async def structure(request: StructureRequest, client: GeminiClientDep):
    """
    Structured output endpoint.

    Get JSON output matching a specified schema.
    """
    logger.info("structure: received request")

    result = await client.structure(request.prompt, request.schema)

    return {
        "success": result["success"],
        "content": result.get("content"),
        "parsed": result.get("parsed"),
        "error": result.get("error"),
    }


@app.post("/api/llm/gemini-openai-v1/tool-call")
async def tool_call(request: ToolCallRequest, client: GeminiClientDep):
    """
    Tool calling endpoint.

    Execute a prompt with function calling enabled.
    """
    logger.info("tool_call: received request")

    result = await client.tool_call(request.prompt)

    return {
        "success": result["success"],
        "content": result.get("content"),
        "tool_calls": result.get("tool_calls"),
        "error": result.get("error"),
    }


@app.post("/api/llm/gemini-openai-v1/stream")
async def stream(request: ChatRequest, client: GeminiClientDep):
    """
    Streaming endpoint (returns accumulated result).

    For real SSE streaming, use the streamGenerator method.
    """
    logger.info("stream: received request")

    result = await client.stream(
        request.prompt,
        model=request.model,
        temperature=request.temperature,
    )

    return {
        "success": result["success"],
        "content": result.get("content"),
        "chunk_count": result.get("chunk_count"),
        "error": result.get("error"),
    }


# =============================================================================
# Main
# =============================================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "fastapi_app:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )
