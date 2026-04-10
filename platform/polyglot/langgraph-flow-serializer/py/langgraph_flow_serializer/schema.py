"""
Pydantic v2 validators mirroring the Zod schema in mjs/src/schema.ts.

Validates:
  - Required fields on workflow, nodes, and edges
  - Node ID uniqueness
  - Edge source/target references to existing node IDs
"""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, field_validator, model_validator


class AIViewportModel(BaseModel):
    x: float
    y: float
    zoom: float


class AINodeDataModel(BaseModel):
    node_type: str
    category: str
    name: Optional[str] = None
    inputs: dict[str, Any] = {}
    credentials: Optional[dict[str, str]] = None

    @field_validator("node_type")
    @classmethod
    def node_type_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("nodeType must not be empty")
        return v

    @field_validator("category")
    @classmethod
    def category_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("category must not be empty")
        return v


class AINodeModel(BaseModel):
    id: str
    type: str
    position: dict[str, float]
    data: AINodeDataModel

    @field_validator("id")
    @classmethod
    def id_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("node id must not be empty")
        return v

    @field_validator("type")
    @classmethod
    def type_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("node type must not be empty")
        return v


class AIEdgeModel(BaseModel):
    id: str
    source: str
    source_handle: str
    target: str
    target_handle: str
    type: Optional[str] = None

    @field_validator("id", "source", "source_handle", "target", "target_handle")
    @classmethod
    def fields_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("edge field must not be empty")
        return v


class AIWorkflowModel(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    viewport: Optional[AIViewportModel] = None
    nodes: list[AINodeModel] = []
    edges: list[AIEdgeModel] = []

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("workflow name must not be empty")
        return v

    @model_validator(mode="after")
    def validate_graph_integrity(self) -> "AIWorkflowModel":
        # Node ID uniqueness
        seen: set[str] = set()
        for node in self.nodes:
            if node.id in seen:
                raise ValueError(f'Duplicate node id: "{node.id}"')
            seen.add(node.id)

        # Edge source/target references
        node_ids = seen
        for edge in self.edges:
            if edge.source not in node_ids:
                raise ValueError(
                    f'Edge "{edge.id}" references unknown source node: "{edge.source}"'
                )
            if edge.target not in node_ids:
                raise ValueError(
                    f'Edge "{edge.id}" references unknown target node: "{edge.target}"'
                )

        return self
