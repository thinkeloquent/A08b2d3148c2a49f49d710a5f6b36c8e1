from typing import Any, Dict, List, Optional
from .executor import HealthCheckExecutor, HttpClientFactory
from .sanitizer import ConfigSanitizer
from .timestamp import TimestampFormatter
from .types import HealthCheckResult

class HealthzDiagnosticsSDK:
    """
    Public SDK for healthz diagnostics.
    Provides programmatic access for CLI tools, Agents, and Dev tools.
    """

    def __init__(self, executor: HealthCheckExecutor):
        self._executor = executor
        self._sanitizer = ConfigSanitizer()
        self._timestamp = TimestampFormatter()

    @classmethod
    def create(cls, http_client_factory: HttpClientFactory) -> "HealthzDiagnosticsSDK":
        """Factory method to create SDK instance."""
        executor = HealthCheckExecutor(http_client_factory)
        return cls(executor)

    async def check_health(self, provider_name: str, provider_config: Dict[str, Any]) -> HealthCheckResult:
        """Execute health check for a provider."""
        return await self._executor.execute(provider_name, provider_config)

    def sanitize_config(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Sanitize configuration object."""
        return self._sanitizer.sanitize(config)

    def check_env_vars(self, var_names: List[str]) -> Dict[str, bool]:
        """Check environment variable presence."""
        return self._sanitizer.check_env_vars(var_names)

    def format_timestamp(self) -> str:
        """Get current ISO8601 timestamp."""
        return self._timestamp.format()
