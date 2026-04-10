"""
Deserializer: JSON string -> AIWorkflow.

Mirrors mjs/src/deserializer.ts:
  - Parses JSON
  - Normalizes optional fields to defaults
  - Validates via Pydantic schema
  - Raises ValidationError on failure
"""

from __future__ import annotations

import json

from pydantic import ValidationError as PydanticValidationError

from langgraph_flow_serializer.schema import AIWorkflowModel
from langgraph_flow_serializer.types import (
    AIEdge,
    AINode,
    AINodeData,
    AIViewport,
    AIWorkflow,
    ValidationError,
)


def _normalize(raw: dict) -> dict:
    """Apply defaults for missing optional fields before Pydantic validation."""
    normalized = dict(raw)

    normalized.setdefault("nodes", [])
    normalized.setdefault("edges", [])

    # Normalize each node
    nodes = []
    for n in normalized["nodes"]:
        node = dict(n)
        data = dict(node.get("data", {}))
        data.setdefault("inputs", {})
        # Map camelCase JSON keys to snake_case for Pydantic model
        if "nodeType" in data and "node_type" not in data:
            data["node_type"] = data.pop("nodeType")
        node["data"] = data
        nodes.append(node)
    normalized["nodes"] = nodes

    # Normalize each edge
    edges = []
    for e in normalized["edges"]:
        edge = dict(e)
        if "sourceHandle" in edge and "source_handle" not in edge:
            edge["source_handle"] = edge.pop("sourceHandle")
        if "targetHandle" in edge and "target_handle" not in edge:
            edge["target_handle"] = edge.pop("targetHandle")
        edges.append(edge)
    normalized["edges"] = edges

    return normalized


def _model_to_workflow(model: AIWorkflowModel) -> AIWorkflow:
    """Convert a validated Pydantic model to dataclass instances."""

    def to_node(nm) -> AINode:
        data = AINodeData(
            node_type=nm.data.node_type,
            category=nm.data.category,
            name=nm.data.name,
            inputs=nm.data.inputs,
            credentials=nm.data.credentials,
        )
        return AINode(
            id=nm.id,
            type=nm.type,
            position={"x": nm.position.get("x", 0), "y": nm.position.get("y", 0)},
            data=data,
        )

    def to_edge(em) -> AIEdge:
        return AIEdge(
            id=em.id,
            source=em.source,
            source_handle=em.source_handle,
            target=em.target,
            target_handle=em.target_handle,
            type=em.type,
        )

    viewport = None
    if model.viewport is not None:
        viewport = AIViewport(
            x=model.viewport.x,
            y=model.viewport.y,
            zoom=model.viewport.zoom,
        )

    return AIWorkflow(
        id=model.id,
        name=model.name,
        description=model.description,
        viewport=viewport,
        nodes=[to_node(n) for n in model.nodes],
        edges=[to_edge(e) for e in model.edges],
    )


def deserialize(json_str: str) -> AIWorkflow:
    """
    Deserialize a JSON string to an AIWorkflow.

    Args:
        json_str: The JSON string to parse and validate.

    Returns:
        A validated AIWorkflow with defaults applied.

    Raises:
        ValidationError: If the JSON is malformed or fails schema validation.
    """
    try:
        raw = json.loads(json_str)
    except json.JSONDecodeError as exc:
        raise ValidationError(f"Failed to parse JSON: {exc}") from exc

    if not isinstance(raw, dict):
        raise ValidationError("Workflow JSON must be an object")

    normalized = _normalize(raw)

    try:
        model = AIWorkflowModel.model_validate(normalized)
    except PydanticValidationError as exc:
        issues = [f"{'.'.join(str(loc) for loc in e['loc'])}: {e['msg']}" for e in exc.errors()]
        raise ValidationError(
            f"Workflow validation failed:\n  " + "\n  ".join(issues),
            issues=issues,
        ) from exc

    return _model_to_workflow(model)
