"""Tests for fmt_sdk logger."""

from fmt_sdk import logger


class TestLogger:
    def test_create_logger(self):
        log = logger.create("fmt-sdk", __file__)
        assert log.package_name == "fmt-sdk"
        assert log.filename == "test_logger.py"

    def test_logger_output_format(self):
        entries = []
        log = logger.create("fmt-sdk", "test.py", handler=entries.append)
        log.info("hello")

        assert len(entries) == 1
        entry = entries[0]
        assert entry["pkg"] == "fmt-sdk"
        assert entry["file"] == "test.py"
        assert entry["level"] == "info"
        assert entry["msg"] == "hello"
        assert "ts" in entry

    def test_logger_with_data(self):
        entries = []
        log = logger.create("fmt-sdk", "test.py", handler=entries.append)
        log._threshold = logger.LOG_LEVELS["debug"]
        log.debug("formatting", {"language": "go"})

        assert len(entries) == 1
        assert entries[0]["ctx"] == {"language": "go"}

    def test_logger_with_error(self):
        entries = []
        log = logger.create("fmt-sdk", "test.py", handler=entries.append)
        log.error("failed", error=ValueError("bad input"))

        assert len(entries) == 1
        assert entries[0]["error"]["message"] == "bad input"
        assert entries[0]["error"]["type"] == "ValueError"

    def test_handler_di_override(self):
        captured = []
        log = logger.create("fmt-sdk", "test.py", handler=captured.append)
        log.info("one")
        log.warn("two")
        log.error("three")

        assert len(captured) == 3
        assert [e["level"] for e in captured] == ["info", "warn", "error"]

    def test_all_log_levels(self):
        entries = []
        log = logger.Logger("fmt-sdk", "test.py", handler=entries.append)
        log._threshold = logger.LOG_LEVELS["trace"]

        log.trace("t")
        log.debug("d")
        log.info("i")
        log.warn("w")
        log.error("e")

        assert len(entries) == 5
        levels = [e["level"] for e in entries]
        assert levels == ["trace", "debug", "info", "warn", "error"]

    def test_level_filtering(self):
        entries = []
        log = logger.Logger("fmt-sdk", "test.py", handler=entries.append)
        log._threshold = logger.LOG_LEVELS["warn"]

        log.trace("t")
        log.debug("d")
        log.info("i")
        log.warn("w")
        log.error("e")

        assert len(entries) == 2
        levels = [e["level"] for e in entries]
        assert levels == ["warn", "error"]
