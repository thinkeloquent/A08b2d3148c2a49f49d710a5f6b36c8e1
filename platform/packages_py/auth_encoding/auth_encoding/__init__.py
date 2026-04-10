"""
fetch_auth_encoding - Polyglot authentication encoding utilities.

Provides encoding for 15 authentication types (Basic, Bearer, API Key, Custom)
with Base64-encoded output for compound auth types.
Zero production dependencies - uses platform built-ins only.
"""

# Logger
from .logger import logger, create_logger, Logger, LogLevel

# Types
from .types.auth_type import AuthType, AUTH_TYPES, is_valid_auth_type
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

# Interfaces
from .interfaces import (
    AuthCredentials,
    EncodingResult,
    EncodingMetadata,
    SDKEncodingResult,
    AuthEncoder,
)

# Core encoding
from .fetch_auth_encoding import encode_auth, get_header_name, is_encoded_auth_type

# Errors
from .errors import (
    AuthEncodingError,
    MissingCredentialError,
    InvalidAuthTypeError,
    HMACNotImplementedError,
)

# SDK
from . import sdk

__all__ = [
    # Logger
    "logger",
    "create_logger",
    "Logger",
    "LogLevel",
    # Types
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
    # Interfaces
    "AuthCredentials",
    "EncodingResult",
    "EncodingMetadata",
    "SDKEncodingResult",
    "AuthEncoder",
    # Core encoding
    "encode_auth",
    "get_header_name",
    "is_encoded_auth_type",
    # Errors
    "AuthEncodingError",
    "MissingCredentialError",
    "InvalidAuthTypeError",
    "HMACNotImplementedError",
    # SDK
    "sdk",
]

__version__ = "1.0.0"
