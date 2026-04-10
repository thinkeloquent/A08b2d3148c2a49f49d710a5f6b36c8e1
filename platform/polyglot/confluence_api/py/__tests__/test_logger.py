"""Tests for the confluence_api logger module."""

import json
import os
from io import StringIO
from unittest.mock import patch

import pytest

from confluence_api.logger import create_logger, null_logger


class TestCreateLogger:
    """Tests for create_logger factory."""

    def test_create_logger_returns_logger_instance(self):
        """create_logger should return a logger with all expected methods."""
        log = create_logger("test", __file__)
        assert log is not None
        assert hasattr(log, "debug")
        assert hasattr(log, "info")
        assert hasattr(log, "warning")
        assert hasattr(log, "error")
        assert hasattr(log, "critical")

    def test_create_logger_info_outputs_json(self, capsys):
        """Logger should emit structured JSON to stderr."""
        log = create_logger("test-pkg", __file__)
        log.info("test message", {"key": "value"})
        captured = capsys.readouterr()
        # Logger writes to stderr
        assert "test message" in captured.err
        # Should be valid JSON
        entry = json.loads(captured.err.strip())
        assert entry["msg"] == "test message"
        assert entry["pkg"] == "test-pkg"
        assert entry["level"] == "info"
        assert entry["ctx"]["key"] == "value"

    def test_create_logger_respects_log_level(self, capsys):
        """Logger should suppress messages below the configured level."""
        with patch.dict(os.environ, {"LOG_LEVEL": "ERROR"}):
            log = create_logger("test-pkg", __file__)
            log.info("should not appear")
            log.debug("should not appear either")
            log.error("should appear")
        captured = capsys.readouterr()
        assert "should not appear" not in captured.err
        assert "should appear" in captured.err

    def test_create_logger_redacts_sensitive_keys(self, capsys):
        """Logger should redact values for sensitive key names."""
        log = create_logger("test-pkg", __file__)
        log.info("auth check", {"api_token": "super-secret", "user": "admin"})
        captured = capsys.readouterr()
        entry = json.loads(captured.err.strip())
        assert entry["ctx"]["api_token"] == "***REDACTED***"
        assert entry["ctx"]["user"] == "admin"

    def test_create_logger_with_import_meta_style_path(self):
        """Logger should handle file:// URLs gracefully."""
        log = create_logger("test", "file:///path/to/test_logger.py")
        assert log is not None


class TestNullLogger:
    """Tests for the null_logger singleton."""

    def test_null_logger_has_all_methods(self):
        """null_logger should have all standard log methods."""
        assert hasattr(null_logger, "debug")
        assert hasattr(null_logger, "info")
        assert hasattr(null_logger, "warning")
        assert hasattr(null_logger, "error")
        assert hasattr(null_logger, "critical")

    def test_null_logger_does_not_raise(self):
        """null_logger methods should silently discard all arguments."""
        null_logger.info("should not fail")
        null_logger.debug("should not fail")
        null_logger.warning("should not fail")
        null_logger.error("should not fail")
        null_logger.critical("should not fail")

    def test_null_logger_with_context(self):
        """null_logger should accept context dicts without error."""
        null_logger.info("test", {"key": "value"})
        null_logger.debug("test", {"nested": {"deep": True}})

    def test_null_logger_does_not_output(self, capsys):
        """null_logger should produce no output."""
        null_logger.info("silent")
        null_logger.error("silent")
        captured = capsys.readouterr()
        assert captured.out == ""
        assert captured.err == ""
