"""Type definitions for LLM synthesis."""

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class SynthesisConfig:
    """Configuration for LLM synthesis client.

    Attributes:
        llm_provider: Default provider ("openai", "anthropic", "gemini").
        openai_model: Model name for OpenAI provider.
        anthropic_model: Model name for Anthropic provider.
        gemini_model: Model name for Gemini provider.
        reranker_model: Model name for Gemini-based reranker.
        temperature: Default temperature for LLM calls.
        max_tokens: Default max tokens for responses.
    """
    llm_provider: str = "openai"
    openai_model: str = "gpt-4o"
    anthropic_model: str = "claude-sonnet-4-5-20250514"
    gemini_model: str = "gemini-2.0-flash"
    reranker_model: str = "gemini-2.0-flash"
    temperature: float = 0.2
    max_tokens: int = 4096
