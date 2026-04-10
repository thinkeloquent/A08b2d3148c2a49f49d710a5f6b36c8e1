"""
Abstract base class for dialect adapters.

Mirrors mjs/src/adapters/adapter.ts.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

from langgraph_flow_serializer.types import AIWorkflow


class DialectAdapter(ABC):
    """
    Bidirectional converter between the universal AIWorkflow schema
    and a dialect-specific JSON structure (Flowise, Langflow, etc.).
    """

    @abstractmethod
    def from_dialect(self, dialect_json: Any) -> AIWorkflow:
        """Convert a dialect-specific JSON object to a universal AIWorkflow."""
        ...

    @abstractmethod
    def to_dialect(self, workflow: AIWorkflow) -> Any:
        """Convert a universal AIWorkflow to a dialect-specific JSON object."""
        ...

    @abstractmethod
    def detect(self, json: Any) -> bool:
        """
        Heuristic check: does the given JSON look like this dialect?
        Used by detect_dialect() for auto-detection.
        """
        ...
