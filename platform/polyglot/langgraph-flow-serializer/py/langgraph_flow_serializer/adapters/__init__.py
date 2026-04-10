"""
Adapter registry.

Supported formats: 'native', 'flowise', 'langflow', 'langgraph-topology'

Usage::

    from langgraph_flow_serializer.adapters import get_adapter, detect_dialect

    adapter = get_adapter("flowise")
    workflow = adapter.from_dialect(flowise_json)

    fmt = detect_dialect(unknown_json)
"""

from __future__ import annotations

from typing import Any

from langgraph_flow_serializer.adapters.base import DialectAdapter
from langgraph_flow_serializer.adapters.flowise_adapter import FlowiseAdapter
from langgraph_flow_serializer.adapters.langflow_adapter import LangflowAdapter
from langgraph_flow_serializer.adapters.langgraph_topology_adapter import LangGraphTopologyAdapter

# -- Native adapter (identity / universal format) ---------------------------


class _NativeAdapter(DialectAdapter):
    """Pass-through adapter for workflows already in the universal schema."""

    def detect(self, json: Any) -> bool:
        if not isinstance(json, dict):
            return False
        return isinstance(json.get("name"), str) and isinstance(json.get("nodes"), list)

    def from_dialect(self, dialect_json: Any):
        import copy
        from langgraph_flow_serializer.deserializer import deserialize
        import json as _json

        return deserialize(_json.dumps(copy.deepcopy(dialect_json)))

    def to_dialect(self, workflow) -> Any:
        import json as _json
        from langgraph_flow_serializer.serializer import serialize

        return _json.loads(serialize(workflow, pretty_print=False))


_native_adapter = _NativeAdapter()
_flowise_adapter = FlowiseAdapter()
_langflow_adapter = LangflowAdapter()
_langgraph_adapter = LangGraphTopologyAdapter()

SUPPORTED_FORMATS = ("native", "flowise", "langflow", "langgraph-topology")

_REGISTRY: dict[str, DialectAdapter] = {
    "native": _native_adapter,
    "flowise": _flowise_adapter,
    "langflow": _langflow_adapter,
    "langgraph-topology": _langgraph_adapter,
}


def get_adapter(format: str) -> DialectAdapter:
    """
    Return the adapter for the given format name.

    Raises:
        ValueError: If the format is not recognized.
    """
    adapter = _REGISTRY.get(format)
    if adapter is None:
        supported = ", ".join(SUPPORTED_FORMATS)
        raise ValueError(
            f'Unknown dialect format: "{format}". Supported formats: {supported}'
        )
    return adapter


def detect_dialect(json: Any) -> str:
    """
    Auto-detect the dialect of a JSON object.

    Detection order (most-specific first):
      1. langgraph-topology
      2. langflow
      3. flowise
      4. native (fallback)

    Returns the format name string.
    """
    check_order = ("langgraph-topology", "langflow", "flowise", "native")
    for fmt in check_order:
        if _REGISTRY[fmt].detect(json):
            return fmt
    return "native"


__all__ = [
    "DialectAdapter",
    "FlowiseAdapter",
    "LangflowAdapter",
    "LangGraphTopologyAdapter",
    "get_adapter",
    "detect_dialect",
    "SUPPORTED_FORMATS",
]
