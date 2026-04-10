"""
Domain-specific API modules for the Statsig Console API client.

Each module encapsulates the endpoints for a particular Statsig resource
(gates, experiments, segments, etc.) and exposes typed convenience methods.
"""

from .audit_logs import AuditLogsModule
from .events import EventsModule
from .experiments import ExperimentsModule
from .gates import GatesModule
from .layers import LayersModule
from .metrics import MetricsModule
from .reports import ReportsModule
from .segments import SegmentsModule
from .tags import TagsModule

__all__ = [
    "AuditLogsModule",
    "EventsModule",
    "ExperimentsModule",
    "GatesModule",
    "LayersModule",
    "MetricsModule",
    "ReportsModule",
    "SegmentsModule",
    "TagsModule",
]
