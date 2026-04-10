import asyncio
from typing import Any, Dict, Protocol, Optional, Callable
from .logger import create as create_logger
from .collector import DiagnosticsCollector
from .timestamp import TimestampFormatter
from .types import HealthCheckResult, ProviderConfig

logger = create_logger("healthz_diagnostics", __name__)

class HttpClient(Protocol):
    async def request(self, method: str, url: str) -> Any: ...
    async def close(self) -> None: ...

HttpClientFactory = Callable[[Dict[str, Any]], HttpClient]

class HealthCheckExecutor:
    """
    Orchestrates health checks with diagnostics, timing, and error handling.
    """

    def __init__(self, http_client_factory: HttpClientFactory, logger_instance: Optional[Any] = None):
        self._client_factory = http_client_factory
        self._logger = logger_instance or logger
        self._timestamp = TimestampFormatter()

    async def execute(self, provider_name: str, provider_config: Dict[str, Any]) -> HealthCheckResult:
        """
        Execute health check for a single provider.
        """
        self._logger.info(f"Executing health check for {provider_name}")
        
        collector = DiagnosticsCollector()
        status_code: Optional[int] = None
        error_msg: Optional[str] = None
        healthy = False
        response_data: Optional[Any] = None
        
        base_url = provider_config.get("base_url")
        health_endpoint = provider_config.get("health_endpoint", "")
        model = provider_config.get("model")
        method = (provider_config.get("method") or "GET").upper()
        health_body = provider_config.get("health_body")
        
        if not base_url:
            error_msg = f"{provider_name} provider not configured (missing base_url)"
            collector.push_error(error_msg)
            return self._build_result(
                provider_name, False, None, error_msg, None, model, collector, None
            )

        # URL construction per REQ0006
        # Always remove trailing slash from base_url
        clean_base = base_url.rstrip("/")

        if not health_endpoint:
            full_url = clean_base
            normalized_endpoint = ""
        else:
            # Ensure health_endpoint starts with /
            normalized_endpoint = health_endpoint if health_endpoint.startswith("/") else f"/{health_endpoint}"
            full_url = f"{clean_base}{normalized_endpoint}"

        client = self._client_factory(provider_config)

        try:
            collector.push_start(full_url, method)

            # Execute request - pass normalized path, not full URL
            # (client already has base_url configured)
            if health_body and method == "POST":
                response = await client.request(method, normalized_endpoint, json=health_body)
            else:
                response = await client.request(method, normalized_endpoint)
            
            # Handle response objects that might be dict or object (depending on client)
            # Assuming client returns object with status_code or dict with status
            if isinstance(response, dict):
                status_code = response.get("status", response.get("status_code"))
                response_data = response.get("data")
            else:
                status_code = getattr(response, "status_code", getattr(response, "status", None))
                response_data = getattr(response, "data", None)

            if status_code and 200 <= status_code < 300:
                healthy = True
                collector.push_end(status_code)
            else:
                healthy = False
                error_msg = f"Unhealthy status code: {status_code}"
                collector.push_error(error_msg)

        except Exception as e:
            healthy = False
            error_msg = str(e)
            collector.push_error(error_msg)
            self._logger.error(f"Health check failed for {provider_name}: {e}")
            
        finally:
            try:
                await client.close()
            except Exception as close_err:
                self._logger.warn(f"Failed to close client for {provider_name}: {close_err}")

        return self._build_result(
            provider_name,
            healthy,
            status_code,
            error_msg,
            full_url,
            model,
            collector,
            response_data
        )

    def _build_result(
        self,
        provider: str,
        healthy: bool,
        status_code: Optional[int],
        error: Optional[str],
        endpoint: Optional[str],
        model: Optional[str],
        collector: DiagnosticsCollector,
        data: Optional[Any]
    ) -> HealthCheckResult:
        return {
            "provider": provider,
            "healthy": healthy,
            "status_code": status_code,
            "latency_ms": collector.get_duration() * 1000,
            "error": error,
            "endpoint": endpoint,
            "model": model,
            "timestamp": self._timestamp.format(),
            "diagnostics": collector.get_events(),
            "data": data
        }
