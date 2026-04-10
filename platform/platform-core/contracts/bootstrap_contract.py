"""
Bootstrap Contract (Python)

Defines the interface for FastAPI server bootstrap.
Bootstrap runs ONCE at application start/shutdown.

Interface:
    setup(config: BootstrapConfig) -> FastAPI
    shutdown(app: FastAPI) -> None
"""

import os
import re
from dataclasses import dataclass, field
from typing import Any


@dataclass
class LoggerConfig:
    """Logger configuration."""
    level: str = 'info'
    json_format: bool = True


@dataclass
class BootstrapConfig:
    """Configuration passed to bootstrap.setup()."""
    port: int = 52000
    host: str = '0.0.0.0'
    logger: LoggerConfig = field(default_factory=LoggerConfig)
    core_plugins: list[str] = field(default_factory=list)
    core_lifecycles: list[str] = field(default_factory=list)
    loaders: list[str] = field(default_factory=list)


@dataclass
class LoaderReport:
    """Structured report from a loader's execution."""
    loader: str = ''
    discovered: int = 0
    validated: int = 0
    imported: int = 0
    registered: int = 0
    skipped: int = 0
    errors: list = field(default_factory=list)
    details: dict = field(default_factory=dict)


def validate_bootstrap_config(config: BootstrapConfig) -> tuple[bool, list[str]]:
    """Validate a bootstrap config.

    Returns:
        Tuple of (is_valid, error_messages)
    """
    errors = []

    if not isinstance(config.port, int) or config.port < 1 or config.port > 65535:
        errors.append('port must be an integer between 1 and 65535')

    if not isinstance(config.host, str):
        errors.append('host must be a string')

    valid_levels = ('fatal', 'error', 'warn', 'warning', 'info', 'debug', 'trace', 'silent')
    if config.logger.level not in valid_levels:
        errors.append(f'logger.level must be one of: {", ".join(valid_levels)}')

    for key in ('core_plugins', 'core_lifecycles', 'loaders'):
        value = getattr(config, key)
        if not isinstance(value, list):
            errors.append(f'{key} must be a list')
        elif not all(isinstance(item, str) for item in value):
            errors.append(f'{key} must contain only strings')

    return (len(errors) == 0, errors)


def create_loader_report(loader_name: str) -> LoaderReport:
    """Create an empty loader report."""
    return LoaderReport(loader=loader_name)


def sort_by_numeric_prefix(file_paths: list[str]) -> list[str]:
    """Sort file paths by numeric prefix in filename.

    Files without numeric prefix sort to 999.
    """
    def extract_prefix(p: str) -> tuple[int, str]:
        match = re.match(r'^(\d+)', os.path.basename(p))
        return (int(match.group(1)) if match else 999, p)

    return sorted(file_paths, key=extract_prefix)
