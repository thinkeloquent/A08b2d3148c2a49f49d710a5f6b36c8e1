"""Module-specific logger for rag_ui_component_ingest_config."""

from __future__ import annotations

import logging

DEFAULT_PACKAGE = "rag_ui_component_ingest_config"


def create_logger(scope: str, parent_logger: logging.Logger | None = None) -> logging.Logger:
    """Create a child logger scoped to this package.

    Args:
        scope: The sub-scope name (e.g. "base_config", "library_config").
        parent_logger: Optional parent logger. When provided, creates a child of it.
                       When omitted, creates a logger under the package namespace.

    Returns:
        A configured Logger instance.
    """
    if parent_logger:
        return parent_logger.getChild(scope)
    return logging.getLogger(f"{DEFAULT_PACKAGE}.{scope}")
