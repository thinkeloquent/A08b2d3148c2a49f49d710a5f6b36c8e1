"""
LLM Agent Interface for AWS S3 Client

Provides a simplified interface for LLM agents with tool-friendly methods.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from aws_s3_client.config import SDKConfig
from aws_s3_client.logger import LoggerProtocol
from aws_s3_client.logger import create as create_logger
from aws_s3_client.sdk import S3StorageSDK, create_sdk

logger = create_logger("aws_s3_client.agent", __file__)


@dataclass
class AgentResponse:
    """
    Simplified response for LLM agents.

    Attributes:
        success: Whether the operation succeeded
        message: Human-readable message
        data: Result data if any
        key: Storage key if applicable
    """

    success: bool
    message: str
    data: Any = None
    key: str | None = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "success": self.success,
            "message": self.message,
            "data": self.data,
            "key": self.key,
        }


class AgentStorageInterface:
    """
    LLM Agent-friendly interface for S3 storage.

    Provides simplified methods with descriptive names suitable for
    LLM function calling and tool use.

    Example:
        agent = AgentStorageInterface(config)
        result = await agent.store({"user": "alice", "score": 100})
        print(result.message)  # "Stored data with key abc123"
    """

    def __init__(
        self,
        config: SDKConfig,
        *,
        custom_logger: LoggerProtocol | None = None,
    ) -> None:
        """
        Initialize the agent interface.

        Args:
            config: SDK configuration
            custom_logger: Optional custom logger
        """
        self._sdk = create_sdk(config, custom_logger=custom_logger or logger)
        self._logger = custom_logger or logger

    async def store(
        self,
        data: dict[str, Any],
        *,
        ttl_seconds: int | None = None,
    ) -> AgentResponse:
        """
        Store JSON data in S3.

        Saves the provided JSON data to S3 storage and returns a unique key
        that can be used to retrieve the data later.

        Args:
            data: JSON object to store
            ttl_seconds: Optional time-to-live in seconds

        Returns:
            AgentResponse with storage key

        Example:
            result = await agent.store({"name": "Alice", "age": 30})
            # result.key contains the storage key
        """
        self._logger.debug(f"store: data with {len(data)} fields")

        response = await self._sdk.save(data, ttl=ttl_seconds)

        if response.success:
            return AgentResponse(
                success=True,
                message=f"Stored data with key {response.key}",
                data=None,
                key=response.key,
            )
        else:
            return AgentResponse(
                success=False,
                message=f"Failed to store data: {response.error}",
            )

    async def retrieve(self, key: str) -> AgentResponse:
        """
        Retrieve JSON data from S3 by key.

        Fetches previously stored data using the storage key.
        Returns None if the data doesn't exist or has expired.

        Args:
            key: Storage key from a previous store operation

        Returns:
            AgentResponse with the stored data

        Example:
            result = await agent.retrieve("abc123")
            # result.data contains the stored JSON
        """
        self._logger.debug(f"retrieve: key={key}")

        response = await self._sdk.load(key)

        if response.success:
            if response.data is not None:
                return AgentResponse(
                    success=True,
                    message="Retrieved data successfully",
                    data=response.data,
                    key=key,
                )
            else:
                return AgentResponse(
                    success=True,
                    message="No data found for this key",
                    data=None,
                    key=key,
                )
        else:
            return AgentResponse(
                success=False,
                message=f"Failed to retrieve data: {response.error}",
            )

    async def remove(self, key: str) -> AgentResponse:
        """
        Remove data from S3 by key.

        Deletes previously stored data. This operation is idempotent -
        it succeeds even if the key doesn't exist.

        Args:
            key: Storage key to delete

        Returns:
            AgentResponse indicating success

        Example:
            result = await agent.remove("abc123")
            # result.success indicates if deletion was successful
        """
        self._logger.debug(f"remove: key={key}")

        response = await self._sdk.delete(key)

        if response.success:
            return AgentResponse(
                success=True,
                message=f"Removed data with key {key}",
                key=key,
            )
        else:
            return AgentResponse(
                success=False,
                message=f"Failed to remove data: {response.error}",
            )

    async def check(self, key: str) -> AgentResponse:
        """
        Check if data exists in S3.

        Verifies whether data with the given key exists in storage.
        This is more efficient than retrieving the full data.

        Args:
            key: Storage key to check

        Returns:
            AgentResponse with existence status in data field

        Example:
            result = await agent.check("abc123")
            # result.data is True if data exists
        """
        self._logger.debug(f"check: key={key}")

        response = await self._sdk.exists(key)

        if response.success:
            exists = response.data
            return AgentResponse(
                success=True,
                message=f"Key {'exists' if exists else 'does not exist'}",
                data=exists,
                key=key,
            )
        else:
            return AgentResponse(
                success=False,
                message=f"Failed to check key: {response.error}",
            )

    async def list_all(self) -> AgentResponse:
        """
        List all stored keys.

        Returns a list of all storage keys in the configured bucket/prefix.

        Returns:
            AgentResponse with list of keys in data field

        Example:
            result = await agent.list_all()
            # result.data contains list of key strings
        """
        self._logger.debug("list_all: listing all keys")

        response = await self._sdk.list_keys()

        if response.success:
            keys = response.data or []
            return AgentResponse(
                success=True,
                message=f"Found {len(keys)} stored keys",
                data=keys,
            )
        else:
            return AgentResponse(
                success=False,
                message=f"Failed to list keys: {response.error}",
            )

    async def close(self) -> None:
        """Close the agent interface and release resources."""
        await self._sdk.close()

    async def __aenter__(self) -> AgentStorageInterface:
        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        await self.close()


def create_agent_interface(
    config: SDKConfig,
    *,
    custom_logger: LoggerProtocol | None = None,
) -> AgentStorageInterface:
    """
    Factory function to create an agent interface.

    Args:
        config: SDK configuration
        custom_logger: Optional custom logger

    Returns:
        Configured AgentStorageInterface instance
    """
    return AgentStorageInterface(config, custom_logger=custom_logger)


# Tool schema for LLM function calling
TOOL_SCHEMA = {
    "name": "s3_storage",
    "description": "Store and retrieve JSON data in AWS S3",
    "functions": [
        {
            "name": "store",
            "description": "Store JSON data and get a unique key",
            "parameters": {
                "type": "object",
                "properties": {
                    "data": {
                        "type": "object",
                        "description": "JSON data to store",
                    },
                    "ttl_seconds": {
                        "type": "integer",
                        "description": "Optional expiration time in seconds",
                    },
                },
                "required": ["data"],
            },
        },
        {
            "name": "retrieve",
            "description": "Retrieve stored data by key",
            "parameters": {
                "type": "object",
                "properties": {
                    "key": {
                        "type": "string",
                        "description": "Storage key from store operation",
                    },
                },
                "required": ["key"],
            },
        },
        {
            "name": "remove",
            "description": "Delete stored data by key",
            "parameters": {
                "type": "object",
                "properties": {
                    "key": {
                        "type": "string",
                        "description": "Storage key to delete",
                    },
                },
                "required": ["key"],
            },
        },
        {
            "name": "check",
            "description": "Check if data exists for a key",
            "parameters": {
                "type": "object",
                "properties": {
                    "key": {
                        "type": "string",
                        "description": "Storage key to check",
                    },
                },
                "required": ["key"],
            },
        },
    ],
}
