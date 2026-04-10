#!/usr/bin/env python3
"""
AWS S3 Client - aiobotocore Example

Demonstrates using aiobotocore directly with:
- Async context manager that yields S3 client
- FastAPI route to list and count buckets
"""

import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Annotated

from aiobotocore.session import get_session
from fastapi import Depends, FastAPI

# =============================================================================
# S3 Client Context Manager
# =============================================================================

@asynccontextmanager
async def get_s3_client() -> AsyncGenerator:
    """
    Async context manager that yields an S3 client.

    Automatically handles session creation and cleanup.
    """
    session = get_session()
    async with session.create_client(
        "s3",
        region_name=os.environ.get("AWS_REGION", "us-east-1"),
        endpoint_url=os.environ.get("AWS_ENDPOINT_URL"),  # For LocalStack
    ) as client:
        yield client


# =============================================================================
# FastAPI Dependency
# =============================================================================

async def s3_client_dependency() -> AsyncGenerator:
    """FastAPI dependency that provides S3 client."""
    async with get_s3_client() as client:
        yield client


S3Client = Annotated[object, Depends(s3_client_dependency)]


# =============================================================================
# FastAPI Application
# =============================================================================

app = FastAPI(
    title="aiobotocore S3 Example",
    description="Example using aiobotocore to list S3 buckets",
)


@app.get("/buckets")
async def list_buckets(s3: S3Client) -> dict:
    """
    List all S3 buckets and return count.

    Returns:
        dict with bucket names and total count
    """
    response = await s3.list_buckets()

    buckets = response.get("Buckets", [])
    bucket_names = [bucket["Name"] for bucket in buckets]

    return {
        "buckets": bucket_names,
        "count": len(bucket_names),
    }


@app.get("/health")
async def health() -> dict:
    """Health check endpoint."""
    return {"status": "healthy"}


# =============================================================================
# Main Entry Point
# =============================================================================

if __name__ == "__main__":
    import uvicorn

    print("Starting aiobotocore example server...")
    print(f"Region: {os.environ.get('AWS_REGION', 'us-east-1')}")
    print(f"Endpoint: {os.environ.get('AWS_ENDPOINT_URL', 'AWS Default')}")

    uvicorn.run(app, host="0.0.0.0", port=8001)
