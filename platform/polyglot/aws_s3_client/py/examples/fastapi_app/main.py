"""
AWS S3 Client - FastAPI Integration Example

Demonstrates FastAPI integration patterns:
- Lifespan context manager for SDK initialization
- Dependency injection for SDK access
- Health check and debug routes
- CRUD endpoints for S3 storage
"""

import os
import sys
from typing import Annotated, Any

from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel

# Add parent directory for local development
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from aws_s3_client import S3StorageSDK, SDKConfig
from aws_s3_client.adapters.fastapi import FastAPIAdapter, create_fastapi_adapter

# =============================================================================
# Configuration
# =============================================================================

# Create configuration from environment or use defaults
config = SDKConfig(
    bucket_name=os.environ.get("AWS_S3_BUCKET_NAME", "example-bucket"),
    region=os.environ.get("AWS_REGION", "us-east-1"),
    endpoint_url=os.environ.get("AWS_ENDPOINT_URL"),  # For LocalStack
    key_prefix="fastapi-example:",
    ttl=3600,  # 1 hour default TTL
    debug=True,
)

# Create adapter for FastAPI integration
adapter = create_fastapi_adapter(config)


# =============================================================================
# FastAPI Application
# =============================================================================

app = FastAPI(
    title="AWS S3 Client FastAPI Example",
    description="Example FastAPI application demonstrating S3 storage integration",
    version="1.0.0",
    lifespan=adapter.lifespan,
)


# =============================================================================
# Dependency Injection
# =============================================================================

# Type alias for SDK dependency
SDK = Annotated[S3StorageSDK, Depends(adapter.get_sdk)]


# =============================================================================
# Request/Response Models
# =============================================================================

class SaveRequest(BaseModel):
    """Request model for save endpoint."""
    data: dict[str, Any]
    ttl: int | None = None


class SaveResponse(BaseModel):
    """Response model for save endpoint."""
    success: bool
    key: str | None
    elapsed_ms: float


class LoadResponse(BaseModel):
    """Response model for load endpoint."""
    success: bool
    data: dict[str, Any] | None
    elapsed_ms: float


class ExistsResponse(BaseModel):
    """Response model for exists endpoint."""
    exists: bool
    elapsed_ms: float


class DeleteResponse(BaseModel):
    """Response model for delete endpoint."""
    success: bool
    elapsed_ms: float


class ListKeysResponse(BaseModel):
    """Response model for list keys endpoint."""
    keys: list[str]
    count: int
    elapsed_ms: float


# =============================================================================
# Health and Debug Routes
# =============================================================================

app.get("/health")(adapter.create_health_route())
app.get("/debug")(adapter.create_debug_route())


# =============================================================================
# Storage CRUD Endpoints
# =============================================================================

@app.post("/storage/save", response_model=SaveResponse)
async def save_data(request: SaveRequest, sdk: SDK) -> SaveResponse:
    """
    Save JSON data to S3.

    Returns a unique storage key that can be used to retrieve the data.
    """
    response = await sdk.save(request.data, ttl=request.ttl)

    if not response.success:
        raise HTTPException(status_code=500, detail=response.error)

    return SaveResponse(
        success=True,
        key=response.key,
        elapsed_ms=response.elapsed_ms,
    )


@app.get("/storage/load/{key}", response_model=LoadResponse)
async def load_data(key: str, sdk: SDK) -> LoadResponse:
    """
    Load JSON data from S3 by key.

    Returns the stored data or null if not found/expired.
    """
    response = await sdk.load(key)

    if not response.success:
        raise HTTPException(status_code=500, detail=response.error)

    return LoadResponse(
        success=True,
        data=response.data,
        elapsed_ms=response.elapsed_ms,
    )


@app.get("/storage/exists/{key}", response_model=ExistsResponse)
async def check_exists(key: str, sdk: SDK) -> ExistsResponse:
    """
    Check if data exists for a key.

    Uses HEAD request for efficiency (no body download).
    """
    response = await sdk.exists(key)

    if not response.success:
        raise HTTPException(status_code=500, detail=response.error)

    return ExistsResponse(
        exists=response.data or False,
        elapsed_ms=response.elapsed_ms,
    )


@app.delete("/storage/delete/{key}", response_model=DeleteResponse)
async def delete_data(key: str, sdk: SDK) -> DeleteResponse:
    """
    Delete data from S3 by key.

    This operation is idempotent - it succeeds even if the key doesn't exist.
    """
    response = await sdk.delete(key)

    if not response.success:
        raise HTTPException(status_code=500, detail=response.error)

    return DeleteResponse(
        success=True,
        elapsed_ms=response.elapsed_ms,
    )


@app.get("/storage/keys", response_model=ListKeysResponse)
async def list_keys(sdk: SDK) -> ListKeysResponse:
    """
    List all storage keys.

    Returns all keys stored with the configured prefix.
    """
    response = await sdk.list_keys()

    if not response.success:
        raise HTTPException(status_code=500, detail=response.error)

    keys = response.data or []
    return ListKeysResponse(
        keys=keys,
        count=len(keys),
        elapsed_ms=response.elapsed_ms,
    )


@app.get("/storage/stats")
async def get_stats(sdk: SDK) -> dict[str, Any]:
    """
    Get operation statistics.

    Returns counts of saves, loads, hits, misses, deletes, and errors.
    """
    response = await sdk.stats()

    if not response.success:
        raise HTTPException(status_code=500, detail=response.error)

    return {
        "stats": response.data,
        "elapsed_ms": response.elapsed_ms,
    }


# =============================================================================
# Example Endpoints
# =============================================================================

@app.post("/example/user")
async def save_user(user_id: int, name: str, email: str, sdk: SDK) -> dict[str, Any]:
    """
    Example: Save a user record.

    Demonstrates a typical use case with structured data.
    """
    user_data = {
        "user_id": user_id,
        "name": name,
        "email": email,
        "type": "user",
    }

    response = await sdk.save(user_data)

    return {
        "message": "User saved",
        "key": response.key,
        "user": user_data,
    }


@app.post("/example/session")
async def create_session(
    user_id: int,
    sdk: SDK,
    ttl: int = 3600,
) -> dict[str, Any]:
    """
    Example: Create a session with custom TTL.

    Demonstrates TTL usage for temporary data.
    """
    import time

    session_data = {
        "user_id": user_id,
        "created_at": time.time(),
        "type": "session",
    }

    response = await sdk.save(session_data, ttl=ttl)

    return {
        "message": f"Session created with {ttl}s TTL",
        "session_key": response.key,
    }


# =============================================================================
# Main Entry Point
# =============================================================================

if __name__ == "__main__":
    import uvicorn

    print("Starting FastAPI example server...")
    print(f"Bucket: {config.bucket_name}")
    print(f"Region: {config.region}")
    print(f"Endpoint: {config.endpoint_url or 'AWS Default'}")

    uvicorn.run(app, host="0.0.0.0", port=8000)
