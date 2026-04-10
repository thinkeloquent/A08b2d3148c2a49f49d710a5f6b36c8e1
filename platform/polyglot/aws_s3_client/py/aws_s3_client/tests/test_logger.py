"""Tests for logger module."""

import io
import logging

import pytest

from aws_s3_client.logger import DefaultLogger, LoggerProtocol, NullLogger, create


class TestLogger:
    """Test cases for logger functionality."""

    def test_create_returns_default_logger(self) -> None:
        """create() should return DefaultLogger instance."""
        logger = create("test_package", __file__)
        assert isinstance(logger, DefaultLogger)

    def test_logger_output_format(self) -> None:
        """Logger output should have correct format."""
        stream = io.StringIO()
        logger = create("test_package", __file__, stream=stream)

        logger.info("Test message")

        output = stream.getvalue()
        assert "[INFO]" in output
        assert "[test_package:" in output
        assert "Test message" in output

    def test_all_log_levels(self) -> None:
        """All log levels should work."""
        stream = io.StringIO()
        logger = create("test_package", __file__, stream=stream)

        logger.debug("Debug message")
        logger.info("Info message")
        logger.warn("Warn message")
        logger.error("Error message")

        output = stream.getvalue()
        assert "[DEBUG]" in output
        assert "[INFO]" in output
        assert "[WARN]" in output
        assert "[ERROR]" in output

    def test_level_filtering(self) -> None:
        """Logger should filter messages below configured level."""
        stream = io.StringIO()
        logger = create("test_package", __file__, level=logging.WARNING, stream=stream)

        logger.debug("Debug message")
        logger.info("Info message")
        logger.warn("Warn message")
        logger.error("Error message")

        output = stream.getvalue()
        assert "Debug message" not in output
        assert "Info message" not in output
        assert "Warn message" in output
        assert "Error message" in output


class TestNullLogger:
    """Test cases for NullLogger."""

    def test_null_logger_does_nothing(self) -> None:
        """NullLogger should not produce output."""
        logger = NullLogger()

        # These should not raise
        logger.debug("Debug")
        logger.info("Info")
        logger.warn("Warn")
        logger.error("Error")

    def test_null_logger_implements_protocol(self) -> None:
        """NullLogger should implement LoggerProtocol."""
        logger = NullLogger()
        assert isinstance(logger, LoggerProtocol)


class TestDefaultLogger:
    """Test cases for DefaultLogger."""

    def test_default_logger_implements_protocol(self) -> None:
        """DefaultLogger should implement LoggerProtocol."""
        logger = DefaultLogger("test", __file__)
        assert isinstance(logger, LoggerProtocol)

    def test_handles_missing_filename(self) -> None:
        """Should handle empty filename."""
        logger = DefaultLogger("test", "")
        stream = io.StringIO()
        logger._stream = stream
        logger.info("Test")

        output = stream.getvalue()
        assert "unknown" in output
