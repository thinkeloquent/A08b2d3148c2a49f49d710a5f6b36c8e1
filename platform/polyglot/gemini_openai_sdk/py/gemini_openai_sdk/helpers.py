"""
Helpers Module - Utility Functions

Common utility functions used across the SDK with defensive logging.
"""

import json
import re
from typing import Any, Dict, List, Optional

from .constants import DEFAULT_MODEL, MODELS
from .logger import create

logger = create("gemini_openai_sdk", __file__)


def get_api_key() -> str:
    """Get Gemini API key from environment.

    Delegates to :func:`get_api_key.get_api_key_sync`.
    """
    from .get_api_key import get_api_key_sync
    return get_api_key_sync()


def get_model(model_type: str) -> str:
    """
    Get full model name from type identifier.

    Args:
        model_type: Model type ("flash" or "pro")

    Returns:
        Full model name string
    """
    logger.debug("get_model: resolving type=%s", model_type)
    model = MODELS.get(model_type, MODELS[DEFAULT_MODEL])
    logger.debug("get_model: resolved to %s", model)
    return model


def get_headers(api_key: str) -> Dict[str, str]:
    """
    Build authorization headers for Gemini API.

    Args:
        api_key: Gemini API key

    Returns:
        Headers dictionary with Authorization and Content-Type
    """
    logger.debug("get_headers: building auth headers")
    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }


def extract_json(content: str) -> Optional[Dict[str, Any]]:
    """
    Extract JSON from response content with fallback strategies.

    Attempts extraction in order:
    1. Direct JSON parse
    2. Extract from markdown code block
    3. Regex match for JSON object

    Args:
        content: Raw content string potentially containing JSON

    Returns:
        Parsed JSON dictionary or None if extraction fails
    """
    if not content:
        logger.debug("extract_json: empty content")
        return None

    # Strategy 1: Direct parse
    logger.debug("extract_json: attempting direct parse")
    try:
        result = json.loads(content)
        logger.debug("extract_json: direct parse succeeded")
        return result
    except json.JSONDecodeError:
        logger.debug("extract_json: direct parse failed, trying code block")

    # Strategy 2: Markdown code block
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", content)
    if match:
        try:
            result = json.loads(match.group(1).strip())
            logger.debug("extract_json: code block extraction succeeded")
            return result
        except json.JSONDecodeError:
            logger.debug("extract_json: code block parse failed, trying regex")

    # Strategy 3: Regex for JSON object
    match = re.search(r"\{[\s\S]*\}", content)
    if match:
        try:
            result = json.loads(match.group(0))
            logger.debug("extract_json: regex extraction succeeded")
            return result
        except json.JSONDecodeError:
            logger.debug("extract_json: regex parse failed")

    logger.warn("extract_json: all extraction strategies failed")
    return None


def validate_schema(data: Dict[str, Any], schema: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate data against a JSON schema.

    Performs basic validation:
    - Root type check
    - Required field presence
    - Property type validation

    Args:
        data: Data dictionary to validate
        schema: JSON schema dictionary

    Returns:
        Dictionary with "valid" boolean and "errors" list
    """
    logger.debug("validate_schema: validating data against schema")
    errors: List[str] = []

    # Type check
    if schema.get("type") == "object" and not isinstance(data, dict):
        logger.debug("validate_schema: type mismatch - expected object")
        return {"valid": False, "errors": ["Expected object"]}

    # Required fields
    required_fields = schema.get("required", [])
    for field in required_fields:
        if field not in data:
            error_msg = f"Missing required field: {field}"
            errors.append(error_msg)
            logger.debug("validate_schema: %s", error_msg)

    # Property type validation
    properties = schema.get("properties", {})
    for key, prop_schema in properties.items():
        if key in data:
            value = data[key]
            prop_type = prop_schema.get("type")

            type_valid = True
            if prop_type == "string" and not isinstance(value, str):
                type_valid = False
            elif prop_type == "number" and not isinstance(value, (int, float)):
                type_valid = False
            elif prop_type == "boolean" and not isinstance(value, bool):
                type_valid = False
            elif prop_type == "array" and not isinstance(value, list):
                type_valid = False

            if not type_valid:
                error_msg = f"{key} should be {prop_type}"
                errors.append(error_msg)
                logger.debug("validate_schema: %s", error_msg)

    is_valid = len(errors) == 0
    logger.debug("validate_schema: validation %s", "passed" if is_valid else "failed")

    return {"valid": is_valid, "errors": errors}


def normalize_messages(
    messages: List[Dict[str, str]],
    include_system_prompt: bool = True,
    system_prompt: Optional[str] = None,
) -> List[Dict[str, str]]:
    """
    Normalize message list, optionally prepending system prompt.

    Args:
        messages: List of message dictionaries
        include_system_prompt: Whether to include system prompt
        system_prompt: Custom system prompt (uses default if not provided)

    Returns:
        Normalized messages list
    """
    from .constants import SYSTEM_PROMPT

    logger.debug("normalize_messages: processing %d messages", len(messages))

    result = list(messages)  # Copy to avoid mutation

    if include_system_prompt and (not result or result[0].get("role") != "system"):
        prompt = system_prompt or SYSTEM_PROMPT
        result.insert(0, {"role": "system", "content": prompt})
        logger.debug("normalize_messages: prepended system prompt")

    return result
