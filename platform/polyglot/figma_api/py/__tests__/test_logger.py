"""Unit tests for figma_api.logger."""
import logging
import os
from unittest.mock import MagicMock

import pytest

from figma_api.logger import (
    LEVELS,
    REDACT_KEYS,
    SDKLogger,
    _format_kwargs,
    _redact_value,
    create_logger,
)


class TestSDKLogger:
    """Tests for SDKLogger class."""

    class TestStatementCoverage:
        def test_create_logger_returns_sdk_logger(self):
            log = create_logger("test-pkg", __file__)
            assert isinstance(log, SDKLogger)

        def test_logger_has_expected_prefix(self):
            log = create_logger("figma-api", "/path/to/module.py")
            assert log.prefix == "[figma-api:module]"

        def test_all_log_methods_callable(self):
            log = create_logger("test", __file__)
            log.trace("trace msg")
            log.debug("debug msg")
            log.info("info msg")
            log.warn("warn msg")
            log.warning("warning msg")
            log.error("error msg")
            log.critical("critical msg")

        def test_levels_dict_values(self):
            assert LEVELS["TRACE"] == 5
            assert LEVELS["DEBUG"] == logging.DEBUG
            assert LEVELS["INFO"] == logging.INFO
            assert LEVELS["WARN"] == logging.WARNING
            assert LEVELS["ERROR"] == logging.ERROR
            assert LEVELS["SILENT"] == 100

    class TestBranchCoverage:
        def test_with_custom_logger_instance(self):
            custom = MagicMock()
            log = SDKLogger("pkg", __file__, logger_instance=custom)
            log.info("test message")
            custom.info.assert_called_once()

        def test_without_custom_logger_uses_default(self):
            log = SDKLogger("pkg", __file__)
            assert log._logger is not None

        def test_with_empty_filename(self):
            log = SDKLogger("pkg", "")
            assert log.filename == "unknown"

        def test_with_none_filename(self):
            # Empty string is falsy in Python, so filename defaults to "unknown"
            log = create_logger("pkg", "")
            assert log.prefix == "[pkg:unknown]"

        def test_set_level_changes_logger_level(self):
            log = create_logger("pkg", __file__)
            log.set_level("ERROR")
            assert log._logger.level == logging.ERROR

        def test_set_level_invalid_defaults_to_info(self):
            log = create_logger("pkg", __file__)
            log.set_level("NONEXISTENT")
            assert log._logger.level == logging.INFO

    class TestBoundaryValues:
        def test_redact_keys_set_contents(self):
            expected = {"token", "secret", "password", "auth", "credential",
                       "authorization", "apikey", "api_key", "accesstoken", "access_token"}
            assert REDACT_KEYS == expected

    class TestErrorHandling:
        def test_format_kwargs_empty(self):
            result = _format_kwargs()
            assert result == ""

        def test_format_kwargs_with_values(self):
            result = _format_kwargs(key="value")
            assert "key='value'" in result

    class TestLogVerification:
        def test_redact_value_sensitive_long(self):
            result = _redact_value("token", "1234567890abcdef")
            assert result == "12345678***"

        def test_redact_value_sensitive_short(self):
            result = _redact_value("token", "short")
            assert result == "***"

        def test_redact_value_sensitive_exactly_8(self):
            result = _redact_value("token", "12345678")
            assert result == "***"

        def test_redact_value_non_sensitive(self):
            result = _redact_value("name", "myvalue")
            assert result == "myvalue"

        def test_redact_value_case_insensitive_key(self):
            result = _redact_value("TOKEN", "longerthan8chars")
            assert result == "longerth***"

        def test_redact_non_string_value(self):
            result = _redact_value("token", 12345)
            assert result == "***"

        def test_format_kwargs_with_sensitive_key(self):
            result = _format_kwargs(token="secret-long-value")
            assert "***" in result

        def test_logger_format_includes_prefix(self):
            log = create_logger("figma-api", "/test/module.py")
            formatted = log._format("test message", key="val")
            assert "[figma-api:module]" in formatted
            assert "test message" in formatted
