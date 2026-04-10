"""
Jobs Module — Sauce Labs API Client

Manage test execution history (VDC & RDC).

Endpoints:
    GET /rest/v1/{username}/jobs          - List jobs
    GET /rest/v1.1/{username}/jobs/{id}   - Get job details
"""

from __future__ import annotations

from typing import Any

from ..errors import SaucelabsValidationError
from ..logger import create_logger

log = create_logger("saucelabs_api", "jobs")


class JobsModule:
    """Manage Sauce Labs test jobs."""

    def __init__(self, client: Any) -> None:
        self._client = client
        self._logger = log

    async def list(self, params: dict[str, Any] | None = None) -> list[Any]:
        """List test jobs for the configured user.

        Parameters
        ----------
        params:
            Optional dict with: limit (default 25), skip, from, to.
        """
        params = params or {}
        username = self._client.username
        if not username:
            raise SaucelabsValidationError("username is required to list jobs")

        query: dict[str, Any] = {"limit": params.get("limit", 25), "format": "json"}
        if "skip" in params:
            query["skip"] = params["skip"]
        if "from" in params:
            val = params["from"]
            if not isinstance(val, int) or val < 0:
                raise SaucelabsValidationError('"from" must be a positive integer (Unix timestamp)')
            query["from"] = val
        if "to" in params:
            val = params["to"]
            if not isinstance(val, int) or val < 0:
                raise SaucelabsValidationError('"to" must be a positive integer (Unix timestamp)')
            query["to"] = val

        self._logger.debug("listing jobs", {"username": username, "params": query})
        return await self._client.get(f"/rest/v1/{username}/jobs", params=query)

    async def get(self, job_id: str) -> dict[str, Any]:
        """Get details for a specific job."""
        username = self._client.username
        if not username:
            raise SaucelabsValidationError("username is required to get job")
        if not job_id:
            raise SaucelabsValidationError("job_id is required")

        self._logger.debug("getting job", {"username": username, "job_id": job_id})
        return await self._client.get(f"/rest/v1.1/{username}/jobs/{job_id}")
