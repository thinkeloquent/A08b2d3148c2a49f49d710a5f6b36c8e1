"""Tests for the Sauce Labs API logger module."""

import os

import pytest

from saucelabs_api.logger import _Logger, _LEVELS, _redact_context, create_logger


class TestRedaction:
    def test_redacts_access_key(self):
        ctx = {"access_key": "supersecret", "username": "demo"}
        result = _redact_context(ctx)
        assert result["access_key"] == "[REDACTED]"
        assert result["username"] == "demo"

    def test_redacts_api_key(self):
        ctx = {"api_key": "mykey"}
        result = _redact_context(ctx)
        assert result["api_key"] == "[REDACTED]"

    def test_redacts_nested(self):
        ctx = {"config": {"password": "secret", "host": "localhost"}}
        result = _redact_context(ctx)
        assert result["config"]["password"] == "[REDACTED]"
        assert result["config"]["host"] == "localhost"

    def test_none_passthrough(self):
        assert _redact_context(None) is None


class TestLogger:
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

    def test_level_filtering(self, capsys):
        os.environ["LOG_LEVEL"] = "ERROR"
        log = create_logger("saucelabs_api", "test")
        log.debug("should not appear")
        log.info("should not appear")
        log.error("should appear")
        captured = capsys.readouterr()
        assert "should not appear" not in captured.out
        assert "should appear" in captured.out

    def test_redaction_in_output(self, capsys):
        os.environ["LOG_LEVEL"] = "DEBUG"
        log = create_logger("saucelabs_api", "test")
        log.info("auth check", {"access_key": "supersecret"})
        captured = capsys.readouterr()
        assert "supersecret" not in captured.out
        assert "[REDACTED]" in captured.out


class TestLevels:
    def test_level_constants(self):
        assert _LEVELS["DEBUG"] == 10
        assert _LEVELS["INFO"] == 20
        assert _LEVELS["WARNING"] == 30
        assert _LEVELS["ERROR"] == 40
        assert _LEVELS["SILENT"] == 100
