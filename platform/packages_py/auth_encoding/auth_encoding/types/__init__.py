"""
Type definitions for fetch_auth_encoding.
"""

from .auth_type import AuthType, AUTH_TYPES, is_valid_auth_type
from .credentials import (
    USERNAME_KEYS,
    PASSWORD_KEYS,
    EMAIL_KEYS,
    TOKEN_KEYS,
    API_KEY_KEYS,
    HEADER_KEY_KEYS,
    HEADER_VALUE_KEYS,
    extract_credential,
)

__all__ = [
    "AuthType",
    "AUTH_TYPES",
    "is_valid_auth_type",
    "USERNAME_KEYS",
    "PASSWORD_KEYS",
    "EMAIL_KEYS",
    "TOKEN_KEYS",
    "API_KEY_KEYS",
    "HEADER_KEY_KEYS",
    "HEADER_VALUE_KEYS",
    "extract_credential",
]
