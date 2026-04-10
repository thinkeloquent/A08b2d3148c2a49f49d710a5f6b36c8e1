"""
Flowise dialect adapter.

Mirrors mjs/src/adapters/flowise.adapter.ts.

Flowise uses:
  - data.name: camelCase LangChain.js class name
  - data.inputs: flat dict of input values
  - No data.node.template structure

Detection heuristic: first node has data.name as camelCase string
and does NOT have a data.node.template structure.
"""

from __future__ import annotations

import re
from typing import Any

from langgraph_flow_serializer.adapters.base import DialectAdapter
from langgraph_flow_serializer.types import AIEdge, AINode, AINodeData, AIWorkflow


def _is_camel_case(s: str) -> bool:
    return bool(re.match(r"^[a-z][a-zA-Z0-9]*$", s))


class FlowiseAdapter(DialectAdapter):
    def detect(self, json: Any) -> bool:
        if not isinstance(json, dict):
            return False
        nodes = json.get("nodes")
        if not isinstance(nodes, list) or len(nodes) == 0:
            return False
        first = nodes[0]
        if not isinstance(first, dict):
            return False
        data = first.get("data")
        if not isinstance(data, dict):
            return False
        # Langflow has data.node.template — reject those
        if isinstance(data.get("node"), dict) and isinstance(
            data["node"].get("template"), dict
        ):
            return False
        name = data.get("name")
        return isinstance(name, str) and _is_camel_case(name)

    def from_dialect(self, dialect_json: Any) -> AIWorkflow:
        nodes: list[AINode] = []
        for fn in dialect_json.get("nodes", []):
            data = fn.get("data") or {}
            node_data = AINodeData(
                node_type=data.get("name", ""),
                category=data.get("category", "Uncategorized"),
                name=data.get("label") or data.get("name"),
                inputs=data.get("inputs") or {},
                credentials=data.get("credentials") or None,
            )
            nodes.append(
                AINode(
                    id=fn["id"],
                    type=fn.get("type", "customNode"),
                    position=fn.get("position") or {"x": 0, "y": 0},
                    data=node_data,
                )
            )

        edges: list[AIEdge] = []
        for fe in dialect_json.get("edges", []):
            edges.append(
                AIEdge(
                    id=fe["id"],
                    source=fe["source"],
                    source_handle=fe.get("sourceHandle") or f"{fe['source']}-output",
                    target=fe["target"],
                    target_handle=fe.get("targetHandle") or f"{fe['target']}-input",
                    type=fe.get("type") or None,
                )
            )

        vp_raw = dialect_json.get("viewport")
        from langgraph_flow_serializer.types import AIViewport

        viewport = (
            AIViewport(x=vp_raw["x"], y=vp_raw["y"], zoom=vp_raw["zoom"])
            if isinstance(vp_raw, dict)
            else None
        )

        return AIWorkflow(
            id=dialect_json.get("id") or None,
            name=dialect_json.get("name") or "Untitled Flowise Flow",
            description=dialect_json.get("description") or None,
            viewport=viewport,
            nodes=nodes,
            edges=edges,
        )

    def to_dialect(self, workflow: AIWorkflow) -> dict:
        nodes = []
        for n in workflow.nodes:
            node: dict = {
                "id": n.id,
                "type": n.type,
                "position": n.position,
                "data": {
                    "name": n.data.node_type,
                    "label": n.data.name or n.data.node_type,
                    "category": n.data.category,
                    "inputs": n.data.inputs,
                },
            }
            if n.data.credentials:
                node["data"]["credentials"] = n.data.credentials
            nodes.append(node)

        edges = [
            {
                "id": e.id,
                "source": e.source,
                "sourceHandle": e.source_handle,
                "target": e.target,
                "targetHandle": e.target_handle,
                **({"type": e.type} if e.type else {}),
            }
            for e in workflow.edges
        ]

        result: dict = {"name": workflow.name, "nodes": nodes, "edges": edges}
        if workflow.id:
            result["id"] = workflow.id
        if workflow.description:
            result["description"] = workflow.description
        if workflow.viewport:
            result["viewport"] = {
                "x": workflow.viewport.x,
                "y": workflow.viewport.y,
                "zoom": workflow.viewport.zoom,
            }
        return result
