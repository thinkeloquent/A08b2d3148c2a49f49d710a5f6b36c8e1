"""
Configuration model for the Polyglot Formatter SDK.

Parses fmt_sdk.toml configuration files that map languages to formatter commands.
"""

import tomllib
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class FormatterEntry:
    """Configuration for a single formatter."""

    command: str
    args: list[str] = field(default_factory=list)
    extensions: list[str] = field(default_factory=list)
    includes: list[str] = field(default_factory=list)
    excludes: list[str] = field(default_factory=list)


@dataclass
class FmtSdkConfig:
    """Top-level fmt_sdk configuration."""

    formatters: dict[str, FormatterEntry] = field(default_factory=dict)

    @staticmethod
    def load(path: str | Path) -> "FmtSdkConfig":
        """Load configuration from a TOML file."""
        with open(path, "rb") as f:
            data = tomllib.load(f)

        formatters = {}
        for name, entry in data.get("formatter", {}).items():
            formatters[name] = FormatterEntry(
                command=entry["command"],
                args=entry.get("args", []),
                extensions=entry.get("extensions", []),
                includes=entry.get("includes", []),
                excludes=entry.get("excludes", []),
            )

        return FmtSdkConfig(formatters=formatters)
