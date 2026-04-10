"""
Main Entry Point — Figma API SDK (Python)

Starts the FastAPI server with configuration from environment.
"""

import uvicorn

from .config import Config
from .logger import create_logger
from .server import create_app

log = create_logger("figma-api", __file__)


def main():
    config = Config.from_env()

    log.info(
        "starting figma-api server",
        port=config.port,
        host=config.host,
        log_level=config.log_level,
    )

    app = create_app(config)
    uvicorn.run(app, host=config.host, port=config.port, log_level=config.log_level.lower())


if __name__ == "__main__":
    main()
