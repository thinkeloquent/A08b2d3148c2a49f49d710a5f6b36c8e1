"""
Sandbox: demonstrate fetch_httpx_sync with sibling packages.

Run from the repo root:
    poetry run python packages_py/fetch_httpx_clients/sandbox/demo_sync.py
"""

from __future__ import annotations

import logging

from can_use_http2 import check
from fetch_httpx import RetryConfig

from fetch_httpx_clients import fetch_httpx_sync

logging.basicConfig(level=logging.INFO, format="%(name)s  %(levelname)s  %(message)s")
log = logging.getLogger(__name__)


def main() -> None:
    h2 = check()
    log.info("HTTP/2 preflight ok=%s", h2.ok)

    log.info("--- sync GET demo ---")
    with fetch_httpx_sync(
        base_url="https://httpbin.org",
        http2=h2,
        retry=RetryConfig(max_retries=2),
    ) as client:
        resp = client.get("/get")
        log.info("status: %s", resp.status_code)
        log.info("body keys: %s", list(resp.json().keys()))

    log.info("done")


if __name__ == "__main__":
    main()
