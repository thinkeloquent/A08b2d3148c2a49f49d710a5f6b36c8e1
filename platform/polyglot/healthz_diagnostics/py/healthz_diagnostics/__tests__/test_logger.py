"""
Unit tests for healthz_diagnostics.logger module.
"""

import pytest
from healthz_diagnostics.logger import create, Logger, DEBUG, INFO, WARN, ERROR


class TestLogger:
    """Tests for Logger module."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        def test_create_returns_logger_instance(self, capture_output):
            """Factory returns Logger instance."""
            logger = create("healthz_diagnostics", "test_module", output=capture_output.capture)
            assert isinstance(logger, Logger)

        def test_all_log_methods_callable(self, capture_output):
            """All log methods (debug, info, warn, error) are callable."""
            logger = create("test", "module", level=DEBUG, output=capture_output.capture)

            logger.debug("debug message")
            logger.info("info message")
            logger.warn("warn message")
            logger.error("error message")

            logs = capture_output.get()
            assert len(logs) == 4

    class TestBranchCoverage:
        """Test all if/else branches."""

        def test_debug_suppressed_when_level_info(self, capture_output):
            """DEBUG messages suppressed when level is INFO."""
            logger = create("test", "module", level=INFO, output=capture_output.capture)

            logger.debug("should not appear")
            logger.info("should appear")

            logs = capture_output.get()
            assert len(logs) == 1
            assert "should appear" in logs[0]

        def test_debug_emitted_when_level_debug(self, capture_output):
            """DEBUG messages emitted when level is DEBUG."""
            logger = create("test", "module", level=DEBUG, output=capture_output.capture)

            logger.debug("should appear")

            logs = capture_output.get()
            assert len(logs) == 1
            assert "should appear" in logs[0]

        def test_error_always_emitted(self, capture_output):
            """ERROR messages always emitted regardless of level."""
            logger = create("test", "module", level=ERROR, output=capture_output.capture)

            logger.debug("suppressed")
            logger.info("suppressed")
            logger.warn("suppressed")
            logger.error("emitted")

            logs = capture_output.get()
            assert len(logs) == 1
            assert "emitted" in logs[0]

    class TestBoundaryValues:
        """Test edge cases and boundary values."""

        def test_empty_message(self, capture_output):
            """Empty message should be logged."""
            logger = create("test", "module", level=DEBUG, output=capture_output.capture)

            logger.info("")

            logs = capture_output.get()
            assert "[INFO] [test:module] " in logs[0]

        def test_very_long_message(self, capture_output):
            """Very long message should be logged without truncation."""
            logger = create("test", "module", level=DEBUG, output=capture_output.capture)
            long_msg = "x" * 10000

            logger.info(long_msg)

            logs = capture_output.get()
            assert long_msg in logs[0]

        def test_special_characters_in_message(self, capture_output):
            """Special characters should be preserved."""
            logger = create("test", "module", level=DEBUG, output=capture_output.capture)
            special = "Message with \n newline and \t tab"

            logger.info(special)

            logs = capture_output.get()
            assert special in logs[0]

    class TestLogVerification:
        """Verify log output format."""

        def test_output_format_matches_spec(self, capture_output):
            """Output format: [LEVEL] [pkg:file] message."""
            logger = create("healthz_diagnostics", "config_store", level=DEBUG, output=capture_output.capture)

            logger.info("Test message")

            logs = capture_output.get()
            assert logs[0] == "[INFO] [healthz_diagnostics:config_store] Test message"

        def test_filename_extracted_from_module_path(self, capture_output):
            """Filename extracted from dotted module path."""
            logger = create("pkg", "healthz_diagnostics.config_store", level=DEBUG, output=capture_output.capture)

            logger.info("Test")

            logs = capture_output.get()
            assert "[pkg:config_store]" in logs[0]

        def test_filename_py_extension_removed(self, capture_output):
            """Filename .py extension should be removed."""
            logger = create("pkg", "module.py", level=DEBUG, output=capture_output.capture)

            logger.info("Test")

            logs = capture_output.get()
            assert "[pkg:module]" in logs[0]

    class TestParityVectors:
        """Cross-language parity tests."""

        @pytest.mark.parametrize("level,pkg,file,msg,expected", [
            ("DEBUG", "healthz_diagnostics", "config_store", "Loading config", "[DEBUG] [healthz_diagnostics:config_store] Loading config"),
            ("INFO", "healthz-diagnostics", "executor", "Health check completed", "[INFO] [healthz-diagnostics:executor] Health check completed"),
            ("WARN", "pkg", "sdk", "Provider not found", "[WARN] [pkg:sdk] Provider not found"),
            ("ERROR", "test", "module", "Connection failed", "[ERROR] [test:module] Connection failed"),
            ("INFO", "pkg", "file", "", "[INFO] [pkg:file] "),
        ])
        def test_parity_vector(self, capture_output, level, pkg, file, msg, expected):
            """Verify parity with Node.js implementation."""
            logger = create(pkg, file, level=DEBUG, output=capture_output.capture)

            method = getattr(logger, level.lower())
            method(msg)

            logs = capture_output.get()
            assert logs[0] == expected
