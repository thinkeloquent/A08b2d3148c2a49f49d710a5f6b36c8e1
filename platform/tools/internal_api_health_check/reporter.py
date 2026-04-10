"""Console and JSON output formatting."""

from __future__ import annotations

import json
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path

from .models import RunSummary, TestResult, TestStatus

# ANSI colors
_GREEN = "\033[32m"
_RED = "\033[31m"
_YELLOW = "\033[33m"
_CYAN = "\033[36m"
_DIM = "\033[2m"
_RESET = "\033[0m"
_BOLD = "\033[1m"

_STATUS_LABEL = {
    TestStatus.PASS: f"{_GREEN}PASS{_RESET}",
    TestStatus.FAIL: f"{_RED}FAIL{_RESET}",
    TestStatus.SKIP: f"{_DIM}SKIP{_RESET}",
    TestStatus.ERROR: f"{_RED} ERR{_RESET}",
}


def _format_time(ms: float) -> str:
    if ms < 1000:
        return f"{ms:.0f}ms"
    return f"{ms / 1000:.2f}s"


def _short_error(error: str) -> str:
    """Extract a brief reason from an error string."""
    if "Connection refused" in error or "Cannot connect" in error:
        return "connection refused"
    if "Timeout" in error:
        return "timeout"
    # First line, capped at 60 chars
    first = error.split("\n", 1)[0]
    return first[:60] + ("..." if len(first) > 60 else "")


def print_console(summary: RunSummary, verbose: bool = False) -> None:
    """Print results to the console with aligned columns."""
    # Group by server
    by_server: dict[str, list[TestResult]] = {}
    for r in summary.results:
        by_server.setdefault(r.server, []).append(r)

    for server_name, results in by_server.items():
        print(f"\n{_BOLD}{_CYAN}── {server_name} ──{_RESET}")

        for r in results:
            label = _STATUS_LABEL.get(r.status, r.status.value)
            time_str = _format_time(r.response_time_ms) if r.status != TestStatus.SKIP else ""
            test_col = f"{r.suite}/{r.test_id}"

            # Status code or short error reason
            detail_col = ""
            if r.http_status is not None:
                if r.status == TestStatus.FAIL:
                    detail_col = f"{_RED}{r.http_status}{_RESET}"
                else:
                    detail_col = str(r.http_status)
            elif r.error:
                detail_col = f"{_DIM}{_short_error(r.error)}{_RESET}"

            line = f"  {label}  {test_col:<45s} {detail_col:<30s} {time_str:>8s}"
            print(line)

            if verbose and r.error:
                print(f"         {_DIM}{r.error}{_RESET}")
            elif verbose and r.status == TestStatus.FAIL:
                print(f"         {_DIM}expected {r.expected_status}, got {r.http_status}{_RESET}")

    # Summary line
    parts = [
        f"{_BOLD}{summary.total} tests{_RESET}",
        f"{_GREEN}{summary.passed} passed{_RESET}",
    ]
    if summary.failed:
        parts.append(f"{_RED}{summary.failed} failed{_RESET}")
    if summary.errors:
        parts.append(f"{_RED}{summary.errors} errors{_RESET}")
    if summary.skipped:
        parts.append(f"{_DIM}{summary.skipped} skipped{_RESET}")
    parts.append(f"in {summary.elapsed_seconds:.1f}s")

    print(f"\n{' | '.join(parts)}\n")


def print_dry_run(entries: list[dict]) -> None:
    """Print dry-run URL list to the console."""
    current_server = None
    for e in entries:
        if e["server"] != current_server:
            current_server = e["server"]
            print(f"\n{_BOLD}{_CYAN}── {current_server} ──{_RESET}")
        method = e["method"]
        url = e["url"]
        test_id = f"{e['suite']}/{e['test_id']}"
        print(f"  {method:<7s} {url:<80s} {_DIM}{test_id}{_RESET}")
    print()


def _serialize_result(r: TestResult) -> dict:
    d = asdict(r)
    d["status"] = r.status.value
    return d


def write_json(summary: RunSummary, output_file: str | Path) -> None:
    """Write structured JSON results to a file."""
    data = {
        "total": summary.total,
        "passed": summary.passed,
        "failed": summary.failed,
        "errors": summary.errors,
        "skipped": summary.skipped,
        "elapsed_seconds": summary.elapsed_seconds,
        "results": [_serialize_result(r) for r in summary.results],
    }
    path = Path(output_file)
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"Results written to {path}")


