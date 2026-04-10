from typing import List, Optional, Any, Dict
from .types import DiagnosticEvent
from .latency import LatencyCalculator
from .timestamp import TimestampFormatter
from .logger import create as create_logger

logger = create_logger("healthz_diagnostics", __name__)

class DiagnosticsCollector:
    """
    Collects diagnostic events (start, end, error) during request lifecycle.
    """

    def __init__(self):
        self._events: List[DiagnosticEvent] = []
        self._latency = LatencyCalculator()
        self._timestamp = TimestampFormatter()
        # Keep track of the active event start time for duration calculation of the step if needed
        # But per spec, request:end/error have duration. LatencyCalculator tracks total.

    def push_start(self, url: str, method: str = "GET") -> None:
        """Record request:start event."""
        logger.info(f"push_start({url!r}, {method!r})")
        self._latency.start()
        
        event: DiagnosticEvent = {
            "type": "request:start",
            "timestamp": self._timestamp.format(),
            "status": None,
            "error": None,
            "duration_ms": None,
            "metadata": {"url": url, "method": method}
        }
        self._events.append(event)

    def push_end(self, status: int) -> None:
        """Record request:end event."""
        logger.info(f"push_end({status})")
        self._latency.stop()
        
        event: DiagnosticEvent = {
            "type": "request:end",
            "timestamp": self._timestamp.format(),
            "status": status,
            "error": None,
            "duration_ms": self._latency.get_ms(),
            "metadata": None
        }
        self._events.append(event)

    def push_error(self, error: Any) -> None:
        """Record request:error event."""
        error_msg = str(error)
        logger.info(f"push_error({error_msg!r})")
        self._latency.stop()
        
        event: DiagnosticEvent = {
            "type": "request:error",
            "timestamp": self._timestamp.format(),
            "status": None,
            "error": error_msg,
            "duration_ms": self._latency.get_ms(),
            "metadata": None
        }
        self._events.append(event)

    def get_events(self) -> List[DiagnosticEvent]:
        """Return ordered list of events."""
        return self._events

    def get_duration(self) -> float:
        """Return total duration in seconds."""
        return self._latency.get_seconds()
