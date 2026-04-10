"""
LangGraph Flow Serializer — Python implementation.

Bidirectional JSON <-> Object serialization for LangChain/LangGraph workflow
graphs using a universal Node-Edge schema compatible with React Flow,
Flowise, and Langflow.

Usage::

    from langgraph_flow_serializer import serialize, deserialize, AIWorkflow

    json_str = serialize(my_workflow)
    workflow = deserialize(json_str)

Cross-dialect::

    from langgraph_flow_serializer import deserialize_from, serialize_as

    workflow = deserialize_from(flowise_json_str, "flowise")
    langflow_str = serialize_as(workflow, "langflow")
"""

from __future__ import annotations

import json as _json
from typing import Optional

from langgraph_flow_serializer.adapters import detect_dialect, get_adapter
from langgraph_flow_serializer.deserializer import deserialize
from langgraph_flow_serializer.exporters.mermaid_exporter import to_mermaid
from langgraph_flow_serializer.serializer import serialize
from langgraph_flow_serializer.types import (
    AIEdge,
    AINode,
    AINodeData,
    AIViewport,
    AIWorkflow,
    SerializerOptions,
    ValidationError,
)

__version__ = "1.0.0"


def serialize_as(
    workflow: AIWorkflow,
    format: str = "native",
    pretty_print: bool = True,
    include_credentials: bool = False,
) -> str:
    """
    Serialize an AIWorkflow to a specific dialect JSON string.

    Args:
        workflow:            The universal workflow to serialize.
        format:              Target dialect (default: 'native').
        pretty_print:        Whether to indent output. Defaults to True.
        include_credentials: Whether to include credentials. Defaults to False.

    Returns:
        A JSON string in the requested dialect.
    """
    if format == "native":
        return serialize(workflow, pretty_print=pretty_print, include_credentials=include_credentials)
    adapter = get_adapter(format)
    dialect_obj = adapter.to_dialect(workflow)
    if pretty_print:
        return _json.dumps(dialect_obj, indent=2)
    return _json.dumps(dialect_obj, separators=(",", ":"))


def deserialize_from(json_str: str, format: Optional[str] = None) -> AIWorkflow:
    """
    Deserialize a JSON string from a specific dialect (or auto-detect).

    Args:
        json_str: The JSON string to deserialize.
        format:   Source dialect. If None, dialect is auto-detected.

    Returns:
        A universal AIWorkflow.

    Raises:
        ValidationError: If parsing or validation fails.
    """
    try:
        raw = _json.loads(json_str)
    except _json.JSONDecodeError:
        # Let deserialize() raise a proper ValidationError
        return deserialize(json_str)

    resolved = format or detect_dialect(raw)

    if resolved == "native":
        return deserialize(json_str)

    adapter = get_adapter(resolved)
    return adapter.from_dialect(raw)


__all__ = [
    "__version__",
    # Core types
    "AIWorkflow",
    "AINode",
    "AIEdge",
    "AIViewport",
    "AINodeData",
    "SerializerOptions",
    "ValidationError",
    # Serialization
    "serialize",
    "deserialize",
    "serialize_as",
    "deserialize_from",
    # Mermaid export
    "to_mermaid",
]
