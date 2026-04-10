"""
FastAPI Adapter for AWS S3 Client

Provides FastAPI integration with dependency injection and lifespan management.
"""

from __future__ import annotations

from collections.abc import AsyncGenerator, Callable
from contextlib import asynccontextmanager
from typing import Any

from aws_s3_client.config import SDKConfig
from aws_s3_client.logger import LoggerProtocol
from aws_s3_client.logger import create as create_logger
from aws_s3_client.sdk import S3StorageSDK, create_sdk

logger = create_logger("aws_s3_client.fastapi", __file__)


class FastAPIAdapter:
    """
    FastAPI adapter for S3 storage integration.

    Provides dependency injection, lifespan management, and health check routes.

    Example:
        from fastapi import FastAPI, Depends
        from aws_s3_client.adapters.fastapi import FastAPIAdapter

        adapter = FastAPIAdapter(SDKConfig(bucket_name="my-bucket"))
        app = FastAPI(lifespan=adapter.lifespan)

        @app.post("/save")
        async def save_data(data: dict, sdk: S3StorageSDK = Depends(adapter.get_sdk)):
            return await sdk.save(data)
    """

    def __init__(
        self,
        config: SDKConfig,
        *,
        custom_logger: LoggerProtocol | None = None,
    ) -> None:
        """
        Initialize the FastAPI adapter.

        Args:
            config: SDK configuration
            custom_logger: Optional custom logger
        """
        self._config = config
        self._sdk: S3StorageSDK | None = None
        self._logger = custom_logger or logger

        self._logger.debug(f"FastAPIAdapter initialized: bucket={config.bucket_name}")

    @asynccontextmanager
    async def lifespan(self, app: Any) -> AsyncGenerator[None, None]:
        """
        FastAPI lifespan context manager for startup/shutdown.

        Usage:
            app = FastAPI(lifespan=adapter.lifespan)
        """
        self._logger.info("FastAPI lifespan: starting up")
        self._sdk = create_sdk(self._config, custom_logger=self._logger)

        try:
            yield
        finally:
            self._logger.info("FastAPI lifespan: shutting down")
            if self._sdk:
                await self._sdk.close()
                self._sdk = None

    def get_sdk(self) -> S3StorageSDK:
        """
        Dependency injection for SDK.

        Usage:
            @app.post("/save")
            async def save(sdk: S3StorageSDK = Depends(adapter.get_sdk)):
                ...
        """
        if self._sdk is None:
            raise RuntimeError("SDK not initialized. Use adapter.lifespan with FastAPI.")
        return self._sdk

    def create_health_route(self) -> Callable[[], Any]:
        """
        Create a health check route handler.

        Usage:
            app.get("/health")(adapter.create_health_route())
        """

        async def health_check() -> dict[str, Any]:
            """Health check endpoint."""
            if self._sdk is None:
                return {
                    "status": "unhealthy",
                    "error": "SDK not initialized",
                }

            try:
                response = await self._sdk.stats()
                return {
                    "status": "healthy",
                    "bucket": self._config.bucket_name,
                    "stats": response.data,
                }
            except Exception as e:
                return {
                    "status": "unhealthy",
                    "error": str(e),
                }

        return health_check

    def create_debug_route(self) -> Callable[[], Any]:
        """
        Create a debug info route handler.

        Usage:
            app.get("/debug")(adapter.create_debug_route())
        """

        async def debug_info() -> dict[str, Any]:
            """Debug information endpoint."""
            if self._sdk is None:
                return {"error": "SDK not initialized"}

            response = await self._sdk.debug_info()
            return response.to_dict()

        return debug_info


def create_fastapi_adapter(
    config: SDKConfig,
    *,
    custom_logger: LoggerProtocol | None = None,
) -> FastAPIAdapter:
    """
    Factory function to create a FastAPI adapter.

    Args:
        config: SDK configuration
        custom_logger: Optional custom logger

    Returns:
        Configured FastAPIAdapter instance
    """
    return FastAPIAdapter(config, custom_logger=custom_logger)


def get_storage_dependency(adapter: FastAPIAdapter) -> Callable[[], S3StorageSDK]:
    """
    Create a FastAPI dependency for SDK injection.

    Args:
        adapter: FastAPI adapter instance

    Returns:
        Dependency callable

    Example:
        adapter = create_fastapi_adapter(config)
        GetSDK = get_storage_dependency(adapter)

        @app.post("/save")
        async def save(sdk: S3StorageSDK = Depends(GetSDK)):
            ...
    """
    return adapter.get_sdk
