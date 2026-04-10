import time
from typing import Optional

class LatencyCalculator:
    """
    High-precision latency measurement.
    """

    def __init__(self):
        self._start_time: Optional[float] = None
        self._end_time: Optional[float] = None

    def start(self) -> None:
        """Start the timer."""
        self._start_time = time.time()
        self._end_time = None

    def stop(self) -> None:
        """Stop the timer."""
        self._end_time = time.time()

    def get_ms(self) -> float:
        """Return duration in milliseconds with 2 decimal precision."""
        if self._start_time is None:
            return 0.0
        
        end = self._end_time if self._end_time is not None else time.time()
        duration_sec = end - self._start_time
        return round(duration_sec * 1000, 2)

    def get_seconds(self) -> float:
        """Return duration in seconds."""
        if self._start_time is None:
            return 0.0
        
        end = self._end_time if self._end_time is not None else time.time()
        return end - self._start_time
