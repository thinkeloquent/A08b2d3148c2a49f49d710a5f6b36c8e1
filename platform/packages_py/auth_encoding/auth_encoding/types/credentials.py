"""
Credential key aliases for flexible credential extraction.
Keys are checked in priority order.
"""
from typing import Dict, Optional, Tuple, Any

# Username aliases - checked in order
USERNAME_KEYS: Tuple[str, ...] = (
    "username",
    "user",
    "userName",
    "user_name",
    "login",
    "id",
    "userId",
)

# Password aliases - checked in order
PASSWORD_KEYS: Tuple[str, ...] = (
    "password",
    "pass",
    "pwd",
    "secret",
    "credential",
    "passwd",
    "passphrase",
    "password_hash",
)

# Email aliases - checked in order
EMAIL_KEYS: Tuple[str, ...] = (
    "email",
    "mail",
    "emailAddress",
    "email_address",
    "userEmail",
    "user_email",
)

# Token aliases - checked in order
TOKEN_KEYS: Tuple[str, ...] = (
    "token",
    "access_token",
    "accessToken",
    "auth_token",
    "authToken",
    "bearer_token",
    "bearerToken",
    "jwt",
    "api_token",
    "apiToken",
)

# API key aliases - checked in order
API_KEY_KEYS: Tuple[str, ...] = (
    "apiKey",
    "api_key",
    "key",
    "x-api-key",
    "xApiKey",
    "apikey",
    "api-key",
    "token",
    "access_key",
    "accessKey",
)

# Header key aliases - checked in order
HEADER_KEY_KEYS: Tuple[str, ...] = (
    "headerKey",
    "header_key",
    "headerName",
    "header_name",
    "name",
    "key",
)

# Header value aliases - checked in order
HEADER_VALUE_KEYS: Tuple[str, ...] = (
    "headerValue",
    "header_value",
    "value",
    "headerContent",
    "header_content",
)


def extract_credential(
    credentials: Dict[str, Any], keys: Tuple[str, ...]
) -> Optional[str]:
    """
    Extract a value from credentials using key aliases in priority order.

    Args:
        credentials: Dictionary of credential key-value pairs
        keys: Tuple of key aliases to check in order

    Returns:
        The first non-empty value found, or None if no match
    """
    for key in keys:
        value = credentials.get(key)
        if value is not None and value != "":
            return str(value)
    return None
