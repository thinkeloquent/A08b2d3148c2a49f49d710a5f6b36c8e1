"""
Core authentication encoding functionality.
Encodes credentials into HTTP headers for various auth types.
"""
import base64
from typing import Dict, Any

from .types.auth_type import AuthType
from .types.credentials import (
    USERNAME_KEYS,
    PASSWORD_KEYS,
    EMAIL_KEYS,
    TOKEN_KEYS,
    API_KEY_KEYS,
    HEADER_KEY_KEYS,
    HEADER_VALUE_KEYS,
    extract_credential,
)
from .errors import (
    MissingCredentialError,
    InvalidAuthTypeError,
    HMACNotImplementedError,
)


def _to_base64(s: str) -> str:
    """Encode a string to Base64."""
    return base64.b64encode(s.encode("utf-8")).decode("utf-8")


def _encode_basic_auth(username: str, password: str) -> str:
    """Encode basic authentication (username:password) to Base64."""
    return _to_base64(f"{username}:{password}")


def encode_auth(auth_type: str, credentials: Dict[str, Any]) -> Dict[str, str]:
    """
    Encode authentication credentials into HTTP headers.

    Args:
        auth_type: The authentication type
        credentials: The credentials to encode

    Returns:
        Dictionary of header name to header value

    Raises:
        MissingCredentialError: If required credentials are missing
        InvalidAuthTypeError: If auth type is not supported
        HMACNotImplementedError: If HMAC auth is attempted
    """
    normalized_type = auth_type.lower()

    # Basic authentication types
    if normalized_type == AuthType.BASIC:
        username = extract_credential(credentials, USERNAME_KEYS)
        password = extract_credential(credentials, PASSWORD_KEYS)
        if not username:
            raise MissingCredentialError(normalized_type, "username")
        if not password:
            raise MissingCredentialError(normalized_type, "****")
        return {"Authorization": f"Basic {_encode_basic_auth(username, password)}"}

    elif normalized_type == AuthType.BASIC_EMAIL:
        email = extract_credential(credentials, EMAIL_KEYS)
        password = extract_credential(credentials, PASSWORD_KEYS)
        if not email:
            raise MissingCredentialError(normalized_type, "email")
        if not password:
            raise MissingCredentialError(normalized_type, "****")
        return {"Authorization": f"Basic {_encode_basic_auth(email, password)}"}

    elif normalized_type == AuthType.BASIC_TOKEN:
        username = extract_credential(credentials, USERNAME_KEYS)
        token = extract_credential(credentials, TOKEN_KEYS)
        if not username:
            raise MissingCredentialError(normalized_type, "username")
        if not token:
            raise MissingCredentialError(normalized_type, "token")
        return {"Authorization": f"Basic {_encode_basic_auth(username, token)}"}

    elif normalized_type == AuthType.BASIC_EMAIL_TOKEN:
        email = extract_credential(credentials, EMAIL_KEYS)
        token = extract_credential(credentials, TOKEN_KEYS)
        if not email:
            raise MissingCredentialError(normalized_type, "email")
        if not token:
            raise MissingCredentialError(normalized_type, "token")
        return {"Authorization": f"Basic {_encode_basic_auth(email, token)}"}

    # Bearer token types - raw token
    elif normalized_type in (AuthType.BEARER, AuthType.BEARER_OAUTH, AuthType.BEARER_JWT):
        token = extract_credential(credentials, TOKEN_KEYS)
        if not token:
            raise MissingCredentialError(normalized_type, "token")
        return {"Authorization": f"Bearer {token}"}

    # Bearer token types - compound (Base64 encoded)
    elif normalized_type == AuthType.BEARER_USERNAME_TOKEN:
        username = extract_credential(credentials, USERNAME_KEYS)
        token = extract_credential(credentials, TOKEN_KEYS)
        if not username:
            raise MissingCredentialError(normalized_type, "username")
        if not token:
            raise MissingCredentialError(normalized_type, "token")
        return {"Authorization": f"Bearer {_encode_basic_auth(username, token)}"}

    elif normalized_type == AuthType.BEARER_USERNAME_PASSWORD:
        username = extract_credential(credentials, USERNAME_KEYS)
        password = extract_credential(credentials, PASSWORD_KEYS)
        if not username:
            raise MissingCredentialError(normalized_type, "username")
        if not password:
            raise MissingCredentialError(normalized_type, "****")
        return {"Authorization": f"Bearer {_encode_basic_auth(username, password)}"}

    elif normalized_type == AuthType.BEARER_EMAIL_TOKEN:
        email = extract_credential(credentials, EMAIL_KEYS)
        token = extract_credential(credentials, TOKEN_KEYS)
        if not email:
            raise MissingCredentialError(normalized_type, "email")
        if not token:
            raise MissingCredentialError(normalized_type, "token")
        return {"Authorization": f"Bearer {_encode_basic_auth(email, token)}"}

    elif normalized_type == AuthType.BEARER_EMAIL_PASSWORD:
        email = extract_credential(credentials, EMAIL_KEYS)
        password = extract_credential(credentials, PASSWORD_KEYS)
        if not email:
            raise MissingCredentialError(normalized_type, "email")
        if not password:
            raise MissingCredentialError(normalized_type, "****")
        return {"Authorization": f"Bearer {_encode_basic_auth(email, password)}"}

    # API key authentication
    elif normalized_type == AuthType.X_API_KEY:
        api_key = extract_credential(credentials, API_KEY_KEYS)
        if not api_key:
            raise MissingCredentialError(normalized_type, "apiKey")
        return {"X-API-Key": api_key}

    # Custom header authentication
    elif normalized_type in (AuthType.CUSTOM, AuthType.CUSTOM_HEADER):
        header_key = extract_credential(credentials, HEADER_KEY_KEYS)
        header_value = extract_credential(credentials, HEADER_VALUE_KEYS)
        if not header_key:
            raise MissingCredentialError(normalized_type, "headerKey")
        if not header_value:
            raise MissingCredentialError(normalized_type, "headerValue")
        return {header_key: header_value}

    # No authentication
    elif normalized_type == AuthType.NONE:
        return {}

    # HMAC - reserved but not implemented
    elif normalized_type == AuthType.HMAC:
        raise HMACNotImplementedError()

    else:
        raise InvalidAuthTypeError(auth_type)


def get_header_name(auth_type: str) -> str:
    """Get header name for an auth type."""
    normalized_type = auth_type.lower()

    if normalized_type == AuthType.X_API_KEY:
        return "X-API-Key"
    elif normalized_type in (AuthType.CUSTOM, AuthType.CUSTOM_HEADER):
        return "custom"
    elif normalized_type == AuthType.NONE:
        return "none"
    else:
        return "Authorization"


def is_encoded_auth_type(auth_type: str) -> bool:
    """Check if an auth type uses Base64 encoding."""
    normalized_type = auth_type.lower()

    encoded_types = (
        AuthType.BASIC,
        AuthType.BASIC_EMAIL,
        AuthType.BASIC_TOKEN,
        AuthType.BASIC_EMAIL_TOKEN,
        AuthType.BEARER_USERNAME_TOKEN,
        AuthType.BEARER_USERNAME_PASSWORD,
        AuthType.BEARER_EMAIL_TOKEN,
        AuthType.BEARER_EMAIL_PASSWORD,
    )

    return normalized_type in encoded_types
