"""
Option 4: Composite Computed Function for STARTUP Scope

This class-based computed function returns an object with multiple properties,
allowing access via dot notation in templates:
    {{fn:startup_tokens.case_001}}
    {{fn:startup_tokens.case_005}}
    {{fn:startup_tokens.timestamp}}

The timestamp is computed once at startup and shared across all properties,
ensuring consistency without explicit state management.

Usage in YAML:
    headers:
      X-Startup-Token: "{{fn:startup_tokens.case_001}}"
      X-Startup-Token2: "{{fn:startup_tokens.case_005}}"
      X-Server-Start: "{{fn:startup_tokens.timestamp_iso}}"
"""
import time
import hashlib
from dataclasses import dataclass, field
from typing import Dict, Any, Optional
from app_yaml_overwrites.options import ComputeScope


# Module-level exports for auto-loading
NAME = "startup_tokens"
SCOPE = ComputeScope.STARTUP


@dataclass
class AppInfo:
    """Nested object for app information."""
    name: str
    version: str


@dataclass
class StartupTokens:
    """
    Composite result object for startup tokens.

    All tokens share the same timestamp, ensuring consistency.
    Properties are accessible via dot notation: {{fn:startup_tokens.case_001}}
    """
    case_001: str
    case_005: str
    timestamp: int
    timestamp_iso: str
    app_info: AppInfo

    def __getitem__(self, key: str) -> Any:
        """Support bracket notation for template resolver."""
        return getattr(self, key, None)


class StartupTokensFactory:
    """
    Factory class for generating startup tokens.

    This demonstrates the class-based pattern for computed functions.
    The factory is instantiated once and called during STARTUP resolution.
    """

    def __init__(self):
        """Initialize the factory with current timestamp."""
        self._timestamp: Optional[int] = None

    def _get_timestamp(self) -> int:
        """Get or create the shared timestamp."""
        if self._timestamp is None:
            self._timestamp = int(time.time())
        return self._timestamp

    def _generate_token(self, base: str, case_id: str) -> str:
        """Generate a deterministic token for a specific case."""
        content = f"{base}:{case_id}"
        hash_val = hashlib.sha256(content.encode()).hexdigest()[:16]
        return f"startup_tok_{case_id}_{hash_val}"

    def create(self, ctx: Dict[str, Any]) -> StartupTokens:
        """
        Create the startup tokens composite object.

        Args:
            ctx: Context containing env, config, app, state, shared

        Returns:
            StartupTokens object with all token values
        """
        timestamp = self._get_timestamp()

        # Get app info from context
        app_name = ctx.get("app", {}).get("name", "mta-server")
        app_version = ctx.get("app", {}).get("version", "0.0.0")

        # Generate tokens with shared timestamp
        base = f"{app_name}:{app_version}:{timestamp}"

        return StartupTokens(
            case_001=self._generate_token(base, "001"),
            case_005=self._generate_token(base, "005"),
            timestamp=timestamp,
            timestamp_iso=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(timestamp)),
            app_info=AppInfo(name=app_name, version=app_version)
        )


# Create singleton factory instance
_factory = StartupTokensFactory()


def register(ctx: Dict[str, Any]) -> Dict[str, Any]:
    """
    Compute function entry point for auto-loading.

    Returns a dict instead of dataclass for simpler template resolver access.
    The factory pattern ensures consistent timestamp across all properties.

    Args:
        ctx: Context dictionary with env, config, app, state, shared

    Returns:
        Dict containing token values accessible via {{fn:startup_tokens.property}}
    """
    tokens = _factory.create(ctx)

    # Return as dict for template resolver compatibility
    return {
        "case_001": tokens.case_001,
        "case_005": tokens.case_005,
        "timestamp": tokens.timestamp,
        "timestamp_iso": tokens.timestamp_iso,
        "app_info": {
            "name": tokens.app_info.name,
            "version": tokens.app_info.version
        }
    }
