"""
FastAPI integration example for Smart Fetch Router.

This example demonstrates:
- Loading config in FastAPI lifespan
- Dependency injection for fetch config
- Route handlers using the SDK

Run with: uvicorn main:app --reload --port 8000
"""

import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
import httpx

from app_yaml_endpoints import (
    load_config_from_file,
    load_config,
    get_fetch_config,
    list_endpoints,
    resolve_intent,
    ConfigError,
    FetchConfig,
    LoggerFactory,
)

# Logger for this module
logger = LoggerFactory.create("fastapi-example", __file__)


# --- Lifespan Management ---


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: load config on startup."""
    logger.info("Starting FastAPI application")

    # Try to load from file first (environment-based)
    app_env = os.environ.get("APP_ENV", "dev")
    config_path = Path(__file__).parent.parent.parent.parent.parent / "common" / "config" / f"endpoint.{app_env}.yaml"
    if config_path.exists():
        load_config_from_file(config_path)
        logger.info("Config loaded from file", {"path": str(config_path), "env": app_env})
    else:
        # Use embedded config for demo
        load_config({
            "endpoints": {
                "llm001": {
                    "baseUrl": "http://localhost:51000/api/llm/gemini-openai-v1",
                    "description": "Primary LLM Service",
                    "method": "POST",
                    "headers": {"X-Service-ID": "llm-primary"},
                    "timeout": 30000,
                    "bodyType": "json",
                },
                "llm002": {
                    "baseUrl": "http://localhost:52000/api/llm/gemini-openai-v1",
                    "description": "Secondary LLM Service",
                    "method": "POST",
                    "headers": {"X-Service-ID": "llm-secondary"},
                    "timeout": 30000,
                    "bodyType": "json",
                },
            },
            "intent_mapping": {
                "mappings": {"chat": "llm001", "agent": "llm002"},
                "default_intent": "llm001",
            },
        })
        logger.info("Config loaded from embedded defaults")

    yield

    logger.info("Shutting down FastAPI application")


# --- FastAPI App ---

app = FastAPI(
    title="Smart Fetch Router Example",
    description="FastAPI integration with Smart Fetch Router SDK",
    version="1.0.0",
    lifespan=lifespan,
)


# --- Pydantic Models ---


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    messages: list[dict[str, str]]
    service_id: str | None = None
    intent: str | None = None


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    service_id: str
    url: str
    method: str
    headers: dict[str, str]
    body_preview: str


# --- Dependencies ---


def get_service_id(service_id: str | None = None, intent: str | None = None) -> str:
    """Resolve service ID from intent or use provided ID."""
    if service_id:
        return service_id
    if intent:
        return resolve_intent(intent)
    return resolve_intent("default")


# --- Routes ---


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Smart Fetch Router FastAPI Example", "docs": "/docs"}


@app.get("/endpoints")
async def get_endpoints():
    """List all available endpoints."""
    return {"endpoints": list_endpoints()}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Get fetch configuration for a chat request.

    This endpoint demonstrates how to:
    1. Resolve intent to service ID
    2. Build fetch configuration
    3. Return configuration (or execute the request)
    """
    try:
        # Determine service ID
        service_id = request.service_id or resolve_intent(request.intent or "chat")

        # Build fetch config
        config = get_fetch_config(service_id, {"messages": request.messages})

        logger.info("Fetch config created", {
            "service_id": config.service_id,
            "url": config.url,
        })

        return ChatResponse(
            service_id=config.service_id,
            url=config.url,
            method=config.method,
            headers=config.headers,
            body_preview=config.body[:100] + "..." if len(config.body) > 100 else config.body,
        )

    except ConfigError as e:
        logger.warn("Config error", {"error": str(e), "available": e.available})
        raise HTTPException(
            status_code=404,
            detail={
                "error": str(e),
                "service_id": e.service_id,
                "available": e.available,
            },
        )


@app.post("/proxy/{service_id}")
async def proxy_request(service_id: str, payload: dict[str, Any]):
    """
    Proxy a request to the configured service.

    This endpoint demonstrates actual HTTP request forwarding.
    """
    try:
        config = get_fetch_config(service_id, payload)

        logger.info("Proxying request", {"service_id": service_id, "url": config.url})

        # In production, you'd use an async HTTP client
        # async with httpx.AsyncClient() as client:
        #     response = await client.request(
        #         method=config.method,
        #         url=config.url,
        #         headers=config.headers,
        #         content=config.body,
        #         timeout=config.timeout / 1000,
        #     )
        #     return response.json()

        # For demo, just return the config
        return {
            "message": "Would proxy to service",
            "config": config.to_dict(),
        }

    except ConfigError as e:
        raise HTTPException(status_code=404, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
