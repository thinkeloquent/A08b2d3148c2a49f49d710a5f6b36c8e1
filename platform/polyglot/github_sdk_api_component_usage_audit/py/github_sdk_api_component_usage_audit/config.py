"""
Configuration for GitHub Component Usage Audit.

Uses a frozen dataclass for immutable configuration with sensible defaults.
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class Config:
    """Immutable configuration for the component usage audit."""

    # Required
    component_name: str
    token: str

    # Search tuning
    min_stars: int = 500
    max_pages: int = 10
    min_file_size: int = 1000

    # Output
    output_dir: str = "./output"
    format: str = "json"
    filename: str | None = None

    # Runtime
    verbose: bool = False
    debug: bool = False
    delay: int = 6

    @classmethod
    def from_dict(cls, data: dict) -> Config:
        """Create a Config from a dictionary, ignoring unknown keys."""
        known = {f.name for f in cls.__dataclass_fields__.values()}
        filtered = {k: v for k, v in data.items() if k in known}
        return cls(**filtered)
