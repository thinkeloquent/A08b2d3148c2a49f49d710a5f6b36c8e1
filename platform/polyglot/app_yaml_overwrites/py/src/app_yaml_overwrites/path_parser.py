"""
Path Parser Module for app_yaml_overwrites package.
Provides dot and bracket notation parsing for nested configuration access.
"""

import re
from typing import List, Any, Union, Optional
from dataclasses import dataclass

from .logger import create as create_logger, ILogger

# Create module-level logger
logger = create_logger("app_yaml_overwrites", "path_parser.py")


@dataclass
class PathSegment:
    """
    Represents a segment of a parsed path.
    - key: String key for object access (e.g., "name" in "user.name")
    - index: Numeric index for array access (e.g., 0 in "items[0]")
    """
    key: Optional[str] = None
    index: Optional[int] = None

    @property
    def is_index(self) -> bool:
        return self.index is not None

    @property
    def value(self) -> Union[str, int]:
        return self.index if self.is_index else self.key

    def __repr__(self) -> str:
        if self.is_index:
            return f"PathSegment(index={self.index})"
        return f"PathSegment(key='{self.key}')"


class PathParser:
    """
    Parses dot and bracket notation paths into segments.

    Supported patterns:
    - app.name -> ["app", "name"]
    - providers[0].api_key -> ["providers", 0, "api_key"]
    - headers["x-custom"] -> ["headers", "x-custom"]
    """

    # Pattern to match bracket access: [0], ["key"], ['key']
    BRACKET_PATTERN = re.compile(r'\[(\d+|"[^"]*"|\'[^\']*\')\]')

    def __init__(self, logger_instance: Optional[ILogger] = None):
        self._logger = logger_instance or logger

    def parse(self, path: str) -> List[PathSegment]:
        """
        Parse a path string into a list of PathSegments.

        Args:
            path: The path string to parse (e.g., "app.name", "items[0].value")

        Returns:
            List of PathSegment objects representing the path

        Raises:
            ValueError: If path is empty or malformed
        """
        if not path:
            self._logger.debug("Empty path provided")
            return []

        if path.strip() != path:
            self._logger.warn("Path has leading/trailing whitespace", path=path)
            path = path.strip()

        self._logger.debug(f"Parsing path: {path}")

        segments: List[PathSegment] = []
        remaining = path

        while remaining:
            # Check for bracket notation at the start
            if remaining.startswith('['):
                match = self.BRACKET_PATTERN.match(remaining)
                if match:
                    bracket_content = match.group(1)
                    # Parse bracket content
                    if bracket_content.isdigit():
                        # Numeric index
                        segments.append(PathSegment(index=int(bracket_content)))
                    elif bracket_content.startswith('"') or bracket_content.startswith("'"):
                        # String key in quotes
                        key = bracket_content[1:-1]  # Remove quotes
                        segments.append(PathSegment(key=key))
                    else:
                        segments.append(PathSegment(key=bracket_content))

                    remaining = remaining[match.end():]
                    # Skip following dot if present
                    if remaining.startswith('.'):
                        remaining = remaining[1:]
                else:
                    # Malformed bracket
                    self._logger.warn(f"Malformed bracket notation in path: {remaining}")
                    break
            else:
                # Find next separator (dot or bracket)
                dot_pos = remaining.find('.')
                bracket_pos = remaining.find('[')

                if dot_pos == -1 and bracket_pos == -1:
                    # No more separators, rest is a key
                    if remaining:
                        segments.append(PathSegment(key=remaining))
                    break
                elif dot_pos == -1:
                    end_pos = bracket_pos
                elif bracket_pos == -1:
                    end_pos = dot_pos
                else:
                    end_pos = min(dot_pos, bracket_pos)

                # Extract key up to separator
                key = remaining[:end_pos]
                if key:
                    segments.append(PathSegment(key=key))

                # Move past the separator
                if end_pos < len(remaining) and remaining[end_pos] == '.':
                    remaining = remaining[end_pos + 1:]
                else:
                    remaining = remaining[end_pos:]

        self._logger.debug(f"Parsed {len(segments)} segments from path: {path}")
        return segments

    def traverse(
        self,
        obj: Any,
        segments: List[PathSegment],
        default: Any = None
    ) -> Any:
        """
        Traverse an object using parsed path segments.

        Args:
            obj: The object to traverse
            segments: List of PathSegment objects
            default: Default value if path not found

        Returns:
            The value at the path, or default if not found
        """
        if not segments:
            return obj

        current = obj
        for i, segment in enumerate(segments):
            if current is None:
                self._logger.debug(f"Null value encountered at segment {i}")
                return default

            try:
                if segment.is_index:
                    # Array/list access
                    if isinstance(current, (list, tuple)):
                        if 0 <= segment.index < len(current):
                            current = current[segment.index]
                        else:
                            self._logger.debug(f"Index {segment.index} out of bounds")
                            return default
                    else:
                        self._logger.debug(f"Cannot index into non-list: {type(current)}")
                        return default
                else:
                    # Object/dict access
                    if isinstance(current, dict):
                        if segment.key in current:
                            current = current[segment.key]
                        else:
                            self._logger.debug(f"Key '{segment.key}' not found")
                            return default
                    elif hasattr(current, segment.key):
                        current = getattr(current, segment.key)
                    else:
                        self._logger.debug(f"Attribute '{segment.key}' not found on {type(current)}")
                        return default
            except (KeyError, IndexError, TypeError) as e:
                self._logger.debug(f"Access error at segment {i}: {e}")
                return default

        return current


def parse_path(path: str) -> List[PathSegment]:
    """
    Convenience function to parse a path string.

    Args:
        path: The path string to parse

    Returns:
        List of PathSegment objects
    """
    parser = PathParser()
    return parser.parse(path)


def traverse_path(obj: Any, path: str, default: Any = None) -> Any:
    """
    Convenience function to traverse an object by path string.

    Args:
        obj: The object to traverse
        path: The path string (e.g., "app.name", "items[0].value")
        default: Default value if path not found

    Returns:
        The value at the path, or default if not found
    """
    parser = PathParser()
    segments = parser.parse(path)
    return parser.traverse(obj, segments, default)
