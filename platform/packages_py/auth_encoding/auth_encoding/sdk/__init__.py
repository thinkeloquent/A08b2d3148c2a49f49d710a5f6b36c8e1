"""
SDK entry point for fetch_auth_encoding.
Provides a structured wrapper around the core encode_auth function
with optional debug tracing.
"""
from typing import Dict, Any, Optional, Callable
from typing_extensions import TypedDict

from ..fetch_auth_encoding import encode_auth, get_header_name, is_encoded_auth_type
from ..logger import Logger


class SDKEncodeMetadata(TypedDict):
    """Metadata about the encoding operation."""

    authType: str
    headerName: str
    encoded: bool


class SDKEncodeResult(TypedDict):
    """Result from SDK encode function."""

    headers: Dict[str, str]
    metadata: SDKEncodeMetadata


OnDebugCallback = Callable[[str, Optional[Dict[str, Any]]], None]


def mask_credential(value: Optional[str]) -> str:
    """Mask a credential value for logging (never log full credentials)."""
    if not value:
        return "(empty)"
    if len(value) <= 4:
        return "****"
    return value[:2] + "****" + value[-2:]


def encode_auth_sdk(
    auth_type: str,
    credentials: Dict[str, Any],
    logger: Optional[Logger] = None,
) -> SDKEncodeResult:
    """
    Encode authentication credentials with SDK wrapper.
    Provides structured input/output and optional debug logging.

    Args:
        auth_type: The authentication type
        credentials: The credentials to encode
        logger: Optional logger for debug output

    Returns:
        SDK encode result with headers and metadata

    Example:
        >>> from auth_encoding.sdk import encode_auth_sdk
        >>> result = encode_auth_sdk(
        ...     auth_type="basic",
        ...     credentials={"username": "*****", "password": "*****",},
        ... )
        >>> print(result["headers"])  # {"Authorization": "Basic *************"}
        >>> print(result["metadata"])  # {"authType": "basic", ...}
    """
    normalized_type = auth_type.lower()

    if logger:
        logger.debug(f"Encoding auth type: {normalized_type}")

    # Log credential keys (not values) for debugging
    credential_keys = [k for k, v in credentials.items() if v is not None and v != ""]
    if logger:
        logger.debug(f"Credential keys provided: {', '.join(credential_keys)}")

    headers = encode_auth(normalized_type, credentials)

    header_name = get_header_name(normalized_type)
    encoded = is_encoded_auth_type(normalized_type)

    if logger:
        logger.debug(f"Header generated: {header_name}")

    return {
        "headers": headers,
        "metadata": {
            "authType": normalized_type,
            "headerName": header_name,
            "encoded": encoded,
        },
    }


def encode_auth_sdk_with_debug(
    auth_type: str,
    credentials: Dict[str, Any],
    on_debug: Optional[OnDebugCallback] = None,
) -> SDKEncodeResult:
    """
    Encode authentication credentials with debug callback.
    Use this variant when you need custom debug handling.

    Args:
        auth_type: The authentication type
        credentials: The credentials to encode
        on_debug: Optional debug callback

    Returns:
        SDK encode result with headers and metadata
    """
    normalized_type = auth_type.lower()

    if on_debug:
        on_debug(f"Encoding auth type: {normalized_type}", None)

    # Log credential keys for debugging
    credential_keys = [k for k, v in credentials.items() if v is not None and v != ""]
    if on_debug:
        on_debug(
            f"Credential keys provided: {', '.join(credential_keys)}",
            {"keys": credential_keys},
        )

    headers = encode_auth(normalized_type, credentials)

    header_name = get_header_name(normalized_type)
    encoded = is_encoded_auth_type(normalized_type)

    if on_debug:
        on_debug(
            f"Header generated: {header_name}",
            {"headerName": header_name, "encoded": encoded},
        )

    return {
        "headers": headers,
        "metadata": {
            "authType": normalized_type,
            "headerName": header_name,
            "encoded": encoded,
        },
    }


__all__ = [
    "SDKEncodeMetadata",
    "SDKEncodeResult",
    "OnDebugCallback",
    "encode_auth_sdk",
    "encode_auth_sdk_with_debug",
    "mask_credential",
]
