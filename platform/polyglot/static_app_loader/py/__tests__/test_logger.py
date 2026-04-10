"""Tests for logger module."""

import sys
from io import StringIO
from unittest.mock import patch

import pytest

from static_app_loader import logger


class TestLogger:
    """Tests for logger functionality."""

    def test_create_logger_with_correct_prefix(self) -> None:
        """Should create a logger with correct prefix."""
        log = logger.create("static-app-loader", "fastapi.py")

        with patch("sys.stdout", new_callable=StringIO) as mock_stdout:
            log.info("Test message")
            output = mock_stdout.getvalue()

        assert "[static-app-loader:fastapi.py] INFO: Test message" in output

    def test_all_log_levels(self) -> None:
        """Should output correct format for all log levels."""
        log = logger.create("test-pkg", "test.py")

        with patch("sys.stdout", new_callable=StringIO) as mock_stdout:
            log.info("Info message")
            log.warn("Warn message")
            log.debug("Debug message")
            log.trace("Trace message")
            output = mock_stdout.getvalue()

        assert "[test-pkg:test.py] INFO: Info message" in output
        assert "[test-pkg:test.py] WARN: Warn message" in output
        assert "[test-pkg:test.py] DEBUG: Debug message" in output
        assert "[test-pkg:test.py] TRACE: Trace message" in output

    def test_error_level_to_stderr(self) -> None:
        """Should output ERROR level to stderr."""
        log = logger.create("test-pkg", "test.py")

        with patch("sys.stderr", new_callable=StringIO) as mock_stderr:
            log.error("Error message")
            output = mock_stderr.getvalue()

        assert "[test-pkg:test.py] ERROR: Error message" in output

    def test_include_context(self) -> None:
        """Should include context when provided."""
        log = logger.create("static-app-loader", "fastapi.py")

        with patch("sys.stdout", new_callable=StringIO) as mock_stdout:
            log.info("Registering app", {"app_name": "dashboard", "path": "/var/www"})
            output = mock_stdout.getvalue()

        assert "[static-app-loader:fastapi.py] INFO: Registering app" in output
        assert '"app_name": "dashboard"' in output
        assert '"path": "/var/www"' in output


class TestSilentLogger:
    """Tests for silent logger."""

    def test_create_silent_logger(self) -> None:
        """Should create a no-op logger."""
        log = logger.create_silent()

        with patch("sys.stdout", new_callable=StringIO) as mock_stdout:
            with patch("sys.stderr", new_callable=StringIO) as mock_stderr:
                log.info("This should not appear")
                log.warn("This should not appear")
                log.error("This should not appear")
                log.debug("This should not appear")
                log.trace("This should not appear")

                assert mock_stdout.getvalue() == ""
                assert mock_stderr.getvalue() == ""
