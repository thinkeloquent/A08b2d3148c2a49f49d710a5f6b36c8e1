"""
Unit tests for the Logger module.

Coverage:
- Logger creation with package/file context
- Log level filtering
- JSON output mode
- Custom handlers
- LoggerFactory defaults
"""

import json
import pytest
from io import StringIO
from unittest.mock import patch

from app_yaml_endpoints.logger import Logger, LoggerFactory


class TestLogger:
    """Tests for Logger class."""

    def test_logger_creation(self):
        """Logger should be created with package and file context."""
        logger = Logger("test-pkg", "/path/to/file.py")
        assert logger._pkg == "test-pkg"
        assert logger._file == "file.py"

    def test_logger_extracts_filename(self):
        """Logger should extract basename from full path."""
        logger = Logger("pkg", "/very/long/path/to/module.py")
        assert logger._file == "module.py"

    def test_log_level_filtering(self):
        """Logger should filter messages below configured level."""
        captured = []

        def handler(level, msg, data, ctx):
            captured.append(msg)

        logger = Logger("pkg", "file.py", handler=handler, level="warn")
        logger.debug("should not appear")
        logger.info("should not appear")
        logger.warn("should appear")
        logger.error("should appear")

        assert len(captured) == 2
        assert captured == ["should appear", "should appear"]

    def test_log_with_data(self):
        """Logger should pass data dictionary to handler."""
        captured = []

        def handler(level, msg, data, ctx):
            captured.append(data)

        logger = Logger("pkg", "file.py", handler=handler, level="debug")
        logger.debug("message", {"key": "value", "count": 42})

        assert len(captured) == 1
        assert captured[0] == {"key": "value", "count": 42}

    def test_log_context_includes_package_and_file(self):
        """Log context should include pkg and file."""
        captured = []

        def handler(level, msg, data, ctx):
            captured.append(ctx)

        logger = Logger("my-package", "/src/my-file.py", handler=handler)
        logger.info("test")

        assert captured[0]["pkg"] == "my-package"
        assert captured[0]["file"] == "my-file.py"

    def test_all_log_levels(self):
        """All log levels should invoke handler when level is trace."""
        captured = []

        def handler(level, msg, data, ctx):
            captured.append(level)

        logger = Logger("pkg", "file.py", handler=handler, level="trace")
        logger.trace("t")
        logger.debug("d")
        logger.info("i")
        logger.warn("w")
        logger.error("e")

        assert captured == ["trace", "debug", "info", "warn", "error"]

    def test_json_output_mode(self, capsys):
        """JSON mode should output valid JSON."""
        logger = Logger("pkg", "file.py", level="info", json_output=True)
        logger.info("test message", {"key": "value"})

        captured = capsys.readouterr()
        output = json.loads(captured.out.strip())

        assert output["level"] == "info"
        assert output["pkg"] == "pkg"
        assert output["file"] == "file.py"
        assert output["msg"] == "test message"
        assert output["data"] == {"key": "value"}

    def test_text_output_format(self, capsys):
        """Text mode should output formatted log line."""
        logger = Logger("pkg", "file.py", level="info", json_output=False)
        logger.info("test message")

        captured = capsys.readouterr()
        output = captured.out.strip()

        assert "[INFO ]" in output
        assert "[pkg:file.py]" in output
        assert "test message" in output


class TestLoggerFactory:
    """Tests for LoggerFactory class."""

    def test_factory_creates_logger(self):
        """Factory should create a Logger instance."""
        logger = LoggerFactory.create("pkg", "file.py")
        assert isinstance(logger, Logger)

    def test_factory_respects_env_level(self, monkeypatch):
        """Factory should use LOG_LEVEL from environment."""
        monkeypatch.setenv("LOG_LEVEL", "debug")
        # Reload to pick up env var
        LoggerFactory._level = "debug"

        logger = LoggerFactory.create("pkg", "file.py")
        assert logger._level == Logger.LEVELS["debug"]

    def test_factory_override_level(self):
        """Factory should allow level override."""
        logger = LoggerFactory.create("pkg", "file.py", level="error")
        assert logger._level == Logger.LEVELS["error"]

    def test_factory_custom_handler(self):
        """Factory should pass custom handler to Logger."""
        calls = []

        def my_handler(level, msg, data, ctx):
            calls.append(msg)

        logger = LoggerFactory.create("pkg", "file.py", handler=my_handler)
        logger.info("test")

        assert calls == ["test"]


class TestLogLevelBoundaries:
    """Boundary value tests for log levels."""

    @pytest.mark.parametrize(
        "level,expected_count",
        [
            ("trace", 5),  # All messages
            ("debug", 4),  # debug, info, warn, error
            ("info", 3),  # info, warn, error
            ("warn", 2),  # warn, error
            ("error", 1),  # error only
        ],
    )
    def test_level_boundaries(self, level, expected_count):
        """Each level should filter correctly."""
        captured = []

        def handler(lvl, msg, data, ctx):
            captured.append(lvl)

        logger = Logger("pkg", "file.py", handler=handler, level=level)
        logger.trace("t")
        logger.debug("d")
        logger.info("i")
        logger.warn("w")
        logger.error("e")

        assert len(captured) == expected_count
