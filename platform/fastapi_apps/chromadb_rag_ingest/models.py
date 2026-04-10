"""Pydantic request/response models for ChromaDB RAG Ingest."""

from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel


class SearchRequest(BaseModel):
    query: str
    top_k: int = 6
    alpha: Optional[float] = None
    threshold: Optional[float] = None
    reranker: Optional[bool] = None
    code_mode: Optional[str] = "regex"
    component_mode: Optional[str] = "metadata"
    backend: Optional[str] = None
    framework: Optional[str] = None


class QueryRequest(BaseModel):
    query: str
    top_k: int = 6
    provider: Optional[str] = None
    alpha: Optional[float] = None
    threshold: Optional[float] = None
    reranker: Optional[bool] = None
    code_mode: Optional[str] = "regex"
    component_mode: Optional[str] = "metadata"
    backend: Optional[str] = None
    framework: Optional[str] = None


class SchemaConfig(BaseModel):
    language: str       # json_schema | zod | typescript | graphql | pydantic | dataclass | typeddict
    text: str           # raw schema definition
    template_id: Optional[str] = None   # preset template ID (json_schema only)


class LLMRequest(BaseModel):
    question: str
    context: str
    provider: Optional[str] = None
    system_prompt: Optional[str] = None
    output_format: str = "markdown"
    schema_config: Optional[SchemaConfig] = None


class IngestRequest(BaseModel):
    force: bool = False
    framework: Optional[str] = None


class RunFunctionRequest(BaseModel):
    params: Optional[dict] = None


# -- Chat session persistence --


class PromptTemplateRef(BaseModel):
    id: str
    name: str
    selected_version_id: str


class CreateSessionRequest(BaseModel):
    session_id: UUID
    query: str
    mode: str = "query"
    top_k: int = 6
    provider: Optional[str] = None
    alpha: float = 0.5
    threshold: float = 0.0
    reranker: bool = False
    backend: Optional[str] = None
    code_mode: str = "regex"
    component_mode: str = "metadata"
    search_results: Optional[list[Any]] = None
    components: Optional[list[str]] = None
    search_answer: Optional[str] = None


class UpdateSessionRequest(BaseModel):
    question: Optional[str] = None
    system_prompt: Optional[str] = None
    format: Optional[str] = None
    schema_config: Optional[dict] = None
    prompt_templates: Optional[list[PromptTemplateRef]] = None
    selected_docs: Optional[list[str]] = None
    variant_selections: Optional[dict[str, Any]] = None


class AppendLlmResponseRequest(BaseModel):
    question: str
    answer: str


class SessionResponse(BaseModel):
    id: UUID
    query: str
    mode: str
    top_k: int
    provider: Optional[str]
    alpha: float
    threshold: float
    reranker: bool
    backend: Optional[str]
    code_mode: str
    component_mode: str
    search_results: Optional[list[Any]]
    components: Optional[list[str]]
    search_answer: Optional[str]
    question: Optional[str]
    system_prompt: Optional[str]
    format: str
    schema_config: Optional[dict] = None
    prompt_templates: Optional[list[PromptTemplateRef]]
    selected_docs: Optional[list[str]]
    variant_selections: Optional[dict[str, Any]]
    llm_responses: Optional[list[Any]]
    created_at: datetime
    updated_at: datetime
