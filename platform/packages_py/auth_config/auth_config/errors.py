from dataclasses import dataclass

class AuthConfigError(Exception):
    """Base class for all auth config errors."""
    pass

@dataclass
class MissingCredentialError(AuthConfigError):
    auth_type: str
    missing_fields: list[str]
    
    def __str__(self) -> str:
        return f"Missing required credentials for '{self.auth_type}': {', '.join(self.missing_fields)}"

@dataclass
class InvalidAuthTypeError(AuthConfigError):
    invalid_type: str
    
    def __str__(self) -> str:
        return f"Invalid auth type: '{self.invalid_type}'"
