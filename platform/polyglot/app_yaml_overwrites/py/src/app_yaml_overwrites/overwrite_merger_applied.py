"""
Overwrite Merger Applied Module for app_yaml_overwrites package.
Top-layer that handles merging of overwrite_from_context sections with template resolution.

This module provides the complete flow:
1. Extract overwrite_from_context section from config
2. Resolve any {{...}} templates in that section using context
3. Deep merge resolved values into original config (replacing null placeholders)
4. Remove overwrite_from_context key from final result
"""

import copy
import os
from typing import Any, Dict, Optional
from dataclasses import dataclass

from .logger import create as create_logger, ILogger
from .template_resolver import TemplateResolver
from .options import ComputeScope

# Create module-level logger
logger = create_logger("app_yaml_overwrites", "overwrite_merger_applied.py")


@dataclass
class AppliedMergerOptions:
    """Options for the applied overwrite merger."""

    # Template resolver for {{...}} expressions
    resolver: TemplateResolver
    # Custom logger
    logger: Optional[ILogger] = None
    # Whether to remove overwrite_from_context key from result (default: True)
    remove_overwrite_key: bool = True
    # Scope for template resolution (default: REQUEST)
    scope: ComputeScope = ComputeScope.REQUEST


def deep_merge_with_null_replace(target: Any, source: Any) -> Any:
    """
    Deep merge that replaces null values in target with source values.

    Args:
        target: Target object (may have null placeholders)
        source: Source object with values to merge

    Returns:
        Merged object
    """
    if source is None:
        return target

    if not isinstance(target, dict):
        return source

    if not isinstance(source, dict):
        return source

    # Lists: Replace entirely
    if isinstance(source, list):
        return source.copy()

    output = target.copy()

    for key, source_value in source.items():
        target_value = output.get(key)

        if target_value is None:
            # Replace None with source value
            output[key] = source_value
        elif isinstance(source_value, dict) and not isinstance(source_value, list):
            # Recursive merge for dicts
            if isinstance(target_value, dict):
                output[key] = deep_merge_with_null_replace(target_value, source_value)
            else:
                output[key] = source_value
        else:
            # Direct replacement for primitives and lists
            output[key] = source_value

    return output


async def apply_overwrites_from_context(
    config: Dict[str, Any],
    context: Dict[str, Any],
    options: AppliedMergerOptions
) -> Dict[str, Any]:
    """
    Apply overwrites from overwrite_from_context sections with template resolution.
    Recursively processes all nested overwrite_from_context sections throughout the config tree.

    Args:
        config: Original config object containing overwrite_from_context (at any level)
        context: Context object for template resolution (request, env, etc.)
        options: Merger options including resolver

    Returns:
        Config with resolved overwrites applied

    Example:
        config = {
            "providers": {
                "my_provider": {
                    "headers": {
                        "X-App-Name": None,
                        "X-Request-Id": None
                    },
                    "overwrite_from_context": {
                        "headers": {
                            "X-App-Name": "MyApp",
                            "X-Request-Id": "{{request.headers.x-request-id}}"
                        }
                    }
                }
            }
        }

        result = await apply_overwrites_from_context(config, context, options)
        # Result:
        # {
        #     "providers": {
        #         "my_provider": {
        #             "headers": {
        #                 "X-App-Name": "MyApp",
        #                 "X-Request-Id": "actual-request-id-value"
        #             }
        #         }
        #     }
        # }
    """
    merger_logger = options.logger or logger
    scope = options.scope
    remove_key = options.remove_overwrite_key

    merger_logger.debug("apply_overwrites_from_context called", data={
        "context_keys": list(context.keys())
    })

    async def process_node(node: Any) -> Any:
        """Recursively process a node, applying overwrites where found."""
        if not isinstance(node, dict):
            return node

        result = {}

        for key, value in node.items():
            if key == "overwrite_from_context":
                # Skip - will be processed separately
                continue
            elif isinstance(value, dict):
                # Recursively process nested dicts
                result[key] = await process_node(value)
            elif isinstance(value, list):
                # Process list items
                result[key] = [await process_node(item) if isinstance(item, dict) else item for item in value]
            else:
                result[key] = value

        # Check if this node has overwrite_from_context
        overwrite_section = node.get("overwrite_from_context")
        if overwrite_section and isinstance(overwrite_section, dict):
            merger_logger.debug("Found overwrite_from_context section", data={
                "overwrite_keys": list(overwrite_section.keys())
            })

            # Resolve templates in the overwrite section
            resolved_overwrites = await options.resolver.resolve_object(
                overwrite_section,
                context,
                scope
            )
            merger_logger.debug("Templates resolved for overwrite section")

            # Deep merge resolved values into this node
            result = deep_merge_with_null_replace(result, resolved_overwrites)

            # Keep overwrite_from_context key if remove_key is False
            if not remove_key:
                result["overwrite_from_context"] = resolved_overwrites

        return result

    result = await process_node(config)
    merger_logger.info("Overwrites applied successfully (recursive)")
    return result


