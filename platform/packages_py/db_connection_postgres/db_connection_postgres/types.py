import uuid
from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import DeclarativeBase, Mapped, declared_attr, mapped_column
from sqlalchemy.types import Boolean, DateTime, Integer, String, Uuid


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass

class TableNameMixin:
    """Mixin to automatically generate table name from class name."""
    @declared_attr.directive
    def __tablename__(cls) -> str:  # noqa: N805
        return cls.__name__.lower()

class TimestampMixin:
    """Mixin for created_at and updated_at timestamps."""
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

class SoftDeleteMixin:
    """Mixin for soft delete support."""
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, default=None)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

class UUIDPrimaryKeyMixin:
    """Mixin for UUID primary key."""
    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid()
    )

class IntPrimaryKeyMixin:
    """Mixin for Integer primary key."""
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
