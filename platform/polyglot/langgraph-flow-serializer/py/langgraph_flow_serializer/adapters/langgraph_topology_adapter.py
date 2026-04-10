"""
LangGraph Topology adapter (import-only).

Mirrors mjs/src/adapters/langgraph-topology.adapter.ts.

Converts the JSON output of a compiled LangGraph get_graph().to_json()
call into the universal AIWorkflow schema.

Export is not supported because the topology format carries only structural
(DAG) information, not full LangChain component configuration.

Detection heuristic: JSON has nodes/edges arrays with __start__/__end__
markers and no data.nodeType on nodes.

Auto-layout: simple top-down layered positioning based on topological sort.
Each layer is spaced 150px vertically; nodes within a layer are spread 200px
horizontally.
"""

from __future__ import annotations

from collections import defaultdict, deque
from typing import Any

from langgraph_flow_serializer.adapters.base import DialectAdapter
from langgraph_flow_serializer.types import AIEdge, AINode, AINodeData, AIWorkflow

LAYER_HEIGHT = 150
NODE_WIDTH = 200
START_NODE_ID = "__start__"
END_NODE_ID = "__end__"


def _compute_layers(node_ids: list[str], edges: list[dict]) -> list[list[str]]:
    """Topological sort — returns layers of node IDs."""
    in_degree: dict[str, int] = {nid: 0 for nid in node_ids}
    dependents: dict[str, list[str]] = defaultdict(list)

    for edge in edges:
        tgt = edge.get("target", "")
        if tgt in in_degree:
            in_degree[tgt] += 1
        dependents[edge.get("source", "")].append(tgt)

    layers: list[list[str]] = []
    queue: deque[str] = deque(nid for nid in node_ids if in_degree[nid] == 0)

    while queue:
        layer = list(queue)
        layers.append(layer)
        queue.clear()
        for nid in layer:
            for dep in dependents[nid]:
                in_degree[dep] -= 1
                if in_degree[dep] == 0:
                    queue.append(dep)

    return layers


class LangGraphTopologyAdapter(DialectAdapter):
    def detect(self, json: Any) -> bool:
        if not isinstance(json, dict):
            return False
        nodes = json.get("nodes")
        edges = json.get("edges")
        if not isinstance(nodes, list) or not isinstance(edges, list):
            return False

        has_start_end = any(
            isinstance(n, dict) and n.get("id") in (START_NODE_ID, END_NODE_ID)
            for n in nodes
        )

        # Reject if already in universal format
        is_universal = any(
            isinstance(n, dict)
            and isinstance(n.get("data"), dict)
            and "nodeType" in n["data"]
            for n in nodes
        )

        return has_start_end and not is_universal

    def from_dialect(self, dialect_json: Any) -> AIWorkflow:
        topo_nodes: list[dict] = dialect_json.get("nodes", [])
        topo_edges: list[dict] = dialect_json.get("edges", [])

        node_ids = [n["id"] for n in topo_nodes]
        layers = _compute_layers(node_ids, topo_edges)

        # Build position map
        position_map: dict[str, dict] = {}
        for layer_idx, layer in enumerate(layers):
            total_width = (len(layer) - 1) * NODE_WIDTH
            for col_idx, nid in enumerate(layer):
                position_map[nid] = {
                    "x": col_idx * NODE_WIDTH - total_width / 2,
                    "y": layer_idx * LAYER_HEIGHT,
                }

        nodes: list[AINode] = []
        for tn in topo_nodes:
            nid = tn["id"]
            is_start = nid == START_NODE_ID
            is_end = nid == END_NODE_ID
            category = "Control" if (is_start or is_end) else "Agent"
            display_name = "START" if is_start else "END" if is_end else nid
            node_type = "START" if is_start else "END" if is_end else tn.get("type", nid)

            nodes.append(
                AINode(
                    id=nid,
                    type="controlNode" if (is_start or is_end) else "agentNode",
                    position=position_map.get(nid, {"x": 0, "y": 0}),
                    data=AINodeData(
                        node_type=node_type,
                        category=category,
                        name=display_name,
                        inputs=tn.get("data") or {},
                    ),
                )
            )

        edges: list[AIEdge] = []
        for idx, te in enumerate(topo_edges):
            src = te.get("source", "")
            tgt = te.get("target", "")
            edges.append(
                AIEdge(
                    id=f"edge-{idx + 1}",
                    source=src,
                    source_handle=f"{src}-output",
                    target=tgt,
                    target_handle=f"{tgt}-input",
                    type="smoothstep" if te.get("conditional") else "default",
                )
            )

        return AIWorkflow(name="LangGraph Workflow", nodes=nodes, edges=edges)

    def to_dialect(self, workflow: AIWorkflow) -> Any:
        raise NotImplementedError(
            "LangGraph topology adapter does not support export. "
            "The topology format is import-only (derived from compiled graph structure)."
        )
