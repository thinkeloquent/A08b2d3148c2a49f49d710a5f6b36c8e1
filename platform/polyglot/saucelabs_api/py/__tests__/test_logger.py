"""
Unit tests for saucelabs_api.logger

Tests cover:
- Statement coverage for _Logger, _redact_context, create_logger
- Branch coverage for level filtering, redaction patterns
- Boundary value analysis
- Error handling verification
- Log verification (hyper-observability)
"""

import os

import pytest

from saucelabs_api.logger import _Logger, _LEVELS, _redact_context, create_logger


class TestRedaction:
    """Tests for _redact_context."""

    # =================================================================
    # Statement Coverage
    # =================================================================

    def test_redacts_access_key(self):
        ctx = {"access_key": "supersecret", "username": "demo"}
        result = _redact_context(ctx)
        assert result["access_key"] == "[REDACTED]"
        assert result["username"] == "demo"

    def test_redacts_api_key(self):
        ctx = {"api_key": "mykey"}
        result = _redact_context(ctx)
        assert result["api_key"] == "[REDACTED]"

    def test_redacts_token(self):
        ctx = {"auth_token": "tok123"}
        result = _redact_context(ctx)
        assert result["auth_token"] == "[REDACTED]"

    def test_redacts_password(self):
        ctx = {"password": "pass123"}
        result = _redact_context(ctx)
        assert result["password"] == "[REDACTED]"

    # =================================================================
    # Branch Coverage
    # =================================================================

    def test_redacts_nested(self):
        ctx = {"config": {"password": "secret", "host": "localhost"}}
        result = _redact_context(ctx)
        assert result["config"]["password"] == "[REDACTED]"
        assert result["config"]["host"] == "localhost"

    def test_none_passthrough(self):
        assert _redact_context(None) is None

    def test_passes_through_non_sensitive_keys(self):
        ctx = {"username": "demo", "region": "us-west-1", "count": 42}
        result = _redact_context(ctx)
        assert result["username"] == "demo"
        assert result["region"] == "us-west-1"
        assert result["count"] == 42

    def test_case_insensitive_redaction(self):
        ctx = {"ACCESS_KEY": "secret", "Api_Key": "secret"}
        result = _redact_context(ctx)
        assert result["ACCESS_KEY"] == "[REDACTED]"
        assert result["Api_Key"] == "[REDACTED]"

    # =================================================================
    # Boundary Values
    # =================================================================

    def test_empty_dict(self):
        result = _redact_context({})
        assert result == {}

    def test_empty_string_value(self):
        result = _redact_context({"api_key": ""})
        assert result["api_key"] == "[REDACTED]"


class TestLogger:
    """Tests for _Logger class and create_logger factory."""

    # =================================================================
    # Statement Coverage
    # =================================================================

    def test_create_logger(self):
        log = create_logger("saucelabs_api", "test_file")
        assert isinstance(log, _Logger)

    def test_log_output_format(self, capsys):
        os.environ["LOG_LEVEL"] = "DEBUG"
        log = create_logger("saucelabs_api", "test")
        log.info("hello world")
        captured = capsys.readouterr()
        assert "[saucelabs_api:test]" in captured.out
        assert "INFO" in captured.out
        assert "hello world" in captured.out

    def test_debug_output(self, capsys):
        os.environ["LOG_LEVEL"] = "DEBUG"
        log = create_logger("saucelabs_api", "test")
        log.debug("debug msg")
        captured = capsys.readouterr()
        assert "DEBUG" in captured.out
        assert "debug msg" in captured.out

    def test_warning_output(self, capsys):
        os.environ["LOG_LEVEL"] = "DEBUG"
        log = create_logger("saucelabs_api", "test")
        log.warning("warn msg")
        captured = capsys.readouterr()
        assert "WARNING" in captured.out
        assert "warn msg" in captured.out

    def test_error_output(self, capsys):
        os.environ["LOG_LEVEL"] = "DEBUG"
        log = create_logger("saucelabs_api", "test")
        log.error("err msg")
        captured = capsys.readouterr()
        assert "ERROR" in captured.out
        assert "err msg" in captured.out

    # =================================================================
    # Branch Coverage
    # =================================================================

    def test_level_filtering(self, capsys):
        os.environ["LOG_LEVEL"] = "ERROR"
        log = create_logger("saucelabs_api", "test")
        log.debug("should not appear")
        log.info("should not appear")
        log.error("should appear")
        captured = capsys.readouterr()
        assert "should not appear" not in captured.out
        assert "should appear" in captured.out

    def test_silent_suppresses_all(self, capsys):
        os.environ["LOG_LEVEL"] = "SILENT"
        log = create_logger("saucelabs_api", "test")
        log.debug("a")
        log.info("b")
        log.warning("c")
        log.error("d")
        captured = capsys.readouterr()
        assert captured.out == ""

    def test_default_level_is_info(self, monkeypatch):
        monkeypatch.delenv("LOG_LEVEL", raising=False)
        log = create_logger("saucelabs_api", "test")
        # The logger should filter debug
        assert log._level == _LEVELS["INFO"]

    def test_unrecognized_level_defaults_to_info(self):
        os.environ["LOG_LEVEL"] = "INVALID"
        log = create_logger("saucelabs_api", "test")
        assert log._level == _LEVELS["INFO"]

    def test_redaction_in_output(self, capsys):
        os.environ["LOG_LEVEL"] = "DEBUG"
        log = create_logger("saucelabs_api", "test")
        log.info("auth check", {"access_key": "supersecret"})
        captured = capsys.readouterr()
        assert "supersecret" not in captured.out
        assert "[REDACTED]" in captured.out

    def test_context_dict_in_output(self, capsys):
        os.environ["LOG_LEVEL"] = "DEBUG"
        log = create_logger("saucelabs_api", "test")
        log.info("data", {"count": 42})
        captured = capsys.readouterr()
        assert "42" in captured.out

    def test_none_context_no_crash(self, capsys):
        os.environ["LOG_LEVEL"] = "DEBUG"
        log = create_logger("saucelabs_api", "test")
        log.info("msg", None)
        captured = capsys.readouterr()
        assert "msg" in captured.out

    # =================================================================
    # Log Verification
    # =================================================================

    def test_timestamp_in_output(self, capsys):
        os.environ["LOG_LEVEL"] = "DEBUG"
        log = create_logger("saucelabs_api", "test")
        log.info("check timestamp")
        captured = capsys.readouterr()
        # ISO-8601 like pattern
        import re
        assert re.search(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}", captured.out)


class TestLevels:
    """Tests for _LEVELS constant."""

    def test_level_constants(self):
        assert _LEVELS["DEBUG"] == 10
        assert _LEVELS["INFO"] == 20
        assert _LEVELS["WARNING"] == 30
        assert _LEVELS["ERROR"] == 40
        assert _LEVELS["SILENT"] == 100

    def test_level_ordering(self):
        assert _LEVELS["DEBUG"] < _LEVELS["INFO"] < _LEVELS["WARNING"] < _LEVELS["ERROR"] < _LEVELS["SILENT"]
