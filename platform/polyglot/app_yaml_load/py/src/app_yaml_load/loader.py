from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from app_yaml_static_config import AppYamlConfig, AppYamlConfigSDK
from app_yaml_static_config.types import InitOptions, ILogger


_CONFIG_FILES = (
    "base.yml",
    "security.yml",
    "api-release-date.yml",
    "feature_flags.yml",
)


def _env_config_files(app_env: str) -> list[str]:
    return [
        f"server.{app_env}.yaml",
        f"endpoint.{app_env}.yaml",
    ]


@dataclass
class LoadOptions:
    config_dir: Optional[str] = None
    app_env: Optional[str] = None
    logger: Optional[ILogger] = None


@dataclass
class LoadResult:
    config: AppYamlConfig
    sdk: AppYamlConfigSDK


def _resolve_config_dir(
    override: Optional[str] = None,
    caller_dir: Optional[Path] = None,
) -> str:
    if override is not None:
        if not override:
            raise ValueError("config_dir must not be an empty string")
        return override
    env_val = os.getenv("CONFIG_DIR")
    if env_val is not None:
        if not env_val:
            raise ValueError("CONFIG_DIR env var must not be an empty string")
        return env_val
    if caller_dir:
        return str((caller_dir / ".." / ".." / ".." / ".." / ".." / "common" / "config").resolve())
    raise ValueError(
        "config_dir is required: pass it explicitly, set CONFIG_DIR env var, or provide caller_dir"
    )


def _resolve_app_env(override: Optional[str] = None) -> str:
    return (override or os.getenv("APP_ENV", "dev")).lower()


def build_config_files(config_dir: str, app_env: str) -> list[str]:
    """Build the canonical 5-file list for AppYamlConfig initialization."""
    return [
        os.path.join(config_dir, f)
        for f in (*_CONFIG_FILES, *_env_config_files(app_env))
    ]


def _resolve_env_template(value: str) -> Optional[str]:
    """Resolve a single {{env.VAR_NAME}} template from os.environ.

    Non-template strings returned as-is. Returns None if env var not set.
    """
    stripped = value.strip()
    if stripped.startswith("{{env.") and stripped.endswith("}}"):
        var_name = stripped[6:-2]
        return os.getenv(var_name)
    return value


def _resolve_env_templates_in_object(obj):
    """Recursively resolve {{env.VAR}} templates in an object."""
    if obj is None:
        return obj
    if isinstance(obj, str):
        return _resolve_env_template(obj)
    if isinstance(obj, list):
        return [_resolve_env_templates_in_object(item) for item in obj]
    if isinstance(obj, dict):
        return {key: _resolve_env_templates_in_object(val) for key, val in obj.items()}
    return obj


def _apply_env_overwrites(node):
    """Recursively walk the config tree and apply overwrite_from_context.

    For each node with an overwrite_from_context section:
    1. Resolve {{env.VAR}} templates in the overwrite section
    2. Apply resolved non-None values to the parent-level fields
    3. Keep overwrite_from_context with resolved values for reference
    """
    if not isinstance(node, dict):
        return node

    result: dict = {}

    for key, value in node.items():
        if key == "overwrite_from_context":
            continue
        if isinstance(value, dict):
            result[key] = _apply_env_overwrites(value)
        else:
            result[key] = value

    overwrites = node.get("overwrite_from_context")
    if overwrites and isinstance(overwrites, dict):
        resolved = _resolve_env_templates_in_object(overwrites)
        for key, value in resolved.items():
            if value is not None:
                result[key] = value
        result["overwrite_from_context"] = resolved

    return result


def load_app_yaml_config(
    config_dir: Optional[str] = None,
    app_env: Optional[str] = None,
    logger: Optional[ILogger] = None,
    *,
    options: Optional[LoadOptions] = None,
) -> LoadResult:
    """Initialize AppYamlConfig from the standard config directory.

    Resolves {{env.VAR}} templates in overwrite_from_context sections
    and applies them to parent-level fields at load time.

    Works for servers, CLIs, and integration tests.

    Accepts either flat kwargs or a LoadOptions dataclass.

    Args:
        config_dir: Override for CONFIG_DIR env var.
        app_env: Override for APP_ENV env var (default: 'dev').
        logger: Optional custom logger.
        options: Alternative to flat kwargs - a LoadOptions dataclass.

    Returns:
        LoadResult with config and sdk attributes.
    """
    if options is not None:
        config_dir = config_dir or options.config_dir
        app_env = app_env or options.app_env
        logger = logger or options.logger

    resolved_dir = _resolve_config_dir(config_dir, caller_dir=Path(__file__).parent)
    resolved_env = _resolve_app_env(app_env)
    files = build_config_files(resolved_dir, resolved_env)

    init_options = InitOptions(
        files=files,
        config_dir=resolved_dir,
        app_env=resolved_env,
        logger=logger,
    )

    AppYamlConfig.initialize(init_options)
    config = AppYamlConfig.get_instance()

    # Resolve {{env.VAR}} templates in overwrite_from_context and apply to parent fields
    raw_config = getattr(config, '_config', None)
    if raw_config and isinstance(raw_config, dict):
        config._config = _apply_env_overwrites(raw_config)

    sdk = AppYamlConfigSDK(config)

    return LoadResult(config=config, sdk=sdk)
