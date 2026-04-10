"""
Validation error normalizers for FastAPI/Pydantic.

Converts Pydantic validation errors to standardized format.
"""

from typing import Any, Dict, List

from ..logger import create

logger = create("common_exceptions", __file__)


def normalize_pydantic_errors(errors: List[Dict[str, Any]]) -> List[Dict[str, str]]:
    """
    Normalize Pydantic validation errors to standardized format.

    Pydantic errors have shape:
        {"loc": ["body", "user", "email"], "msg": "...", "type": "..."}

    Normalized output:
        {"field": "body.user.email", "message": "...", "code": "..."}

    Args:
        errors: List of Pydantic error dicts

    Returns:
        List of normalized error dicts
    """
    normalized = []

    for error in errors:
        # Convert loc tuple/list to dot-notation path
        loc = error.get("loc", [])
        field_path = ".".join(str(part) for part in loc)

        # Extract message
        message = error.get("msg", "Invalid value")

        # Extract error type as code
        error_type = error.get("type", "")
        code = _normalize_error_type(error_type)

        normalized_error = {
            "field": field_path,
            "message": _capitalize_first(message),
        }

        if code:
            normalized_error["code"] = code

        logger.debug(f"Normalized validation error: {field_path} - {message}")
        normalized.append(normalized_error)

    return normalized


def _normalize_error_type(error_type: str) -> str:
    """
    Normalize Pydantic error type to standardized code.

    Args:
        error_type: Pydantic error type (e.g., "value_error.email")

    Returns:
        Normalized code (e.g., "format.email")
    """
    # Map common Pydantic error types to codes
    type_mapping = {
        "value_error.missing": "required",
        "value_error.email": "format.email",
        "value_error.url": "format.url",
        "value_error.uuid": "format.uuid",
        "type_error.integer": "type.integer",
        "type_error.string": "type.string",
        "type_error.bool": "type.boolean",
        "type_error.none.not_allowed": "type.not_null",
        "value_error.any_str.min_length": "string.min_length",
        "value_error.any_str.max_length": "string.max_length",
        "value_error.number.not_gt": "number.greater_than",
        "value_error.number.not_ge": "number.greater_than_or_equal",
        "value_error.number.not_lt": "number.less_than",
        "value_error.number.not_le": "number.less_than_or_equal",
        "value_error.list.min_items": "array.min_items",
        "value_error.list.max_items": "array.max_items",
        "value_error.const": "enum.invalid",
    }

    # Check exact match first
    if error_type in type_mapping:
        return type_mapping[error_type]

    # Check prefix matches
    for prefix, code in type_mapping.items():
        if error_type.startswith(prefix.split(".")[0]):
            return code

    # Default: convert underscores to dots
    return error_type.replace("_", ".")


def _capitalize_first(message: str) -> str:
    """Capitalize first letter of message."""
    if not message:
        return message
    return message[0].upper() + message[1:]


logger.debug("Pydantic normalizers initialized")