def format_json_stdout(summary: RunSummary) -> None:
    """Print JSON results to stdout."""
    data = {
        "total": summary.total,
        "passed": summary.passed,
        "failed": summary.failed,
        "errors": summary.errors,
        "skipped": summary.skipped,
        "elapsed_seconds": summary.elapsed_seconds,
        "results": [_serialize_result(r) for r in summary.results],
    }
    print(json.dumps(data, indent=2))


def _format_log_line(r: TestResult, timestamp: str) -> str:
    """Format a single result as a plain-text log line."""
    status = r.status.value.ljust(5)
    test_col = f"{r.suite}/{r.test_id}"
    time_str = _format_time(r.response_time_ms)

    detail = ""
    if r.http_status is not None:
        detail = str(r.http_status)
        if r.status == TestStatus.FAIL:
            detail += f" (expected {r.expected_status})"
    elif r.error:
        detail = _short_error(r.error)

    return f"[{timestamp}] {status}  {r.server:<12s} {test_col:<45s} {detail:<40s} {time_str:>8s}  {r.url}"


def write_pass_fail_logs(summary: RunSummary, log_dir: str | Path) -> None:
    """Write separate pass and fail log files after every run.

    Files created:
      - <log_dir>/internal_api_health_check.pass.log
      - <log_dir>/internal_api_health_check.fail.log
    """
    log_dir = Path(log_dir)
    log_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    pass_results = [r for r in summary.results if r.status == TestStatus.PASS]
    fail_results = [r for r in summary.results if r.status in (TestStatus.FAIL, TestStatus.ERROR)]

    header = (
        f"# internal_api_health_check  run={timestamp}  "
        f"total={summary.total} passed={summary.passed} "
        f"failed={summary.failed} errors={summary.errors} "
        f"skipped={summary.skipped} elapsed={summary.elapsed_seconds}s\n"
    )

    pass_file = log_dir / "internal_api_health_check.pass.log"
    with open(pass_file, "w") as f:
        f.write(header)
        for r in pass_results:
            f.write(_format_log_line(r, timestamp) + "\n")
        if not pass_results:
            f.write("# (no passing tests)\n")

    fail_file = log_dir / "internal_api_health_check.fail.log"
    with open(fail_file, "w") as f:
        f.write(header)
        f.write("\n")

        if not fail_results:
            f.write("# (no failures)\n")
        else:
            # Group by server for readability
            by_server: dict[str, list[TestResult]] = {}
            for r in fail_results:
                by_server.setdefault(r.server, []).append(r)

            for server_name, results in by_server.items():
                f.write(f"{'=' * 80}\n")
                f.write(f"SERVER: {server_name}\n")
                f.write(f"{'=' * 80}\n\n")

                for i, r in enumerate(results):
                    f.write(f"--- [{i + 1}/{len(results)}] {r.suite}/{r.test_id} ---\n")
                    f.write(f"  status:          {r.status.value}\n")
                    if r.description:
                        f.write(f"  description:     {r.description}\n")
                    f.write(f"  method:          {r.method}\n")
                    f.write(f"  url:             {r.url}\n")
                    if r.headers:
                        f.write(f"  headers:         {json.dumps(r.headers)}\n")
                    f.write(f"  timeout:         {r.timeout}s\n")
                    f.write(f"  response_time:   {_format_time(r.response_time_ms)}\n")
                    if r.http_status is not None:
                        f.write(f"  http_status:     {r.http_status}\n")
                    f.write(f"  expected_status: {r.expected_status}\n")
                    if r.error:
                        f.write(f"  error:           {r.error}\n")
                    f.write("\n")

            # Fail summary at bottom
            f.write(f"{'=' * 80}\n")
            f.write(f"FAIL SUMMARY: {len(fail_results)} failure(s)\n")
            fail_count = sum(1 for r in fail_results if r.status == TestStatus.FAIL)
            error_count = sum(1 for r in fail_results if r.status == TestStatus.ERROR)
            if fail_count:
                f.write(f"  FAIL:  {fail_count} (wrong status code)\n")
            if error_count:
                f.write(f"  ERROR: {error_count} (timeout / connection / exception)\n")
            f.write(f"{'=' * 80}\n")
