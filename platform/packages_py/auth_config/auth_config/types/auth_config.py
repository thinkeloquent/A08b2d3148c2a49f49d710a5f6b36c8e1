from dataclasses import dataclass, field
from typing import Optional, Dict

@dataclass
class AuthConfig:
    type: str  # Validated against AuthType enum
    username: Optional[str] = None
    password: Optional[str] = None
    email: Optional[str] = None
    token: Optional[str] = None
    baseUrl: Optional[str] = None
    headerName: Optional[str] = None  # Added for custom/custom_header support
    headerValue: Optional[str] = None  # Value for custom header types

@dataclass
class AuthConfigInput(AuthConfig):
    encode: bool = False

@dataclass
class AuthConfigWithHeaders(AuthConfig):
    headers: Dict[str, str] = field(default_factory=dict)
