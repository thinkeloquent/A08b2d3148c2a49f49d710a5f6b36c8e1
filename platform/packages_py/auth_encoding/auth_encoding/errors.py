"""
Error classes for fetch_auth_encoding.
"""


class AuthEncodingError(Exception):
    """Base error class for auth encoding errors."""

    pass


class MissingCredentialError(AuthEncodingError):
    """Error thrown when required credentials are missing."""

    def __init__(self, auth_type: str, missing_field: str):
        self.auth_type = auth_type
        self.missing_field = missing_field
        super().__init__(
            f"Missing required credential '{missing_field}' for auth type '{auth_type}'"
        )


class InvalidAuthTypeError(AuthEncodingError):
    """Error thrown when an invalid auth type is provided."""

    def __init__(self, auth_type: str):
        self.auth_type = auth_type
        super().__init__(f"Unsupported auth type: '{auth_type}'")


class HMACNotImplementedError(AuthEncodingError):
    """Error thrown when HMAC auth is attempted (not implemented)."""

    def __init__(self):
        super().__init__("HMAC authentication is not implemented")
