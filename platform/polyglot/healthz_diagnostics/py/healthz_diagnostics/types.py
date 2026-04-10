from typing import TypedDict, List, Optional, Any, Dict

class DiagnosticEvent(TypedDict):
    """Event captured during diagnostics."""
    type: str
    timestamp: str  # ISO8601
    status: Optional[int]
    error: Optional[str]
    duration_ms: Optional[float]
    metadata: Optional[Dict[str, Any]]

class HealthCheckResult(TypedDict):
    """Result of a health check execution."""
    provider: str
    healthy: bool
    status_code: Optional[int]
    latency_ms: Optional[float]
    error: Optional[str]
    endpoint: Optional[str]
    model: Optional[str]
    timestamp: str
    diagnostics: List[DiagnosticEvent]
    data: Optional[Any]

class ProviderConfig(TypedDict):
    """Configuration for a provider."""
    base_url: str
    health_endpoint: Optional[str]
    method: Optional[str]
    model: Optional[str]
    endpoint_api_key: Optional[str]
    # Allow extra keys
    __extra_items__: Optional[Dict[str, Any]]
