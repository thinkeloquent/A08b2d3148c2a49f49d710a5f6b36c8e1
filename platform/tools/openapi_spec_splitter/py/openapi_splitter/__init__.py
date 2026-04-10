"""
OpenAPI Splitter - Split large OpenAPI specifications into smaller, manageable files.

This package provides both CLI and SDK interfaces for splitting OpenAPI specifications
by tags or path prefixes while maintaining component integrity and references.
"""

from .core import (
    OpenAPISplitter,
    OpenAPISplitterError,
    ComponentResolver,
)

__version__ = "1.0.0"
__author__ = "OpenAPI Splitter Contributors"
__email__ = "support@example.com"

__all__ = [
    'OpenAPISplitter',
    'OpenAPISplitterError',
    'ComponentResolver',
    '__version__',
]