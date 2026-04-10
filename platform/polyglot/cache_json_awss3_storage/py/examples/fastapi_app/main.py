"""
FastAPI Integration Example for cache_json_awss3_storage

This example demonstrates:
- Lifespan context manager pattern for startup/shutdown
- Dependency injection pattern for request handling
- CRUD endpoints for cached data
- Health check with storage statistics

Run with:
    uvicorn fastapi_app.main:app --reload

Or with the parent Makefile:
    make dev
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Annotated, Any

from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel

# Import storage components
from cache_json_awss3_storage import (
    JsonS3Storage,
    create_logger,
    create_storage,
    generate_key,
)

# =============================================================================
# Configuration (Mock for demo - use real config in production)
# =============================================================================

# In production, load from environment or app-yaml config
CONFIG = {
    "bucket_name": "cache-demo-bucket",
    "key_prefix": "fastapi:",
    "ttl": 3600,  # 1 hour default TTL
    "region": "us-east-1",
}

# Create logger
logger = create_logger("fastapi_app", __file__)


# =============================================================================
# Request/Response Models
# =============================================================================


class CacheData(BaseModel):
    """Model for data to cache."""

    key: str | None = None  # Optional custom key; if not provided, generates from data
    data: dict[str, Any]
    ttl: int | None = None


class CacheResponse(BaseModel):
    """Response model for cache operations."""

    key: str
    message: str


class DataResponse(BaseModel):
    """Response model for loaded data."""

    key: str
    data: dict[str, Any]


class HealthResponse(BaseModel):
    """Response model for health check."""

    status: str
    storage_stats: dict[str, int]
    object_count: int


class KeysResponse(BaseModel):
    """Response model for key listing."""

    keys: list[str]
    count: int


# =============================================================================
# Lifespan Context Manager
# =============================================================================


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for FastAPI application.

    Handles:
    - Startup: Initialize S3 client and storage
    - Shutdown: Close storage and clean up resources
    """
    logger.info("Starting FastAPI application...")

    # In production, use real AWS credentials:
    # from aiobotocore.session import get_session
    # session = get_session()
    # async with session.create_client('s3', region_name=CONFIG['region']) as s3_client:

    # For demo, use mock S3
    try:
        import boto3
        from moto import mock_aws

        mock = mock_aws()
        mock.start()

        # Create bucket
        s3 = boto3.client("s3", region_name=CONFIG["region"])
        s3.create_bucket(Bucket=CONFIG["bucket_name"])

        from aiobotocore.session import get_session

        session = get_session()

        async with session.create_client(
            "s3", region_name=CONFIG["region"]
        ) as s3_client:
            # Create storage instance
            storage = create_storage(
                s3_client,
                bucket_name=CONFIG["bucket_name"],
                key_prefix=CONFIG["key_prefix"],
                ttl=CONFIG["ttl"],
                debug=True,
                logger=logger,
            )

            # Store in app state
            app.state.storage = storage

            logger.info(
                f"Storage initialized: bucket={CONFIG['bucket_name']}, "
                f"prefix={CONFIG['key_prefix']}"
            )

            yield

            # Shutdown
            logger.info("Shutting down FastAPI application...")
            await storage.close()
            logger.info("Storage closed")

        mock.stop()

    except ImportError:
        logger.error("moto not installed - demo requires: pip install moto[s3]")
        raise


# =============================================================================
# Application Setup
# =============================================================================

app = FastAPI(
    title="Cache JSON AWS S3 Storage - FastAPI Demo",
    description="Demonstrates integration of cache_json_awss3_storage with FastAPI",
    version="1.0.0",
    lifespan=lifespan,
)


# =============================================================================
# Dependency Injection
# =============================================================================


async def get_storage() -> JsonS3Storage:
    """
    Dependency to get storage instance.

    Usage:
        @app.get("/")
        async def handler(storage: Annotated[JsonS3Storage, Depends(get_storage)]):
            ...
    """
    return app.state.storage


# Type alias for cleaner route signatures
StorageDep = Annotated[JsonS3Storage, Depends(get_storage)]


# =============================================================================
# Routes
# =============================================================================


@app.get("/health", response_model=HealthResponse)
async def health_check(storage: StorageDep) -> HealthResponse:
    """
    Health check endpoint.

    Returns storage statistics and object count.
    """
    stats = storage.get_stats()
    keys = await storage.list_keys()

    return HealthResponse(
        status="ok",
        storage_stats={
            "saves": stats.saves,
            "loads": stats.loads,
            "hits": stats.hits,
            "misses": stats.misses,
            "deletes": stats.deletes,
            "errors": stats.errors,
        },
        object_count=len(keys),
    )


@app.post("/cache", response_model=CacheResponse)
async def cache_data(body: CacheData, storage: StorageDep) -> CacheResponse:
    """
    Cache JSON data.

    Provide a custom key or let the system generate one from the data.
    """
    try:
        # Use provided key or generate from data
        key = body.key if body.key else generate_key(body.data)
        await storage.save(key, body.data, ttl=body.ttl)
        logger.info(f"Cached data with key: {key}")
        return CacheResponse(key=key, message="Data cached successfully")
    except Exception as e:
        logger.error(f"Failed to cache data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/cache/{key}", response_model=DataResponse)
async def get_cached(key: str, storage: StorageDep) -> DataResponse:
    """
    Get cached data by key.

    Returns 404 if not found or expired.
    """
    data = await storage.load(key)

    if data is None:
        logger.info(f"Cache miss for key: {key}")
        raise HTTPException(status_code=404, detail="Key not found or expired")

    logger.info(f"Cache hit for key: {key}")
    return DataResponse(key=key, data=data)


@app.delete("/cache/{key}", response_model=CacheResponse)
async def delete_cached(key: str, storage: StorageDep) -> CacheResponse:
    """
    Delete cached data by key.

    S3 delete is idempotent, so this always succeeds.
    """
    await storage.delete(key)
    logger.info(f"Deleted cache key: {key}")
    return CacheResponse(key=key, message="Data deleted successfully")


@app.get("/cache", response_model=KeysResponse)
async def list_cached(storage: StorageDep) -> KeysResponse:
    """
    List all cached keys.
    """
    keys = await storage.list_keys()
    return KeysResponse(keys=keys, count=len(keys))


@app.delete("/cache", response_model=CacheResponse)
async def clear_cache(storage: StorageDep) -> CacheResponse:
    """
    Clear all cached data.

    Use with caution in production!
    """
    count = await storage.clear()
    logger.warn(f"Cleared {count} items from cache")
    return CacheResponse(key="*", message=f"Cleared {count} items")


# =============================================================================
# Error Handlers
# =============================================================================


@app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    """Handle unexpected exceptions."""
    logger.error(f"Unhandled exception: {exc}")
    return {"error": "Internal server error", "detail": str(exc)}


# =============================================================================
# Entry Point (for direct execution)
# =============================================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
