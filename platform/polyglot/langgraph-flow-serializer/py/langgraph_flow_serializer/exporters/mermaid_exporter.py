"""
Mermaid flowchart exporter.

Mirrors mjs/src/exporters/mermaid.exporter.ts.

Generates Mermaid `flowchart TD` syntax from an AIWorkflow.

Category-based node shapes:
  agents / agent     -> hexagon     {{label}}
  routing / conditions / condition -> diamond {label}
  prompt / prompts   -> trapezoid   [/label\\]
  model / models / chat models -> stadium ([label])
  memory             -> subroutine  [[label]]
  tool / tools       -> asymmetric  >label]
  control            -> circle      ((label))
  (default)          -> rectangle   [label]

Nodes are grouped into Mermaid subgraphs by category.
Edges are rendered as labeled arrows.
"""

from __future__ import annotations

import re
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from langgraph_flow_serializer.types import AIEdge, AINode, AIWorkflow


# Maps lowercase category keys to shape-rendering callables
def _hex(sid: str, label: str) -> str:
    return f'{sid}{{{{{_esc(label)}}}}}'

def _diamond(sid: str, label: str) -> str:
    return f'{sid}{{{_esc(label)}}}'

def _trapezoid(sid: str, label: str) -> str:
    return f'{sid}[/{_esc(label)}\\]'

def _stadium(sid: str, label: str) -> str:
    return f'{sid}([{_esc(label)}])'

def _subroutine(sid: str, label: str) -> str:
    return f'{sid}[[{_esc(label)}]]'

def _asymmetric(sid: str, label: str) -> str:
    return f'{sid}>{_esc(label)}]'

def _circle(sid: str, label: str) -> str:
    return f'{sid}(({_esc(label)}))'

def _rect(sid: str, label: str) -> str:
    return f'{sid}[{_esc(label)}]'


SHAPE_MAP: dict = {
    "agent": _hex,
    "agents": _hex,
    "routing": _diamond,
    "conditions": _diamond,
    "condition": _diamond,
    "prompt": _trapezoid,
    "prompts": _trapezoid,
    "model": _stadium,
    "models": _stadium,
    "chat models": _stadium,
    "memory": _subroutine,
    "tool": _asymmetric,
    "tools": _asymmetric,
    "control": _circle,
}


def _esc(text: str) -> str:
    """Escape characters that have special meaning in Mermaid labels."""
    return text.replace('"', "&quot;").replace("|", "&#124;")


def _safe_id(node_id: str) -> str:
    """Convert an arbitrary node ID to a valid Mermaid identifier."""
    return re.sub(r"[^a-zA-Z0-9_]", "_", node_id)


def _render_node(node: "AINode") -> str:
    safe = _safe_id(node.id)
    label = node.data.name or node.data.node_type or node.id
    renderer = SHAPE_MAP.get(node.data.category.lower(), _rect)
    return renderer(safe, label)


def _render_edge(edge: "AIEdge", id_map: dict[str, str]) -> str:
    src = id_map.get(edge.source, _safe_id(edge.source))
    tgt = id_map.get(edge.target, _safe_id(edge.target))
    # Include source handle label only if it's not the default "-output" pattern
    handle_label = (
        edge.source_handle
        if edge.source_handle and not edge.source_handle.endswith("-output")
        else None
    )
    if handle_label:
        return f"{src} -->|{_esc(handle_label)}| {tgt}"
    return f"{src} --> {tgt}"


def to_mermaid(workflow: "AIWorkflow") -> str:
    """
    Convert an AIWorkflow to a Mermaid flowchart string.

    Args:
        workflow: The workflow to convert.

    Returns:
        A Mermaid ``flowchart TD`` diagram as a string.
    """
    lines = ["flowchart TD"]

    # Build safe-ID map for edge rendering
    id_map = {node.id: _safe_id(node.id) for node in workflow.nodes}

    # Group nodes by category
    by_category: dict[str, list] = {}
    for node in workflow.nodes:
        by_category.setdefault(node.data.category, []).append(node)

    # Render subgraphs
    for category, nodes in by_category.items():
        subgraph_id = _safe_id(category)
        lines.append(f'  subgraph {subgraph_id}["{_esc(category)}"]')
        for node in nodes:
            lines.append(f"    {_render_node(node)}")
        lines.append("  end")

    # Render edges
    for edge in workflow.edges:
        lines.append(f"  {_render_edge(edge, id_map)}")

    return "\n".join(lines)
