# FastAPI Server - Main Package
# Allows: from fastapi_server import app, config, logger, print_routes

from .main import app, config
from .logger import logger
from .print_routes import print_routes

__all__ = [
    "app",
    "config",
    "logger",
    "print_routes",
]
