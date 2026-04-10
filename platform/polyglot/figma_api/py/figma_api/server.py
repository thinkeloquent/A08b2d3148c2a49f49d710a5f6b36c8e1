"""
Server Module — Figma API SDK

FastAPI server setup with CORS, error handling, and route registration.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import Config
from .logger import create_logger
from .middleware.error_handler import register_error_handlers
from .routes.router import create_router
from .sdk.client import FigmaClient
from .sdk.comments import CommentsClient
from .sdk.components import ComponentsClient
from .sdk.dev_resources import DevResourcesClient
from .sdk.files import FilesClient
from .sdk.library_analytics import LibraryAnalyticsClient
from .sdk.projects import ProjectsClient
from .sdk.variables import VariablesClient
from .sdk.webhooks import WebhooksClient

log = create_logger("figma-api", __file__)


def create_app(config: Config) -> FastAPI:
    """Create and configure the FastAPI application."""

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        log.info("initializing figma client", base_url=config.base_url)
        client = FigmaClient(
            token=config.figma_token or None,
            base_url=config.base_url,
            rate_limit_auto_wait=config.rate_limit_auto_wait,
            rate_limit_threshold=config.rate_limit_threshold,
            timeout=config.timeout,
            max_retries=config.max_retries,
            cache_max_size=config.cache_max_size,
            cache_ttl=config.cache_ttl,
        )
        app.state.figma_client = client
        app.state.projects_client = ProjectsClient(client)
        app.state.files_client = FilesClient(client)
        app.state.comments_client = CommentsClient(client)
        app.state.components_client = ComponentsClient(client)
        app.state.variables_client = VariablesClient(client)
        app.state.dev_resources_client = DevResourcesClient(client)
        app.state.library_analytics_client = LibraryAnalyticsClient(client)
        app.state.webhooks_client = WebhooksClient(client)
        log.info("figma client initialized")
        yield
        await client.close()
        log.info("figma client closed")

    app = FastAPI(
        title="Figma API SDK",
        description="Polyglot Figma API proxy server (Python/FastAPI)",
        version="1.0.0",
        lifespan=lifespan,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
        allow_credentials=True,
    )

    # Error handlers
    register_error_handlers(app)

    # Routes
    router = create_router()
    app.include_router(router)

    log.info("server configured")
    return app
