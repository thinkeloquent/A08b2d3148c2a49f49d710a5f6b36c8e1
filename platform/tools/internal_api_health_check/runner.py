"""Async HTTP test runner using aiohttp."""

from __future__ import annotations

import asyncio
import time

import aiohttp

from .models import RunSummary, ServerConfig, TestCase, TestResult, TestStatus, TestSuite
from .substitution import substitute


async def _run_single(
    session: aiohttp.ClientSession,
    test: TestCase,
    suite_name: str,
    server: ServerConfig,
    url: str,
    semaphore: asyncio.Semaphore,
) -> TestResult:
    async with semaphore:
        start = time.monotonic()
        try:
            timeout = aiohttp.ClientTimeout(total=test.timeout)
            async with session.request(
                test.method,
                url,
                headers=test.headers or None,
                json=test.body if test.body is not None else None,
                timeout=timeout,
            ) as resp:
                elapsed = (time.monotonic() - start) * 1000
                http_status = resp.status
                if http_status in test.expected_status:
                    status = TestStatus.PASS
                else:
                    status = TestStatus.FAIL
                return TestResult(
                    test_id=test.id,
                    suite=suite_name,
                    server=server.name,
                    status=status,
                    http_status=http_status,
                    expected_status=test.expected_status,
                    response_time_ms=round(elapsed, 1),
                    url=url,
                    method=test.method,
                    description=test.description,
                    headers=dict(test.headers),
                    timeout=test.timeout,
                )
        except asyncio.TimeoutError:
            elapsed = (time.monotonic() - start) * 1000
            return TestResult(
                test_id=test.id,
                suite=suite_name,
                server=server.name,
                status=TestStatus.ERROR,
                expected_status=test.expected_status,
                response_time_ms=round(elapsed, 1),
                url=url,
                error="Timeout",
                method=test.method,
                description=test.description,
                headers=dict(test.headers),
                timeout=test.timeout,
            )
        except aiohttp.ClientConnectorError as exc:
            elapsed = (time.monotonic() - start) * 1000
            return TestResult(
                test_id=test.id,
                suite=suite_name,
                server=server.name,
                status=TestStatus.ERROR,
                expected_status=test.expected_status,
                response_time_ms=round(elapsed, 1),
                url=url,
                error=f"Connection refused: {exc}",
                method=test.method,
                description=test.description,
                headers=dict(test.headers),
                timeout=test.timeout,
            )
        except Exception as exc:
            elapsed = (time.monotonic() - start) * 1000
            return TestResult(
                test_id=test.id,
                suite=suite_name,
                server=server.name,
                status=TestStatus.ERROR,
                expected_status=test.expected_status,
                response_time_ms=round(elapsed, 1),
                url=url,
                error=str(exc),
                method=test.method,
                description=test.description,
                headers=dict(test.headers),
                timeout=test.timeout,
            )


async def run_suites(
    servers: list[ServerConfig],
    suites: list[TestSuite],
    variables: dict[str, str],
    prefix: str,
    concurrency: int = 5,
    global_timeout: float | None = None,
) -> RunSummary:
    """Execute all test suites against all servers and return a summary."""
    semaphore = asyncio.Semaphore(concurrency)
    tasks: list[asyncio.Task] = []
    skipped: list[TestResult] = []

    start = time.monotonic()

    async with aiohttp.ClientSession() as session:
        for server in servers:
            for suite in suites:
                for test in suite.tests:
                    if test.skip:
                        skipped.append(
                            TestResult(
                                test_id=test.id,
                                suite=suite.name,
                                server=server.name,
                                status=TestStatus.SKIP,
                                expected_status=test.expected_status,
                                url="(skipped)",
                                method=test.method,
                                description=test.description,
                                headers=dict(test.headers),
                                timeout=test.timeout,
                            )
                        )
                        continue

                    suite_vars = {**suite.variables, **variables}
                    effective_vars = {**suite_vars, **test.variables} if test.variables else suite_vars
                    resolved_path = substitute(test.path, effective_vars)
                    effective_prefix = substitute(suite.prefix or prefix, effective_vars)
                    url = f"{server.base_url}{effective_prefix}{resolved_path}"

                    effective_test = test
                    if global_timeout is not None:
                        effective_test = TestCase(
                            id=test.id,
                            description=test.description,
                            path=test.path,
                            method=test.method,
                            expected_status=test.expected_status,
                            expected_body=test.expected_body,
                            timeout=global_timeout,
                            headers=test.headers,
                            body=test.body,
                            skip=test.skip,
                        )

                    tasks.append(
                        asyncio.create_task(
                            _run_single(
                                session, effective_test, suite.name, server, url, semaphore,
                            )
                        )
                    )

        results = await asyncio.gather(*tasks)

    elapsed = time.monotonic() - start
    all_results = list(results) + skipped

    summary = RunSummary(
        total=len(all_results),
        passed=sum(1 for r in all_results if r.status == TestStatus.PASS),
        failed=sum(1 for r in all_results if r.status == TestStatus.FAIL),
        errors=sum(1 for r in all_results if r.status == TestStatus.ERROR),
        skipped=sum(1 for r in all_results if r.status == TestStatus.SKIP),
        elapsed_seconds=round(elapsed, 2),
        results=all_results,
    )
    return summary


def build_dry_run(
    servers: list[ServerConfig],
    suites: list[TestSuite],
    variables: dict[str, str],
    prefix: str,
) -> list[dict]:
    """Build the list of URLs that would be tested (no HTTP calls)."""
    entries: list[dict] = []
    for server in servers:
        for suite in suites:
            for test in suite.tests:
                if test.skip:
                    entries.append({
                        "server": server.name,
                        "suite": suite.name,
                        "test_id": test.id,
                        "method": test.method,
                        "url": "(skipped)",
                    })
                    continue
                suite_vars = {**suite.variables, **variables}
                effective_vars = {**suite_vars, **test.variables} if test.variables else suite_vars
                resolved_path = substitute(test.path, effective_vars)
                effective_prefix = substitute(suite.prefix or prefix, effective_vars)
                url = f"{server.base_url}{effective_prefix}{resolved_path}"
                entries.append({
                    "server": server.name,
                    "suite": suite.name,
                    "test_id": test.id,
                    "method": test.method,
                    "url": url,
                })
    return entries
