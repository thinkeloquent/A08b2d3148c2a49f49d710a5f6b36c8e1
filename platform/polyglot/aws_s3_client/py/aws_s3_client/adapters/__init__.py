"""
Framework Adapters for AWS S3 Client

Provides integration adapters for FastAPI and other frameworks.
"""

from aws_s3_client.adapters.fastapi import (
    FastAPIAdapter,
    create_fastapi_adapter,
    get_storage_dependency,
)

__all__ = [
    "FastAPIAdapter",
    "create_fastapi_adapter",
    "get_storage_dependency",
]
