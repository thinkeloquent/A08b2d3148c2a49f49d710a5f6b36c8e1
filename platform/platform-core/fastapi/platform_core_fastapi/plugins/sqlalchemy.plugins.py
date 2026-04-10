"""SQLAlchemy plugin — placeholder for database initialisation.

Stores None on app.state.db until a real database lifecycle hook
configures the engine and session factory.

Usage (from a lifecycle hook):
    from plugins.sqlalchemy_plugins import init_db, teardown_db
    await init_db(app, config)
"""
import logging
from typing import Any

from fastapi import FastAPI

log = logging.getLogger("platform.plugins.sqlalchemy")


def init_db(app: FastAPI, config: Any = None) -> None:
    """Placeholder: initialise SQLAlchemy engine and store on app.state.db.

    Replace this body when a real database URL is available.
    """
    app.state.db = None
    log.debug("SQLAlchemy plugin: db placeholder set (no engine configured)")


def teardown_db(app: FastAPI) -> None:
    """Placeholder: dispose of the SQLAlchemy engine on shutdown."""
    db = getattr(app.state, "db", None)
    if db is not None and hasattr(db, "dispose"):
        db.dispose()
        log.info("SQLAlchemy engine disposed")
    else:
        log.debug("SQLAlchemy plugin: nothing to tear down")
    app.state.db = None
