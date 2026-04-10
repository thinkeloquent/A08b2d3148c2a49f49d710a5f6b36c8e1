"""
Data models for Smart Fetch Router configuration.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Literal


@dataclass
class EndpointConfig:
    """Configuration for a single endpoint."""

    base_url: str
    description: str = ""
    method: str = "POST"
    headers: dict[str, str] = field(default_factory=dict)
    timeout: int = 30000
    body_type: Literal["json", "text"] = "json"
    key: str = ""
    name: str = ""
    tags: list[str] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict[str, Any], key: str = "") -> EndpointConfig:
        return cls(
            base_url=data.get("baseUrl") or data.get("baseurl", ""),
            description=data.get("description", ""),
            method=data.get("method", "POST"),
            headers=data.get("headers") or {},
            timeout=data.get("timeout", 30000),
            body_type=data.get("bodyType", "json"),
            key=key,
            name=data.get("name") or key,
            tags=list(data.get("tags") or []),
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "key": self.key,
            "name": self.name,
            "tags": self.tags,
            "baseUrl": self.base_url,
            "description": self.description,
            "method": self.method,
            "headers": self.headers,
            "timeout": self.timeout,
            "bodyType": self.body_type,
        }


@dataclass
class FetchConfig:
    """Complete fetch configuration ready for HTTP client."""

    service_id: str
    url: str
    method: str
    headers: dict[str, str]
    body: str
    timeout: int

    def to_dict(self) -> dict[str, Any]:
        return {
            "serviceId": self.service_id,
            "url": self.url,
            "method": self.method,
            "headers": self.headers,
            "body": self.body,
            "headersTimeout": self.timeout,
        }
