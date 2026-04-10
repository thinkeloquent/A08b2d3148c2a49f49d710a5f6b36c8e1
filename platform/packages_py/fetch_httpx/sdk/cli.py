"""
CLI Utilities for fetch_httpx package.

Provides command-line interface utilities for HTTP operations,
useful for building CLI tools that make HTTP requests.
"""

from __future__ import annotations

import json
import sys
from dataclasses import dataclass
from typing import TYPE_CHECKING, Any, TextIO

from .. import logger as logger_module
from .._client import Client
from .._models import Response

if TYPE_CHECKING:
    from .._types import AuthTypes, HeaderTypes

logger = logger_module.create("fetch_httpx", __file__)


# =============================================================================
# CLI Context
# =============================================================================

@dataclass
class CLIContext:
    """
    CLI execution context.

    Holds configuration for CLI HTTP operations including
    output formatting and verbosity settings.
    """

    verbose: bool = False
    quiet: bool = False
    output_format: str = "auto"  # auto, json, text, headers
    color: bool = True
    output: TextIO = sys.stdout
    error_output: TextIO = sys.stderr

    def write(self, text: str) -> None:
        """Write to output."""
        if not self.quiet:
            self.output.write(text)
            self.output.flush()

    def write_error(self, text: str) -> None:
        """Write to error output."""
        self.error_output.write(text)
        self.error_output.flush()

    def write_json(self, data: Any) -> None:
        """Write formatted JSON to output."""
        formatted = json.dumps(data, indent=2, ensure_ascii=False)
        self.write(formatted + "\n")

    def write_response(self, response: Response) -> None:
        """Write response to output based on format setting."""
        if self.output_format == "headers":
            self._write_headers(response)
        elif self.output_format == "json":
            self._write_json_response(response)
        elif self.output_format == "text":
            self.write(response.text)
        else:
            # Auto-detect format
            content_type = response.headers.get("content-type", "")
            if "json" in content_type:
                self._write_json_response(response)
            else:
                self.write(response.text)

    def _write_headers(self, response: Response) -> None:
        """Write response headers."""
        self.write(f"HTTP {response.status_code}\n")
        for name, value in response.headers.items():
            self.write(f"{name}: {value}\n")
        self.write("\n")

    def _write_json_response(self, response: Response) -> None:
        """Write JSON response with pretty formatting."""
        try:
            data = response.json()
            self.write_json(data)
        except Exception:
            # Not valid JSON, write as text
            self.write(response.text)


# =============================================================================
# CLI Client
# =============================================================================

class CLIHTTPClient:
    """
    HTTP client configured for CLI usage.

    Provides simplified interface for CLI tools with
    automatic output handling.
    """

    def __init__(
        self,
        context: CLIContext,
        *,
        base_url: str | None = None,
        auth: AuthTypes | None = None,
        headers: HeaderTypes | None = None,
        timeout: float = 30.0,
    ) -> None:
        self._context = context
        self._client = Client(
            base_url=base_url,
            auth=auth,
            headers=headers,
            timeout=timeout,
            follow_redirects=True,
        )

    def request(
        self,
        method: str,
        url: str,
        *,
        data: dict[str, Any] | None = None,
        json_data: Any | None = None,
        headers: dict[str, str] | None = None,
        params: dict[str, str] | None = None,
    ) -> int:
        """
        Make an HTTP request and write output.

        Returns exit code (0 for success, 1 for error).
        """
        try:
            if self._context.verbose:
                self._context.write_error(f"> {method} {url}\n")

            response = self._client.request(
                method,
                url,
                data=data,
                json=json_data,
                headers=headers,
                params=params,
            )

            if self._context.verbose:
                self._context.write_error(f"< {response.status_code}\n")

            self._context.write_response(response)

            return 0 if response.is_success else 1

        except Exception as e:
            self._context.write_error(f"Error: {e}\n")
            return 1

    def get(self, url: str, **kwargs: Any) -> int:
        """Make a GET request."""
        return self.request("GET", url, **kwargs)

    def post(self, url: str, **kwargs: Any) -> int:
        """Make a POST request."""
        return self.request("POST", url, **kwargs)

    def put(self, url: str, **kwargs: Any) -> int:
        """Make a PUT request."""
        return self.request("PUT", url, **kwargs)

    def patch(self, url: str, **kwargs: Any) -> int:
        """Make a PATCH request."""
        return self.request("PATCH", url, **kwargs)

    def delete(self, url: str, **kwargs: Any) -> int:
        """Make a DELETE request."""
        return self.request("DELETE", url, **kwargs)

    def close(self) -> None:
        """Close the client."""
        self._client.close()

    def __enter__(self) -> CLIHTTPClient:
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        self.close()


# =============================================================================
# Factory Function
# =============================================================================

def create_cli_client(
    *,
    verbose: bool = False,
    quiet: bool = False,
    output_format: str = "auto",
    base_url: str | None = None,
    auth: AuthTypes | None = None,
    headers: HeaderTypes | None = None,
    timeout: float = 30.0,
) -> CLIHTTPClient:
    """
    Factory function to create a CLI HTTP client.

    Args:
        verbose: Enable verbose output
        quiet: Suppress normal output
        output_format: Output format (auto, json, text, headers)
        base_url: Base URL for requests
        auth: Authentication
        headers: Default headers
        timeout: Request timeout

    Returns:
        Configured CLI HTTP client
    """
    context = CLIContext(
        verbose=verbose,
        quiet=quiet,
        output_format=output_format,
    )

    return CLIHTTPClient(
        context,
        base_url=base_url,
        auth=auth,
        headers=headers,
        timeout=timeout,
    )


__all__ = [
    "CLIContext",
    "CLIHTTPClient",
    "create_cli_client",
]
