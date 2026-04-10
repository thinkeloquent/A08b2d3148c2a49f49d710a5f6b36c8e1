"""Data structures for the API health check tool."""

from __future__ import annotations

import enum
from dataclasses import dataclass, field


class TestStatus(enum.Enum):
    PASS = "PASS"
    FAIL = "FAIL"
    SKIP = "SKIP"
    ERROR = "ERROR"


@dataclass
class ServerConfig:
    name: str
    base_url: str
    description: str = ""


@dataclass
class TestCase:
    id: str
    description: str
    path: str
    method: str = "GET"
    expected_status: list[int] = field(default_factory=lambda: [200])
    expected_body: dict | None = None
    timeout: float = 10.0
    headers: dict[str, str] = field(default_factory=dict)
    body: dict | None = None
    skip: bool = False
    variables: dict[str, str] = field(default_factory=dict)


@dataclass
class TestSuite:
    name: str
    description: str
    tests: list[TestCase] = field(default_factory=list)
    prefix: str = ""
    variables: dict[str, str] = field(default_factory=dict)


@dataclass
class TestResult:
    test_id: str
    suite: str
    server: str
    status: TestStatus
    http_status: int | None = None
    expected_status: list[int] = field(default_factory=list)
    response_time_ms: float = 0.0
    url: str = ""
    error: str | None = None
    method: str = "GET"
    description: str = ""
    headers: dict[str, str] = field(default_factory=dict)
    timeout: float = 10.0


@dataclass
class RunSummary:
    total: int = 0
    passed: int = 0
    failed: int = 0
    errors: int = 0
    skipped: int = 0
    elapsed_seconds: float = 0.0
    results: list[TestResult] = field(default_factory=list)
