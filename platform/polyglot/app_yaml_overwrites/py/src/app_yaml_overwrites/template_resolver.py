"""
Template Resolver Module for app_yaml_overwrites package.
Provides resolution of {{...}} template expressions in configuration.
"""

import re
from typing import Any, Dict, List, Optional

from .logger import create as create_logger, ILogger
from .options import ComputeScope, MissingStrategy, ResolverOptions
from .errors import (
    RecursionLimitError,
    ComputeFunctionError,
    ErrorCode
)
from .compute_registry import ComputeRegistry
from .security import Security
from .path_parser import traverse_path

# Create module-level logger
logger = create_logger("app_yaml_overwrites", "template_resolver.py")


class TemplateResolver:
    """
    Resolves template expressions in configuration values.

    Supported patterns:
    - {{variable.path}} - Access context value by path
    - {{fn:function_name}} - Call registered compute function
    - {{fn:function_name.property}} - Call function and access property (Option 4)
    - {{path | "default"}} - Use default value if path not found
    - {{fn:name | "default"}} - Use default if function not found/fails
    - {{fn:name.property | "default"}} - Access property with default
    """

    # Pattern: {{fn:function_name.property_path | "default"}}
    # Groups: 1=fn_name, 2=property_path (optional), 3=default section, 4=default value
    COMPUTE_PATTERN = re.compile(
        r'^\{\{fn:([a-zA-Z_][a-zA-Z0-9_]*)(?:\.([a-zA-Z0-9_.]+))?(\s*\|\s*[\'"](.*)[\'"]\s*)?\}\}$'
    )

    # Pattern: {{variable.path | "default"}}
    TEMPLATE_PATTERN = re.compile(
        r'^\{\{([a-zA-Z0-9_.]*)(\s*\|\s*[\'"](.*)[\'"]\s*)?\}\}$'
    )

    def __init__(
        self,
        registry: ComputeRegistry,
        options: Optional[ResolverOptions] = None
    ):
        """
        Initialize the TemplateResolver.

        Args:
            registry: ComputeRegistry for function resolution
            options: Optional ResolverOptions configuration
        """
        self._logger = (options.logger if options else None) or logger
        self._registry = registry
        self._max_depth = options.max_depth if options else 10
        self._missing_strategy = (
            options.missing_strategy if options
            else MissingStrategy.ERROR
        )
        self._logger.debug("TemplateResolver initialized")

    def is_compute_pattern(self, expression: str) -> bool:
        """
        Check if an expression matches the compute pattern {{fn:name}}.

        Args:
            expression: The string to check

        Returns:
            True if it's a compute pattern
        """
        return bool(self.COMPUTE_PATTERN.match(expression))

    def is_template_pattern(self, expression: str) -> bool:
        """
        Check if an expression matches the template pattern {{path}}.

        Args:
            expression: The string to check

        Returns:
            True if it's a template pattern
        """
        return bool(self.TEMPLATE_PATTERN.match(expression))

    async def resolve(
        self,
        expression: Any,
        context: Dict[str, Any],
        scope: ComputeScope = ComputeScope.REQUEST,
        depth: int = 0,
        property_path: Optional[str] = None
    ) -> Any:
        """
        Resolve a single template expression.

        Args:
            expression: The value to resolve (string with {{...}} or other)
            context: Context dictionary for variable lookup
            scope: Resolution scope (STARTUP or REQUEST)
            depth: Current recursion depth
            property_path: The path to the property being resolved (e.g., "providers.gemini_openai.api_key")

        Returns:
            Resolved value (preserves types)

        Raises:
            RecursionLimitError: If depth exceeds max_depth
            ComputeFunctionError: If function resolution fails
        """
        # Pass-through non-string values
        if not isinstance(expression, str):
            return expression

        # Recursion check
        if depth > self._max_depth:
            self._logger.error(f"Recursion limit reached: {self._max_depth}")
            raise RecursionLimitError(
                f"Recursion limit reached ({self._max_depth})",
                ErrorCode.RECURSION_LIMIT
            )

        # Check compute pattern first
        compute_match = self.COMPUTE_PATTERN.match(expression)
        if compute_match:
            return await self._resolve_compute(compute_match, context, scope, property_path)

        # Check template pattern
        template_match = self.TEMPLATE_PATTERN.match(expression)
        if template_match:
            return self._resolve_template(template_match, context)

        # Not a template, return as-is
        return expression

    async def resolve_object(
        self,
        obj: Any,
        context: Dict[str, Any],
        scope: ComputeScope = ComputeScope.REQUEST,
        depth: int = 0,
        current_path: str = ""
    ) -> Any:
        """
        Recursively resolve templates in an object (dict/list).

        Args:
            obj: The object to resolve
            context: Context dictionary for variable lookup
            scope: Resolution scope (STARTUP or REQUEST)
            depth: Current recursion depth
            current_path: The current property path being traversed (e.g., "providers.gemini_openai")

        Returns:
            New object with all templates resolved
        """
        if depth > self._max_depth:
            raise RecursionLimitError(
                f"Recursion limit reached ({self._max_depth})",
                ErrorCode.RECURSION_LIMIT
            )

        if isinstance(obj, list):
            return [
                await self.resolve_object(
                    item, context, scope, depth + 1,
                    f"{current_path}[{i}]" if current_path else f"[{i}]"
                )
                for i, item in enumerate(obj)
            ]

        if isinstance(obj, dict):
            result = {}
            for key, value in obj.items():
                new_path = f"{current_path}.{key}" if current_path else key
                result[key] = await self.resolve_object(value, context, scope, depth + 1, new_path)
            return result

        if isinstance(obj, str):
            return await self.resolve(obj, context, scope, depth, current_path)

        # Pass through other types
        return obj

    async def resolve_many(
        self,
        expressions: List[Any],
        context: Dict[str, Any],
        scope: ComputeScope = ComputeScope.REQUEST
    ) -> List[Any]:
        """
        Resolve multiple expressions.

        Args:
            expressions: List of values to resolve
            context: Context dictionary for variable lookup
            scope: Resolution scope

        Returns:
            List of resolved values
        """
        return [
            await self.resolve(expr, context, scope)
            for expr in expressions
        ]

    def _get_nested(self, obj: Any, path: str) -> Any:
        """
        Access nested property via dot notation (Option 4 support).

        Args:
            obj: The object to access (dict, object, or any with __getitem__)
            path: Dot-separated path e.g., "case_001" or "nested.value"

        Returns:
            The value at the path, or None if not found

        Example:
            result = {"tokens": {"case_001": "abc"}}
            _get_nested(result, "tokens.case_001")  # Returns "abc"
        """
        if obj is None or path is None:
            return obj

        for key in path.split('.'):
            if isinstance(obj, dict):
                obj = obj.get(key)
            elif hasattr(obj, key):
                obj = getattr(obj, key)
            elif hasattr(obj, '__getitem__'):
                try:
                    obj = obj[key]
                except (KeyError, TypeError, IndexError):
                    return None
            else:
                return None

            if obj is None:
                return None

        return obj

    async def _resolve_compute(
        self,
        match: re.Match,
        context: Dict[str, Any],
        scope: ComputeScope,
        target_property_path: Optional[str] = None
    ) -> Any:
        """
        Resolve a compute function expression with optional property access.

        Supports both:
        - {{fn:function_name}} - Returns full result
        - {{fn:function_name.property}} - Returns nested property (Option 4)

        Args:
            match: Regex match object
            context: Context dictionary
            scope: Resolution scope
            target_property_path: The path to the property being computed (e.g., "providers.gemini_openai.api_key")
        """
        fn_name = match.group(1)
        fn_property_path = match.group(2)  # Optional property path for Option 4 (e.g., {{fn:name.property}})
        default_val = match.group(4)    # Updated group number

        self._logger.debug(
            f"Resolving compute: {fn_name}",
            property_path=fn_property_path,
            target_property_path=target_property_path,
            default=default_val
        )

        if not self._registry.has(fn_name):
            if default_val is not None:
                return self._parse_default(default_val)
            if self._missing_strategy == MissingStrategy.DEFAULT:
                return None
            if self._missing_strategy == MissingStrategy.IGNORE:
                return match.group(0)

            raise ComputeFunctionError(
                f"Compute function not found: {fn_name}",
                ErrorCode.COMPUTE_FUNCTION_NOT_FOUND,
                {"name": fn_name}
            )

        # Skip REQUEST-scoped functions during STARTUP
        fn_scope = self._registry.get_scope(fn_name)
        if fn_scope == ComputeScope.REQUEST and scope == ComputeScope.STARTUP:
            self._logger.debug(
                f"Skipping REQUEST scope function '{fn_name}' during STARTUP"
            )
            return match.group(0)  # Return original template

        try:
            # Pass the target property path to the compute function
            result = await self._registry.resolve(fn_name, context, target_property_path)

            # Option 4: Apply property path if specified (for {{fn:name.property}})
            if fn_property_path:
                result = self._get_nested(result, fn_property_path)
                if result is None and default_val is not None:
                    return self._parse_default(default_val)

            return result

        except Exception as e:
            if default_val is not None:
                self._logger.warn(
                    f"Function {fn_name} failed, using default: {e}"
                )
                return self._parse_default(default_val)
            raise

    def _resolve_template(
        self,
        match: re.Match,
        context: Dict[str, Any]
    ) -> Any:
        """
        Resolve a template variable expression.
        """
        path = match.group(1)
        default_val = match.group(3)

        self._logger.debug(
            f"Resolving template: {path}",
            default=default_val
        )

        # Validate path security
        if path:
            Security.validate_path(path)

        # Traverse context to get value
        value = traverse_path(context, path) if path else context

        if value is None:
            if default_val is not None:
                return self._parse_default(default_val)
            if self._missing_strategy == MissingStrategy.IGNORE:
                return match.group(0)
            # Return None for missing values if strategy is DEFAULT or path is empty
            return None

        return value

    def _parse_default(self, val: str) -> Any:
        """
        Parse a default value string, converting to appropriate type.
        """
        if val == 'true':
            return True
        if val == 'false':
            return False
        if val == 'null' or val == 'None':
            return None
        try:
            # Try to parse as number
            if '.' in val:
                return float(val)
            return int(val)
        except ValueError:
            pass
        return val


def create_resolver(
    registry: ComputeRegistry,
    options: Optional[ResolverOptions] = None
) -> TemplateResolver:
    """
    Factory function to create a TemplateResolver.

    Args:
        registry: ComputeRegistry for function resolution
        options: Optional resolver configuration

    Returns:
        TemplateResolver instance
    """
    return TemplateResolver(registry, options)
