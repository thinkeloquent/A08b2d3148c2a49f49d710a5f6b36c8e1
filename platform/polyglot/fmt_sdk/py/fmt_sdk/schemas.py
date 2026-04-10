"""
Format request/result schemas and enums for the Polyglot Formatter SDK.

All schemas serialize to identical JSON across Go, Python, Node.js, and Rust.
"""

from enum import Enum
from typing import Optional

from pydantic import BaseModel


class Language(str, Enum):
    """Supported source languages."""

    GO = "go"
    PYTHON = "python"
    NODE = "node"
    RUST = "rust"
    SHELL = "shell"
    SQL = "sql"
    MARKUP = "markup"


class Severity(str, Enum):
    """Diagnostic severity levels."""

    ERROR = "error"
    WARNING = "warning"
    INFO = "info"
    HINT = "hint"


class FormatRequest(BaseModel):
    """A request to format source code."""

    source: str
    language: Language
    options: dict | None = None
    context: dict | None = None

    model_config = {"populate_by_name": True}


class Diagnostic(BaseModel):
    """A single diagnostic message from a formatter."""

    file: str | None = None
    line: int | None = None
    column: int | None = None
    severity: Severity
    message: str
    rule: str | None = None


class FormatResult(BaseModel):
    """The result of a format operation."""

    success: bool
    formatted: str | None = None
    diff: str | None = None
    diagnostics: list[Diagnostic] = []
    metadata: dict | None = None
