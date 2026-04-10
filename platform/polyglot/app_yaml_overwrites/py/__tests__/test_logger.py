
import pytest
from app_yaml_overwrites import logger
from unittest.mock import patch
import json
import logging

def test_logger_creation():
    log = logger.create("test_pkg", "test_file.py")
    assert isinstance(log, logger.ILogger)
    # Check if instance is of ConsoleLogger (implementation detail)
    assert isinstance(log, logger.ConsoleLogger)
    assert log.prefix == "[test_pkg:test_file.py]"

def test_logger_output(capsys):
    log = logger.create("test_pkg", "test_file.py")
    
    log.info("Test message", key="value")
    
    captured = capsys.readouterr()
    output = captured.out
    
    assert "[test_pkg:test_file.py] INFO: Test message" in output
    assert '{"key": "value"}' in output

def test_log_levels(capsys, monkeypatch):
    monkeypatch.setenv("LOG_LEVEL", "warn")
    log = logger.create("test_pkg", "test_file.py")
    
    log.info("Should not appear")
    log.error("Should appear")
    
    captured = capsys.readouterr()
    assert "INFO: Should not appear" not in captured.out
    assert "ERROR: Should appear" in captured.out

def test_protocol_compliance():
    # Verify that ConsoleLogger satisfies ILogger protocol at runtime
    log = logger.create("pkg", "file")
    assert isinstance(log, logger.ILogger)
