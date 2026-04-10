"""
Entry point for the GitHub API server.

Reads environment variables, creates the FastAPI app, and starts uvicorn.
"""

from __future__ import annotations

import os
import uvicorn

from github_api.config import Config
from github_api.server import create_app


def main() -> None:
    """Start the GitHub API server."""
    config = Config.from_env()
    app = create_app(config)

    uvicorn.run(
        app,
        host=config.host,
        port=config.port,
        log_level=config.log_level.lower(),
    )


if __name__ == "__main__":
    main()
