"""Tests for _resolve_http2 logic."""

from __future__ import annotations

from can_use_http2 import Http2CheckResult

from fetch_httpx_clients.clients import _resolve_http2


def test_none_returns_false() -> None:
    assert _resolve_http2(None) is False


def test_bool_true_passthrough() -> None:
    assert _resolve_http2(True) is True


def test_bool_false_passthrough() -> None:
    assert _resolve_http2(False) is False


def test_check_result_ok(h2_ok: Http2CheckResult) -> None:
    assert _resolve_http2(h2_ok) is True


def test_check_result_fail(h2_fail: Http2CheckResult) -> None:
    assert _resolve_http2(h2_fail) is False


def test_check_result_fail_logs_warning(
    h2_fail: Http2CheckResult,
    caplog_warning,
) -> None:
    _resolve_http2(h2_fail)
    assert "HTTP/2 preflight failed" in caplog_warning.text
    assert "h2 package is not installed" in caplog_warning.text


def test_check_result_ok_no_warning(
    h2_ok: Http2CheckResult,
    caplog_warning,
) -> None:
    _resolve_http2(h2_ok)
    assert caplog_warning.text == ""
