"""
Option 5: Shared Context Computed Function (REQUEST Scope) - Token 001

This class-based computed function uses the shared context (ctx['shared'])
to coordinate with other REQUEST-scoped functions during the same resolution pass.

The shared context ensures that multiple functions use the same timestamp,
even though they are defined in separate files.

Usage in YAML:
    headers:
      X-Request-Token: "{{fn:request_token_001}}"
      X-Request-Token2: "{{fn:request_token_005}}"

Both tokens will have the same timestamp because they use:
    ctx['shared'].get_or_set('request_timestamp', factory)
"""
import time
import hashlib
from typing import Dict, Any, Optional
from app_yaml_overwrites.options import ComputeScope


# Module-level exports for auto-loading
NAME = "request_token_001"
SCOPE = ComputeScope.REQUEST


class RequestTokenGenerator:
    """
    Class-based token generator using shared context.

    This pattern allows multiple computed functions to share state
    during a single request resolution pass.
    """

    # Shared context key for the request timestamp
    TIMESTAMP_KEY = "request_tokens_timestamp"

    def __init__(self, case_id: str):
        """
        Initialize the generator for a specific case.

        Args:
            case_id: Identifier for this token case (e.g., "001", "005")
        """
        self.case_id = case_id

    def _get_shared_timestamp(self, ctx: Dict[str, Any]) -> int:
        """
        Get or create the shared timestamp from context.

        Uses the unified .get(key, factory) API - if key doesn't exist,
        the factory is called and result is cached.

        Args:
            ctx: Context dictionary containing 'shared' SharedContext

        Returns:
            Shared timestamp (same across all functions in this request)
        """
        shared = ctx.get('shared')
        if shared is None:
            # Fallback if shared context not available
            return int(time.time())

        # Simplified API: .get(key, factory) - callable default is invoked and cached
        return shared.get(self.TIMESTAMP_KEY, lambda: int(time.time()))

    def _generate_token(self, base: str) -> str:
        """Generate a deterministic token."""
        content = f"{base}:{self.case_id}"
        hash_val = hashlib.sha256(content.encode()).hexdigest()[:16]
        return f"req_tok_{self.case_id}_{hash_val}"

    def generate(self, ctx: Dict[str, Any]) -> str:
        """
        Generate the token using shared timestamp.

        Args:
            ctx: Context with env, config, app, state, shared, request

        Returns:
            Generated token string
        """
        timestamp = self._get_shared_timestamp(ctx)

        # Get app and request info
        app_name = ctx.get("app", {}).get("name", "mta-server")
        app_version = ctx.get("app", {}).get("version", "0.0.0")

        # Include request ID if available for uniqueness
        request = ctx.get("request", {}) or {}
        headers = request.get("headers", {}) or {}
        request_id = headers.get("x-request-id", "no-req-id")

        # Generate token with shared timestamp
        base = f"{app_name}:{app_version}:{timestamp}:{request_id}"
        return self._generate_token(base)


# Create instance for case 001
_generator = RequestTokenGenerator(case_id="001")


def register(ctx: Dict[str, Any]) -> str:
    """
    Compute function entry point for auto-loading.

    Uses shared context to coordinate with request_token_005
    for consistent timestamps.

    Args:
        ctx: Context dictionary with env, config, app, state, shared, request

    Returns:
        Generated token string for case 001
    """
    return _generator.generate(ctx)
