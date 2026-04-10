"""SQLAlchemy models for the RAG Component Registry.

Tables are prefixed with rag_cr_001_ to avoid collisions with other apps.
"""

import uuid

from sqlalchemy import Boolean, Float, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import Uuid

from db_connection_postgres import Base, TimestampMixin


class RagComponentDocument(Base, TimestampMixin):
    """Markdown reference documents for UI components."""

    __tablename__ = "rag_cr_001_component_document"
    __table_args__ = (
        UniqueConstraint("library_slug", "component_name", name="uq_cr001_doc_lib_comp"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    file_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    library_slug: Mapped[str] = mapped_column(String(100), nullable=False)
    component_name: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False)


class RagComponentFunctionModule(Base, TimestampMixin):
    """Python function modules (.fnc.py) for UI components."""

    __tablename__ = "rag_cr_001_component_function_module"
    __table_args__ = (
        UniqueConstraint("library_slug", "component_name", name="uq_cr001_fn_lib_comp"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    file_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    library_slug: Mapped[str] = mapped_column(String(100), nullable=False)
    component_name: Mapped[str] = mapped_column(String(255), nullable=False)
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    function_metadata: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    file_path: Mapped[str] = mapped_column(String(1024), nullable=False)


class RagChatSession(Base, TimestampMixin):
    """Persisted chat session state for the RAG search + LLM UI."""

    __tablename__ = "rag_cr_001_chat_session"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True)
    query: Mapped[str] = mapped_column(Text, nullable=False)
    mode: Mapped[str] = mapped_column(String(20), nullable=False, default="query")
    top_k: Mapped[int] = mapped_column(Integer, nullable=False, default=6)
    provider: Mapped[str | None] = mapped_column(String(50), nullable=True)
    alpha: Mapped[float] = mapped_column(Float, nullable=False, default=0.5)
    threshold: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    reranker: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    backend: Mapped[str | None] = mapped_column(String(50), nullable=True)
    code_mode: Mapped[str] = mapped_column(String(20), nullable=False, default="regex")
    component_mode: Mapped[str] = mapped_column(String(20), nullable=False, default="metadata")
    search_results: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    components: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    search_answer: Mapped[str | None] = mapped_column(Text, nullable=True)
    question: Mapped[str | None] = mapped_column(Text, nullable=True)
    system_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)
    format: Mapped[str] = mapped_column(String(50), nullable=False, default="markdown")
    schema_config: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    prompt_templates: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    selected_docs: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    variant_selections: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    llm_responses: Mapped[list | None] = mapped_column(JSONB, nullable=True)
