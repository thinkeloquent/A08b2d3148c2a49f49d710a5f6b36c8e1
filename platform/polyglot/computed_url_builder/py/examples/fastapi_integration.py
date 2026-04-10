#!/usr/bin/env python3
"""
FastAPI integration example for computed-url-builder.

This example demonstrates:
- Using the URL builder as a FastAPI dependency
- Environment-based configuration
- Building URLs in route handlers

To run:
    export URL_BUILDER_BACKEND=https://httpbin.org
    uvicorn fastapi_integration:app --reload

Then visit:
    http://localhost:8000/proxy/get
    http://localhost:8000/config
"""

import os
from typing import Any, Dict

import httpx
from fastapi import Depends, FastAPI, HTTPException
from fastapi.responses import JSONResponse

from computed_url_builder import UrlBuilder, create_url_builder
from computed_url_builder.fastapi import get_url_builder

# Set default environment variables for demo
os.environ.setdefault("URL_BUILDER_BACKEND", "https://httpbin.org")
os.environ.setdefault("URL_BUILDER_API", "https://api.example.com")

# Create FastAPI app
app = FastAPI(
    title="Computed URL Builder Demo",
    description="Demonstrates URL builder integration with FastAPI",
    version="1.0.0",
)


# Alternative: Create a builder with static configuration
static_builder = create_url_builder(
    url_keys={
        "dev": "https://dev.api.example.com",
        "prod": "https://api.example.com",
    },
    base_path="/api/v1",
)


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Computed URL Builder FastAPI Demo",
        "endpoints": [
            "/proxy/get - Proxy request using URL builder",
            "/config - Show current URL builder configuration",
            "/static/{env}/users - Use static builder configuration",
        ],
    }


@app.get("/proxy/get")
async def proxy_get(builder: UrlBuilder = Depends(get_url_builder)):
    """
    Proxy a GET request to the backend service.

    Uses the URL builder to construct the target URL.
    """
    try:
        url = builder.build("backend") + "/get"

        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            return JSONResponse(
                content={
                    "target_url": url,
                    "status_code": response.status_code,
                    "response": response.json(),
                },
                status_code=response.status_code,
            )
    except KeyError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Backend error: {e}")


@app.get("/config")
async def show_config(builder: UrlBuilder = Depends(get_url_builder)):
    """Show the current URL builder configuration."""
    return {
        "builder_state": builder.to_dict(),
        "available_environments": list(builder.env.keys()),
    }


@app.get("/static/{env}/users")
async def get_users_static(env: str) -> dict[str, Any]:
    """
    Get users using static builder configuration.

    Demonstrates using a pre-configured builder instead of dependency injection.
    """
    try:
        url = static_builder.build(env) + "/users"
        return {
            "url": url,
            "note": "This uses a static builder, not from environment",
        }
    except KeyError:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown environment: {env}. Available: {list(static_builder.env.keys())}",
        )


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "computed-url-builder-demo"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
