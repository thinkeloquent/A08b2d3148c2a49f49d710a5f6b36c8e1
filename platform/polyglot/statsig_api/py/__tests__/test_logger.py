"""
Unit tests for statsig_client.logger.

Tests cover:
- Statement coverage for logger creation and log emission
- Decision/branch coverage for log level filtering and redaction
- Boundary value analysis for edge cases in context handling
"""

import os
from unittest.mock import MagicMock

import pytest

from statsig_client.logger import (
    _Logger,
    _LEVELS,
    _redact_context,
    create_logger,
)


class TestCreateLogger:
    """Tests for the create_logger factory."""

    class TestStatementCoverage:
        def test_creates_logger_instance(self):
            log = create_logger("test_pkg", "test_file")
            assert isinstance(log, _Logger)

        def test_logger_has_all_methods(self):
            log = create_logger("test_pkg", "test_file")
            assert callable(log.debug)
            assert callable(log.info)
            assert callable(log.warning)
            assert callable(log.error)

    class TestDecisionBranchCoverage:
        def test_respects_debug_log_level(self, monkeypatch):
            monkeypatch.setenv("LOG_LEVEL", "DEBUG")
            mock_print = MagicMock()
            log = create_logger("pkg", "file")
            log._print_fn = mock_print
            log.debug("test message")
            mock_print.assert_called_once()

        def test_debug_suppressed_at_info_level(self, monkeypatch):
            monkeypatch.setenv("LOG_LEVEL", "INFO")
            mock_print = MagicMock()
            log = create_logger("pkg", "file")
            log._print_fn = mock_print
            log.debug("test message")
            mock_print.assert_not_called()

        def test_error_emitted_at_all_levels(self, monkeypatch):
            monkeypatch.setenv("LOG_LEVEL", "ERROR")
            mock_print = MagicMock()
            log = create_logger("pkg", "file")
            log._print_fn = mock_print
            log.error("error message")
            mock_print.assert_called_once()

        def test_invalid_log_level_defaults_to_info(self, monkeypatch):
            monkeypatch.setenv("LOG_LEVEL", "INVALID")
            mock_print = MagicMock()
            log = create_logger("pkg", "file")
            log._print_fn = mock_print
            log.info("should appear")
            mock_print.assert_called_once()
            log.debug("should not appear")
            assert mock_print.call_count == 1


class TestLogger:
    """Tests for the _Logger class."""

    class TestStatementCoverage:
        def test_emit_includes_prefix_and_message(self, monkeypatch):
            monkeypatch.setenv("LOG_LEVEL", "DEBUG")
            mock_print = MagicMock()
            log = _Logger(prefix="pkg:file", level=_LEVELS["DEBUG"], print_fn=mock_print)
            log.info("hello world")
            output = mock_print.call_args[0][0]
            assert "[pkg:file]" in output
            assert "hello world" in output
            assert "INFO" in output

        def test_emit_includes_context(self, monkeypatch):
            mock_print = MagicMock()
            log = _Logger(prefix="pkg:file", level=_LEVELS["DEBUG"], print_fn=mock_print)
            log.info("msg", {"name": "testval"})
            output = mock_print.call_args[0][0]
            assert "name" in output
            assert "testval" in output

    class TestBoundaryValueAnalysis:
        def test_none_context_omitted(self):
            mock_print = MagicMock()
            log = _Logger(prefix="p:f", level=_LEVELS["DEBUG"], print_fn=mock_print)
            log.info("msg", None)
            output = mock_print.call_args[0][0]
            assert "{" not in output or "None" not in output

        def test_empty_dict_context_omitted(self):
            mock_print = MagicMock()
            log = _Logger(prefix="p:f", level=_LEVELS["DEBUG"], print_fn=mock_print)
            log.info("msg", {})
            mock_print.assert_called_once()


class TestRedactContext:
    """Tests for the _redact_context function."""

    class TestDecisionBranchCoverage:
        def test_redacts_token_key(self):
            result = _redact_context({"api_token": "secret123"})
            assert result["api_token"] == "[REDACTED]"

        def test_redacts_password_key(self):
            result = _redact_context({"password": "abc"})
            assert result["password"] == "[REDACTED]"

        def test_redacts_key_key(self):
            result = _redact_context({"api_key": "console-xxx"})
            assert result["api_key"] == "[REDACTED]"

        def test_preserves_safe_key(self):
            result = _redact_context({"name": "test"})
            assert result["name"] == "test"

        def test_nested_dict_redaction(self):
            result = _redact_context({"config": {"secret": "hidden"}})
            assert result["config"]["secret"] == "[REDACTED]"

    class TestBoundaryValueAnalysis:
        def test_none_input(self):
            assert _redact_context(None) is None

        def test_empty_dict(self):
            assert _redact_context({}) == {}
