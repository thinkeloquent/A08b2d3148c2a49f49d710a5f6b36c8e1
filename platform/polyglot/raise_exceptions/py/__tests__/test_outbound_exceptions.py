"""
Tests for outbound exception classes.

These tests cover exceptions raised when calling upstream services:
- ConnectTimeoutException (503)
- ReadTimeoutException (504)
- WriteTimeoutException (504)
- NetworkException (503)
- UpstreamServiceException (502)
- UpstreamTimeoutException (504)
"""

import pytest

from common_exceptions import (
    ConnectTimeoutException,
    ErrorCode,
    NetworkException,
    ReadTimeoutException,
    UpstreamServiceException,
    UpstreamTimeoutException,
    WriteTimeoutException,
)


class TestConnectTimeoutException:
    """Tests for ConnectTimeoutException (503)."""

    def test_default_values(self):
        """Should have correct default values."""
        exc = ConnectTimeoutException()
        assert exc.status == 503
        assert exc.code == ErrorCode.CONNECT_TIMEOUT

    def test_with_service_info(self):
        """Should include service information."""
        exc = ConnectTimeoutException(
            message="Connection to payment-api timed out",
            service="payment-api",
            timeout_ms=5000,
        )
        assert exc.service == "payment-api"
        assert exc.timeout_ms == 5000

        response = exc.to_response()
        assert response["error"]["details"]["service"] == "payment-api"
        assert response["error"]["details"]["timeoutMs"] == 5000

    def test_retryable_flag(self):
        """Should be marked as retryable."""
        exc = ConnectTimeoutException()
        # Connect timeout is often retryable
        assert exc.status == 503  # Service Unavailable is retryable


class TestReadTimeoutException:
    """Tests for ReadTimeoutException (504)."""

    def test_default_values(self):
        """Should have correct default values."""
        exc = ReadTimeoutException()
        assert exc.status == 504
        assert exc.code == ErrorCode.READ_TIMEOUT

    def test_with_operation_info(self):
        """Should include operation information."""
        exc = ReadTimeoutException(
            message="Read timeout from inventory service",
            service="inventory-api",
            operation="get_stock",
            timeout_ms=30000,
        )
        assert exc.operation == "get_stock"
        response = exc.to_response()
        assert response["error"]["details"]["operation"] == "get_stock"


class TestWriteTimeoutException:
    """Tests for WriteTimeoutException (504)."""

    def test_default_values(self):
        """Should have correct default values."""
        exc = WriteTimeoutException()
        assert exc.status == 504
        assert exc.code == ErrorCode.WRITE_TIMEOUT

    def test_serialization(self):
        """Should serialize correctly."""
        exc = WriteTimeoutException(
            message="Write timeout to database service",
            service="db-service",
            timeout_ms=10000,
        )
        response = exc.to_response()
        assert response["error"]["code"] == "WRITE_TIMEOUT"
        assert response["error"]["status"] == 504


class TestNetworkException:
    """Tests for NetworkException (503)."""

    def test_default_values(self):
        """Should have correct default values."""
        exc = NetworkException()
        assert exc.status == 503
        assert exc.code == ErrorCode.NETWORK_ERROR

    def test_dns_failure_scenario(self):
        """Should handle DNS failure scenario."""
        exc = NetworkException(
            message="DNS resolution failed",
            service="unknown-service",
            details={"hostname": "api.unknown.example.com", "error": "NXDOMAIN"},
        )
        response = exc.to_response()
        assert response["error"]["status"] == 503
        assert "NXDOMAIN" in str(response["error"]["details"])

    def test_connection_refused_scenario(self):
        """Should handle connection refused scenario."""
        exc = NetworkException(
            message="Connection refused",
            service="local-service",
            details={"host": "localhost", "port": 8080, "error": "ECONNREFUSED"},
        )
        assert exc.status == 503


class TestUpstreamServiceException:
    """Tests for UpstreamServiceException (502)."""

    def test_default_values(self):
        """Should have correct default values."""
        exc = UpstreamServiceException()
        assert exc.status == 502
        assert exc.code == ErrorCode.UPSTREAM_SERVICE_ERROR

    def test_with_upstream_status(self):
        """Should include upstream status code."""
        exc = UpstreamServiceException(
            message="Payment service returned error",
            service="payment-api",
            operation="charge",
            upstream_status=500,
        )
        assert exc.upstream_status == 500

        response = exc.to_response()
        assert response["error"]["details"]["service"] == "payment-api"
        assert response["error"]["details"]["upstreamStatus"] == 500

    def test_upstream_4xx_error(self):
        """Should handle upstream 4xx errors."""
        exc = UpstreamServiceException(
            message="Upstream validation failed",
            service="validation-api",
            upstream_status=400,
            details={"upstream_message": "Invalid input"},
        )
        # Even if upstream returns 4xx, we return 502 (bad gateway)
        assert exc.status == 502

    def test_upstream_5xx_error(self):
        """Should handle upstream 5xx errors."""
        exc = UpstreamServiceException(
            message="Upstream server error",
            service="data-api",
            upstream_status=503,
        )
        assert exc.status == 502


class TestUpstreamTimeoutException:
    """Tests for UpstreamTimeoutException (504)."""

    def test_default_values(self):
        """Should have correct default values."""
        exc = UpstreamTimeoutException()
        assert exc.status == 504
        assert exc.code == ErrorCode.UPSTREAM_TIMEOUT

    def test_gateway_timeout_scenario(self):
        """Should handle gateway timeout scenario."""
        exc = UpstreamTimeoutException(
            message="Upstream request timed out",
            service="slow-api",
            operation="heavy_computation",
            timeout_ms=60000,
        )
        response = exc.to_response()
        assert response["error"]["status"] == 504
        assert response["error"]["details"]["service"] == "slow-api"
        assert response["error"]["details"]["timeoutMs"] == 60000


class TestOutboundExceptionCommon:
    """Common tests for all outbound exceptions."""

    @pytest.mark.parametrize(
        "exc_class,expected_status,expected_code",
        [
            (ConnectTimeoutException, 503, ErrorCode.CONNECT_TIMEOUT),
            (ReadTimeoutException, 504, ErrorCode.READ_TIMEOUT),
            (WriteTimeoutException, 504, ErrorCode.WRITE_TIMEOUT),
            (NetworkException, 503, ErrorCode.NETWORK_ERROR),
            (UpstreamServiceException, 502, ErrorCode.UPSTREAM_SERVICE_ERROR),
            (UpstreamTimeoutException, 504, ErrorCode.UPSTREAM_TIMEOUT),
        ],
    )
    def test_status_and_code(self, exc_class, expected_status, expected_code):
        """Should have correct status and code."""
        exc = exc_class()
        assert exc.status == expected_status
        assert exc.code == expected_code

    def test_service_attribute(self):
        """All outbound exceptions should support service attribute."""
        exceptions = [
            ConnectTimeoutException(service="test-service"),
            ReadTimeoutException(service="test-service"),
            WriteTimeoutException(service="test-service"),
            NetworkException(service="test-service"),
            UpstreamServiceException(service="test-service"),
            UpstreamTimeoutException(service="test-service"),
        ]

        for exc in exceptions:
            assert exc.service == "test-service"
            response = exc.to_response()
            assert response["error"]["details"]["service"] == "test-service"

    def test_log_entry_includes_service(self):
        """Log entries should include service information."""
        exc = UpstreamServiceException(
            message="Service error",
            service="payment-api",
        )
        log_entry = exc.to_log_entry()

        assert log_entry["error"]["type"] == "UpstreamServiceException"
        assert "service" in log_entry["error"]["details"]
