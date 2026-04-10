"""Shared dual-handler logger for chromadb_rag_ingest.

Configures a single ``"chromadb_rag_ingest"`` logger with two handlers:

- **StreamHandler(stderr)** — surfaces errors on the console
- **FileHandler** — persists errors to ``logs/chromadb_rag_ingest.log``

Both handlers are set to ERROR level so ``print()``-based info output
(the established pattern throughout the ingest pipeline) is unaffected.
"""

from __future__ import annotations

import logging
import sys
from pathlib import Path

_LOGGER_NAME = "chromadb_rag_ingest"
_FORMAT = "%(asctime)s %(levelname)s [%(name)s] %(message)s"


def setup_logger(log_path: str | Path | None = None) -> logging.Logger:
    """Return the shared logger, creating handlers on first call.

    Parameters
    ----------
    log_path:
        Override the default log file location.  When *None* the file is
        written to ``<project>/platform/logs/chromadb_rag_ingest.log``.
    """
    logger = logging.getLogger(_LOGGER_NAME)
    if logger.handlers:  # Already configured — avoid duplicate handlers
        return logger

    logger.setLevel(logging.DEBUG)
    fmt = logging.Formatter(_FORMAT)

    # Console (stderr) — errors only
    sh = logging.StreamHandler(sys.stderr)
    sh.setLevel(logging.ERROR)
    sh.setFormatter(fmt)
    logger.addHandler(sh)

    # File — errors only
    if log_path is None:
        log_path = Path(__file__).parent.parent.parent / "logs" / "chromadb_rag_ingest.log"
    Path(log_path).parent.mkdir(parents=True, exist_ok=True)
    fh = logging.FileHandler(log_path)
    fh.setLevel(logging.ERROR)
    fh.setFormatter(fmt)
    logger.addHandler(fh)

    return logger
