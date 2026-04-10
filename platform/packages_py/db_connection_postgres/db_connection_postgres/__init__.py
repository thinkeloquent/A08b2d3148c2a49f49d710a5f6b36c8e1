from .config import PostgresConfig
from .exceptions import DatabaseConfigError, DatabaseConnectionError, DatabaseImportError
from .schemas import DatabaseConfigValidator
from .session import DatabaseManager, get_db_manager
from .types import Base, SoftDeleteMixin, TableNameMixin, TimestampMixin, UUIDPrimaryKeyMixin

# Backward-compatible alias
DatabaseConfig = PostgresConfig

__all__ = [
    "DatabaseConfig",
    "PostgresConfig",
    "DatabaseManager",
    "get_db_manager",
    "DatabaseConfigError",
    "DatabaseConnectionError",
    "DatabaseImportError",
    "Base",
    "TimestampMixin",
    "SoftDeleteMixin",
    "UUIDPrimaryKeyMixin",
    "TableNameMixin",
    "DatabaseConfigValidator",
]
