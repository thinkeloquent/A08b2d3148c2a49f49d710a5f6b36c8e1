"""
Options and enums for app_yaml_overwrites package.
"""

from enum import Enum
from typing import Optional, Any
from dataclasses import dataclass


class ComputeScope(Enum):
    """
    Scope for compute functions.
    - STARTUP: Resolved once at server boot, cached for lifetime
    - REQUEST: Resolved per HTTP request, no caching
    - GLOBAL:  Resolved in both STARTUP and REQUEST scopes, never cached.
               At STARTUP the function runs without request context (ctx.request is None).
               At REQUEST the function runs with full request context (headers, query, etc.).
    """
    STARTUP = 'STARTUP'
    REQUEST = 'REQUEST'
    GLOBAL = 'GLOBAL'


class MissingStrategy(Enum):
    """
    Strategy for handling missing template values.
    - ERROR: Raise exception on missing value
    - DEFAULT: Use default value if provided
    - IGNORE: Return original template string
    """
    ERROR = 'ERROR'
    DEFAULT = 'DEFAULT'
    IGNORE = 'IGNORE'


@dataclass
class ResolverOptions:
    """
    Configuration options for the TemplateResolver.
    """
    max_depth: int = 10
    missing_strategy: MissingStrategy = MissingStrategy.ERROR
    logger: Optional[Any] = None