class AppliedOverwriteMerger:
    """Class-based applied merger for stateful operations."""

    def __init__(self, config: Dict[str, Any], options: AppliedMergerOptions):
        self._config = copy.deepcopy(config)
        self._resolver = options.resolver
        self._logger = options.logger or logger
        self._remove_overwrite_key = options.remove_overwrite_key
        self._scope = options.scope

        self._logger.debug("AppliedOverwriteMerger initialized", data={
            "config_keys": list(config.keys()),
            "has_overwrite_section": "overwrite_from_context" in config
        })

    async def apply(
        self,
        context: Dict[str, Any],
        scope: Optional[ComputeScope] = None
    ) -> Dict[str, Any]:
        """
        Apply overwrites using the provided context.

        Args:
            context: Context object for template resolution
            scope: Resolution scope (default: uses options.scope or REQUEST)

        Returns:
            Merged config with resolved overwrites
        """
        options = AppliedMergerOptions(
            resolver=self._resolver,
            logger=self._logger,
            remove_overwrite_key=self._remove_overwrite_key,
            scope=scope or self._scope
        )

        self._config = await apply_overwrites_from_context(
            self._config,
            context,
            options
        )

        return self._config

    def get_config(self) -> Dict[str, Any]:
        """Get the current config state."""
        return self._config


def create_applied_merger(
    config: Dict[str, Any],
    options: AppliedMergerOptions
) -> AppliedOverwriteMerger:
    """Factory function to create an applied merger."""
    return AppliedOverwriteMerger(config, options)


def apply_resolved_overwrites(config: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Apply already-resolved overwrite_from_context values to top-level config fields.

    This is a simple utility for use after SDK resolution has already resolved
    template values inside overwrite_from_context. It copies those resolved values
    to their corresponding top-level fields.

    Unlike apply_overwrites_from_context (which performs template resolution),
    this function assumes templates are already resolved and simply copies values.

    Args:
        config: Config object with resolved overwrite_from_context values

    Returns:
        Config with overwrite_from_context values applied to top-level fields

    Example:
        # After SDK resolution, overwrite_from_context contains resolved values:
        config = {
            "base_url": "https://api.example.com",
            "api_key": None,  # placeholder
            "overwrite_from_context": {
                "api_key": "resolved-api-key-value"  # resolved by SDK
            }
        }

        result = apply_resolved_overwrites(config)
        # Result:
        # {
        #     "base_url": "https://api.example.com",
        #     "api_key": "resolved-api-key-value",  # copied from overwrite_from_context
        #     "overwrite_from_context": {
        #         "api_key": "resolved-api-key-value"
        #     }
        # }
    """
    if not config:
        return config or {}

    result = dict(config)

    # Apply overwrite_from_env: values are env var names, look up from os.environ
    env_overwrites = config.get("overwrite_from_env", {})
    if env_overwrites and isinstance(env_overwrites, dict):
        for key, env_var_name in env_overwrites.items():
            if key in result and isinstance(env_var_name, str):
                env_value = os.environ.get(env_var_name)
                if env_value is not None:
                    result[key] = env_value

    # Apply overwrite_from_context: values are already-resolved template results
    overwrites = config.get("overwrite_from_context", {})
    if overwrites and isinstance(overwrites, dict):
        for key, value in overwrites.items():
            if key in result:
                result[key] = value

    return result
