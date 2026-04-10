"""
Authentication types supported by the encoding library.
15 auth types with Base64-encoded output for compound types.
"""
from typing import Literal


class AuthType:
    """Authentication type constants."""

    # Basic authentication types
    BASIC = "basic"
    BASIC_EMAIL = "basic_email"
    BASIC_TOKEN = "basic_token"
    BASIC_EMAIL_TOKEN = "basic_email_token"

    # Bearer token types
    BEARER = "bearer"
    BEARER_OAUTH = "bearer_oauth"
    BEARER_JWT = "bearer_jwt"
    BEARER_USERNAME_TOKEN = "bearer_username_token"
    BEARER_USERNAME_PASSWORD = "bearer_username_password"
    BEARER_EMAIL_TOKEN = "bearer_email_token"
    BEARER_EMAIL_PASSWORD = "bearer_email_password"

    # API key authentication
    X_API_KEY = "x-api-key"

    # Custom header authentication
    CUSTOM = "custom"
    CUSTOM_HEADER = "custom_header"

    # No authentication
    NONE = "none"

    # Reserved - not implemented
    HMAC = "hmac"


# Array of all valid auth types for validation
AUTH_TYPES = [
    AuthType.BASIC,
    AuthType.BASIC_EMAIL,
    AuthType.BASIC_TOKEN,
    AuthType.BASIC_EMAIL_TOKEN,
    AuthType.BEARER,
    AuthType.BEARER_OAUTH,
    AuthType.BEARER_JWT,
    AuthType.BEARER_USERNAME_TOKEN,
    AuthType.BEARER_USERNAME_PASSWORD,
    AuthType.BEARER_EMAIL_TOKEN,
    AuthType.BEARER_EMAIL_PASSWORD,
    AuthType.X_API_KEY,
    AuthType.CUSTOM,
    AuthType.CUSTOM_HEADER,
    AuthType.NONE,
    AuthType.HMAC,
]

AuthTypeLiteral = Literal[
    "basic",
    "basic_email",
    "basic_token",
    "basic_email_token",
    "bearer",
    "bearer_oauth",
    "bearer_jwt",
    "bearer_username_token",
    "bearer_username_password",
    "bearer_email_token",
    "bearer_email_password",
    "x-api-key",
    "custom",
    "custom_header",
    "none",
    "hmac",
]


def is_valid_auth_type(value: str) -> bool:
    """Check if a string is a valid auth type."""
    return value in AUTH_TYPES
