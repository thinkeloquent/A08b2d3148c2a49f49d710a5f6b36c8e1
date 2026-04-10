"""
Sandbox: demonstrate fetch_httpx_async with sibling packages.

Run from the repo root:
    poetry run python packages_py/fetch_httpx_clients/sandbox/demo_async.py
"""

from __future__ import annotations

import asyncio
import logging

from can_use_http2 import Http2CheckResult, check, check_h2_installed, check_httpx_installed
from fetch_httpx import RetryConfig

from fetch_httpx_clients import fetch_httpx_async
from fetch_httpx_clients.clients import DEFAULT_LLM_TIMEOUT

logging.basicConfig(level=logging.INFO, format="%(name)s  %(levelname)s  %(message)s")
log = logging.getLogger(__name__)


def show_preflight() -> Http2CheckResult:
    """Run HTTP/2 preflight and display the result."""
    log.info("--- HTTP/2 preflight ---")
    log.info("h2 installed  : %s", check_h2_installed())

    installed, version = check_httpx_installed()
    log.info("httpx installed: %s  (version %s)", installed, version)

    result = check()  # local-only, no network probe
    log.info("preflight .ok : %s", result.ok)
    if result.errors:
        for err in result.errors:
            log.warning("  error: %s", err)
    return result


async def demo_get(h2: Http2CheckResult) -> None:
    """Fire a GET against a public JSON endpoint."""
    log.info("--- async GET demo ---")
    async with fetch_httpx_async(
        base_url="https://httpbin.org",
        http2=h2,
        retry=RetryConfig(max_retries=2),
    ) as client:
        resp = await client.get("/get")
        log.info("status: %s", resp.status_code)
        log.info("body keys: %s", list(resp.json().keys()))


async def main() -> None:
    log.info("DEFAULT_LLM_TIMEOUT = %s", DEFAULT_LLM_TIMEOUT)
    h2 = show_preflight()
    await demo_get(h2)
    log.info("done")


if __name__ == "__main__":
    asyncio.run(main())
