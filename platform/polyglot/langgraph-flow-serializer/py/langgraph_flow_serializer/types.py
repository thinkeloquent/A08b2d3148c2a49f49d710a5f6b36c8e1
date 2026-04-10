"""
Core dataclass types for the LangGraph Flow Serializer.

Mirrors the TypeScript type definitions in mjs/src/types.ts.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class AIViewport:
    x: float
    y: float
    zoom: float


@dataclass
class AINodeData:
    """Data payload attached to each workflow node."""

    #: LangChain class name (e.g., "ChatOpenAI")
    node_type: str
    #: Grouping category (e.g., "Chat Models", "Agents")
    category: str
    #: Display label
    name: Optional[str] = None
    #: Input parameters for the node
    inputs: dict = field(default_factory=dict)
    #: Credentials — stripped unless include_credentials is True
    credentials: Optional[dict[str, str]] = None


@dataclass
class AINode:
    id: str
    #: React Flow component type (e.g., "customNode")
    type: str
    position: dict  # {"x": float, "y": float}
    data: AINodeData


@dataclass
class AIEdge:
    id: str
    source: str
    source_handle: str
    target: str
    target_handle: str
    #: React Flow edge type (e.g., "smoothstep")
    type: Optional[str] = None


@dataclass
class AIWorkflow:
    name: str
    nodes: list[AINode] = field(default_factory=list)
    edges: list[AIEdge] = field(default_factory=list)
    id: Optional[str] = None
    description: Optional[str] = None
    viewport: Optional[AIViewport] = None


@dataclass
class SerializerOptions:
    """Options controlling serialization behaviour."""

    #: Whether to pretty-print JSON output. Defaults to True.
    pretty_print: bool = True
    #: Whether to include credential fields in output. Defaults to False.
    include_credentials: bool = False


class ValidationError(Exception):
    """Raised when a workflow JSON fails schema validation."""

    def __init__(self, message: str, issues: list[str] | None = None) -> None:
        super().__init__(message)
        self.issues: list[str] = issues or []

    def __repr__(self) -> str:
        return f"ValidationError({str(self)!r}, issues={self.issues!r})"
