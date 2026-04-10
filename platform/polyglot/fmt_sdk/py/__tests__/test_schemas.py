"""Tests for fmt_sdk schema validation and JSON round-trip."""

import json

from fmt_sdk.schemas import (
    Diagnostic,
    FormatRequest,
    FormatResult,
    Language,
    Severity,
)


class TestLanguageEnum:
    def test_values(self):
        assert Language.GO.value == "go"
        assert Language.PYTHON.value == "python"
        assert Language.NODE.value == "node"
        assert Language.RUST.value == "rust"
        assert Language.SHELL.value == "shell"
        assert Language.SQL.value == "sql"
        assert Language.MARKUP.value == "markup"

    def test_all_values_lowercase(self):
        for member in Language:
            assert member.value == member.value.lower()

    def test_count(self):
        assert len(Language) == 7


class TestSeverityEnum:
    def test_values(self):
        assert Severity.ERROR.value == "error"
        assert Severity.WARNING.value == "warning"
        assert Severity.INFO.value == "info"
        assert Severity.HINT.value == "hint"

    def test_count(self):
        assert len(Severity) == 4


class TestFormatRequest:
    def test_full_request(self, sample_request):
        assert sample_request.source == 'package main\n\nfunc main() { fmt.Println("hello") }\n'
        assert sample_request.language == Language.GO
        assert sample_request.options == {"tab_width": 4}
        assert sample_request.context == {"caller": "test"}

    def test_minimal_request(self, minimal_request):
        assert minimal_request.source == "x = 1"
        assert minimal_request.language == Language.PYTHON
        assert minimal_request.options is None
        assert minimal_request.context is None

    def test_json_round_trip(self, sample_request):
        json_str = sample_request.model_dump_json(exclude_none=True)
        parsed = json.loads(json_str)
        restored = FormatRequest.model_validate(parsed)
        assert restored == sample_request

    def test_json_excludes_none_fields(self, minimal_request):
        data = json.loads(minimal_request.model_dump_json(exclude_none=True))
        assert "options" not in data
        assert "context" not in data
        assert data["source"] == "x = 1"
        assert data["language"] == "python"


class TestDiagnostic:
    def test_full_diagnostic(self):
        d = Diagnostic(
            file="main.go",
            line=10,
            column=5,
            severity=Severity.ERROR,
            message="syntax error",
            rule="parse-error",
        )
        assert d.file == "main.go"
        assert d.line == 10
        assert d.column == 5
        assert d.severity == Severity.ERROR
        assert d.message == "syntax error"
        assert d.rule == "parse-error"

    def test_minimal_diagnostic(self):
        d = Diagnostic(severity=Severity.INFO, message="all good")
        assert d.file is None
        assert d.line is None
        assert d.rule is None

    def test_json_round_trip(self):
        d = Diagnostic(
            file="test.py",
            line=1,
            column=1,
            severity=Severity.WARNING,
            message="unused import",
            rule="F401",
        )
        json_str = d.model_dump_json(exclude_none=True)
        restored = Diagnostic.model_validate_json(json_str)
        assert restored == d

    def test_json_excludes_none_fields(self):
        d = Diagnostic(severity=Severity.HINT, message="consider refactoring")
        data = json.loads(d.model_dump_json(exclude_none=True))
        assert "file" not in data
        assert "line" not in data
        assert "column" not in data
        assert "rule" not in data
        assert data["severity"] == "hint"
        assert data["message"] == "consider refactoring"


class TestFormatResult:
    def test_success_result(self, sample_result):
        assert sample_result.success is True
        assert sample_result.formatted is not None
        assert sample_result.diff is not None
        assert len(sample_result.diagnostics) == 1
        assert sample_result.metadata is not None

    def test_failure_result(self, failure_result):
        assert failure_result.success is False
        assert failure_result.formatted is None
        assert failure_result.diff is None
        assert len(failure_result.diagnostics) == 1
        assert failure_result.diagnostics[0].severity == Severity.ERROR

    def test_json_round_trip(self, sample_result):
        json_str = sample_result.model_dump_json(exclude_none=True)
        restored = FormatResult.model_validate_json(json_str)
        assert restored == sample_result

    def test_empty_diagnostics(self):
        r = FormatResult(success=True, formatted="clean code")
        data = json.loads(r.model_dump_json(exclude_none=True))
        assert data["diagnostics"] == []
        assert data["success"] is True
