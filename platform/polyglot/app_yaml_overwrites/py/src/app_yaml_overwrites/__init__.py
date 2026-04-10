"""
app_yaml_overwrites package
Provides configuration overwrite resolution with template support.
"""

# SDK and main exports
from .sdk import ConfigSDK, ConfigSDK as SDK, create_sdk

# Logger
from .logger import ILogger, create as create_logger

# Compatibility aliases
create = create_logger

# Options and enums
from .options import ComputeScope, MissingStrategy, ResolverOptions
# Alias for backwards compatibility
ConfigScope = ComputeScope

# Error types
from .errors import (
    ErrorCode,
    ResolveError,
    ComputeFunctionError,
    SecurityError,
    RecursionLimitError,
    ScopeViolationError,
    ValidationError
)

# Core resolution engine
from .template_resolver import TemplateResolver, create_resolver
from .compute_registry import ComputeRegistry, create_registry
from .path_parser import PathParser, PathSegment, parse_path, traverse_path
from .security import Security, validate_path, is_safe_path

# Overwrite merging
from .overwrite_merger import apply_overwrites, IOverwriteMerger, OverwriteMerger

# Overwrite merging with template resolution
from .overwrite_merger_applied import (
    apply_overwrites_from_context,
    apply_resolved_overwrites,
    deep_merge_with_null_replace,
    AppliedOverwriteMerger,
    create_applied_merger,
    AppliedMergerOptions
)

# Context building
from .context_builder import ContextBuilder, ContextExtender

# Shared context for computed functions (Option 5)
from .shared_context import SharedContext, create_shared_context

# FastAPI integration (from integrations submodule)
from .integrations.fastapi import (
    create_config_lifespan,
    ConfigResolutionMiddleware,
    ConfigIntegrationOptions,
    get_config_sdk,
    get_config,
    get_resolved_config,
    resolve_template_dependency,
    setup_config_integration
)

__all__ = [
    # SDK
    "ConfigSDK",
    "SDK",
    "create_sdk",
    # Logger
    "ILogger",
    "create_logger",
    "create",
    # Options
    "ComputeScope",
    "ConfigScope",
    "MissingStrategy",
    "ResolverOptions",
    # Errors
    "ErrorCode",
    "ResolveError",
    "ComputeFunctionError",
    "SecurityError",
    "RecursionLimitError",
    "ScopeViolationError",
    "ValidationError",
    # Resolution engine
    "TemplateResolver",
    "create_resolver",
    "ComputeRegistry",
    "create_registry",
    "PathParser",
    "PathSegment",
    "parse_path",
    "traverse_path",
    "Security",
    "validate_path",
    "is_safe_path",
    # Overwrite merging
    "apply_overwrites",
    "IOverwriteMerger",
    "OverwriteMerger",
    # Overwrite merging with template resolution
    "apply_overwrites_from_context",
    "apply_resolved_overwrites",
    "deep_merge_with_null_replace",
    "AppliedOverwriteMerger",
    "create_applied_merger",
    "AppliedMergerOptions",
    # Context
    "ContextBuilder",
    "ContextExtender",
    # Shared context for computed functions
    "SharedContext",
    "create_shared_context",
    # FastAPI integration
    "create_config_lifespan",
    "ConfigResolutionMiddleware",
    "ConfigIntegrationOptions",
    "get_config_sdk",
    "get_config",
    "get_resolved_config",
    "resolve_template_dependency",
    "setup_config_integration",
]
