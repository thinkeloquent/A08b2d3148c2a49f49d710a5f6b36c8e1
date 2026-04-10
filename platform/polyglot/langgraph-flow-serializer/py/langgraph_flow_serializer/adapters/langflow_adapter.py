"""
Langflow dialect adapter.

Mirrors mjs/src/adapters/langflow.adapter.ts.

Langflow uses data.node.template with per-field objects:
  { "type": "str", "value": "...", "show": true }

Detection heuristic: first node has data.node.template as a dict.
"""

from __future__ import annotations

from typing import Any

from langgraph_flow_serializer.adapters.base import DialectAdapter
from langgraph_flow_serializer.types import AIEdge, AINode, AINodeData, AIViewport, AIWorkflow


class LangflowAdapter(DialectAdapter):
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
        inner = data.get("node")
        return isinstance(inner, dict) and isinstance(inner.get("template"), dict)

    def from_dialect(self, dialect_json: Any) -> AIWorkflow:
        nodes: list[AINode] = []
        for ln in dialect_json.get("nodes", []):
            data = ln.get("data") or {}
            inner = data.get("node") or {}
            template = inner.get("template") or {}

            # Flatten: extract value from each template field
            inputs: dict = {}
            for key, field in template.items():
                inputs[key] = field.get("value") if isinstance(field, dict) else field

            node_data = AINodeData(
                node_type=data.get("type", ""),
                category=data.get("category", "Uncategorized"),
                name=inner.get("display_name") or data.get("type"),
                inputs=inputs,
            )
            nodes.append(
                AINode(
                    id=ln["id"],
                    type=ln.get("type", "customNode"),
                    position=ln.get("position") or {"x": 0, "y": 0},
                    data=node_data,
                )
            )

        edges: list[AIEdge] = []
        for le in dialect_json.get("edges", []):
            edges.append(
                AIEdge(
                    id=le["id"],
                    source=le["source"],
                    source_handle=le.get("sourceHandle") or f"{le['source']}-output",
                    target=le["target"],
                    target_handle=le.get("targetHandle") or f"{le['target']}-input",
                    type=le.get("type") or None,
                )
            )

        vp_raw = dialect_json.get("viewport")
        viewport = (
            AIViewport(x=vp_raw["x"], y=vp_raw["y"], zoom=vp_raw["zoom"])
            if isinstance(vp_raw, dict)
            else None
        )

        return AIWorkflow(
            id=dialect_json.get("id") or None,
            name=dialect_json.get("name") or "Untitled Langflow",
            description=dialect_json.get("description") or None,
            viewport=viewport,
            nodes=nodes,
            edges=edges,
        )

    def to_dialect(self, workflow: AIWorkflow) -> dict:
        nodes = []
        for n in workflow.nodes:
            template = {}
            for key, value in n.data.inputs.items():
                if isinstance(value, (int, float)):
                    field_type = "float"
                else:
                    field_type = "str"
                template[key] = {"type": field_type, "value": value, "show": True}

            nodes.append(
                {
                    "id": n.id,
                    "type": n.type,
                    "position": n.position,
                    "data": {
                        "type": n.data.node_type,
                        "category": n.data.category,
                        "node": {
                            "display_name": n.data.name or n.data.node_type,
                            "template": template,
                        },
                    },
                }
            )

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
