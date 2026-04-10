"""
Serializer: AIWorkflow -> JSON string.

Mirrors mjs/src/serializer.ts:
  - Deep-clones before serialization (never mutates the caller's object)
  - Strips credentials from nodes unless include_credentials is True
"""

from __future__ import annotations

import copy
import json

from langgraph_flow_serializer.types import AIWorkflow


def _to_dict(workflow: AIWorkflow) -> dict:
    """Convert AIWorkflow dataclass tree to a plain dict suitable for JSON serialization."""

    def node_to_dict(node) -> dict:
        data = {
            "nodeType": node.data.node_type,
            "category": node.data.category,
            "inputs": node.data.inputs,
        }
        if node.data.name is not None:
            data["name"] = node.data.name
        if node.data.credentials is not None:
            data["credentials"] = node.data.credentials

        return {
            "id": node.id,
            "type": node.type,
            "position": node.position,
            "data": data,
        }

    def edge_to_dict(edge) -> dict:
        d: dict = {
            "id": edge.id,
            "source": edge.source,
            "sourceHandle": edge.source_handle,
            "target": edge.target,
            "targetHandle": edge.target_handle,
        }
        if edge.type is not None:
            d["type"] = edge.type
        return d

    result: dict = {"name": workflow.name}
    if workflow.id is not None:
        result["id"] = workflow.id
    if workflow.description is not None:
        result["description"] = workflow.description
    if workflow.viewport is not None:
        result["viewport"] = {
            "x": workflow.viewport.x,
            "y": workflow.viewport.y,
            "zoom": workflow.viewport.zoom,
        }
    result["nodes"] = [node_to_dict(n) for n in workflow.nodes]
    result["edges"] = [edge_to_dict(e) for e in workflow.edges]
    return result


def serialize(
    workflow: AIWorkflow,
    pretty_print: bool = True,
    include_credentials: bool = False,
) -> str:
    """
    Serialize an AIWorkflow to a JSON string.

    Args:
        workflow:            The workflow object to serialize.
        pretty_print:        Whether to indent the JSON output. Defaults to True.
        include_credentials: Whether to include credential fields. Defaults to False.

    Returns:
        A JSON string representation of the workflow.
    """
    # Deep clone to avoid mutating the caller's object
    cloned = copy.deepcopy(workflow)

    if not include_credentials:
        for node in cloned.nodes:
            node.data.credentials = None

    d = _to_dict(cloned)

    # Remove None credential keys that sneak through
    for node_dict in d.get("nodes", []):
        node_dict.get("data", {}).pop("credentials", None)

    if pretty_print:
        return json.dumps(d, indent=2)
    return json.dumps(d, separators=(",", ":"))
