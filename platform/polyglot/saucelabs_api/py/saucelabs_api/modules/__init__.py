"""Domain modules for the Sauce Labs API client."""

from .jobs import JobsModule
from .platform import PlatformModule
from .users import UsersModule
from .upload import UploadModule

__all__ = [
    "JobsModule",
    "PlatformModule",
    "UsersModule",
    "UploadModule",
]
