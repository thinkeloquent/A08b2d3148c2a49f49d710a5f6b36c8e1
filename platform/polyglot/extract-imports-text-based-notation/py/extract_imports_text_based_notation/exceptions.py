class ParseError(Exception):
    """Raised when source code cannot be parsed."""


class UnsupportedImportError(ValueError):
    """Raised for unsupported import syntax."""
