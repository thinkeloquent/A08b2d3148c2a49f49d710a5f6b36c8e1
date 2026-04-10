import time
from datetime import datetime, timezone
from typing import Union

class TimestampFormatter:
    """
    Consistent ISO8601 timestamp generation.
    Output: YYYY-MM-DDTHH:MM:SSZ (no milliseconds)
    """

    def format(self) -> str:
        """Return current UTC timestamp in ISO8601 format."""
        return self.format_from_epoch(time.time())

    def format_from_epoch(self, epoch: Union[float, int]) -> str:
        """
        Format specific epoch timestamp.
        Args:
            epoch: Unix timestamp (seconds)
        Returns:
            ISO8601 string (e.g., "2024-01-15T10:30:00Z")
        """
        dt = datetime.fromtimestamp(epoch, tz=timezone.utc)
        # Format as YYYY-MM-DDTHH:MM:SSZ
        return dt.strftime("%Y-%m-%dT%H:%M:%SZ")
