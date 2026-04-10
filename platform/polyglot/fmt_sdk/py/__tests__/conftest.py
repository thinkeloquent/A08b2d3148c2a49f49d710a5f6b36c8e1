"""Shared fixtures for fmt_sdk tests."""

from pathlib import Path

import pytest

from fmt_sdk.schemas import (
    Diagnostic,
    FormatRequest,
    FormatResult,
    Language,
    Severity,
)

FIXTURES_DIR = Path(__file__).resolve().parent.parent.parent / "__fixtures__"


@pytest.fixture
def sample_request():
    return FormatRequest(
        source='package main\n\nfunc main() { fmt.Println("hello") }\n',
        language=Language.GO,
        options={"tab_width": 4},
        context={"caller": "test"},
    )


@pytest.fixture
def sample_result():
    return FormatResult(
        success=True,
        formatted='package main\n\nfunc main() {\n\tfmt.Println("hello")\n}\n',
        diff="@@ -1,3 +1,5 @@\n package main\n",
        diagnostics=[
            Diagnostic(
                file="main.go",
                line=3,
                column=1,
                severity=Severity.WARNING,
                message="Line too long",
                rule="line-length",
            )
        ],
        metadata={"duration_ms": 12, "formatter_version": "1.0.0"},
    )


@pytest.fixture
def minimal_request():
    return FormatRequest(
        source="x = 1",
        language=Language.PYTHON,
    )


@pytest.fixture
def failure_result():
    return FormatResult(
        success=False,
        diagnostics=[
            Diagnostic(
                severity=Severity.ERROR,
                message="Syntax error: unexpected token",
            )
        ],
    )


@pytest.fixture
def config_toml_path():
    return FIXTURES_DIR / "config.toml"
